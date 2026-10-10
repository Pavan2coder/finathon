import { notFound, redirect } from "next/navigation";
import { BrutalBars, TrendChart } from "@/components/charts";
import { EvidenceClaims, type Claim } from "@/components/EvidenceClaims";
import { Card, CardHead, Initials } from "@/components/ui";
import { canSee, getUser, profile, resolveEvidence, store } from "@/lib/data/repo";
import type { EvidenceScore } from "@/lib/engine";
import { requireRole } from "@/lib/session";

const r1 = (x: number) => Math.round(x * 10) / 10;

function buildClaims(userId: number, cycleId: number, ev: EvidenceScore): Claim[] {
  const byKey = new Map(ev.components.map((c) => [c.key, c]));
  const claims: Claim[] = [];
  const g = byKey.get("goals");
  if (g) claims.push({ id: "goals", text: `Reached ${Math.round(g.value)}% of goal targets across ${g.evidence.length} goals.`, refs: g.evidence });
  const d = byKey.get("deliverables");
  if (d) {
    const rows = store.deliverables.filter((x) => x.userId === userId && x.cycleId === cycleId);
    const onTime = rows.filter((x) => x.delivered && x.delivered <= x.due).length;
    const q = r1(rows.reduce((a, x) => a + x.quality, 0) / rows.length);
    claims.push({ id: "deliverables", text: `Delivered ${onTime} of ${rows.length} deliverables on time, averaging ${q}/5 quality.`, refs: d.evidence });
  }
  const p = byKey.get("projects");
  if (p) claims.push({ id: "projects", text: `Project outcomes weighted by contribution: ${Math.round(p.value)}/100.`, refs: p.evidence });
  const f = byKey.get("peer");
  if (f) claims.push({ id: "peer", text: `Peers scored their work ${r1(1 + (f.value / 100) * 4)}/5 across ${f.evidence.length} reviews.`, refs: f.evidence });
  const i = byKey.get("impact");
  if (i) claims.push({ id: "impact", text: `Business impact came in at ${Math.round(i.value)}/100 against target.`, refs: i.evidence });
  const t = byKey.get("training");
  if (t) claims.push({ id: "training", text: `Completed ${Math.round((t.value / 100) * t.evidence.length)} of ${t.evidence.length} assigned trainings.`, refs: t.evidence });
  const a = byKey.get("attendance");
  if (a) claims.push({ id: "attendance", text: `Present on ${Math.round(a.value)}% of working days.`, refs: a.evidence });
  for (const m of ev.missing) claims.push({ id: `missing-${m}`, text: `No ${m} evidence this cycle, so its weight was spread across the rest.`, refs: [], missing: true });
  return claims;
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requireRole();
  const id = Number((await params).id);
  const user = getUser(id);
  if (!user || user.role !== "employee") notFound();
  // Managers only see direct reports, employees only themselves — enforced server-side.
  if (!canSee(viewer, id)) redirect("/?denied=1");

  const p = profile(id);
  const claims = buildClaims(id, p.cycle.id, p.current.evidence);
  const evidence = [...new Set(claims.flatMap((c) => c.refs))].map(resolveEvidence).filter((e) => !!e);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-5">
        <Initials name={user.name} className="size-16 text-lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-5xl leading-none tracking-[-0.02em]">{user.name}</h1>
          <p className="mt-2 text-muted">
            {user.title} · {user.dept} · Level {user.level}
            {p.manager && <> · Reports to {p.manager.name}</>}
          </p>
        </div>
      </header>

      <Card>
        <CardHead label={`${p.cycle.name} evidence profile`} title="What the evidence says" right={<span className="font-mono text-3xl font-semibold">{p.current.evidence.score}</span>} />
        <EvidenceClaims claims={claims} evidence={evidence} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card paper>
          <CardHead label="Across review cycles" title="Evidence score and rating" />
          <TrendChart
            data={p.history.map((h) => ({ cycle: h.cycle.name, score: h.evidence.score }))}
            series={[{ key: "score", label: "Evidence score" }]}
          />
          <table className="mt-4 w-full text-sm">
            <caption className="sr-only">Ratings by cycle</caption>
            <thead>
              <tr className="label text-left text-muted"><th className="py-1 font-normal">Cycle</th><th className="font-normal">Evidence</th><th className="font-normal">Rating</th></tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {p.history.map((h) => (
                <tr key={h.cycle.id} className="border-t-2 border-ink/10">
                  <td className="py-1.5 font-sans">{h.cycle.name}</td>
                  <td>{h.evidence.score}</td>
                  <td>{h.rating ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card paper>
          <CardHead label="Score breakdown" title="Where the score comes from" />
          <BrutalBars layout="vertical" height={260} label="Score" data={p.current.evidence.components.map((c) => ({ name: c.label, value: c.value, tooltip: `${Math.round(c.weight * 100)}% of the score` }))} />
        </Card>
      </div>
    </div>
  );
}
