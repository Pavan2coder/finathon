import Link from "next/link";

export interface CalItem {
  date: string; // yyyy-mm-dd
  label: string;
  tone: "primary" | "accent" | "alert" | "ink";
}

const TONE = { primary: "bg-primary text-white", accent: "bg-accent text-[#0f1417]", alert: "bg-alert text-[#0f1417]", ink: "bg-ink text-bg" };
const pad = (n: number) => String(n).padStart(2, "0");

/** Month grid. `month` is yyyy-mm; navigation links keep other query params via `hrefFor`. */
export function MonthCalendar({ month, items, hrefFor, selected }: { month: string; items: CalItem[]; hrefFor: (q: { m?: string; d?: string }) => string; selected?: string }) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const days = new Date(y, m, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday first
  const prev = m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`;
  const next = m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;
  const today = new Date().toLocaleDateString("en-CA");
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`)];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Link href={hrefFor({ m: prev })} className="btn btn-ghost px-3 py-1" aria-label="Previous month">‹</Link>
        <p className="font-display text-2xl">{first.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        <Link href={hrefFor({ m: next })} className="btn btn-ghost px-3 py-1" aria-label="Next month">›</Link>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <p key={d} className="label text-center text-muted">{d}</p>)}
        {cells.map((date, i) => {
          if (!date) return <span key={`x${i}`} />;
          const here = items.filter((it) => it.date === date);
          const isSel = date === selected;
          return (
            <Link
              key={date}
              href={hrefFor({ m: month, d: date })}
              aria-label={`${date}${here.length ? `, ${here.length} item${here.length > 1 ? "s" : ""}` : ""}`}
              aria-current={isSel ? "date" : undefined}
              className={`flex min-h-16 flex-col gap-1 rounded-md border-2 p-1.5 text-left transition-colors ${isSel ? "border-ink bg-accent text-[#0f1417]" : "border-ink/20 hover:border-ink"} ${date === today ? "ring-2 ring-primary ring-offset-1 ring-offset-bg" : ""}`}
            >
              <span className="font-mono text-xs">{Number(date.slice(8))}</span>
              {here.slice(0, 2).map((it) => (
                <span key={it.label} className={`hidden truncate rounded-sm border border-ink px-1 text-[10px] sm:block ${TONE[it.tone]}`}>{it.label}</span>
              ))}
              {here.length > 0 && <span className="size-2 rounded-full border border-ink bg-primary sm:hidden" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
