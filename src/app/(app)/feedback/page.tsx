import Link from "next/link";
import { NewRequestForm, RespondForm } from "@/components/FeedbackForms";
import { Card, CardHead, Chip, Empty, PageHeader } from "@/components/ui";
import { TRACK_SKILLS } from "@/lib/data/generate";
import { getUser, store, visibleUserIds } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import { followUpFeedbackRequest, sendFeedbackRequest } from "./actions";
import { FeedbackAnalytics } from "./analytics";

const TABS = [
  { key: "all", label: "All" },
  { key: "not_sent", label: "Not sent" },
  { key: "sent", label: "Sent" },
  { key: "responded", label: "Responded" },
  { key: "followed_up", label: "Followed up" },
  { key: "failed", label: "Failed" },
] as const;

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ status?: string; tab?: string }> }) {
  const viewer = await requireRole();
  const sp = await searchParams;
  const status = sp.status ?? "all";
  const tab = sp.tab === "analytics" ? "analytics" : "requests";

  const toMe = store.requests.filter((r) => r.reviewerId === viewer.id && (r.status === "sent" || r.status === "followed_up"));
  const scope = viewer.role === "employee" ? [] : new Set(visibleUserIds(viewer));
  const managed = viewer.role === "employee" ? [] : store.requests.filter((r) => (scope as Set<number>).has(r.subjectId));
  const rows = managed.filter((r) => status === "all" || r.status === status);
  const team = viewer.role === "manager" ? visibleUserIds(viewer).map((id) => ({ id, name: getUser(id)!.name })).sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <>
      <PageHeader title="Feedback automation" lead={viewer.role === "employee" ? "Colleagues asked for your view. Specific examples make their evidence stronger." : "Collect peer feedback before calibration. Each response becomes evidence on the person's profile."} />

      {toMe.length > 0 && (
        <Card className="mb-6">
          <CardHead label="Waiting for you" title={`${toMe.length} colleague${toMe.length === 1 ? "" : "s"} asked for feedback`} />
          <ul className="space-y-4">
            {toMe.map((r) => {
              const s = getUser(r.subjectId)!;
              return (
                <li key={r.id} className="rounded-md border-2 border-ink p-4">
                  <p className="font-medium">{s.name} <span className="font-normal text-muted">· {s.title}</span></p>
                  <RespondForm id={r.id} name={s.name} skills={TRACK_SKILLS[s.track]} />
                </li>
              );
            })}
          </ul>
        </Card>
      )}
      {viewer.role === "employee" && !toMe.length && <Empty title="No requests waiting" hint="When a colleague's manager asks for your feedback, it shows up here." />}

      {viewer.role !== "employee" && (
        <nav className="mb-6 flex border-b-[3px] border-ink" aria-label="Sections">
          {[["requests", "Feedback requests"], ["analytics", "Analytics"]].map(([k, l]) => (
            <Link key={k} href={k === "requests" ? "/feedback" : "/feedback?tab=analytics"} aria-current={tab === k ? "page" : undefined} className={`-mb-[3px] border-[3px] px-4 py-2 font-medium ${tab === k ? "rounded-t-md border-ink border-b-bg bg-bg" : "border-transparent text-muted hover:text-ink"}`}>{l}</Link>
          ))}
        </nav>
      )}

      {viewer.role !== "employee" && tab === "analytics" && <FeedbackAnalytics requests={managed} />}

      {viewer.role !== "employee" && tab === "requests" && (
        <>
          {viewer.role === "manager" && <NewRequestForm team={team} />}
          <nav className="mb-4 flex flex-wrap gap-2" aria-label="Filter by status">
            {TABS.map((t) => {
              const n = t.key === "all" ? managed.length : managed.filter((r) => r.status === t.key).length;
              const on = status === t.key;
              return (
                <Link key={t.key} href={t.key === "all" ? "/feedback" : `/feedback?status=${t.key}`} aria-current={on ? "page" : undefined}
                  className={`label rounded-md border-[3px] border-ink px-3 py-1.5 ${on ? "bg-ink text-bg" : "bg-card hover:bg-accent hover:text-[#0f1417]"}`}>
                  {t.label} · {n}
                </Link>
              );
            })}
          </nav>
          {rows.length ? (
            <div className="brutal overflow-x-auto p-0">
              <table className="w-full min-w-[720px] text-sm">
                <thead><tr className="label border-b-[3px] border-ink text-left"><th className="px-4 py-3 font-normal">About</th><th className="px-4 font-normal">Reviewer</th><th className="px-4 font-normal">Status</th><th className="px-4 font-normal">Sent</th><th className="px-4 font-normal"><span className="sr-only">Action</span></th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b-2 border-ink/10 last:border-0">
                      <td className="px-4 py-2.5"><Link href={`/people/${r.subjectId}`} className="hover:underline">{getUser(r.subjectId)?.name}</Link></td>
                      <td className="px-4">{getUser(r.reviewerId)?.name}</td>
                      <td className="px-4"><Chip kind={r.status === "failed" ? "flagged" : r.status === "responded" ? "inconsistent" : "ok"}>{r.status.replace("_", " ")}</Chip></td>
                      <td className="px-4 font-mono text-xs">{r.sentAt?.slice(0, 10) ?? "—"}</td>
                      <td className="px-4 text-right">
                        {r.status === "not_sent" && <form action={sendFeedbackRequest}><input type="hidden" name="id" value={r.id} /><button className="btn btn-primary px-3 py-1">Send</button></form>}
                        {(r.status === "sent" || r.status === "failed") && <form action={followUpFeedbackRequest}><input type="hidden" name="id" value={r.id} /><button className="btn btn-ghost px-3 py-1">Follow up</button></form>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No requests with this status" hint="Try another tab." />
          )}
        </>
      )}
    </>
  );
}
