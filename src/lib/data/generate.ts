// Deterministic simulated dataset. Same output every run (fixed seed).
// Shapes mirror src/db/schema.ts so the seed script can insert these rows directly.
import { evidenceScore, requirements, skillGaps, assessSkills, recommendations, type MatrixRow } from "../engine";

type Role = "employee" | "manager" | "hr";
type Stage = "not_ready" | "developing" | "near_ready" | "ready" | "promoted";

export interface UserRow { id: number; name: string; email: string; role: Role; managerId: number | null; dept: string; level: number; title: string; track: string; promotionStage: Stage }
export interface CycleRow { id: number; name: string; start: string; end: string; status: "closed" | "active" }
export interface GoalRow { id: number; userId: number; cycleId: number; title: string; target: number; actual: number }
export interface ProjectRow { id: number; name: string; cycleId: number; outcomeScore: number; skills: string[] }
export interface MemberRow { projectId: number; userId: number; contribution: number }
export interface DeliverableRow { id: number; userId: number; projectId: number | null; cycleId: number; title: string; due: string; delivered: string | null; quality: number; skills: string[] }
export interface FeedbackRow { id: number; subjectId: number; authorId: number; kind: "peer" | "manager"; cycleId: number; score: number; text: string; skills: string[] }
export interface RequestRow { id: number; subjectId: number; reviewerId: number; cycleId: number; status: "not_sent" | "sent" | "responded" | "followed_up" | "failed"; sentAt: string | null }
export interface TrainingRow { id: number; userId: number; course: string; skill: string; status: "planned" | "in_progress" | "done"; completedAt: string | null }
export interface AttendanceRow { id: number; userId: number; cycleId: number; month: string; workDays: number; presentDays: number }
export interface ImpactRow { id: number; userId: number; cycleId: number; metric: string; value: number; note: string }
export interface RatingRow { id: number; userId: number; cycleId: number; managerId: number; rating: number }
export interface DevItemRow { id: number; userId: number; kind: "training" | "stretch"; title: string; skill: string; due: string; status: "todo" | "in_progress" | "done"; progress: number }
export interface EventRow { id: number; title: string; date: string; kind: "deadline" | "calibration" | "holiday" }
export interface AuditRow { id: number; entity: string; entityId: number; field: string; oldValue: string | null; newValue: string | null; reason: string; actorId: number; at: string }

export interface TaskRow { id: number; title: string; assigneeId: number; creatorId: number; due: string; priority: "low" | "medium" | "high" | "critical"; notes: string; status: "open" | "done"; kind: "task" | "stretch" }
export interface PostRow { id: number; authorId: number; recipientId: number; skills: string[]; content: string; status: "draft" | "scheduled" | "published"; scheduledAt: string | null; at: string; cheers: number[] }
export interface NoteRow { id: number; subjectId: number; authorId: number; kind: "note" | "activity"; title: string; details: string; at: string }

export interface Dataset {
  users: UserRow[]; cycles: CycleRow[]; goals: GoalRow[]; projects: ProjectRow[]; members: MemberRow[];
  deliverables: DeliverableRow[]; feedback: FeedbackRow[]; requests: RequestRow[]; trainings: TrainingRow[];
  attendance: AttendanceRow[]; impact: ImpactRow[]; ratings: RatingRow[]; matrix: MatrixRow[];
  devItems: DevItemRow[]; events: EventRow[]; audit: AuditRow[];
  tasks: TaskRow[]; posts: PostRow[]; notes: NoteRow[];
  /** Ground truth for seed-check: what the engine must find. */
  planted: { lenient: number[]; strict: number[]; inconsistent: number[]; contradictions: number[] };
}

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TRACK_SKILLS: Record<string, string[]> = {
  Engineering: ["System Design", "Code Quality", "Delivery", "Collaboration", "Mentoring"],
  Data: ["Analytics", "Statistics", "Data Engineering", "Communication", "Delivery"],
  Product: ["Product Strategy", "Stakeholder Mgmt", "Analytics", "Communication", "Delivery"],
  Design: ["UX Research", "Visual Design", "Communication", "Collaboration", "Delivery"],
  Management: ["Mentoring", "Stakeholder Mgmt", "Communication", "Delivery", "Collaboration"],
};
export const TITLES: Record<string, string[]> = {
  Engineering: ["Associate Engineer", "Software Engineer", "Senior Engineer", "Staff Engineer", "Principal Engineer"],
  Data: ["Data Associate", "Data Analyst", "Senior Data Analyst", "Lead Data Scientist", "Principal Data Scientist"],
  Product: ["Associate PM", "Product Manager", "Senior PM", "Group PM", "Director of Product"],
  Design: ["Junior Designer", "Product Designer", "Senior Designer", "Lead Designer", "Design Director"],
};

