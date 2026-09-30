import assert from "node:assert/strict";
import { test } from "node:test";
import {
  careerPaths,
  evidenceScore,
  expectedRatings,
  managerConsistency,
  promotionReadiness,
  type EvidenceInput,
  type MatrixRow,
  type RatedCase,
} from "./index";

const NOISE = [0.2, -0.2, 0.1, -0.1, 0.3, -0.3];
const EVIDENCE = [45, 55, 62, 70, 80, 90];
const fair = (e: number) => 1 + (4 * (e - 40)) / 55;
const clamp = (x: number) => Math.min(5, Math.max(1, x));

/** 4 fair managers, 1 lenient, 1 strict, 1 inconsistent, 1 with only 2 reports, one contradiction under manager 1. */
function org(): RatedCase[] {
  const cases: RatedCase[] = [];
  let uid = 1;
  const team = (managerId: number, rate: (e: number, i: number) => number) =>
    EVIDENCE.forEach((e, i) => cases.push({ userId: uid++, managerId, evidence: e + managerId, rating: clamp(rate(e, i)) }));
  for (const m of [1, 2, 3, 4]) team(m, (e, i) => fair(e) + NOISE[i]);
  team(5, (e, i) => fair(e) + 1 + NOISE[i]); // lenient
  team(6, (e, i) => fair(e) - 1 + NOISE[i]); // strict
  team(7, (_e, i) => [4.5, 1.5, 5, 1, 4, 2][i]); // ignores evidence
  cases.push({ userId: uid++, managerId: 8, evidence: 60, rating: 3 });
  cases.push({ userId: uid++, managerId: 8, evidence: 70, rating: 3.5 });
  // contradiction: strong evidence, rated 1 by a fair manager
  cases.push({ userId: 999, managerId: 1, evidence: 92, rating: 1 });
  return cases;
}

const flagsOf = (id: number) => managerConsistency(expectedRatings(org())).find((m) => m.managerId === id)!.flags;

test("fair managers carry no flags", () => {
  for (const id of [1, 2, 3, 4]) assert.deepEqual(flagsOf(id), [], `manager ${id}`);
});

test("lenient manager is flagged lenient", () => assert.ok(flagsOf(5).includes("lenient")));

test("strict manager is flagged strict", () => assert.ok(flagsOf(6).includes("strict")));

test("manager whose ratings ignore evidence is flagged inconsistent", () => assert.ok(flagsOf(7).includes("inconsistent")));

test("manager with fewer than 4 ratings gets insufficient_data only", () => assert.deepEqual(flagsOf(8), ["insufficient_data"]));

test("strong evidence rated 1 is a contradiction case", () => {
  const c = expectedRatings(org()).find((r) => r.userId === 999)!;
  assert.ok(c.flagged);
  assert.ok(c.residual <= -1.5);
});

const baseEvidence: EvidenceInput = {
  goals: [{ id: 1, target: 10, actual: 10 }],
  projects: [{ id: 2, outcomeScore: 80, contribution: 1 }],
  deliverables: [{ id: 3, due: "2026-03-01", delivered: "2026-02-28", quality: 5 }],
  peerFeedback: [{ id: 4, score: 5 }],
  impact: [{ id: 5, value: 60 }],
  trainings: [{ id: 6, status: "done" }],
  attendance: [{ id: 7, workDays: 20, presentDays: 19 }],
};

test("evidence score is the weighted mix and cites every row", () => {
  const s = evidenceScore(baseEvidence);
  // 100*.25 + 80*.15 + 100*.15 + 100*.15 + 60*.15 + 100*.1 + 95*.05 = 90.75
  assert.equal(s.score, 90.8);
  assert.deepEqual(s.missing, []);
  assert.deepEqual(s.components.find((c) => c.key === "goals")!.evidence, ["goal:1"]);
});

test("missing component redistributes its weight and is reported", () => {
  const s = evidenceScore({ ...baseEvidence, trainings: [] });
  assert.deepEqual(s.missing, ["training"]);
  const total = s.components.reduce((a, c) => a + c.weight, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  // (90.75 - 10) / 0.9
  assert.equal(s.score, 89.7);
});

test("late and missing deliverables are discounted", () => {
  const s = evidenceScore({
    ...baseEvidence,
    deliverables: [
      { id: 1, due: "2026-03-01", delivered: "2026-03-05", quality: 5 },
      { id: 2, due: "2026-03-01", delivered: null, quality: 5 },
    ],
  });
  assert.equal(s.components.find((c) => c.key === "deliverables")!.value, 35);
});

const matrix: MatrixRow[] = [
  { track: "Engineering", level: 3, skill: "Delivery", requiredLevel: 3 },
  { track: "Engineering", level: 3, skill: "System Design", requiredLevel: 3 },
  { track: "Engineering", level: 4, skill: "Delivery", requiredLevel: 4 },
  { track: "Engineering", level: 4, skill: "System Design", requiredLevel: 4 },
  { track: "Management", level: 3, skill: "Delivery", requiredLevel: 3 },
  { track: "Management", level: 3, skill: "Mentoring", requiredLevel: 3 },
];

test("readiness names exactly the unmet criteria", () => {
  const r = promotionReadiness({
    level: 3,
    track: "Engineering",
    skills: [
      { skill: "Delivery", level: 4.2, evidence: [] },
      { skill: "System Design", level: 3.1, evidence: [] },
    ],
    matrix,
    recentScores: [78, 81],
    openTrainings: [],
  });
  assert.equal(r.nextLevel, 4);
  assert.equal(r.percent, 75);
  assert.equal(r.unmet.length, 1);
  assert.match(r.unmet[0], /System Design at level 4/);
});

test("top of track has no next level", () => {
  const r = promotionReadiness({ level: 4, track: "Engineering", skills: [], matrix, recentScores: [], openTrainings: [] });
  assert.equal(r.nextLevel, null);
});

test("career paths include next level and qualifying lateral tracks", () => {
  const paths = careerPaths({
    level: 3,
    track: "Engineering",
    skills: [
      { skill: "Delivery", level: 3.5, evidence: [] },
      { skill: "Mentoring", level: 2.4, evidence: [] },
    ],
    matrix,
  });
  assert.deepEqual(
    paths.map((p) => `${p.kind}:${p.track}:${p.level}`),
    ["next:Engineering:4", "lateral:Management:3"],
  );
});
