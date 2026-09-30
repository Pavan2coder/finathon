// Runs the engine over the generated dataset and checks it finds exactly the planted patterns.
import assert from "node:assert/strict";
import { generate } from "../src/lib/data/generate";
import { evidenceScore, expectedRatings, managerConsistency } from "../src/lib/engine";

const ds = generate();
const cycle = ds.cycles.find((c) => c.status === "active")!.id;
const projectsOf = (u: number) =>
  ds.members.filter((m) => m.userId === u).map((m) => ({ ...ds.projects.find((p) => p.id === m.projectId)!, contribution: m.contribution }));
const evidence = (u: number) =>
  evidenceScore({
    goals: ds.goals.filter((x) => x.userId === u && x.cycleId === cycle),
    projects: projectsOf(u).filter((p) => p.cycleId === cycle),
    deliverables: ds.deliverables.filter((x) => x.userId === u && x.cycleId === cycle),
    peerFeedback: ds.feedback.filter((f) => f.subjectId === u && f.cycleId === cycle && f.kind === "peer"),
    impact: ds.impact.filter((x) => x.userId === u && x.cycleId === cycle),
    trainings: ds.trainings.filter((t) => t.userId === u),
    attendance: ds.attendance.filter((a) => a.userId === u && a.cycleId === cycle),
  }).score;

const cases = expectedRatings(
  ds.ratings.filter((r) => r.cycleId === cycle).map((r) => ({ userId: r.userId, managerId: r.managerId, rating: r.rating, evidence: evidence(r.userId) })),
);
const managers = managerConsistency(cases);
const name = (id: number) => ds.users.find((u) => u.id === id)!.name;
const withFlag = (f: string) => managers.filter((m) => m.flags.includes(f as never)).map((m) => m.managerId).sort();

console.table(managers.map((m) => ({ manager: name(m.managerId), n: m.n, gap: m.medianResidual, spread: m.spread, r: m.correlation, flags: m.flags.join(",") })));

assert.deepEqual(withFlag("lenient"), [...ds.planted.lenient].sort(), "lenient managers");
assert.deepEqual(withFlag("strict"), [...ds.planted.strict].sort(), "strict managers");
assert.deepEqual(withFlag("inconsistent"), [...ds.planted.inconsistent].sort(), "inconsistent managers");

const biased = new Set([...ds.planted.lenient, ...ds.planted.strict, ...ds.planted.inconsistent]);
const flaggedUnderFair = cases.filter((c) => c.flagged && !biased.has(c.managerId)).map((c) => c.userId).sort();
assert.deepEqual(flaggedUnderFair, [...ds.planted.contradictions].sort(), "contradiction cases under fair managers");

console.log(`seed-check ok: ${ds.planted.lenient.length} lenient, ${ds.planted.strict.length} strict, ${ds.planted.inconsistent.length} inconsistent, ${ds.planted.contradictions.length} contradictions found exactly`);
