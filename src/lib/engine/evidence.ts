import { THRESHOLDS } from "./thresholds";

/** Evidence references look like "goal:12" so the UI can link to the row. */
export type EvidenceRef = string;

export interface EvidenceInput {
  goals: { id: number; target: number; actual: number }[];
  projects: { id: number; outcomeScore: number; contribution: number }[];
  deliverables: { id: number; due: string; delivered: string | null; quality: number }[];
  peerFeedback: { id: number; score: number }[];
  impact: { id: number; value: number }[];
  trainings: { id: number; status: "planned" | "in_progress" | "done" }[];
  attendance: { id: number; workDays: number; presentDays: number }[];
}

export type ComponentKey = keyof typeof THRESHOLDS.weights;

export interface Component {
  key: ComponentKey;
  label: string;
  weight: number;
  value: number; // 0–100
  evidence: EvidenceRef[];
}

export interface EvidenceScore {
  score: number; // 0–100, rounded to 1 dp
  components: Component[];
  missing: ComponentKey[];
}

const LABELS: Record<ComponentKey, string> = {
  goals: "Goal attainment",
  projects: "Project outcomes",
  deliverables: "Deliverables",
  peer: "Peer feedback",
  impact: "Business impact",
  training: "Training",
  attendance: "Attendance",
};

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

function compute(ev: EvidenceInput): Partial<Record<ComponentKey, { value: number; evidence: EvidenceRef[] }>> {
  const out: Partial<Record<ComponentKey, { value: number; evidence: EvidenceRef[] }>> = {};
  if (ev.goals.length)
    out.goals = {
      value: mean(ev.goals.map((g) => Math.min(g.actual / g.target, 1) * 100)),
      evidence: ev.goals.map((g) => `goal:${g.id}`),
    };
  const totalContribution = ev.projects.reduce((a, p) => a + p.contribution, 0);
  if (ev.projects.length && totalContribution > 0)
    out.projects = {
      value: ev.projects.reduce((a, p) => a + p.outcomeScore * p.contribution, 0) / totalContribution,
      evidence: ev.projects.map((p) => `project:${p.id}`),
    };
  if (ev.deliverables.length)
    out.deliverables = {
      value: mean(
        ev.deliverables.map((d) => {
          const timing = d.delivered === null ? 0 : d.delivered <= d.due ? 1 : THRESHOLDS.lateDeliveryFactor;
          return timing * (d.quality / 5) * 100;
        }),
      ),
      evidence: ev.deliverables.map((d) => `deliverable:${d.id}`),
    };
  if (ev.peerFeedback.length)
    out.peer = {
      value: mean(ev.peerFeedback.map((f) => ((f.score - 1) / 4) * 100)),
      evidence: ev.peerFeedback.map((f) => `feedback:${f.id}`),
    };
  if (ev.impact.length)
    out.impact = { value: mean(ev.impact.map((i) => i.value)), evidence: ev.impact.map((i) => `impact:${i.id}`) };
  if (ev.trainings.length)
    out.training = {
      value: (ev.trainings.filter((t) => t.status === "done").length / ev.trainings.length) * 100,
      evidence: ev.trainings.map((t) => `training:${t.id}`),
    };
  const work = ev.attendance.reduce((a, r) => a + r.workDays, 0);
  if (work > 0)
    out.attendance = {
      value: (ev.attendance.reduce((a, r) => a + r.presentDays, 0) / work) * 100,
      evidence: ev.attendance.map((r) => `attendance:${r.id}`),
    };
  return out;
}

/** Weighted evidence score; weights of missing components are redistributed over present ones. */
export function evidenceScore(ev: EvidenceInput): EvidenceScore {
  const parts = compute(ev);
  const keys = Object.keys(THRESHOLDS.weights) as ComponentKey[];
  const present = keys.filter((k) => parts[k]);
  const missing = keys.filter((k) => !parts[k]);
  const totalWeight = present.reduce((a, k) => a + THRESHOLDS.weights[k], 0);
  const components: Component[] = present.map((k) => ({
    key: k,
    label: LABELS[k],
    weight: THRESHOLDS.weights[k] / totalWeight,
    value: Math.round(parts[k]!.value * 10) / 10,
    evidence: parts[k]!.evidence,
  }));
  const score = totalWeight ? components.reduce((a, c) => a + c.value * c.weight, 0) : 0;
  return { score: Math.round(score * 10) / 10, components, missing };
}