const FIRST = ["Aarav","Ananya","Vihaan","Diya","Arjun","Ishaan","Kavya","Rohan","Meera","Aditya","Saanvi","Karthik","Nisha","Varun","Pooja","Siddharth","Riya","Nikhil","Sneha","Rahul","Tanvi","Harsh","Lakshmi","Farhan","Zoya","Dev","Aisha","Kabir","Neha","Yash","Shreya","Manav","Divya","Omkar","Bhavna","Tejas","Swati","Abhinav","Ira","Pranav","Keerthi","Gautam","Sana","Raghav","Anjali","Vikram","Mitali","Sahil","Deepa","Arnav","Chitra","Imran","Pallavi","Suresh","Revathi","Naveen","Hema","Kiran","Ojas","Maya"];
const LAST = ["Sharma","Reddy","Iyer","Khan","Patel","Nair","Rao","Gupta","Menon","Das","Kulkarni","Bose","Pillai","Mehta","Joshi","Varma","Chopra","Naidu","Sethi","Hegde"];

const d = (y: number, m: number, day: number) => `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export function generate(): Dataset {
  const rand = rng(20261001);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const between = (a: number, b: number) => a + rand() * (b - a);
  const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
  const r1 = (x: number) => Math.round(x * 10) / 10;

  // ---- skill matrix ----
  const matrix: MatrixRow[] = [];
  for (const [track, skills] of Object.entries(TRACK_SKILLS))
    for (let level = 1; level <= 5; level++)
      skills.forEach((skill, i) => {
        const base = [2, 2.5, 3, 4, 4.5][level - 1];
        matrix.push({ track, level, skill, requiredLevel: clamp(Math.round(base - (i % 3 === 2 ? 0.5 : 0)), 1, 5) });
      });

  // ---- cycles ----
  const cycles: CycleRow[] = [
    { id: 1, name: "H2 2025", start: d(2025, 7, 1), end: d(2025, 12, 31), status: "closed" },
    { id: 2, name: "H1 2026", start: d(2026, 1, 1), end: d(2026, 6, 30), status: "closed" },
    { id: 3, name: "H2 2026", start: d(2026, 7, 1), end: d(2026, 12, 31), status: "active" },
  ];

  // ---- people ----
  const users: UserRow[] = [];
  let uid = 1;
  const addUser = (u: Omit<UserRow, "id" | "email" | "promotionStage">) => {
    const id = uid++;
    const email = `${u.name.toLowerCase().replace(/[^a-z]+/g, ".")}@evalsense.demo`;
    users.push({ ...u, id, email, promotionStage: "not_ready" });
    return id;
  };
  addUser({ name: "Elena Rostova", role: "hr", managerId: null, dept: "People", level: 4, title: "HR Calibration Lead", track: "Management" });
  addUser({ name: "Farah Siddiqui", role: "hr", managerId: null, dept: "People", level: 3, title: "HR Business Partner", track: "Management" });
  addUser({ name: "Joel Mathew", role: "hr", managerId: null, dept: "People", level: 3, title: "People Analyst", track: "Management" });

  type Behaviour = "fair" | "lenient" | "strict" | "inconsistent";
  const managerDefs: { name: string; dept: string; behaviour: Behaviour; contradictions: number }[] = [
    { name: "Ravi Kumar", dept: "Engineering", behaviour: "fair", contradictions: 1 },
    { name: "Sunita Bhat", dept: "Engineering", behaviour: "lenient", contradictions: 0 },
    { name: "Arvind Rao", dept: "Data", behaviour: "fair", contradictions: 2 },
    { name: "Meenakshi Pillai", dept: "Data", behaviour: "strict", contradictions: 0 },
    { name: "Daniel D'Souza", dept: "Product", behaviour: "lenient", contradictions: 0 },
    { name: "Kavitha Menon", dept: "Product", behaviour: "fair", contradictions: 2 },
    { name: "Tarun Ghosh", dept: "Design", behaviour: "inconsistent", contradictions: 0 },
    { name: "Leela Narayan", dept: "Design", behaviour: "fair", contradictions: 1 },
  ];
  const managers = managerDefs.map((m) => ({
    ...m,
    id: addUser({ name: m.name, role: "manager", managerId: null, dept: m.dept, level: 4, title: `${m.dept} Manager`, track: m.dept }),
  }));

  const usedNames = new Set(users.map((u) => u.name));
  const freshName = () => {
    for (;;) {
      const n = `${pick(FIRST)} ${pick(LAST)}`;
      if (!usedNames.has(n)) { usedNames.add(n); return n; }
    }
  };

  const latent = new Map<number, number>(); // underlying performance 0–100
  const trend = new Map<number, number>();
  const teams = new Map<number, number[]>();
  let priyaId = 0;
  managers.forEach((m, mi) => {
    const size = mi % 2 === 0 ? 8 : 7;
    const team: number[] = [];
    for (let i = 0; i < size; i++) {
      const isPriya = mi === 0 && i === 0;
      const level = isPriya ? 3 : 1 + Math.floor(rand() * 4);
      const id = addUser({
        name: isPriya ? "Priya Sharma" : freshName(),
        role: "employee",
        managerId: m.id,
        dept: m.dept,
        level,
        title: TITLES[m.dept][level - 1],
        track: m.dept,
      });
      if (isPriya) priyaId = id;
      team.push(id);
      latent.set(id, isPriya ? 84 : between(42, 94));
      trend.set(id, isPriya ? 3 : between(-4, 4));
    }
    teams.set(m.id, team);
  });

  // ---- evidence per employee per cycle ----
  const goals: GoalRow[] = []; const projects: ProjectRow[] = []; const members: MemberRow[] = [];
  const deliverables: DeliverableRow[] = []; const feedback: FeedbackRow[] = []; const impact: ImpactRow[] = [];
  const attendance: AttendanceRow[] = []; const trainings: TrainingRow[] = [];
  const ids = { goal: 1, project: 1, deliv: 1, fb: 1, imp: 1, att: 1, tr: 1 };
  const perf = (u: number, c: number) => clamp(latent.get(u)! + trend.get(u)! * (c - 2) + between(-3, 3), 25, 99);

  const GOAL_TITLES = ["Ship roadmap milestones", "Reduce defect backlog", "Improve customer NPS", "Hit delivery predictability", "Grow feature adoption", "Cut cycle time"];
  const IMPACT_METRICS = ["Revenue influenced", "Cost saved", "Hours automated", "Churn prevented"];
  const FEEDBACK_TEXT = [
    [1.8, "Struggled to land commitments this cycle; needs clearer planning."],
    [2.6, "Solid on assigned work, could take more ownership."],
    [3.4, "Dependable and collaborative; good partner on shared work."],
    [4.2, "Consistently raises the bar and unblocks others."],
    [5, "Exceptional impact; the team leans on their judgement."],
  ] as const;
  const fbText = (s: number) => FEEDBACK_TEXT.find(([t]) => s <= t)?.[1] ?? FEEDBACK_TEXT[4][1];

  for (const c of cycles) {
    const [y, m0] = c.start.split("-").map(Number);
    for (const [mid, team] of teams) {
      const dept = users.find((u) => u.id === mid)!.dept;
      const skills = TRACK_SKILLS[dept];
      const teamPerf = team.reduce((a, u) => a + perf(u, c.id), 0) / team.length;
      const project: ProjectRow = { id: ids.project++, name: `${dept} ${pick(["Atlas", "Beacon", "Comet", "Delta", "Echo", "Forge"])} ${c.name}`, cycleId: c.id, outcomeScore: r1(clamp(teamPerf + between(-8, 8), 30, 100)), skills: [skills[0], skills[2]] };
      projects.push(project);
      for (const u of team) {
        const p = perf(u, c.id);
        members.push({ projectId: project.id, userId: u, contribution: r1(between(0.3, 1)) });
        const userSkills = u === priyaId ? ["Delivery", "Code Quality", "Collaboration"] : skills;
        for (let g = 0; g < 3; g++)
          goals.push({ id: ids.goal++, userId: u, cycleId: c.id, title: GOAL_TITLES[(u + g) % GOAL_TITLES.length], target: 10, actual: r1(clamp(10 * (p / 100) + between(-1.5, 1.5), 1, 12)) });
        for (let k = 0; k < 3; k++) {
          const due = d(y, m0 + 1 + k * 2, 15);
          const onTime = rand() < p / 100 + 0.1;
          const [dy, dm, dd] = due.split("-").map(Number);
          deliverables.push({
            id: ids.deliv++, userId: u, projectId: project.id, cycleId: c.id,
            title: `${pick(["Spec", "Release", "Report", "Prototype", "Migration", "Review"])} for ${project.name.split(" ")[1]}`,
            due, delivered: onTime ? d(dy, dm, dd - 2) : rand() < 0.85 ? d(dy, dm, Math.min(28, dd + 9)) : null,
            quality: r1(clamp(1 + (4 * p) / 100 + between(-0.6, 0.6), 1, 5)),
            skills: [pick(userSkills)],
          });
        }
        const peers = team.filter((x) => x !== u);
        for (let k = 0; k < 2; k++) {
          const s = r1(clamp(1 + (4 * p) / 100 + between(-0.5, 0.5), 1, 5));
          feedback.push({ id: ids.fb++, subjectId: u, authorId: pick(peers), kind: "peer", cycleId: c.id, score: s, text: fbText(s), skills: [pick(userSkills)] });
        }
        // Priya: System Design shows up only through weak feedback, giving her a clear next-level gap.
        if (u === priyaId)
          feedback.push({ id: ids.fb++, subjectId: u, authorId: peers[0], kind: "peer", cycleId: c.id, score: 2.8, text: "Great executor; design reviews still lean on others.", skills: ["System Design"] });
        impact.push({ id: ids.imp++, userId: u, cycleId: c.id, metric: pick(IMPACT_METRICS), value: r1(clamp(p + between(-10, 10), 10, 100)), note: "Measured against the cycle target" });
        const work = 124;
        attendance.push({ id: ids.att++, userId: u, cycleId: c.id, month: `${c.name}`, workDays: work, presentDays: Math.round(work * clamp(0.86 + 0.12 * (p / 100) + between(-0.03, 0.03), 0.7, 1)) });
      }
    }
  }
  const employees = users.filter((u) => u.role === "employee");
  for (const u of employees) {
    const skills = TRACK_SKILLS[u.track];
    for (let k = 0; k < 2; k++) {
      const status = u.id === priyaId ? (k === 0 ? "done" : "in_progress") : pick(["done", "done", "in_progress", "planned"] as const);
      const skill = skills[(u.id + k) % skills.length];
      trainings.push({ id: ids.tr++, userId: u.id, course: `${skill} essentials`, skill, status, completedAt: status === "done" ? d(2026, 3 + k, 10) : null });
    }
  }

  // ---- ratings, driven by computed evidence so the plant is exact ----
  const evidenceFor = (u: number, c: number) =>
    evidenceScore({
      goals: goals.filter((g) => g.userId === u && g.cycleId === c),
      projects: members.filter((m) => m.userId === u).map((m) => ({ ...projects.find((p) => p.id === m.projectId)!, contribution: m.contribution })).filter((p) => p.cycleId === c),
      deliverables: deliverables.filter((x) => x.userId === u && x.cycleId === c),
      peerFeedback: feedback.filter((f) => f.subjectId === u && f.cycleId === c && f.kind === "peer"),
      impact: impact.filter((i) => i.userId === u && i.cycleId === c),
      trainings: trainings.filter((t) => t.userId === u),
      attendance: attendance.filter((a) => a.userId === u && a.cycleId === c),
    }).score;

  const fairRating = (e: number) => 1 + (4 * (e - 40)) / 55;
  const ratings: RatingRow[] = [];
  const planted = { lenient: [] as number[], strict: [] as number[], inconsistent: [] as number[], contradictions: [] as number[] };
  let rid = 1;
  for (const m of managers) {
    if (m.behaviour !== "fair") planted[m.behaviour].push(m.id);
    const team = teams.get(m.id)!;
    // contradictions: never Priya. Strongest evidence gets rated low, weakest gets rated high,
    // so there is always room on the 1–5 scale for a clear gap.
    const active = cycles.find((c) => c.status === "active")!.id;
    const byEvidence = team.filter((u) => u !== priyaId).sort((a, b) => evidenceFor(b, active) - evidenceFor(a, active));
    const contraDir = new Map<number, number>();
    if (m.contradictions >= 1) contraDir.set(byEvidence[0], -1);
    if (m.contradictions >= 2) contraDir.set(byEvidence[byEvidence.length - 1], 1);
    const contra = new Set(contraDir.keys());
    for (const c of cycles)
      for (const u of team) {
        const e = evidenceFor(u, c.id);
        let r = fairRating(e) + between(-0.35, 0.35);
        if (m.behaviour === "lenient") r += 0.9;
        if (m.behaviour === "strict") r -= 0.9;
        if (m.behaviour === "inconsistent") r += (team.indexOf(u) % 2 ? -1 : 1) * between(1.6, 2.4);
        if (c.status === "active" && contra.has(u)) r = fairRating(e) + contraDir.get(u)! * 2.8;
        ratings.push({ id: rid++, userId: u, cycleId: c.id, managerId: m.id, rating: Math.round(clamp(r, 1, 5) * 2) / 2 });
      }
    for (const u of contra) planted.contradictions.push(u);
  }

  // ---- promotion stage, dev plan, requests ----
  const devItems: DevItemRow[] = [];
  let did = 1;
  for (const u of employees) {
    const recent = [evidenceFor(u.id, 2), evidenceFor(u.id, 3)];
    const avg = (recent[0] + recent[1]) / 2;
    u.promotionStage = avg >= 85 ? "ready" : avg >= 76 ? "near_ready" : avg >= 62 ? "developing" : "not_ready";
    if (u.id === priyaId) u.promotionStage = "near_ready";
    const skillIn = {
      deliverables: deliverables.filter((x) => x.userId === u.id),
      projects: members.filter((m) => m.userId === u.id).map((m) => ({ ...projects.find((p) => p.id === m.projectId)!, contribution: m.contribution })),
      feedback: feedback.filter((f) => f.subjectId === u.id),
    };
    const gaps = skillGaps(assessSkills(skillIn), requirements(matrix, u.track, u.level + 1));
    recommendations(gaps).slice(0, 2).forEach((rec, i) => {
      const status = u.id === priyaId ? "in_progress" : pick(["todo", "in_progress", "done"] as const);
      devItems.push({ id: did++, userId: u.id, kind: "training", title: rec.training, skill: rec.skill, due: d(2026, 10 + i, 20), status, progress: status === "done" ? 100 : status === "in_progress" ? (u.id === priyaId ? 40 + i * 25 : Math.round(between(15, 80))) : 0 });
      if (i === 0) devItems.push({ id: did++, userId: u.id, kind: "stretch", title: rec.stretch, skill: rec.skill, due: d(2026, 12, 5), status: "todo", progress: 0 });
    });
  }

  const requests: RequestRow[] = [];
  let qid = 1;
  const statuses = ["sent", "responded", "responded", "followed_up", "not_sent", "failed"] as const;
  for (const [, team] of teams)
    for (const u of team)
      team.filter((x) => x !== u).slice(0, 3).forEach((rev) => {
        const status = pick([...statuses]);
        requests.push({ id: qid++, subjectId: u, reviewerId: rev, cycleId: 3, status, sentAt: status === "not_sent" ? null : `${d(2026, 9, 10 + (qid % 15))}T10:00:00Z` });
      });
  // Priya's own review asks arrive as "sent" so she has something to answer
  for (const r of requests) if (r.reviewerId === priyaId) { r.status = "sent"; r.sentAt ??= "2026-09-24T10:00:00Z"; }

  const events: EventRow[] = [
    { id: 1, title: "Self-reviews due", date: d(2026, 10, 9), kind: "deadline" },
    { id: 2, title: "Peer feedback closes", date: d(2026, 10, 16), kind: "deadline" },
    { id: 3, title: "Engineering calibration", date: d(2026, 10, 21), kind: "calibration" },
    { id: 4, title: "Data & Product calibration", date: d(2026, 10, 23), kind: "calibration" },
    { id: 5, title: "Design calibration", date: d(2026, 10, 27), kind: "calibration" },
    { id: 6, title: "Diwali", date: d(2026, 11, 8), kind: "holiday" },
    { id: 7, title: "Ratings locked", date: d(2026, 11, 13), kind: "deadline" },
    { id: 8, title: "Promotion committee", date: d(2026, 11, 20), kind: "calibration" },
    { id: 9, title: "Gandhi Jayanti", date: d(2026, 10, 2), kind: "holiday" },
  ];

  const audit: AuditRow[] = [
    { id: 1, entity: "rating", entityId: ratings.find((r) => r.cycleId === 2)!.id, field: "rating", oldValue: "4.5", newValue: "4", reason: "Aligned with delivery evidence at H1 calibration", actorId: 1, at: "2026-07-08T11:20:00Z" },
    { id: 2, entity: "user", entityId: priyaId, field: "promotionStage", oldValue: "developing", newValue: "near_ready", reason: "Two strong cycles; design depth still pending", actorId: managers[0].id, at: "2026-07-15T09:05:00Z" },
    { id: 3, entity: "rating", entityId: ratings.filter((r) => r.cycleId === 2)[9].id, field: "rating", oldValue: "2", newValue: "3", reason: "Goal data imported late; evidence supports a 3", actorId: 2, at: "2026-07-09T15:42:00Z" },
  ];

  // ---- workspace data (Aczen pages). Drawn after the evidence so planted calibration results never move. ----
  const staff = users.filter((u) => u.role !== "hr");
  const tasks: TaskRow[] = [];
  let tid = 1;
  const TASKS = ["Review Q3 goal progress", "Draft self-review", "Prepare calibration notes", "Update onboarding doc", "Pair on design review", "Shadow incident retro"];
  for (const [mid, team] of teams)
    team.forEach((u, i) => {
      tasks.push({ id: tid++, title: TASKS[(u + i) % TASKS.length], assigneeId: u, creatorId: mid, due: d(2026, 10, 3 + ((u * 3) % 20)), priority: (["low", "medium", "high", "critical"] as const)[i % 4], notes: "", status: i % 5 === 0 ? "done" : "open", kind: "task" });
    });
  for (const di of devItems.filter((x) => x.kind === "stretch")) {
    const owner = users.find((u) => u.id === di.userId)!;
    tasks.push({ id: tid++, title: di.title, assigneeId: di.userId, creatorId: owner.managerId ?? di.userId, due: di.due, priority: "medium", notes: `Stretch assignment for ${di.skill}`, status: "open", kind: "stretch" });
  }

  const ravi = managers[0].id;

  const posts: PostRow[] = [];
  let postId = 1;
  const KUDOS = ["Unblocked the release by fixing the flaky pipeline overnight.", "Ran a brilliant design review — clear trade-offs, no ego.", "Mentored two new joiners through their first on-call.", "Turned a messy customer escalation into a clean fix and a runbook."];
  for (let k = 0; k < 10; k++) {
    const author = pick(staff);
    const pool = staff.filter((x) => x.dept === author.dept && x.id !== author.id);
    const to = pick(pool);
    posts.push({ id: postId++, authorId: author.id, recipientId: to.id, skills: [pick(TRACK_SKILLS[to.track] ?? TRACK_SKILLS.Engineering)], content: pick(KUDOS), status: k < 8 ? "published" : "scheduled", scheduledAt: k < 8 ? null : d(2026, 10, 3 + k), at: `${d(2026, 9, 15 + k)}T12:00:00Z`, cheers: [] });
  }

  const notes: NoteRow[] = [
    { id: 1, subjectId: priyaId, authorId: ravi, kind: "note", title: "Design review ownership", details: "Agreed Priya leads next sprint's design review to build System Design evidence.", at: "2026-09-29T10:00:00Z" },
  ];

  return { users, cycles, goals, projects, members, deliverables, feedback, requests, trainings, attendance, impact, ratings, matrix, devItems, events, audit, tasks, posts, notes, planted };
}
