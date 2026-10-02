import "server-only";
import {
  assessSkills,
  careerPaths,
  evidenceScore,
  expectedRatings,
  managerConsistency,
  promotionReadiness,
  recommendations,
  requirements,
  skillGaps,
  THRESHOLDS,
  type EvidenceRef,
  type EvidenceScore,
} from "../engine";
import { generate, type Dataset, type UserRow } from "./generate";

// ponytail: in-memory store for the UI-first pass; swap these reads for Drizzle queries in one place when the DB goes live.
const g = globalThis as unknown as { __store?: Dataset };
export const store = (g.__store ??= generate());

export const activeCycle = () => store.cycles.find((c) => c.status === "active")!;

export function getUser(id: number) {
  return store.users.find((u) => u.id === id) ?? null;
}

export const DEMO = {
  employee: () => store.users.find((u) => u.name === "Priya Sharma")!,
  manager: () => store.users.find((u) => u.name === "Ravi Kumar")!,
  hr: () => store.users.find((u) => u.name === "Elena Rostova")!,
};

/** Employees the viewer may see. Enforced here so every page inherits it. */
export function visibleUserIds(viewer: UserRow): number[] {
  if (viewer.role === "hr") return store.users.filter((u) => u.role === "employee").map((u) => u.id);
  if (viewer.role === "manager") return store.users.filter((u) => u.managerId === viewer.id).map((u) => u.id);
  return [viewer.id];
}

export const canSee = (viewer: UserRow, userId: number) => visibleUserIds(viewer).includes(userId);

const memberProjects = (userId: number) =>
  store.members
    .filter((m) => m.userId === userId)
    .map((m) => ({ ...store.projects.find((p) => p.id === m.projectId)!, contribution: m.contribution }));

export function evidenceFor(userId: number, cycleId: number): EvidenceScore {
  return evidenceScore({
    goals: store.goals.filter((x) => x.userId === userId && x.cycleId === cycleId),
    projects: memberProjects(userId).filter((p) => p.cycleId === cycleId),
    deliverables: store.deliverables.filter((x) => x.userId === userId && x.cycleId === cycleId),
    peerFeedback: store.feedback.filter((f) => f.subjectId === userId && f.cycleId === cycleId && f.kind === "peer"),
    impact: store.impact.filter((x) => x.userId === userId && x.cycleId === cycleId),
    trainings: store.trainings.filter((t) => t.userId === userId),
    attendance: store.attendance.filter((a) => a.userId === userId && a.cycleId === cycleId),
  });
}

export function skillsFor(userId: number) {
  return assessSkills({
    deliverables: store.deliverables.filter((x) => x.userId === userId),
    projects: memberProjects(userId),
    feedback: store.feedback.filter((f) => f.subjectId === userId),
  });
}

export function ratingFor(userId: number, cycleId: number) {
  return store.ratings.find((r) => r.userId === userId && r.cycleId === cycleId) ?? null;
}

export function calibration(cycleId = activeCycle().id) {
  const cases = store.ratings
    .filter((r) => r.cycleId === cycleId)
    .map((r) => ({ userId: r.userId, managerId: r.managerId, rating: r.rating, evidence: evidenceFor(r.userId, cycleId).score }));
  const results = expectedRatings(cases);
  const managers = managerConsistency(results).map((m) => ({ ...m, manager: getUser(m.managerId)! }));
  return {
    cases: results.map((r) => ({ ...r, user: getUser(r.userId)!, manager: getUser(r.managerId)! })),
    managers: managers.sort((a, b) => a.manager.name.localeCompare(b.manager.name)),
  };
}

/** Expected-rating curve sampled across the evidence range, ±the contradiction threshold, for the scatter's shaded band. */
export function ratingBand(cases: { evidence: number; expected: number }[]) {
  const sorted = [...cases].sort((a, b) => a.evidence - b.evidence);
  return [35, 45, 55, 65, 75, 85, 95].map((x) => {
    const near = sorted.reduce((best, c) => (Math.abs(c.evidence - x) < Math.abs(best.evidence - x) ? c : best), sorted[0]);
    return { x, lo: near.expected - THRESHOLDS.contradictionResidual, hi: near.expected + THRESHOLDS.contradictionResidual };
  });
}

