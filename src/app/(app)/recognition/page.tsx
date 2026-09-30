import { PartyPopper } from "lucide-react";
import Link from "next/link";
import { MonthCalendar } from "@/components/MonthCalendar";
import { NewRecognitionButton } from "@/components/RecognitionForm";
import { Chip, Empty, Initials, PageHeader } from "@/components/ui";
import { TRACK_SKILLS } from "@/lib/data/generate";
import { coworkers, getUser, store, todayISO } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import { cheer, publishDraft, publishDue } from "./actions";

export default async function RecognitionPage({ searchParams }: { searchParams: Promise<{ view?: string; status?: string; m?: string; d?: string }> }) {
  const viewer = await requireRole();
  await publishDue();
  const sp = await searchParams;
  const view = sp.view === "calendar" ? "calendar" : "posts";
  const status = sp.status ?? "all";
  // Drafts are private to their author.
  const visible = store.posts.filter((p) => p.status !== "draft" || p.authorId === viewer.id);
  const shown = visible.filter((p) => status === "all" || p.status === status).sort((a, b) => (b.scheduledAt ?? b.at).localeCompare(a.scheduledAt ?? a.at));
  const next = visible.filter((p) => p.status === "scheduled").sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!))[0];
  const people = coworkers(viewer).filter((c) => c.role !== "hr").map((c) => ({ id: c.id, name: c.name, skills: TRACK_SKILLS[c.track] ?? [] }));
  const today = todayISO();
  const q = (o: Record<string, string>) => `/recognition?${new URLSearchParams({ view, ...(status !== "all" ? { status } : {}), ...o })}`;

  return (
    <>
      <PageHeader title="Recognition" lead="Thank people for specific work. Published recognition becomes peer evidence on their profile, tagged with the skill they showed." actions={<NewRecognitionButton people={people} />} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[["Drafts", visible.filter((p) => p.status === "draft").length], ["Scheduled", visible.filter((p) => p.status === "scheduled").length], ["Published", visible.filter((p) => p.status === "published").length]].map(([l, n]) => (
          <div key={l} className="brutal p-4"><p className="label text-muted">{l}</p><p className="mt-1 font-mono text-3xl font-semibold">{n}</p></div>
        ))}
        <div className="brutal p-4"><p className="label text-muted">Next up</p><p className="mt-1 truncate text-lg font-medium">{next ? new Date(next.scheduledAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}</p></div>
      </div>
      <div className="brutal mb-6 flex flex-wrap items-center gap-3 p-3">
        <nav className="flex flex-wrap gap-2" aria-label="Filter by status">
          {["all", "published", "scheduled", "draft"].map((s) => (
            <Link key={s} href={`/recognition?${new URLSearchParams({ view, ...(s !== "all" ? { status: s } : {}) })}`} aria-current={status === s ? "page" : undefined} className={`label rounded-md border-2 border-ink px-2.5 py-1 ${status === s ? "bg-ink text-bg" : "bg-card"}`}>{s === "all" ? "All statuses" : s}</Link>
          ))}
        </nav>
        <div className="ml-auto flex" role="group" aria-label="View">
          {(["calendar", "posts"] as const).map((v) => (
            <Link key={v} href={`/recognition?${new URLSearchParams({ view: v, ...(status !== "all" ? { status } : {}) })}`} aria-current={view === v ? "page" : undefined} className={`label border-[3px] border-ink px-3 py-1.5 first:rounded-l-md last:rounded-r-md last:border-l-0 ${view === v ? "bg-ink text-bg" : "bg-card"}`}>{v}</Link>
          ))}
        </div>
      </div>

      {view === "calendar" ? (
        <section className="brutal p-5">
          <MonthCalendar
            month={sp.m ?? today.slice(0, 7)}
            selected={sp.d}
            hrefFor={(o) => q(Object.fromEntries(Object.entries(o).filter(([, v]) => v)) as Record<string, string>)}
            items={shown.map((p) => ({ date: (p.scheduledAt ?? p.at).slice(0, 10), label: getUser(p.recipientId)?.name ?? "", tone: p.status === "published" ? "accent" : p.status === "scheduled" ? "primary" : "ink" }))}
          />
        </section>
      ) : shown.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {shown.map((p) => {
            const from = getUser(p.authorId)!;
            const to = getUser(p.recipientId)!;
            const mine = p.cheers.includes(viewer.id);
            return (
              <li key={p.id} className="brutal flex flex-col p-4">
                <div className="flex items-center gap-3">
                  <Initials name={from.name} />
                  <p className="min-w-0 flex-1 text-sm"><span className="font-medium">{from.name}</span> recognised <Link href={`/people/${to.id}`} className="font-medium underline-offset-4 hover:underline">{to.name}</Link></p>
                  {p.status !== "published" && <Chip kind="ok">{p.status}</Chip>}
                </div>
                <p className="mt-3 flex-1 text-lg leading-snug">“{p.content}”</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {p.skills.map((s) => <span key={s} className="label rounded border-2 border-ink bg-accent px-2 py-0.5 text-[11px] text-[#0f1417]">{s}</span>)}
                  <span className="ml-auto font-mono text-xs text-muted">{new Date(p.scheduledAt ?? p.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  {p.status === "published" && (
                    <form action={cheer}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className={`flex items-center gap-1.5 rounded-md border-2 border-ink px-2 py-1 text-sm ${mine ? "bg-primary text-white" : "bg-card"}`} aria-pressed={mine}>
                        <PartyPopper size={14} /> {p.cheers.length}
                      </button>
                    </form>
                  )}
                  {p.status === "draft" && p.authorId === viewer.id && (
                    <form action={publishDraft}><input type="hidden" name="id" value={p.id} /><button className="btn btn-primary px-2.5 py-1">Publish</button></form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty title="Nothing here yet" hint="Recognise someone for specific work to get started." />
      )}
    </>
  );
}
