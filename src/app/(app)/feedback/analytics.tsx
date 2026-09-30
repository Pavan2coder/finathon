import { BrutalBars } from "@/components/charts";
import { Card, CardHead, StatTile } from "@/components/ui";
import type { RequestRow } from "@/lib/data/generate";
import { getUser } from "@/lib/data/repo";

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

/** Aczen's outreach analytics, for feedback requests. Only statuses we actually record — no inferred "opens". */
export function FeedbackAnalytics({ requests }: { requests: RequestRow[] }) {
  const total = requests.length;
  const contacted = requests.filter((r) => r.status !== "not_sent").length;
  const responded = requests.filter((r) => r.status === "responded").length;
  const followed = requests.filter((r) => r.status === "followed_up").length;
  const failed = requests.filter((r) => r.status === "failed").length;
  const funnel = [
    { label: "Created", n: total },
    { label: "Sent", n: contacted },
    { label: "Needed a follow-up", n: followed },
    { label: "Responded", n: responded },
  ];
  const depts = [...new Set(requests.map((r) => getUser(r.subjectId)?.dept ?? "—"))].sort();
  const byDept = depts.map((d) => {
    const rs = requests.filter((r) => getUser(r.subjectId)?.dept === d && r.status !== "not_sent");
    return { name: d, value: pct(rs.filter((r) => r.status === "responded").length, rs.length), tooltip: `${rs.length} sent` };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Total requests" value={total} />
        <StatTile label="Contacted" value={contacted} note="Sent, followed up or answered" />
        <StatTile label="Responses" value={responded} tone="accent" />
        <StatTile label="Response rate" value={pct(responded, contacted)} suffix="%" note="Responses ÷ contacted" tone="primary" />
      </div>
      <Card>
        <CardHead label="Conversion funnel" title="From request to evidence" />
        <ol className="space-y-3">
          {funnel.map((f) => (
            <li key={f.label} className="grid grid-cols-[160px_1fr_90px] items-center gap-3">
              <span className="text-sm">{f.label}</span>
              <span className="h-6 rounded-sm border-2 border-ink bg-bg"><span className="block h-full border-r-2 border-ink bg-primary" style={{ width: `${pct(f.n, total)}%` }} /></span>
              <span className="text-right font-mono text-sm tabular-nums">{f.n} · {pct(f.n, total)}%</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted">% is of all requests created. {failed} request{failed === 1 ? "" : "s"} failed to deliver and should be resent. Every response becomes peer-feedback evidence on the person&apos;s profile.</p>
      </Card>
      {byDept.length > 1 && (
        <Card paper>
          <CardHead label="By department" title="Response rate where requests went out" />
          <BrutalBars data={byDept} label="Response rate %" domain={[0, 100]} />
        </Card>
      )}
    </div>
  );
}
