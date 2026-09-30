import { EventForm } from "@/components/EventForm";
import { MonthCalendar } from "@/components/MonthCalendar";
import { Card, CardHead, Chip, Empty, PageHeader } from "@/components/ui";
import { store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

const TONE = { deadline: "ink", calibration: "primary", holiday: "accent" } as const;

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string; d?: string }> }) {
  const viewer = await requireRole();
  const sp = await searchParams;
  const today = new Date().toLocaleDateString("en-CA");
  const month = sp.m ?? today.slice(0, 7);
  const selected = sp.d ?? today;
  const onDay = store.events.filter((e) => e.date === selected);
  const hrefFor = (q: { m?: string; d?: string }) => `/calendar?${new URLSearchParams({ ...(q.m ? { m: q.m } : {}), ...(q.d ? { d: q.d } : {}) })}`;
  return (
    <>
      <PageHeader title="Review calendar" lead="Deadlines, calibration sessions and holidays for the current cycle." />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <MonthCalendar month={month} selected={selected} hrefFor={hrefFor} items={store.events.map((e) => ({ date: e.date, label: e.title, tone: TONE[e.kind] }))} />
          <p className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
            <span className="flex items-center gap-2"><span className="inline-block size-3 border border-ink bg-ink" /> Deadline</span>
            <span className="flex items-center gap-2"><span className="inline-block size-3 border border-ink bg-primary" /> Calibration</span>
            <span className="flex items-center gap-2"><span className="inline-block size-3 border border-ink bg-accent" /> Holiday</span>
          </p>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHead label="Selected day" title={new Date(selected + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} />
            {onDay.length ? (
              <ul className="space-y-2">
                {onDay.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 rounded-md border-2 border-ink px-3 py-2">
                    <span>{e.title}</span>
                    <Chip kind={e.kind === "calibration" ? "lenient" : e.kind === "holiday" ? "inconsistent" : "ok"}>{e.kind}</Chip>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="Nothing on this day" hint={viewer.role === "hr" ? "Add an event below." : "Pick a highlighted date."} />
            )}
          </Card>
          {viewer.role === "hr" ? (
            <Card>
              <CardHead label="HR only" title="Add an event" />
              <EventForm defaultDate={selected} />
            </Card>
          ) : (
            <p className="text-sm text-muted">Only HR can add or change events.</p>
          )}
        </div>
      </div>
    </>
  );
}
