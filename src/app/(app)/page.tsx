import Link from "next/link";
import { TrendChart, BrutalBars } from "@/components/charts";
import { Workspace } from "@/components/Workspace";
import { Card, CardHead, Chip, Empty, FlagDot, StatTile } from "@/components/ui";
import { TITLES, type UserRow } from "@/lib/data/generate";
import { activeCycle, calibration, evidenceFor, profile, store, visibleUserIds } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

const STAGE_LABEL = { not_ready: "Not ready", developing: "Developing", near_ready: "Near ready", ready: "Ready", promoted: "Promoted" } as const;
const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0);
const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function Hero({ headline, sub, sticker, name }: { headline: string; sub: string; sticker?: string; name: string }) {
  return (
    <section className="brutal relative mb-6 overflow-hidden bg-primary p-6 text-white sm:p-10">
      <p className="label text-white/80">Welcome back, {name.split(" ")[0]} · {activeCycle().name} review cycle</p>
      <h1 className="font-display mt-3 max-w-[22ch] text-4xl leading-[0.95] tracking-[-0.02em] sm:text-6xl">{headline}</h1>
      <p className="mt-4 max-w-[60ch] text-lg leading-relaxed font-light text-white/90">{sub}</p>
      {sticker && (
        <span className="anim-float label absolute top-6 right-6 hidden rotate-6 rounded-md border-[3px] border-[#0f1417] bg-accent px-3 py-2 text-[#0f1417] shadow-[4px_4px_0_#0f1417] sm:block">
          {sticker}
        </span>
      )}
    </section>
  );
}

function Snapshot({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-3xl">Performance snapshot</h2>
      {children}
    </section>
  );
}

function Upcoming() {
  const today = new Date().toLocaleDateString("en-CA");
  const next = store.events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  return (
    <Card>
      <CardHead label="Review calendar" title="Coming up" right={<Link href="/calendar" className="label underline underline-offset-4">Open calendar</Link>} />
      {next.length ? (
        <ul className="divide-y-2 divide-ink/10">
          {next.map((e) => (
            <li key={e.id} className="flex items-center gap-4 py-2.5">
              <span className="w-16 font-mono text-sm tabular-nums">{fmtDate(e.date)}</span>
              <span className="flex-1">{e.title}</span>
              <Chip kind={e.kind === "calibration" ? "lenient" : "ok"}>{e.kind}</Chip>
            </li>
          ))}
        </ul>
      ) : (
        <Empty title="Nothing scheduled" hint="HR adds deadlines and calibration sessions here." />
      )}
    </Card>
  );
}

