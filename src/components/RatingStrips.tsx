import { Chip } from "./ui";

export interface StripRow {
  id: number;
  name: string;
  ratings: { value: number; flagged: boolean; who: string }[];
  mean: number;
  medianResidual: number;
  flags: string[];
}

/** One row per manager: every rating as a square on a 1–5 line, their mean as a bar, the org mean dashed. */
export function RatingStrips({ rows, orgMean }: { rows: StripRow[]; orgMean: number }) {
  const W = 520;
  const x = (v: number) => 16 + ((v - 1) / 4) * (W - 32);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="label text-left text-muted">
            <th className="w-44 py-2 font-normal">Manager</th>
            <th className="font-normal">
              <svg viewBox={`0 0 ${W} 20`} className="w-full" aria-hidden>
                {[1, 2, 3, 4, 5].map((v) => (
                  <text key={v} x={x(v)} y={14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={11} fill="var(--muted)">{v}</text>
                ))}
              </svg>
            </th>
            <th className="w-24 text-right font-normal">vs evidence</th>
            <th className="w-48 pl-4 font-normal">Pattern</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            // stack equal ratings vertically so every point stays visible
            const seen = new Map<number, number>();
            return (
              <tr key={r.id} className="border-t-2 border-ink/10">
                <td className="py-2 font-medium">{r.name}<span className="block text-xs font-normal text-muted">{r.ratings.length} ratings</span></td>
                <td>
                  <svg viewBox={`0 0 ${W} 44`} className="w-full" role="img" aria-label={`${r.name}: ratings average ${r.mean}, org average ${orgMean}`}>
                    <line x1={x(1)} x2={x(5)} y1={22} y2={22} stroke="rgb(var(--ink-rgb) / 0.25)" strokeWidth={2} />
                    <line x1={x(orgMean)} x2={x(orgMean)} y1={2} y2={42} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="4 4" />
                    <rect x={x(r.mean) - 2} y={2} width={4} height={40} fill="var(--series-1)" />
                    {r.ratings.map((p, i) => {
                      const k = seen.get(p.value) ?? 0;
                      seen.set(p.value, k + 1);
                      const cy = 22 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 9;
                      return (
                        <rect key={i} x={x(p.value) - 4 + (k > 4 ? 6 : 0)} y={cy - 4} width={8} height={8}
                          fill={p.flagged ? "var(--alert)" : "var(--card)"} stroke="var(--ink)" strokeWidth={1.5}>
                          <title>{`${p.who}: ${p.value}${p.flagged ? " — disagrees with evidence" : ""}`}</title>
                        </rect>
                      );
                    })}
                  </svg>
                </td>
                <td className="text-right font-mono tabular-nums">{r.medianResidual > 0 ? "+" : ""}{r.medianResidual.toFixed(2)}</td>
                <td className="pl-4">
                  <span className="flex flex-wrap gap-1.5">
                    {r.flags.length ? r.flags.map((f) => <Chip key={f} kind={f} />) : <Chip kind="ok">calibrated</Chip>}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-2"><span className="inline-block size-2.5 border-[1.5px] border-ink bg-card" /> one rating</span>
        <span className="flex items-center gap-2"><span className="inline-block size-2.5 border-[1.5px] border-ink bg-alert" /> disagrees with evidence</span>
        <span className="flex items-center gap-2"><span className="inline-block h-3 w-1 bg-primary" /> manager average</span>
        <span className="flex items-center gap-2"><span className="inline-block w-4 border-t-[1.5px] border-dashed border-ink" /> org average</span>
        <span>“vs evidence” = average gap between rating and what evidence predicts; beyond ±0.5 is flagged.</span>
      </p>
    </div>
  );
}
