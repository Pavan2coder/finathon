"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceArea,
  ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, type TooltipProps,
} from "recharts";

// Validated with dataviz/validate_palette.js: 2 categorical slots, light + dark. Ink dashed = reference series.
export const S1 = "var(--series-1)";
export const S2 = "var(--series-2)";
const INK = "var(--ink)";
const ALERT = "var(--alert)";
const AXIS = { fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--muted)" };

function BrutalTooltip({ active, payload, label }: TooltipProps<number, string> & { payload?: { name?: string; value?: number; color?: string; payload?: Record<string, unknown> }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const extra = payload[0].payload?.tooltip as string | undefined;
  return (
    <div className="rounded-md border-[3px] border-ink bg-card px-3 py-2 text-sm shadow-brutal-sm">
      {label !== undefined && <p className="label mb-1">{label}</p>}
      {extra && <p className="mb-1 font-medium">{extra}</p>}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="inline-block size-2.5 border border-ink" style={{ background: p.color }} />
          <span className="text-muted">{p.name}</span>
          <span className="ml-auto font-mono tabular-nums">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="mb-3 flex flex-wrap gap-4 text-xs">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2">
          {i.dashed ? <span className="inline-block w-5 border-t-2 border-dashed border-ink" /> : <span className="inline-block size-3 border-2 border-ink" style={{ background: i.color }} />}
          {i.label}
        </span>
      ))}
    </div>
  );
}

/** Line trend across cycles. series: up to two keys; optional dashed reference value. */
export function TrendChart({ data, series, reference, domain = [0, 100], height = 220 }: {
  data: Record<string, number | string>[];
  series: { key: string; label: string }[];
  reference?: { value: number; label: string };
  domain?: [number, number];
  height?: number;
}) {
  const colors = [S1, S2];
  return (
    <div>
      {(series.length > 1 || reference) && (
        <Legend items={[...series.map((s, i) => ({ label: s.label, color: colors[i] })), ...(reference ? [{ label: reference.label, color: INK, dashed: true }] : [])]} />
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
          <XAxis dataKey="cycle" tick={AXIS} axisLine={{ stroke: INK, strokeWidth: 2 }} tickLine={false} />
          <YAxis domain={domain} tick={AXIS} axisLine={false} tickLine={false} />
          <Tooltip content={<BrutalTooltip />} cursor={{ stroke: INK, strokeWidth: 1, strokeDasharray: "4 4" }} />
          {reference && <ReferenceLine y={reference.value} stroke={INK} strokeWidth={1.5} strokeDasharray="6 6" />}
          {series.map((s, i) => (
            <Line key={s.key} dataKey={s.key} name={s.label} stroke={colors[i]} strokeWidth={2} isAnimationActive
              dot={{ r: 5, fill: colors[i], stroke: INK, strokeWidth: 2, shape: "square" } as never}
              activeDot={{ r: 7, fill: colors[i], stroke: INK, strokeWidth: 2 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Flat bars with ink outlines. layout="vertical" for horizontal bars. */
export function BrutalBars({ data, dataKey = "value", label = "Value", layout = "horizontal", height = 220, domain, highlight }: {
  data: { name: string; value: number; tooltip?: string }[];
  dataKey?: string;
  label?: string;
  layout?: "horizontal" | "vertical";
  height?: number;
  domain?: [number, number];
  highlight?: (d: { name: string; value: number }) => boolean;
}) {
  const vertical = layout === "vertical";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={vertical ? "vertical" : "horizontal"} margin={{ top: 8, right: 16, bottom: 0, left: vertical ? 8 : -16 }} barCategoryGap={vertical ? 6 : "20%"}>
        {vertical ? (
          <>
            <XAxis type="number" domain={domain ?? [0, 100]} tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={120} tick={{ ...AXIS, fill: "var(--ink)" }} axisLine={{ stroke: INK, strokeWidth: 2 }} tickLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={AXIS} axisLine={{ stroke: INK, strokeWidth: 2 }} tickLine={false} interval={0} />
            <YAxis domain={domain} allowDecimals={false} tick={AXIS} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip content={<BrutalTooltip />} cursor={{ fill: "rgb(var(--ink-rgb) / 0.06)" }} />
        <Bar dataKey={dataKey} name={label} stroke={INK} strokeWidth={2} isAnimationActive>
          {data.map((d) => <Cell key={d.name} fill={highlight?.(d) ? S2 : S1} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Demonstrated vs required-now vs required-next. */
export function SkillRadar({ data, height = 300 }: { data: { skill: string; demonstrated: number; current: number; next: number }[]; height?: number }) {
  return (
    <div>
      <Legend items={[{ label: "Demonstrated", color: S1 }, { label: "Current level needs", color: S2 }, { label: "Next level needs", color: INK, dashed: true }]} />
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} outerRadius="68%" margin={{ top: 8, right: 40, bottom: 8, left: 40 }}>
          <PolarGrid stroke="rgb(var(--ink-rgb) / 0.2)" />
          <PolarAngleAxis dataKey="skill" tick={{ ...AXIS, fill: "var(--ink)" }} />
          <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
          <Tooltip content={<BrutalTooltip />} />
          <Radar name="Next level needs" dataKey="next" stroke={INK} strokeWidth={1.5} strokeDasharray="6 6" fill="none" />
          <Radar name="Current level needs" dataKey="current" stroke={S2} strokeWidth={2} fill={S2} fillOpacity={0.12} />
          <Radar name="Demonstrated" dataKey="demonstrated" stroke={S1} strokeWidth={2} fill={S1} fillOpacity={0.25} dot={{ r: 3, fill: S1 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Evidence (x) vs rating (y). Shaded band = within ±1.5 of expected; coral = flagged. */
export function EvidenceScatter({ points, band, height = 340 }: {
  points: { evidence: number; rating: number; flagged: boolean; tooltip: string }[];
  band: { x: number; lo: number; hi: number }[];
  height?: number;
}) {
  const ok = points.filter((p) => !p.flagged);
  const bad = points.filter((p) => p.flagged);
  return (
    <div>
      <Legend items={[{ label: "Rating in line with evidence", color: S1 }, { label: "Rating disagrees with evidence", color: ALERT }]} />
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: -16 }}>
          <CartesianGrid stroke="none" />
          <XAxis type="number" dataKey="evidence" name="Evidence score" domain={[30, 100]} tick={AXIS} axisLine={{ stroke: INK, strokeWidth: 2 }} tickLine={false}
            label={{ value: "Evidence score", position: "insideBottomRight", offset: -4, style: AXIS }} />
          <YAxis type="number" dataKey="rating" name="Rating" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={AXIS} axisLine={false} tickLine={false} />
          <ZAxis range={[70, 70]} />
          {band.slice(0, -1).map((b, i) => (
            <ReferenceArea key={i} x1={b.x} x2={band[i + 1].x} y1={Math.max(1, (b.lo + band[i + 1].lo) / 2)} y2={Math.min(5, (b.hi + band[i + 1].hi) / 2)} fill="rgb(var(--ink-rgb) / 0.07)" stroke="none" ifOverflow="hidden" />
          ))}
          <Tooltip content={<BrutalTooltip />} cursor={{ strokeDasharray: "4 4", stroke: INK }} />
          <Scatter name="In line" data={ok} fill={S1} stroke={INK} strokeWidth={1.5} shape="square" />
          <Scatter name="Flagged" data={bad} fill={ALERT} stroke={INK} strokeWidth={2} shape="diamond" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
