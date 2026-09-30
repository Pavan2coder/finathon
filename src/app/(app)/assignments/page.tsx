import Link from "next/link";
import { TaskRow } from "@/components/Workspace";
import { TaskButton } from "@/components/WorkspaceForms";
import { Empty, PageHeader } from "@/components/ui";
import { coworkers, store, todayISO } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

const FILTERS = [["all", "All"], ["open", "Open"], ["overdue", "Overdue"], ["stretch", "Stretch assignments"], ["done", "Completed"]] as const;

export default async function AssignmentsPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const viewer = await requireRole();
  const f = (await searchParams).f ?? "all";
  const today = todayISO();
  const keep = (t: (typeof store.tasks)[number]) =>
    f === "open" ? t.status === "open" : f === "done" ? t.status === "done" : f === "overdue" ? t.status === "open" && t.due < today : f === "stretch" ? t.kind === "stretch" : true;
  const byDue = (a: (typeof store.tasks)[number], b: (typeof store.tasks)[number]) => a.status.localeCompare(b.status) || a.due.localeCompare(b.due);
  const mine = store.tasks.filter((t) => t.assigneeId === viewer.id).filter(keep).sort(byDue);
  const given = store.tasks.filter((t) => t.creatorId === viewer.id && t.assigneeId !== viewer.id).filter(keep).sort(byDue);
  const people = coworkers(viewer).map((c) => ({ id: c.id, name: c.name }));

  return (
    <>
      <PageHeader title="My assignments" lead="Manage and track your tasks. Stretch assignments come from development gaps and count toward the next level." actions={<div className="w-64"><TaskButton label="Assign task to coworker" people={people} selfId={viewer.id} defaultDue={today} /></div>} />
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Filter tasks">
        {FILTERS.map(([k, l]) => (
          <Link key={k} href={k === "all" ? "/assignments" : `/assignments?f=${k}`} aria-current={f === k ? "page" : undefined} className={`label rounded-md border-[3px] border-ink px-3 py-1.5 ${f === k ? "bg-ink text-bg" : "bg-card hover:bg-accent hover:text-[#0f1417]"}`}>{l}</Link>
        ))}
      </nav>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="brutal p-5">
          <h2 className="mb-3 font-display text-2xl">Assigned to me <span className="font-mono text-base text-muted">{mine.length}</span></h2>
          {mine.length ? <ul className="space-y-2">{mine.map((t) => <TaskRow key={t.id} t={t} viewerId={viewer.id} />)}</ul> : <Empty title="No tasks assigned yet." hint="Tasks your manager or coworkers give you land here." />}
        </section>
        <section className="brutal p-5">
          <h2 className="mb-3 font-display text-2xl">I assigned <span className="font-mono text-base text-muted">{given.length}</span></h2>
          {given.length ? <ul className="space-y-2">{given.map((t) => <TaskRow key={t.id} t={t} viewerId={viewer.id} />)}</ul> : <Empty title="Nothing here yet." hint="Use “Assign task to coworker” to hand off work." />}
        </section>
      </div>
    </>
  );
}