export function profile(userId: number) {
  const user = getUser(userId)!;
  const cycle = activeCycle();
  const history = store.cycles.map((c) => ({
    cycle: c,
    evidence: evidenceFor(userId, c.id),
    rating: ratingFor(userId, c.id)?.rating ?? null,
  }));
  const current = history.find((h) => h.cycle.id === cycle.id)!;
  const skills = skillsFor(userId);
  const nextReqs = requirements(store.matrix, user.track, user.level + 1);
  const curReqs = requirements(store.matrix, user.track, user.level);
  const gaps = skillGaps(skills, nextReqs);
  const openTrainings = store.trainings.filter((t) => t.userId === userId && t.status !== "done").map((t) => t.course);
  const closedScores = history.filter((h) => h.cycle.status === "closed").map((h) => h.evidence.score);
  const calib = calibration(cycle.id).cases.find((c) => c.userId === userId) ?? null;
  return {
    user,
    manager: user.managerId ? getUser(user.managerId) : null,
    cycle,
    history,
    current,
    calib,
    skills,
    curReqs,
    nextReqs,
    gaps,
    recs: recommendations(gaps),
    readiness: promotionReadiness({ level: user.level, track: user.track, skills, matrix: store.matrix, recentScores: closedScores, openTrainings }),
    paths: careerPaths({ level: user.level, track: user.track, skills, matrix: store.matrix }),
    goals: store.goals.filter((x) => x.userId === userId && x.cycleId === cycle.id),
    devItems: store.devItems.filter((x) => x.userId === userId),
    trainings: store.trainings.filter((t) => t.userId === userId),
  };
}

export interface EvidenceItem {
  ref: EvidenceRef;
  kind: string;
  title: string;
  detail: string;
}

/** Resolves "goal:12" style refs to something a person can read. */
export function resolveEvidence(ref: EvidenceRef): EvidenceItem | null | undefined {
  const [kind, raw] = ref.split(":");
  const id = Number(raw);
  switch (kind) {
    case "goal": {
      const x = store.goals.find((r) => r.id === id);
      return x && { ref, kind: "Goal", title: x.title, detail: `${x.actual} of ${x.target} target` };
    }
    case "project": {
      const x = store.projects.find((r) => r.id === id);
      return x && { ref, kind: "Project", title: x.name, detail: `Outcome ${x.outcomeScore}/100` };
    }
    case "deliverable": {
      const x = store.deliverables.find((r) => r.id === id);
      if (!x) return null;
      const timing = x.delivered === null ? "not delivered" : x.delivered <= x.due ? "on time" : "late";
      return { ref, kind: "Deliverable", title: x.title, detail: `Quality ${x.quality}/5, ${timing}` };
    }
    case "feedback": {
      const x = store.feedback.find((r) => r.id === id);
      return x && { ref, kind: x.kind === "peer" ? "Peer feedback" : "Manager feedback", title: `“${x.text}”`, detail: `${x.score}/5 from ${getUser(x.authorId)?.name}` };
    }
    case "impact": {
      const x = store.impact.find((r) => r.id === id);
      return x && { ref, kind: "Business impact", title: x.metric, detail: `${x.value}/100 against target` };
    }
    case "training": {
      const x = store.trainings.find((r) => r.id === id);
      return x && { ref, kind: "Training", title: x.course, detail: x.status.replace("_", " ") };
    }
    case "attendance": {
      const x = store.attendance.find((r) => r.id === id);
      return x && { ref, kind: "Attendance", title: x.month, detail: `${x.presentDays} of ${x.workDays} days` };
    }
  }
  return null;
}

/** People a viewer can assign tasks to or message: their department, their manager, their reports. HR reaches everyone. */
export function coworkers(viewer: UserRow) {
  return store.users
    .filter((u) => u.id !== viewer.id)
    .filter((u) => viewer.role === "hr" || u.role === "hr" || u.dept === viewer.dept || u.id === viewer.managerId || u.managerId === viewer.id)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Local calendar date (the server runs in the org's timezone), not the UTC date. */
export const todayISO = () => new Date().toLocaleDateString("en-CA");

export function openPunch(userId: number) {
  return store.punches.find((p) => p.userId === userId && p.outAt === null) ?? null;
}

export function lastPunch(userId: number) {
  return store.punches.filter((p) => p.userId === userId).sort((a, b) => (b.outAt ?? b.inAt).localeCompare(a.outAt ?? a.inAt))[0] ?? null;
}

/** Hours worked in the 7 days up to today, from closed punches. */
export function hoursThisWeek(userId: number) {
  const since = Date.now() - 7 * 864e5;
  const ms = store.punches
    .filter((p) => p.userId === userId && p.outAt && new Date(p.inAt).getTime() >= since)
    .reduce((a, p) => a + (new Date(p.outAt!).getTime() - new Date(p.inAt).getTime()), 0);
  return Math.round((ms / 36e5) * 10) / 10;
}
