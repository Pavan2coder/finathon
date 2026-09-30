import { THRESHOLDS } from "./thresholds";

export interface RatedCase {
  userId: number;
  managerId: number;
  evidence: number; // evidence score 0–100
  rating: number; // 1–5
}

export interface CaseResult extends RatedCase {
  expected: number;
  residual: number;
  flagged: boolean;
}

export type ManagerFlag = "lenient" | "strict" | "inconsistent" | "insufficient_data";

export interface ManagerResult {
  managerId: number;
  n: number;
  meanRating: number;
  medianResidual: number;
  spread: number; // robust SD of residuals (1.4826 × MAD)
  correlation: number | null;
  flags: ManagerFlag[];
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const round2 = (x: number) => Math.round(x * 100) / 100;

/**
 * Expected rating = a robust (Theil–Sen) line through every rating in the cycle against its
 * evidence score. The slope is the median of all pairwise slopes and the intercept the median
 * offset, so a minority of lenient or strict managers cannot drag the baseline with them.
 * Residual = actual − expected.
 */
export function expectedRatings(cases: RatedCase[]): CaseResult[] {
  if (cases.length < 2) return cases.map((c) => ({ ...c, expected: c.rating, residual: 0, flagged: false }));
  const slopes: number[] = [];
  for (let i = 0; i < cases.length; i++)
    for (let j = i + 1; j < cases.length; j++) {
      const dx = cases[j].evidence - cases[i].evidence;
      if (dx !== 0) slopes.push((cases[j].rating - cases[i].rating) / dx);
    }
  const slope = slopes.length ? median(slopes) : 0;
  const intercept = median(cases.map((c) => c.rating - slope * c.evidence));
  return cases.map((c) => {
    const expected = round2(Math.min(5, Math.max(1, intercept + slope * c.evidence)));
    const residual = round2(c.rating - expected);
    return { ...c, expected, residual, flagged: Math.abs(residual) >= THRESHOLDS.contradictionResidual };
  });
}

function robustSpread(xs: number[]) {
  const m = median(xs);
  return 1.4826 * median(xs.map((x) => Math.abs(x - m)));
}

function pearson(xs: number[], ys: number[]): number | null {
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : null;
}

/**
 * Per-manager rating behaviour. Individual contradictions are already surfaced as case flags,
 * so the systemic checks (typical gap, spread, correlation) look at the manager's other ratings;
 * a manager whose flagged share is itself high is inconsistent by definition.
 */
export function managerConsistency(results: CaseResult[]): ManagerResult[] {
  const byManager = new Map<number, CaseResult[]>();
  for (const r of results) byManager.set(r.managerId, [...(byManager.get(r.managerId) ?? []), r]);

  const rows = [...byManager].map(([managerId, rs]) => {
    const typical = rs.filter((r) => !r.flagged);
    const base = typical.length >= 3 ? typical : rs;
    const residuals = base.map((r) => r.residual);
    return {
      managerId,
      n: rs.length,
      flaggedShare: rs.filter((r) => r.flagged).length / rs.length,
      // errs in both directions, as opposed to a consistent lean
      bothWays: rs.some((r) => r.flagged && r.residual > 0) && rs.some((r) => r.flagged && r.residual < 0),
      meanRating: round2(mean(rs.map((r) => r.rating))),
      medianResidual: round2(median(residuals)),
      spread: round2(robustSpread(residuals)),
      correlation: base.length > 2 ? pearson(base.map((r) => r.evidence), base.map((r) => r.rating)) : null,
    };
  });

  const eligible = rows.filter((r) => r.n >= THRESHOLDS.minRatingsPerManager);
  const orgSpread = eligible.length ? median(eligible.map((r) => r.spread)) : 0;
  const spreadLimit = Math.max(THRESHOLDS.inconsistentSpreadMultiple * orgSpread, THRESHOLDS.inconsistentMinSpread);

  return rows.map(({ flaggedShare, bothWays, ...r }) => {
    const flags: ManagerFlag[] = [];
    if (r.n < THRESHOLDS.minRatingsPerManager) flags.push("insufficient_data");
    else {
      if (r.medianResidual > THRESHOLDS.lenientResidual) flags.push("lenient");
      if (r.medianResidual < THRESHOLDS.strictResidual) flags.push("strict");
      const erratic = bothWays && flaggedShare >= THRESHOLDS.inconsistentFlaggedShare;
      const wide = r.spread > spreadLimit;
      const untracked = r.correlation !== null && r.correlation < THRESHOLDS.inconsistentMinCorrelation;
      if (erratic || wide || untracked) flags.push("inconsistent");
    }
    return { ...r, correlation: r.correlation === null ? null : round2(r.correlation), flags };
  });
}
