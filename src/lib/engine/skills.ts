import type { EvidenceRef } from "./evidence";
import { THRESHOLDS } from "./thresholds";

export interface SkillInput {
  deliverables: { id: number; quality: number; skills: string[] }[];
  projects: { id: number; outcomeScore: number; contribution: number; skills: string[] }[];
  feedback: { id: number; score: number; skills: string[] }[];
}

export interface SkillLevel {
  skill: string;
  level: number; // 1–5, 1 dp
  evidence: EvidenceRef[];
}

export interface MatrixRow {
  track: string;
  level: number;
  skill: string;
  requiredLevel: number;
}

export interface Gap {
  skill: string;
  current: number;
  required: number;
  gap: number;
}

const r1 = (x: number) => Math.round(x * 10) / 10;

/** Demonstrated level per skill from tagged work (quality, outcomes) blended with tagged feedback. */
export function assessSkills(input: SkillInput): SkillLevel[] {
  const acc = new Map<string, { work: number[]; workW: number[]; fb: number[]; evidence: EvidenceRef[] }>();
  const get = (s: string) => {
    if (!acc.has(s)) acc.set(s, { work: [], workW: [], fb: [], evidence: [] });
    return acc.get(s)!;
  };
  for (const d of input.deliverables)
    for (const s of d.skills) {
      const a = get(s);
      a.work.push(d.quality);
      a.workW.push(1);
      a.evidence.push(`deliverable:${d.id}`);
    }
  for (const p of input.projects)
    for (const s of p.skills) {
      const a = get(s);
      a.work.push(1 + (p.outcomeScore / 100) * 4);
      a.workW.push(p.contribution);
      a.evidence.push(`project:${p.id}`);
    }
  for (const f of input.feedback)
    for (const s of f.skills) {
      const a = get(s);
      a.fb.push(f.score);
      a.evidence.push(`feedback:${f.id}`);
    }
  return [...acc].map(([skill, a]) => {
    const wSum = a.workW.reduce((x, y) => x + y, 0);
    const work = wSum ? a.work.reduce((x, v, i) => x + v * a.workW[i], 0) / wSum : null;
    const fb = a.fb.length ? a.fb.reduce((x, y) => x + y, 0) / a.fb.length : null;
    const blend = THRESHOLDS.skillFeedbackBlend;
    const level = work !== null && fb !== null ? work * (1 - blend) + fb * blend : (work ?? fb)!;
    return { skill, level: r1(level), evidence: a.evidence };
  });
}

export function requirements(matrix: MatrixRow[], track: string, level: number) {
  return matrix.filter((m) => m.track === track && m.level === level);
}

/** Skills where demonstrated level falls short of the given level's requirement. Undemonstrated skills count as 0. */
export function skillGaps(skills: SkillLevel[], reqs: MatrixRow[]): Gap[] {
  const lvl = new Map(skills.map((s) => [s.skill, s.level]));
  return reqs
    .map((r) => {
      const current = lvl.get(r.skill) ?? 0;
      return { skill: r.skill, current, required: r.requiredLevel, gap: r1(r.requiredLevel - current) };
    })
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap);
}

export const CATALOG: Record<string, { course: string; stretch: string }> = {
  "System Design": { course: "Designing Distributed Systems", stretch: "Own the design review for the next service" },
  "Code Quality": { course: "Refactoring & Testing Craft", stretch: "Lead a test-coverage push on a legacy module" },
  Delivery: { course: "Planning & Estimation", stretch: "Run a sprint as delivery lead" },
  Collaboration: { course: "Cross-team Collaboration", stretch: "Pair with another team on a shared milestone" },
  Mentoring: { course: "Coaching Fundamentals", stretch: "Mentor a new joiner through onboarding" },
  Analytics: { course: "Applied Analytics", stretch: "Build the team's KPI dashboard" },
  Statistics: { course: "Statistics for Decisions", stretch: "Design and read out an A/B test" },
  Communication: { course: "Clear Writing & Presenting", stretch: "Present the quarterly review to leadership" },
  "Data Engineering": { course: "Data Pipelines in Practice", stretch: "Migrate one batch job to streaming" },
  "Product Strategy": { course: "Product Strategy Bootcamp", stretch: "Write the next-quarter opportunity memo" },
  "Stakeholder Mgmt": { course: "Managing Stakeholders", stretch: "Run the monthly stakeholder sync" },
  "UX Research": { course: "Research Methods", stretch: "Plan and run five user interviews" },
  "Visual Design": { course: "Visual Systems", stretch: "Extend the design system with a new component family" },
};

