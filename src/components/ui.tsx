import Link from "next/link";
import type { ReactNode } from "react";
import { CountUp } from "./CountUp";

export function PageHeader({ title, lead, actions }: { title: string; lead?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.02em] sm:text-6xl">{title}</h1>
        {lead && <p className="mt-3 max-w-[64ch] text-lg leading-relaxed font-light text-muted">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "", paper = false }: { children: ReactNode; className?: string; paper?: boolean }) {
  return <section className={`brutal p-5 ${paper ? "grid-paper" : ""} ${className}`}>{children}</section>;
}

/** CogniSwitch-style header: small square bullet + mono label, serif title below. */
export function CardHead({ label, title, right }: { label: string; title?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <p className="label flex items-center gap-2 text-muted">
          <span className="inline-block size-2 bg-primary" />
          {label}
        </p>
        {title && <h2 className="font-display mt-1 text-2xl leading-tight">{title}</h2>}
      </div>
      {right}
    </div>
  );
}

export function StatTile({ label, value, suffix, note, tone = "card" }: { label: string; value: number; suffix?: string; note?: ReactNode; tone?: "card" | "primary" | "accent" | "alert" }) {
  const bg = { card: "bg-card", primary: "bg-primary text-white", accent: "bg-accent text-[#0f1417]", alert: "bg-alert text-[#0f1417]" }[tone];
  return (
    <div className={`brutal p-4 ${bg}`}>
      <p className="label opacity-80">{label}</p>
      <p className="mt-2 font-mono text-4xl font-semibold tabular-nums">
        <CountUp value={value} />
        {suffix && <span className="ml-1 text-lg opacity-70">{suffix}</span>}
      </p>
      {note && <p className="mt-1 text-sm opacity-80">{note}</p>}
    </div>
  );
}

const CHIP: Record<string, string> = {
  lenient: "bg-primary text-white",
  strict: "bg-[#0f1417] text-[#ebebed] dark:bg-[#ebebed] dark:text-[#0f1417]",
  inconsistent: "bg-accent text-[#0f1417]",
  insufficient_data: "bg-card text-muted",
  flagged: "bg-alert text-[#0f1417]",
  ok: "bg-card",
};

export function Chip({ kind, children }: { kind: keyof typeof CHIP | string; children?: ReactNode }) {
  return (
    <span className={`label inline-flex items-center gap-1.5 rounded border-2 border-ink px-2 py-0.5 text-[11px] ${CHIP[kind] ?? CHIP.ok}`}>
      {children ?? kind.replace("_", " ")}
    </span>
  );
}

export function FlagDot() {
  return <span className="anim-pulse-ring inline-block size-2.5 rounded-full border border-ink bg-alert" aria-hidden />;
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-md border-[3px] border-dashed border-ink/40 p-8 text-center">
      <p className="font-display text-xl">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Initials({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`grid size-9 shrink-0 place-items-center rounded-md border-2 border-ink bg-accent font-mono text-xs font-semibold text-[#0f1417] ${className}`}>
      {name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
    </span>
  );
}

export function PersonLink({ id, name, sub }: { id: number; name: string; sub?: string }) {
  return (
    <Link href={`/people/${id}`} className="group flex items-center gap-3">
      <Initials name={name} />
      <span className="min-w-0">
        <span className="block truncate font-medium underline-offset-4 group-hover:underline">{name}</span>
        {sub && <span className="block truncate text-xs text-muted">{sub}</span>}
      </span>
    </Link>
  );
}

export function Meter({ value, tone = "primary" }: { value: number; tone?: "primary" | "accent" }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-sm border-2 border-ink bg-card" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full border-r-2 border-ink ${tone === "primary" ? "bg-primary" : "bg-accent"}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
