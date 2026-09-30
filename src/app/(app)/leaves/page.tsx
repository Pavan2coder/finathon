import { RequestLeaveButton } from "@/components/LeaveForm";
import { Chip, Empty, Meter, PageHeader, PersonLink } from "@/components/ui";
import { LEAVE_ALLOWANCE, type LeaveType } from "@/lib/data/generate";
import { getUser, store, todayISO, visibleUserIds } from "@/lib/data/repo";
import { leaveDays, leaveUsed } from "@/lib/leave";
import { requireRole } from "@/lib/session";
import { cancelLeave, decideLeave } from "./actions";

const LABEL: Record<LeaveType, string> = { casual: "Casual", sick: "Sick", vacation: "Vacation", wfh: "Work from home" };
const STATUS_CHIP = { pending: "ok", approved: "inconsistent", rejected: "flagged" } as const;

export default async function LeavesPage() {
  const viewer = await requireRole();
  const mine = store.leaves.filter((l) => l.userId === viewer.id).sort((a, b) => b.from.localeCompare(a.from));
  const team = viewer.role === "employee" ? new Set<number>() : new Set(visibleUserIds(viewer));
  const toDecide = store.leaves.filter((l) => l.status === "pending" && team.has(l.userId)).sort((a, b) => a.from.localeCompare(b.from));

  return (
    <>
      <PageHeader title="Leave requests" lead="Request time off and track your balance. Approved leave counts as planned absence, not missed attendance." actions={<RequestLeaveButton today={todayISO()} />} />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(Object.keys(LEAVE_ALLOWANCE) as LeaveType[]).map((t) => {
          const used = leaveUsed(viewer.id, t);
          const left = LEAVE_ALLOWANCE[t] - used;
          return (
            <div key={t} className="brutal p-4">
              <div className="flex items-baseline justify-between">
                <p className="font-medium">{LABEL[t]}</p>
                <p className="label text-muted">{LEAVE_ALLOWANCE[t]} total</p>
              </div>
              <p className="mt-2 font-mono text-3xl font-semibold tabular-nums">{left}<span className="ml-1 text-sm font-normal text-muted">days left</span></p>
              <div className="mt-3"><Meter value={(used / LEAVE_ALLOWANCE[t]) * 100} tone={t === "wfh" ? "accent" : "primary"} /></div>
            </div>
          );
        })}
      </div>

      {viewer.role !== "employee" && (
        <section className="brutal mb-8 p-5">
          <h2 className="mb-4 font-display text-2xl">Waiting for your decision</h2>
          {toDecide.length ? (
            <ul className="space-y-2">
              {toDecide.map((l) => {
                const u = getUser(l.userId)!;
                return (
                  <li key={l.id} className="flex flex-wrap items-center gap-4 rounded-md border-2 border-ink p-3">
                    <div className="min-w-48 flex-1"><PersonLink id={u.id} name={u.name} sub={u.title} /></div>
                    <div className="min-w-48 flex-1 text-sm">
                      <p><span className="font-medium">{LABEL[l.type]}</span> · {l.from}{l.to !== l.from && ` → ${l.to}`} · {leaveDays(l.from, l.to)} day{leaveDays(l.from, l.to) === 1 ? "" : "s"}</p>
                      <p className="text-muted">“{l.reason}”</p>
                    </div>
                    <div className="flex gap-2">
                      <form action={decideLeave}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="decision" value="approved" /><button className="btn btn-primary px-3 py-1.5">Approve</button></form>
                      <form action={decideLeave}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="decision" value="rejected" /><button className="btn btn-ghost px-3 py-1.5">Reject</button></form>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty title="No requests waiting" hint="New leave requests from your team appear here." />
          )}
        </section>
      )}

      <section className="brutal p-5">
        <h2 className="font-display text-2xl">My requests</h2>
        <p className="mb-4 text-sm text-muted">My leave history</p>
        {mine.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead><tr className="label border-b-[3px] border-ink text-left"><th className="py-2 font-normal">Type</th><th className="font-normal">Dates</th><th className="font-normal">Days</th><th className="font-normal">Reason</th><th className="font-normal">Status</th><th /></tr></thead>
              <tbody>
                {mine.map((l) => (
                  <tr key={l.id} className="border-b-2 border-ink/10 last:border-0">
                    <td className="py-2.5">{LABEL[l.type]}</td>
                    <td className="font-mono text-xs">{l.from}{l.to !== l.from && ` → ${l.to}`}</td>
                    <td className="font-mono">{leaveDays(l.from, l.to)}</td>
                    <td className="max-w-[28ch] truncate text-muted">{l.reason}</td>
                    <td><Chip kind={STATUS_CHIP[l.status]}>{l.status}</Chip></td>
                    <td className="text-right">{l.status === "pending" && <form action={cancelLeave}><input type="hidden" name="id" value={l.id} /><button className="text-sm underline underline-offset-4">Cancel</button></form>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="No leave requests yet." hint="Click “Request leave” to start." />
        )}
      </section>
    </>
  );
}