function Tasks({ items }: { items: { href: string; text: string; flag?: boolean }[] }) {
  return (
    <Card>
      <CardHead label="To do" title="Your review tasks" />
      {items.length ? (
        <ul className="space-y-2">
          {items.map((t) => (
            <li key={t.text}>
              <Link href={t.href} className="flex items-center gap-3 rounded-md border-2 border-ink px-3 py-2.5 transition-colors hover:bg-accent hover:text-[#0f1417]">
                {t.flag ? <FlagDot /> : <span className="inline-block size-2.5 bg-primary" />}
                <span className="flex-1">{t.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Empty title="You're all caught up" hint="New requests and flagged ratings will show up here." />
      )}
    </Card>
  );
}

function EmployeeOverview({ viewer, sp }: { viewer: UserRow; sp: { m?: string; d?: string } }) {
  const p = profile(viewer.id);
  const nextTitle = TITLES[viewer.track]?.[viewer.level] ?? `level ${viewer.level + 1}`;
  const met = p.readiness.criteria.filter((c) => c.met).length;
  const goalAttainment = p.current.evidence.components.find((c) => c.key === "goals")?.value ?? 0;
  const toAnswer = store.requests.filter((r) => r.reviewerId === viewer.id && (r.status === "sent" || r.status === "followed_up"));
  const openDev = p.devItems.filter((d) => d.status !== "done");
  const devProgress = avg(p.devItems.map((d) => d.progress));
  return (
    <>
      <Hero
        headline={`You meet ${met} of ${p.readiness.criteria.length} criteria for ${nextTitle}.`}
        sub={p.readiness.unmet.length ? `Still needed: ${p.readiness.unmet[0]}.` : "Every criterion is met. Your manager can nominate you at the next committee."}
        sticker={STAGE_LABEL[viewer.promotionStage]}
        name={viewer.name}
      />
      <Workspace viewer={viewer} sp={sp} />
      <Snapshot>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Evidence score" value={p.current.evidence.score} suffix="/100" note="This cycle, so far" />
        <StatTile label="Goal attainment" value={goalAttainment} suffix="%" note={`Across ${plural(p.goals.length, "goal")} this cycle`} />
        <StatTile label="Feedback to give" value={toAnswer.length} note="Colleagues asked you" tone={toAnswer.length ? "accent" : "card"} />
        <StatTile label="Plan progress" value={devProgress} suffix="%" note={plural(openDev.length, "item") + " open"} />
      </div>
      <div className="mb-6 grid gap-6">
        <Card paper>
          <CardHead label="Evidence trend" title="Your evidence score by cycle" />
          <TrendChart data={p.history.map((h) => ({ cycle: h.cycle.name, score: h.evidence.score }))} series={[{ key: "score", label: "Evidence score" }]} reference={{ value: 75, label: "Promotion bar (75)" }} />
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Tasks items={[
          ...toAnswer.map((r) => ({ href: "/feedback", text: `Give feedback on ${store.users.find((u) => u.id === r.subjectId)?.name}` })),
          ...openDev.map((d) => ({ href: "/development", text: `${d.title} — ${d.progress}% done` })),
        ]} />
        <Upcoming />
      </div>
      </Snapshot>
    </>
  );
}

function ManagerOverview({ viewer, sp }: { viewer: UserRow; sp: { m?: string; d?: string } }) {
  const team = visibleUserIds(viewer);
  const cal = calibration();
  const mine = cal.managers.find((m) => m.managerId === viewer.id);
  const flagged = cal.cases.filter((c) => c.managerId === viewer.id && c.flagged);
  const teamScores = team.map((id) => evidenceFor(id, activeCycle().id).score);
  const ready = store.users.filter((u) => team.includes(u.id) && (u.promotionStage === "ready" || u.promotionStage === "near_ready")).length;
  const notSent = store.requests.filter((r) => team.includes(r.subjectId) && r.status === "not_sent").length;
  const trend = store.cycles.map((c) => ({
    cycle: c.name,
    team: avg(team.map((id) => evidenceFor(id, c.id).score)),
    org: avg(store.users.filter((u) => u.role === "employee").map((u) => evidenceFor(u.id, c.id).score)),
  }));
  const headline = flagged.length
    ? `${plural(flagged.length, "rating")} on your team ${flagged.length === 1 ? "disagrees" : "disagree"} with the evidence.`
    : "Your ratings track the evidence.";
  const drift = mine?.medianResidual ?? 0;
  return (
    <>
      <Hero
        headline={headline}
        sub={`On average you rate ${Math.abs(drift).toFixed(2)} points ${drift >= 0 ? "above" : "below"} what the evidence predicts. Anything within ±0.5 counts as calibrated.`}
        sticker={mine?.flags.length ? mine.flags.join(" · ") : "Calibrated"}
        name={viewer.name}
      />
      <Workspace viewer={viewer} sp={sp} />
      <Snapshot>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Direct reports" value={team.length} />
        <StatTile label="Team evidence" value={avg(teamScores)} suffix="avg" note="This cycle" />
        <StatTile label="Flagged ratings" value={flagged.length} tone={flagged.length ? "alert" : "card"} note="Review before calibration" />
        <StatTile label="Near or ready" value={ready} note="For promotion" tone="accent" />
      </div>
      <div className="mb-6 grid gap-6">
        <Card paper>
          <CardHead label="Evidence trend" title="Your team against the org" />
          <TrendChart data={trend} series={[{ key: "team", label: "Your team" }, { key: "org", label: "Whole org" }]} />
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Tasks items={[
          ...flagged.map((c) => ({ href: "/calibration", text: `Re-check ${c.user.name}: rated ${c.rating}, evidence suggests ${c.expected}`, flag: true })),
          ...(notSent ? [{ href: "/feedback", text: `Send ${plural(notSent, "feedback request")}` }] : []),
        ]} />
        <Upcoming />
      </div>
      </Snapshot>
    </>
  );
}

function HrOverview({ viewer, sp }: { viewer: UserRow; sp: { m?: string; d?: string } }) {
  const cal = calibration();
  const off = cal.managers.filter((m) => m.flags.some((f) => f !== "insufficient_data"));
  const flagged = cal.cases.filter((c) => c.flagged);
  const employees = store.users.filter((u) => u.role === "employee");
  const stages = (Object.keys(STAGE_LABEL) as (keyof typeof STAGE_LABEL)[]).map((s) => ({
    name: STAGE_LABEL[s],
    value: employees.filter((u) => u.promotionStage === s).length,
  }));
  const trend = store.cycles.map((c) => ({ cycle: c.name, org: avg(employees.map((u) => evidenceFor(u.id, c.id).score)) }));
  return (
    <>
      <Hero
        headline={`${off.length} of ${cal.managers.length} managers rate differently from their evidence.`}
        sub={`${plural(flagged.length, "individual rating")} ${flagged.length === 1 ? "sits" : "sit"} 1.5+ points away from what the evidence predicts. Review them before the calibration sessions.`}
        sticker="Calibration open"
        name={viewer.name}
      />
      <Workspace viewer={viewer} sp={sp} />
      <Snapshot>
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Employees" value={employees.length} note={`${cal.managers.length} managers`} />
        <StatTile label="Ratings in" value={cal.cases.length} note={activeCycle().name} />
        <StatTile label="Managers off-pattern" value={off.length} tone="primary" note="Lenient, strict or inconsistent" />
        <StatTile label="Flagged cases" value={flagged.length} tone={flagged.length ? "alert" : "card"} note="Rating vs evidence" />
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card paper>
          <CardHead label="Evidence trend" title="Org evidence score by cycle" />
          <TrendChart data={trend} series={[{ key: "org", label: "Org average" }]} />
        </Card>
        <Card paper>
          <CardHead label="Promotion pipeline" title="Where people stand" right={<Link href="/pipeline" className="label underline underline-offset-4">Open pipeline</Link>} />
          <BrutalBars data={stages} label="People" />
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Tasks items={off.map((m) => ({ href: "/calibration", text: `${m.manager.name}: ${m.flags.join(", ")} (${m.n} ratings)`, flag: true }))} />
        <Upcoming />
      </div>
      </Snapshot>
    </>
  );
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ denied?: string; m?: string; d?: string }> }) {
  const viewer = await requireRole();
  const sp = await searchParams;
  const { denied } = sp;
  return (
    <>
      {denied && (
        <p role="alert" className="mb-6 rounded-md border-[3px] border-ink bg-card px-4 py-3">
          That page isn&apos;t available to your role. Switch role from the top bar to see it.
        </p>
      )}
      {viewer.role === "employee" && <EmployeeOverview viewer={viewer} sp={sp} />}
      {viewer.role === "manager" && <ManagerOverview viewer={viewer} sp={sp} />}
      {viewer.role === "hr" && <HrOverview viewer={viewer} sp={sp} />}
    </>
  );
}
