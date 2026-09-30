import { CalendarClock, CheckCircle2, Clock, ListChecks } from "lucide-react";
import { MonthCalendar } from "@/components/MonthCalendar";
import { TaskRow, Tile } from "@/components/Workspace";
import { TaskButton } from "@/components/WorkspaceForms";
import { Empty, PageHeader } from "@/components/ui";
import { coworkers, store, todayISO } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

export default async function MyCalendarPage({ searchParams }: { searchParams: Promise<{ m?: string; d?: string }> }) {
  const viewer = await requireRole();
  const sp = await searchParams;
  const today = todayISO();
  const month = sp.m ?? today.slice(0, 7);
  const selected = sp.d ?? today;
  const mine = store.tasks.filter((t) => t.assigneeId === viewer.id);
  const open = mine.filter((t) => t.status === "open");
  const plan = store.devItems.filter((d) => d.userId === viewer.id && d.status !== "done");
  const hrefFor = (q: { m?: string; d?: string }) => `/my-calendar?${new URLSearchParams({ ...(q.m ? { m: q.m } : {}), ...(q.d ? { d: q.d } : {}) })}`;
  const onDay = mine.filter((t) => t.due === selected);
  const planOnDay = plan.filter((d) => d.due === selected);
  const people = coworkers(viewer).map((c) => ({ id: c.id, name: c.name }));

  return (
    <>
      <PageHeader title="Tasks calendar" lead="Your tasks, stretch assignments and development-plan deadlines in one view." />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile icon={ListChecks} label="My tasks" value={String(mine.length)} />
        <Tile icon={CalendarClock} label="Due today" value={String(open.filter((t) => t.due === today).length)} tone="primary" />
        <Tile icon={Clock} label="Overdue" value={String(open.filter((t) => t.due < today).length)} tone="alert" />
        <Tile icon={CheckCircle2} label="Completed" value={String(mine.filter((t) => t.status === "done").length)} tone="accent" />
      </div>
      <section className="brutal p-5">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <MonthCalendar
            month={month}
            selected={selected}
            hrefFor={hrefFor}
            items={[
              ...mine.map((t) => ({ date: t.due, label: t.title, tone: (t.status === "done" ? "accent" : t.due < today ? "alert" : "primary") as "accent" | "alert" | "primary" })),
              ...plan.map((d) => ({ date: d.due, label: d.title, tone: "ink" as const })),
            ]}
          />
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-medium">{new Date(selected + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
              <TaskButton label="Add task" people={people} selfId={viewer.id} defaultDue={selected} lockDue variant="ghost" />
            </div>
            {onDay.length || planOnDay.length ? (
              <ul className="space-y-2">
                {onDay.map((t) => <TaskRow key={t.id} t={t} viewerId={viewer.id} />)}
                {planOnDay.map((d) => (
                  <li key={`d${d.id}`} className="rounded-md border-2 border-ink bg-bg px-3 py-2">
                    <p>{d.title}</p>
                    <p className="text-xs text-muted">Development plan · {d.skill} · {d.progress}% done</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="No tasks scheduled for this date" />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
