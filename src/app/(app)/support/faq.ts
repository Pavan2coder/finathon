import { THRESHOLDS } from "@/lib/engine";

const w = THRESHOLDS.weights;
const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Knowledge base. The support chat answers from these entries only. */
export const FAQ: { q: string; a: string; keys: RegExp }[] = [
  {
    q: "How is my evidence score calculated?",
    a: `It's a weighted mix of seven sources for the cycle: goals ${pct(w.goals)}, project outcomes ${pct(w.projects)}, deliverables ${pct(w.deliverables)} (on time × quality), peer feedback ${pct(w.peer)}, business impact ${pct(w.impact)}, training ${pct(w.training)} and attendance ${pct(w.attendance)}. If a source is missing, its weight is spread over the rest and your profile says so.`,
    keys: /score|evidence|calculat|weight/i,
  },
  {
    q: "Why was a rating flagged?",
    a: `A rating is flagged when it sits ${THRESHOLDS.contradictionResidual} or more points away from what the evidence predicts. The prediction is a line fitted through every rating in the cycle, so a few lenient or strict managers can't move it. A flag starts a review; it doesn't change the rating.`,
    keys: /flag|disagree|calibrat|residual/i,
  },
  {
    q: "What makes a manager lenient, strict or inconsistent?",
    a: `Lenient or strict: their typical (median) gap from the evidence is beyond ±${THRESHOLDS.lenientResidual}. Inconsistent: their ratings barely track evidence (correlation under ${THRESHOLDS.inconsistentMinCorrelation}), spread unusually wide, or many of them are flagged in both directions. Managers with fewer than ${THRESHOLDS.minRatingsPerManager} ratings show "insufficient data".`,
    keys: /lenient|strict|inconsistent|manager/i,
  },
  {
    q: "What do I need for promotion?",
    a: `Every skill the next level requires at or above its bar, an evidence score of ${THRESHOLDS.promotionEvidenceScore}+ for ${THRESHOLDS.promotionCycles} closed cycles, and your assigned trainings done. Your profile lists exactly which of these are still open.`,
    keys: /promot|next level|ready|criteria/i,
  },
  {
    q: "How do I punch in?",
    a: "On the Dashboard, type the 5-letter code shown on screen, take a photo with the live camera, then press Punch in. Codes expire after two minutes; tap refresh for a new one. Punch out the same way.",
    keys: /punch|attendance|camera|code/i,
  },
  {
    q: "How do I request leave?",
    a: "Go to Leaves and press Request leave. Weekends aren't counted, and you can't book more days than your balance or overlap an existing request. Your manager approves or rejects it.",
    keys: /leave|holiday|vacation|sick|wfh|time off/i,
  },
  {
    q: "How does recognition affect my profile?",
    a: "Published recognition is saved as peer feedback on the recipient's profile, tagged with the skill it names, so it counts toward their evidence and skill levels.",
    keys: /recogni|kudos|thank/i,
  },
  {
    q: "Does EvalSense rank employees?",
    a: "No. It never sorts people by score. It compares how managers rate against evidence and flags individual ratings for review. Final decisions stay with people.",
    keys: /rank|leaderboard|compare people/i,
  },
];