export interface Recommendation {
  skill: string;
  gap: number;
  training: string;
  stretch: string;
}

export function recommendations(gaps: Gap[]): Recommendation[] {
  return gaps.map((g) => ({
    skill: g.skill,
    gap: g.gap,
    training: CATALOG[g.skill]?.course ?? `${g.skill} fundamentals`,
    stretch: CATALOG[g.skill]?.stretch ?? `Take on a project that exercises ${g.skill}`,
  }));
}

export interface Criterion {
  label: string;
  met: boolean;
  detail: string;
}

export interface Readiness {
  nextLevel: number | null; // null = top of track
  percent: number; // 0–100
  criteria: Criterion[];
  unmet: string[];
}

export function promotionReadiness(args: {
  level: number;
  track: string;
  skills: SkillLevel[];
  matrix: MatrixRow[];
  recentScores: number[]; // most recent last
  openTrainings: string[]; // course names not yet done
}): Readiness {
  const nextLevel = args.level + 1;
  const reqs = requirements(args.matrix, args.track, nextLevel);
  if (!reqs.length) return { nextLevel: null, percent: 100, criteria: [], unmet: [] };

  const lvl = new Map(args.skills.map((s) => [s.skill, s.level]));
  const criteria: Criterion[] = reqs.map((r) => {
    const cur = lvl.get(r.skill) ?? 0;
    return {
      label: `${r.skill} at level ${r.requiredLevel}`,
      met: cur >= r.requiredLevel,
      detail: cur >= r.requiredLevel ? `Demonstrated ${cur}` : `Demonstrated ${cur}, needs ${r.requiredLevel}`,
    };
  });

  const need = THRESHOLDS.promotionCycles;
  const last = args.recentScores.slice(-need);
  const scoreMet = last.length === need && last.every((s) => s >= THRESHOLDS.promotionEvidenceScore);
  criteria.push({
    label: `Evidence score ≥ ${THRESHOLDS.promotionEvidenceScore} for ${need} cycles`,
    met: scoreMet,
    detail: last.length ? `Last ${last.length}: ${last.join(", ")}` : "No closed cycles yet",
  });

  criteria.push({
    label: "Assigned trainings complete",
    met: args.openTrainings.length === 0,
    detail: args.openTrainings.length ? `Open: ${args.openTrainings.join(", ")}` : "All done",
  });

  const met = criteria.filter((c) => c.met).length;
  return {
    nextLevel,
    percent: Math.round((met / criteria.length) * 100),
    criteria,
    unmet: criteria.filter((c) => !c.met).map((c) => `${c.label} — ${c.detail}`),
  };
}

export interface CareerPath {
  track: string;
  level: number;
  overlap: number; // 0–1
  kind: "next" | "lateral";
}

/** Next level on the current track, plus lateral tracks at the same level whose requirements the person mostly meets. */
export function careerPaths(args: { level: number; track: string; skills: SkillLevel[]; matrix: MatrixRow[] }): CareerPath[] {
  const lvl = new Map(args.skills.map((s) => [s.skill, s.level]));
  const overlap = (reqs: MatrixRow[]) =>
    reqs.length ? reqs.reduce((a, r) => a + Math.min((lvl.get(r.skill) ?? 0) / r.requiredLevel, 1), 0) / reqs.length : 0;

  const paths: CareerPath[] = [];
  const next = requirements(args.matrix, args.track, args.level + 1);
  if (next.length)
    paths.push({ track: args.track, level: args.level + 1, overlap: Math.round(overlap(next) * 100) / 100, kind: "next" });

  const tracks = [...new Set(args.matrix.map((m) => m.track))].filter((t) => t !== args.track);
  for (const t of tracks) {
    const o = overlap(requirements(args.matrix, t, args.level));
    if (o >= THRESHOLDS.careerOverlap) paths.push({ track: t, level: args.level, overlap: Math.round(o * 100) / 100, kind: "lateral" });
  }
  return paths;
}
