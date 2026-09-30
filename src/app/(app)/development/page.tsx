import { MonthCalendar } from "@/components/MonthCalendar";
import { PersonPicker } from "@/components/PersonPicker";
import { Card, CardHead, Chip, Empty, Meter, PageHeader, StatTile } from "@/components/ui";
import { profile } from "@/lib/data/repo";
import { subjectFor } from "@/lib/scope";
import { requireRole } from "@/lib/session";
import { updateDevPlanItem } from "./actions";

const STATUS = { todo: "Not started", in_progress: "In progress", done: "Done" } as const;

export default async function DevelopmentPage({ searchParams }: { searchParams: Promise<{ user?: string; m?: string; d?: string }> }) {
  const viewer = await requireRole("employee", "manager");
  const sp = await searchParams;
  const { subject, people } = subjectFor(viewer, sp.user);
  const p = profile(subject.id);
  const items = [...p.devItems].sort((a, b) => a.due.localeCompare(b.due));
  const today = new Date().toLocaleDateString("en-CA");
  const month = sp.m ?? today.slice(0, 7);
  const hrefFor = (q: { m?: string; d?: string }) => `/development?${new URLSearchParams({ ...(sp.user ? { user: sp.user } : {}), ...(q.m ? { m: q.m } : {}), ...(q.d ? { d: q.d } : {}) })}`;
  const selected = sp.d;
  const onDay = selected ? items.filter((i) => i.due === selected) : [];

  return (
    <>
      <PageHeader
        title="Development plan"
        lead="Courses and stretch work chosen from the gaps between current skills and the next level."
        actions={people.length ? <PersonPicker people={people} value={subject.id} /> : undefined}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Plan items" value={items.length} />
        <StatTile label="Due this month" value={items.filter((i) => i.due.startsWith(today.slice(0, 7)) && i.status !== "done").length} />
        <StatTile label="Overdue" value={items.filter((i) => i.due < today && i.status !== "done").length} tone={items.some((i) => i.due < today && i.status !== "done") ? "alert" : "card"} />
        <StatTile label="Completed" value={items.filter((i) => i.status === "done").length} tone="accent" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHead label="Assignments" title={`${subject.name === viewer.name ? "Your" : `${subject.name.split(" ")[0]}'s`} plan`} />
          {items.length ? (
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.id} className="rounded-md border-2 border-ink p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{i.title}</p>
                      <p className="text-sm text-muted">{i.kind === "training" ? "Course" : "Stretch assignment"} · {i.skill} · due {i.due}</p>
                    </div>
                    <Chip kind={i.status === "done" ? "inconsistent" : "ok"}>{STATUS[i.status]}</Chip>
                  </div>
                  <div className="mt-3"><Meter value={i.progress} tone={i.status === "done" ? "accent" : "primary"} /></div>
                  <form action={updateDevPlanItem} className="mt-3 flex items-center gap-3">
                    <input type="hidden" name="id" value={i.id} />
                    <label htmlFor={`p${i.id}`} className="label text-muted">Progress</label>
                    <input id={`p${i.id}`} type="range" name="progress" min={0} max={100} step={5} defaultValue={i.progress} className="flex-1 accent-[var(--primary)]" />
                    <span className="w-10 text-right font-mono text-sm tabular-nums">{i.progress}%</span>
                    <button className="btn btn-ghost px-3 py-1.5">Save</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No plan yet" hint="Items appear here once the skills page finds a gap against the next level." />
          )}
        </Card>
        <Card>
          <CardHead label="Calendar" title="Due dates" />
          <MonthCalendar month={month} selected={selected} hrefFor={hrefFor} items={items.map((i) => ({ date: i.due, label: i.title, tone: i.status === "done" ? "accent" : i.due < today ? "alert" : "primary" }))} />
          <div className="mt-4">
            {selected ? (
              onDay.length ? (
                <ul className="space-y-2">{onDay.map((i) => <li key={i.id} className="rounded-md border-2 border-ink px-3 py-2">{i.title}</li>)}</ul>
              ) : (
                <Empty title="Nothing due that day" hint="Pick a highlighted date." />
              )
            ) : (
              <p className="text-sm text-muted">Pick a date to see what&apos;s due.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
