import type { CareerPath } from "@/lib/engine";

/** Current role on the left, possible moves on the right; edges labelled with skill overlap. */
export function CareerGraph({ current, paths, titleFor }: { current: string; paths: CareerPath[]; titleFor: (p: CareerPath) => string }) {
  const W = 520;
  const rowH = 76;
  const H = Math.max(1, paths.length) * rowH + 24;
  const cy = H / 2;
  return (
    <div className="grid-paper overflow-x-auto rounded-md border-[3px] border-ink p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[420px]" role="img" aria-label={`Career paths from ${current}`}>
        {paths.map((p, i) => {
          const y = 12 + i * rowH + rowH / 2;
          return (
            <g key={p.track + p.level}>
              <path d={`M 176,${cy} C 250,${cy} 250,${y} 312,${y}`} fill="none" stroke="var(--series-1)" strokeWidth={1.5} className={p.kind === "next" ? "anim-dash" : undefined} strokeDasharray={p.kind === "next" ? undefined : "4 4"} />
              <rect x={216} y={(cy + y) / 2 - 11} width={56} height={22} rx={3} fill="var(--card)" stroke="var(--ink)" strokeWidth={2} />
              <text x={244} y={(cy + y) / 2 + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={11} fill="var(--ink)">{Math.round(p.overlap * 100)}%</text>
              <rect x={316} y={y - 26} width={196} height={52} rx={5} fill="var(--ink)" />
              <rect x={312} y={y - 30} width={196} height={52} rx={5} fill={p.kind === "next" ? "var(--accent)" : "var(--card)"} stroke="var(--ink)" strokeWidth={3} />
              <text x={324} y={y - 10} fontFamily="var(--font-mono)" fontSize={10} letterSpacing="0.1em" fill={p.kind === "next" ? "#0f1417" : "var(--muted)"}>{p.kind === "next" ? "NEXT LEVEL" : "LATERAL MOVE"}</text>
              <text x={324} y={y + 10} fontFamily="var(--font-sans)" fontSize={14} fontWeight={600} fill={p.kind === "next" ? "#0f1417" : "var(--ink)"}>{titleFor(p)}</text>
            </g>
          );
        })}
        <rect x={16} y={cy - 26} width={164} height={52} rx={5} fill="var(--ink)" />
        <rect x={12} y={cy - 30} width={164} height={52} rx={5} fill="var(--primary)" stroke="var(--ink)" strokeWidth={3} />
        <text x={26} y={cy - 10} fontFamily="var(--font-mono)" fontSize={10} letterSpacing="0.1em" fill="#ffffff">NOW</text>
        <text x={26} y={cy + 10} fontFamily="var(--font-sans)" fontSize={14} fontWeight={600} fill="#ffffff">{current}</text>
      </svg>
      <p className="px-2 pb-1 text-xs text-muted">Percent = how much of that role&apos;s skill bar is already met. Lateral moves show at 70% or more.</p>
    </div>
  );
}
