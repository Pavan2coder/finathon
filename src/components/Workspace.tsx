import { CalendarClock, CheckCircle2, Clock, FileText, ListChecks, TimerReset, TrendingUp } from "lucide-react";
import { toggleTask } from "@/app/(app)/workspace/actions";
import type { UserRow } from "@/lib/data/generate";
import { coworkers, getUser, hoursThisWeek, lastPunch, openPunch, store, todayISO } from "@/lib/data/repo";
import { MonthCalendar } from "./MonthCalendar";
import { PunchCard } from "./PunchCard";
import { Empty } from "./ui";
import { TaskButton, WorkUpdateCard } from "./WorkspaceForms";

const PRIORITY: Record<string, string> = { low: "bg-card", medium: "bg-accent text-[#0f1417]", high: "bg-primary text-white", critical: "bg-alert text-[#0f1417]" };

export function Tile({ icon: Icon, label, value, tone = "ink" }: { icon: typeof Clock; label: string; value: string; tone?: "ink" | "primary" | "accent" | "alert" }) {
  const color = { ink: "", primary: "text-primary", accent: "text-[var(--series-2)]", alert: "text-alert-ink" }[tone];
  return (
    <div className="brutal p-4">
      <span className="grid size-10 place-items-center rounded-md border-2 border-ink bg-accent text-[#0f1417]"><Icon size={18} /></span>
      <p className="label mt-3 text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export function TaskRow({ t, viewerId }: { t: (typeof store.tasks)[number]; viewerId: number }) {
  const other = getUser(t.assigneeId === viewerId ? t.creatorId : t.assigneeId);
  const overdue = t.status === "open" && t.due < todayISO();
  return (
    <li className="flex items-center gap-3 rounded-md border-2 border-ink px-3 py-2">
      <form action={toggleTask}>
        <input type="hidden" name="id" value={t.id} />
        <button className={`grid size-5 place-items-center rounded border-2 border-ink ${t.status === "done" ? "bg-accent" : "bg-card"}`} aria-label={t.status === "done" ? `Mark "${t.title}" as not done` : `Mark "${t.title}" as done`}>
          {t.status === "done" && <CheckCircle2 size={12} className="text-[#0f1417]" />}
        </button>
      </form>
      <div className="min-w-0 flex-1">
        <p className={`truncate ${t.status === "done" ? "text-muted line-through" : ""}`}>{t.title}</p>
        <p className="truncate text-xs text-muted">
          {t.kind === "stretch" ? "Stretch assignment · " : ""}
          {t.assigneeId === viewerId ? (t.creatorId === viewerId ? "Self" : `From ${other?.name}`) : `For ${other?.name}`} · due {t.due}
          {overdue && <span className="text-alert-ink"> · overdue</span>}
        </p>
      </div>
      <span className={`label rounded border-2 border-ink px-1.5 text-[10px] ${PRIORITY[t.priority]}`}>{t.priority}</span>
    </li>
  );
}

/** Aczen Connect's daily workspace: punch, work update, assignments and the tasks calendar. */
export function Workspace({ viewer, sp }: { viewer: UserRow; sp: { m?: string; d?: string } }) {
  const today = todayISO();
  const open = openPunch(viewer.id);
  const last = lastPunch(viewer.id);
  const updates = store.workUpdates.filter((w) => w.userId === viewer.id).sort((a, b) => b.date.localeCompare(a.date));
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const mine = store.tasks.filter((t) => t.assigneeId === viewer.id);
  const given = store.tasks.filter((t) => t.creatorId === viewer.id && t.assigneeId !== viewer.id);
  const people = coworkers(viewer).map((c) => ({ id: c.id, name: c.name }));
  const openMine = mine.filter((t) => t.status === "open");
  const month = sp.m ?? today.slice(0, 7);
  const selected = sp.d ?? today;
  const hrefFor = (q: { m?: string; d?: string }) => `/?${new URLSearchParams({ ...(q.m ? { m: q.m } : {}), ...(q.d ? { d: q.d } : {}) })}#tasks`;
  const onDay = [...mine, ...given].filter((t) => t.due === selected);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile icon={CheckCircle2} label="Today's status" value={open ? "Punched in" : "Punched out"} tone={open ? "accent" : "ink"} />
        <Tile icon={Clock} label="Last punch" value={last ? new Date(last.outAt ?? last.inAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"} tone="primary" />
        <Tile icon={FileText} label="Work update" value={updates[0]?.date === today ? "Submitted" : "Pending"} tone={updates[0]?.date === today ? "accent" : "alert"} />
        <Tile icon={TrendingUp} label="Open tasks" value={String(openMine.length)} tone="primary" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="brutal flex items-center gap-4 p-4"><TimerReset className="text-primary" /><div><p className="text-sm text-muted">Hours this week</p><p className="font-mono text-2xl font-semibold">{hoursThisWeek(viewer.id)}h</p></div></div>
        <div className="brutal flex items-center gap-4 p-4"><FileText className="text-[var(--series-2)]" /><div><p className="text-sm text-muted">Updates this week</p><p className="font-mono text-2xl font-semibold">{updates.filter((u) => u.date >= weekAgo).length}</p></div></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PunchCard punchedIn={!!open} lastPunch={last ? (last.outAt ?? last.inAt) : null} />
        <WorkUpdateCard today={today} last={updates[0] ?? null} />
      </div>

      <section className="brutal p-5">
        <h2 className="mb-4 flex items-center gap-2 font-display text-2xl"><ListChecks size={20} className="text-primary" /> My assignments</h2>
        <TaskButton label="Assign task to coworker" people={people} selfId={viewer.id} defaultDue={today} />
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="label mb-2 text-muted">Assigned to me</p>
            {mine.length ? <ul className="space-y-2">{mine.sort((a, b) => a.status.localeCompare(b.status) || a.due.localeCompare(b.due)).slice(0, 6).map((t) => <TaskRow key={t.id} t={t} viewerId={viewer.id} />)}</ul> : <Empty title="No tasks assigned yet." />}
          </div>
          <div>
            <p className="label mb-2 text-muted">I assigned</p>
            {given.length ? <ul className="space-y-2">{given.sort((a, b) => a.due.localeCompare(b.due)).slice(0, 6).map((t) => <TaskRow key={t.id} t={t} viewerId={viewer.id} />)}</ul> : <Empty title="You haven't assigned anything." hint="Assign a task and it shows up here." />}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile icon={ListChecks} label="My tasks" value={String(mine.length)} />
        <Tile icon={CalendarClock} label="Due today" value={String(openMine.filter((t) => t.due === today).length)} tone="primary" />
        <Tile icon={Clock} label="Overdue" value={String(openMine.filter((t) => t.due < today).length)} tone="alert" />
        <Tile icon={CheckCircle2} label="Completed" value={String(mine.filter((t) => t.status === "done").length)} tone="accent" />
      </div>

      <section id="tasks" className="brutal scroll-mt-24 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl">Tasks calendar</h2>
          <p className="flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full border border-ink bg-primary" /> Has tasks</span>
            <span className="flex items-center gap-1.5"><span className="inline-block size-2.5 rounded-full border border-ink bg-alert" /> Overdue</span>
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <MonthCalendar month={month} selected={selected} hrefFor={hrefFor} items={[...mine, ...given].map((t) => ({ date: t.due, label: t.title, tone: t.status === "done" ? "accent" : t.due < today ? "alert" : "primary" }))} />
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-medium">Tasks for {new Date(selected + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
              <TaskButton label="Add task" people={people} selfId={viewer.id} defaultDue={selected} lockDue variant="ghost" />
            </div>
            {onDay.length ? <ul className="space-y-2">{onDay.map((t) => <TaskRow key={t.id} t={t} viewerId={viewer.id} />)}</ul> : <Empty title="No tasks scheduled for this date" />}
          </div>
        </div>
      </section>
    </div>
  );
}
