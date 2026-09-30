"use server";

import { TITLES } from "@/lib/data/generate";
import { calibration, canSee, getUser, profile, resolveEvidence, visibleUserIds, type EvidenceItem } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

export type Intent = "next_level" | "score" | "skills" | "flagged" | "compare" | "managers" | "close_to_promotion";
export interface Answer { text: string[]; cites: EvidenceItem[] }

const INTENT_WORDS: [Intent, RegExp][] = [
  ["flagged", /flag|disagree|why.*rat|contradict/i],
  ["managers", /manager|lenient|strict|inconsistent/i],
  ["compare", /compare|org|average|calibrat/i],
  ["close_to_promotion", /close|promot|ready/i],
  ["next_level", /next level|need|criteria/i],
  ["skills", /skill|gap|learn|course|train/i],
  ["score", /score|evidence|why.*\d/i],
];

const cite = (refs: string[], n = 4) => refs.slice(0, n).map(resolveEvidence).filter((e): e is EvidenceItem => !!e);

/** Answers are built from engine output only — no model, nothing invented. */
export async function ask(input: { intent?: Intent; question?: string; personId?: number }): Promise<Answer> {
  const viewer = await requireRole();
  const intent = input.intent ?? INTENT_WORDS.find(([, re]) => re.test(input.question ?? ""))?.[0];
  const subjectId = input.personId && canSee(viewer, input.personId) ? input.personId : viewer.role === "employee" ? viewer.id : null;

  if (!intent)
    return { text: ["I answer from the evidence in EvalSense, so I stick to a few kinds of question. Try one of the suggestions, or ask about promotion criteria, evidence scores, skills, or flagged ratings."], cites: [] };

  if ((intent === "next_level" || intent === "score" || intent === "skills" || intent === "flagged") && !subjectId)
    return { text: ["Pick a person first, then ask again."], cites: [] };

  if (intent === "next_level") {
    const p = profile(subjectId!);
    const title = TITLES[p.user.track]?.[p.user.level] ?? "the next level";
    if (!p.readiness.nextLevel) return { text: [`${p.user.name} is at the top of the ${p.user.track} track.`], cites: [] };
    return {
      text: [
        `${p.user.name} meets ${p.readiness.criteria.filter((c) => c.met).length} of ${p.readiness.criteria.length} criteria for ${title} (${p.readiness.percent}%).`,
        ...(p.readiness.unmet.length ? ["Still needed:", ...p.readiness.unmet.map((u) => `• ${u}`)] : ["Every criterion is met."]),
      ],
      cites: cite(p.skills.filter((s) => p.gaps.some((g) => g.skill === s.skill)).flatMap((s) => s.evidence)),
    };
  }

  if (intent === "score") {
    const p = profile(subjectId!);
    const ev = p.current.evidence;
    const sorted = [...ev.components].sort((a, b) => b.value * b.weight - a.value * a.weight);
    return {
      text: [
        `${p.user.name}'s ${p.cycle.name} evidence score is ${ev.score}/100.`,
        `Strongest: ${sorted[0].label} (${sorted[0].value}). Weakest: ${sorted.at(-1)!.label} (${sorted.at(-1)!.value}).`,
        ...(ev.missing.length ? [`No ${ev.missing.join(", ")} evidence yet, so those weights were spread across the rest.`] : []),
      ],
      cites: cite(sorted.at(-1)!.evidence),
    };
  }

  if (intent === "skills") {
    const p = profile(subjectId!);
    if (!p.recs.length) return { text: [`${p.user.name} has no skill gaps against the next level.`], cites: [] };
    return {
      text: [`Biggest gaps for ${p.user.name}:`, ...p.recs.map((r) => `• ${r.skill}: ${r.gap} levels short. Course: ${r.training}. Stretch: ${r.stretch}.`)],
      cites: cite(p.skills.filter((s) => s.skill === p.recs[0].skill).flatMap((s) => s.evidence)),
    };
  }

  const cal = calibration();

  if (intent === "flagged") {
    const c = cal.cases.find((x) => x.userId === subjectId);
    if (!c) return { text: ["There's no rating for this person in the current cycle yet."], cites: [] };
    const p = profile(subjectId!);
    return {
      text: c.flagged
        ? [
            `${c.user.name} is rated ${c.rating}, but evidence of ${c.evidence}/100 predicts about ${c.expected}.`,
            `That's a gap of ${c.residual > 0 ? "+" : ""}${c.residual}, past the ±1.5 line, so it goes to calibration. The rating may still be right — the manager should say why in the review.`,
          ]
        : [`${c.user.name}'s rating of ${c.rating} is within 1.5 of what the evidence predicts (${c.expected}). Nothing to review.`],
      cites: cite(p.current.evidence.components.flatMap((x) => x.evidence), 5),
    };
  }

  if (viewer.role === "employee") return { text: ["That question is for managers and HR. Ask about your own score, skills or next level instead."], cites: [] };

  if (intent === "compare") {
    const scope = viewer.role === "hr" ? cal.managers : cal.managers.filter((m) => m.managerId === viewer.id);
    return {
      text: scope.map((m) => `${m.manager.name}: typical gap vs evidence ${m.medianResidual > 0 ? "+" : ""}${m.medianResidual} over ${m.n} ratings${m.flags.length ? ` — ${m.flags.join(", ")}` : " — calibrated"}.`),
      cites: [],
    };
  }

  if (intent === "managers") {
    const off = cal.managers.filter((m) => m.flags.some((f) => f !== "insufficient_data") && (viewer.role === "hr" || m.managerId === viewer.id));
    return {
      text: off.length ? off.map((m) => `${m.manager.name} is ${m.flags.join(" and ")} (typical gap ${m.medianResidual > 0 ? "+" : ""}${m.medianResidual}, correlation with evidence ${m.correlation ?? "n/a"}).`) : ["No manager in your scope rates off-pattern this cycle."],
      cites: [],
    };
  }

  // close_to_promotion — alphabetical, never ranked
  const near = visibleUserIds(viewer).map((id) => getUser(id)!).filter((u) => u.promotionStage === "near_ready" || u.promotionStage === "ready").sort((a, b) => a.name.localeCompare(b.name));
  return {
    text: near.length ? [`${near.length} people are near or ready (alphabetical):`, ...near.map((u) => `• ${u.name}: ${profile(u.id).readiness.percent}% of criteria met`)] : ["Nobody in your scope is near promotion yet."],
    cites: [],
  };
}
