import Link from "next/link";
<<<<<<< HEAD
import { TrendChart, BrutalBars } from "@/components/charts";
import { Workspace } from "@/components/Workspace";
import { Card, CardHead, Chip, Empty, FlagDot, StatTile } from "@/components/ui";
import { TITLES, type UserRow } from "@/lib/data/generate";
import { activeCycle, calibration, evidenceFor, profile, store, visibleUserIds } from "@/lib/data/repo";
=======
import { BrutalBars, EvidenceScatter, TrendChart } from "@/components/charts";
import { Card, CardHead, Chip, Empty, FlagDot, Meter, PersonLink, StatTile } from "@/components/ui";
import { TITLES, type UserRow } from "@/lib/data/generate";
import { activeCycle, calibration, evidenceFor, getUser, profile, ratingBand, store, visibleUserIds } from "@/lib/data/repo";
import { THRESHOLDS } from "@/lib/engine";
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
import { requireRole } from "@/lib/session";

const STAGE_LABEL = { not_ready: "Not ready", developing: "Developing", near_ready: "Near ready", ready: "Ready", promoted: "Promoted" } as const;
const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0);
const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;
const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
<<<<<<< HEAD

function Hero({ headline, sub, sticker, name }: { headline: string; sub: string; sticker?: string; name: string }) {
  return (
    <section className="brutal relative mb-6 overflow-hidden bg-primary p-6 text-white sm:p-10">
      <p className="label text-white/80">Welcome back, {name.split(" ")[0]} · {activeCycle().name} review cycle</p>
      <h1 className="font-display mt-3 max-w-[22ch] text-4xl leading-[0.95] tracking-[-0.02em] sm:text-6xl">{headline}</h1>
      <p className="mt-4 max-w-[60ch] text-lg leading-relaxed font-light text-white/90">{sub}</p>
      {sticker && (
        <span className="anim-float label absolute top-6 right-6 hidden rotate-6 rounded-md border-[3px] border-[#0f1417] bg-accent px-3 py-2 text-[#0f1417] shadow-[4px_4px_0_#0f1417] sm:block">
=======
const title = (track: string, level: number) => TITLES[track]?.[level - 1] ?? `${track} L${level}`;

// Each portal gets its own hero colour so the three dashboards read differently at a glance.
const HERO = {
  employee: { slab: "bg-accent text-[#0f1417]", sticker: "bg-primary text-white" },
  manager: { slab: "bg-[#0f1417] text-[#ebebed]", sticker: "bg-accent text-[#0f1417]" },
  hr: { slab: "bg-primary text-white", sticker: "bg-accent text-[#0f1417]" },
} as const;

function Hero({ role, eyebrow, headline, sub, sticker, name }: { role: keyof typeof HERO; eyebrow: string; headline: string; sub: string; sticker?: string; name: string }) {
  return (
    <section className={`brutal relative mb-6 overflow-hidden p-6 sm:p-10 ${HERO[role].slab}`}>
      <p className="label opacity-80">{eyebrow} · {name.split(" ")[0]} · {activeCycle().name} review cycle</p>
      <h1 className="font-display mt-3 max-w-[22ch] text-4xl leading-[0.95] tracking-[-0.02em] sm:text-6xl">{headline}</h1>
      <p className="mt-4 max-w-[60ch] text-lg leading-relaxed font-light opacity-90">{sub}</p>
      {sticker && (
        <span className={`anim-float label absolute top-6 right-6 hidden rotate-6 rounded-md border-[3px] border-[#0f1417] px-3 py-2 shadow-[4px_4px_0_#0f1417] sm:block ${HERO[role].sticker}`}>
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
          {sticker}
        </span>
      )}
    </section>
  );
}

<<<<<<< HEAD
function Snapshot({ children }: { children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-3xl">Performance snapshot</h2>
      {children}
    </section>
  );
}

=======
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
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

<<<<<<< HEAD
function Tasks({ items }: { items: { href: string; text: string; flag?: boolean }[] }) {
  return (
    <Card>
      <CardHead label="To do" title="Your review tasks" />
=======
function Tasks({ title: heading, items }: { title: string; items: { href: string; text: string; flag?: boolean }[] }) {
  return (
    <Card>
      <CardHead label="To do" title={heading} />
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
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

<<<<<<< HEAD
function EmployeeOverview({ viewer, sp }: { viewer: UserRow; sp: { m?: string; d?: string } }) {
  const p = profile(viewer.id);
  const nextTitle = TITLES[viewer.track]?.[viewer.level] ?? `level ${viewer.level + 1}`;
=======
/** How many people miss each required skill for their next level. A count per skill, never a list of people. */
function gapCounts(ids: number[]) {
  const counts = new Map<string, number>();
  for (const id of ids) for (const g of profile(id).gaps) counts.set(g.skill, (counts.get(g.skill) ?? 0) + 1);
  return [...counts].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
}

// ---- Employee: "my evidence" — profile, readiness, gaps, career paths ----
function EmployeeOverview({ viewer }: { viewer: UserRow }) {
  const p = profile(viewer.id);
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
  const met = p.readiness.criteria.filter((c) => c.met).length;
  const goalAttainment = p.current.evidence.components.find((c) => c.key === "goals")?.value ?? 0;
  const toAnswer = store.requests.filter((r) => r.reviewerId === viewer.id && (r.status === "sent" || r.status === "followed_up"));
  const openDev = p.devItems.filter((d) => d.status !== "done");
<<<<<<< HEAD
  const devProgress = avg(p.devItems.map((d) => d.progress));
  return (
    <>
      <Hero
        headline={`You meet ${met} of ${p.readiness.criteria.length} criteria for ${nextTitle}.`}
=======
  return (
    <>
      <Hero
        role="employee"
        eyebrow="My evidence"
        headline={`You meet ${met} of ${p.readiness.criteria.length} criteria for ${title(viewer.track, viewer.level + 1)}.`}
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
        sub={p.readiness.unmet.length ? `Still needed: ${p.readiness.unmet[0]}.` : "Every criterion is met. Your manager can nominate you at the next committee."}
        sticker={STAGE_LABEL[viewer.promotionStage]}
        name={viewer.name}
      />
<<<<<<< HEAD
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
=======
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Evidence score" value={p.current.evidence.score} suffix="/100" note={`Promotion bar is ${THRESHOLDS.promotionEvidenceScore}`} />
        <StatTile label="Goal attainment" value={goalAttainment} suffix="%" note={`Across ${plural(p.goals.length, "goal")}`} />
        <StatTile label="Readiness" value={p.readiness.percent} suffix="%" note="Of promotion criteria met" tone="primary" />
        <StatTile label="Skill gaps" value={p.gaps.length} note="Against the next level" tone={p.gaps.length ? "alert" : "card"} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card paper>
          <CardHead label="Evidence profile" title="What your score is made of" right={<Link href={`/people/${viewer.id}`} className="label underline underline-offset-4">See sources</Link>} />
          <BrutalBars
            layout="vertical"
            label="Score"
            height={260}
            data={p.current.evidence.components.map((c) => ({ name: c.label, value: Math.round(c.value), tooltip: `${Math.round(c.weight * 100)}% of the score` }))}
          />
        </Card>
        <Card>
          <CardHead label="Promotion readiness" title="Criteria checklist" />
          <ul className="space-y-2">
            {p.readiness.criteria.map((c) => (
              <li key={c.label} className={`flex items-start gap-3 rounded-md border-2 border-ink px-3 py-2 ${c.met ? "" : "bg-alert/15"}`}>
                <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded border-2 border-ink text-xs font-bold ${c.met ? "bg-accent text-[#0f1417]" : "bg-card"}`}>{c.met ? "✓" : "✗"}</span>
                <span className="min-w-0">
                  <span className="block">{c.label}</span>
                  <span className="block text-xs text-muted">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHead label="Development gaps" title="How to close them" right={<Link href="/development" className="label underline underline-offset-4">Open plan</Link>} />
          {p.recs.length ? (
            <ul className="space-y-3">
              {p.recs.slice(0, 3).map((r) => (
                <li key={r.skill} className="rounded-md border-2 border-ink p-3">
                  <p className="flex items-center justify-between gap-2 font-medium">{r.skill} <Chip kind="flagged">−{r.gap} levels</Chip></p>
                  <p className="mt-1 text-sm text-muted">Training: {r.training}</p>
                  <p className="text-sm text-muted">Stretch: {r.stretch}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No gaps against the next level" hint="Every required skill is at or above the bar." />
          )}
        </Card>
        <Card>
          <CardHead label="Career paths" title="Where your skills can take you" />
          {p.paths.length ? (
            <ul className="space-y-3">
              {p.paths.map((c) => (
                <li key={`${c.track}-${c.level}`}>
                  <p className="mb-1 flex items-center justify-between gap-2">
                    <span>{title(c.track, c.level)} <span className="text-xs text-muted">· {c.kind === "next" ? "next level" : "lateral move"}</span></span>
                    <span className="font-mono text-sm tabular-nums">{Math.round(c.overlap * 100)}%</span>
                  </p>
                  <Meter value={c.overlap * 100} tone={c.kind === "next" ? "primary" : "accent"} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No paths yet" hint="Paths appear once your skills overlap another role's requirements." />
          )}
        </Card>
      </div>

      <Card paper className="mb-6">
        <CardHead label="Performance trend" title="Your evidence score by cycle" />
        <TrendChart data={p.history.map((h) => ({ cycle: h.cycle.name, score: h.evidence.score }))} series={[{ key: "score", label: "Evidence score" }]} reference={{ value: THRESHOLDS.promotionEvidenceScore, label: `Promotion bar (${THRESHOLDS.promotionEvidenceScore})` }} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tasks title="Your review tasks" items={[
          ...toAnswer.map((r) => ({ href: "/feedback", text: `Give feedback on ${getUser(r.subjectId)?.name}` })),
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
          ...openDev.map((d) => ({ href: "/development", text: `${d.title} — ${d.progress}% done` })),
        ]} />
        <Upcoming />
      </div>
<<<<<<< HEAD
      </Snapshot>
=======
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
    </>
  );
}

<<<<<<< HEAD
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
=======
// ---- Manager: "my team" — team evidence, my rating consistency, team gaps ----
function ManagerOverview({ viewer }: { viewer: UserRow }) {
  const team = visibleUserIds(viewer);
  const cal = calibration();
  const mine = cal.managers.find((m) => m.managerId === viewer.id);
  const myCases = cal.cases.filter((c) => c.managerId === viewer.id);
  const flagged = myCases.filter((c) => c.flagged);
  const reports = store.users.filter((u) => team.includes(u.id)).sort((a, b) => a.name.localeCompare(b.name));
  const ready = reports.filter((u) => u.promotionStage === "ready" || u.promotionStage === "near_ready").length;
  const notSent = store.requests.filter((r) => team.includes(r.subjectId) && r.status === "not_sent").length;
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
  const drift = mine?.medianResidual ?? 0;
  return (
    <>
      <Hero
<<<<<<< HEAD
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
=======
        role="manager"
        eyebrow="My team"
        headline={flagged.length ? `${plural(flagged.length, "rating")} on your team ${flagged.length === 1 ? "disagrees" : "disagree"} with the evidence.` : "Your ratings track the evidence."}
        sub={`On average you rate ${Math.abs(drift).toFixed(2)} points ${drift >= 0 ? "above" : "below"} what the evidence predicts. Anything within ±${THRESHOLDS.lenientResidual} counts as calibrated.`}
        sticker={mine?.flags.length ? mine.flags.join(" · ") : "Calibrated"}
        name={viewer.name}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Direct reports" value={team.length} />
        <StatTile label="Team evidence" value={avg(team.map((id) => evidenceFor(id, activeCycle().id).score))} suffix="avg" note="This cycle" />
        <StatTile label="Flagged ratings" value={flagged.length} tone={flagged.length ? "alert" : "card"} note="Review before calibration" />
        <StatTile label="Near or ready" value={ready} note="For promotion" tone="accent" />
      </div>

      <Card className="mb-6">
        <CardHead label="Team evidence" title="Your reports this cycle" right={<span className="text-xs text-muted">Sorted by name. EvalSense never ranks people.</span>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="label border-b-2 border-ink text-muted">
                <th className="py-2 pr-3">Person</th>
                <th className="py-2 pr-3">Evidence</th>
                <th className="py-2 pr-3">Your rating</th>
                <th className="py-2 pr-3">Stage</th>
                <th className="py-2">Biggest gap</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-ink/10">
              {reports.map((u) => {
                const c = myCases.find((x) => x.userId === u.id);
                const score = evidenceFor(u.id, activeCycle().id).score;
                const gap = profile(u.id).gaps[0];
                return (
                  <tr key={u.id}>
                    <td className="py-2.5 pr-3"><PersonLink id={u.id} name={u.name} sub={u.title} /></td>
                    <td className="w-48 py-2.5 pr-3">
                      <div className="flex items-center gap-2"><Meter value={score} /><span className="w-10 font-mono text-sm tabular-nums">{Math.round(score)}</span></div>
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-sm tabular-nums">
                      {c ? <span className="flex items-center gap-2">{c.flagged && <FlagDot />}{c.rating} <span className="text-muted">vs {c.expected}</span></span> : "—"}
                    </td>
                    <td className="py-2.5 pr-3"><Chip kind="ok">{STAGE_LABEL[u.promotionStage]}</Chip></td>
                    <td className="py-2.5 text-sm">{gap ? `${gap.skill} (−${gap.gap})` : <span className="text-muted">None</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card paper>
          <CardHead label="Rating consistency" title="Your ratings against their evidence" right={<Link href="/calibration" className="label underline underline-offset-4">Calibration</Link>} />
          <EvidenceScatter height={280} band={ratingBand(cal.cases)} points={myCases.map((c) => ({ evidence: c.evidence, rating: c.rating, flagged: c.flagged, tooltip: c.user.name }))} />
        </Card>
        <Card paper>
          <CardHead label="Team development" title="Skills your team is missing" right={<Link href="/skills" className="label underline underline-offset-4">Skills & gaps</Link>} />
          <BrutalBars layout="vertical" label="People with this gap" height={280} domain={[0, Math.max(1, team.length)]} data={gapCounts(team)} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tasks title="Before calibration" items={[
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
          ...flagged.map((c) => ({ href: "/calibration", text: `Re-check ${c.user.name}: rated ${c.rating}, evidence suggests ${c.expected}`, flag: true })),
          ...(notSent ? [{ href: "/feedback", text: `Send ${plural(notSent, "feedback request")}` }] : []),
        ]} />
        <Upcoming />
      </div>
<<<<<<< HEAD
      </Snapshot>
=======
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
    </>
  );
}

<<<<<<< HEAD
function HrOverview({ viewer, sp }: { viewer: UserRow; sp: { m?: string; d?: string } }) {
=======
// ---- HR: "org consistency" — manager patterns, org-wide contradictions, pipeline, audit ----
function HrOverview({ viewer }: { viewer: UserRow }) {
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
  const cal = calibration();
  const off = cal.managers.filter((m) => m.flags.some((f) => f !== "insufficient_data"));
  const flagged = cal.cases.filter((c) => c.flagged);
  const employees = store.users.filter((u) => u.role === "employee");
<<<<<<< HEAD
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
=======
  const stages = (Object.keys(STAGE_LABEL) as (keyof typeof STAGE_LABEL)[]).map((s) => ({ name: STAGE_LABEL[s], value: employees.filter((u) => u.promotionStage === s).length }));
  const audit = [...store.audit].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);
  return (
    <>
      <Hero
        role="hr"
        eyebrow="Org consistency"
        headline={`${off.length} of ${cal.managers.length} managers rate differently from their evidence.`}
        sub={`${plural(flagged.length, "individual rating")} ${flagged.length === 1 ? "sits" : "sit"} ${THRESHOLDS.contradictionResidual}+ points away from what the evidence predicts. Review them before the calibration sessions.`}
        sticker="Calibration open"
        name={viewer.name}
      />
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Employees" value={employees.length} note={`${cal.managers.length} managers`} />
        <StatTile label="Ratings in" value={cal.cases.length} note={activeCycle().name} />
        <StatTile label="Managers off-pattern" value={off.length} tone="primary" note="Lenient, strict or inconsistent" />
        <StatTile label="Flagged cases" value={flagged.length} tone={flagged.length ? "alert" : "card"} note="Rating vs evidence" />
      </div>
<<<<<<< HEAD
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
=======

      <Card className="mb-6">
        <CardHead label="Manager consistency" title="How each manager rates against evidence" right={<Link href="/calibration" className="label underline underline-offset-4">Open calibration</Link>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="label border-b-2 border-ink text-muted">
                <th className="py-2 pr-3">Manager</th>
                <th className="py-2 pr-3">Ratings</th>
                <th className="py-2 pr-3">Avg rating</th>
                <th className="py-2 pr-3">Gap vs evidence</th>
                <th className="py-2">Pattern</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-ink/10">
              {cal.managers.map((m) => (
                <tr key={m.managerId}>
                  <td className="py-2.5 pr-3"><PersonLink id={m.managerId} name={m.manager.name} sub={m.manager.dept} /></td>
                  <td className="py-2.5 pr-3 font-mono text-sm tabular-nums">{m.n}</td>
                  <td className="py-2.5 pr-3 font-mono text-sm tabular-nums">{m.meanRating.toFixed(2)}</td>
                  <td className="py-2.5 pr-3 font-mono text-sm tabular-nums">{m.medianResidual > 0 ? "+" : ""}{m.medianResidual.toFixed(2)}</td>
                  <td className="py-2.5"><span className="flex flex-wrap gap-1.5">{m.flags.length ? m.flags.map((f) => <Chip key={f} kind={f} />) : <Chip kind="ok">calibrated</Chip>}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card paper>
          <CardHead label="Evidence vs rating" title="Every rating this cycle" />
          <EvidenceScatter height={280} band={ratingBand(cal.cases)} points={cal.cases.map((c) => ({ evidence: c.evidence, rating: c.rating, flagged: c.flagged, tooltip: `${c.user.name} (${c.manager.name})` }))} />
        </Card>
        <Card paper>
          <CardHead label="Promotion pipeline" title="Where people stand" right={<Link href="/pipeline" className="label underline underline-offset-4">Open pipeline</Link>} />
          <BrutalBars layout="vertical" data={stages} label="People" height={280} domain={[0, Math.max(1, ...stages.map((s) => s.value))]} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card paper>
          <CardHead label="Org development" title="Most common skill gaps" />
          <BrutalBars layout="vertical" label="People with this gap" height={260} domain={[0, Math.max(1, employees.length)]} data={gapCounts(employees.map((u) => u.id))} />
        </Card>
        <Card>
          <CardHead label="Decisions stay with people" title="Latest audited changes" right={<Link href="/audit" className="label underline underline-offset-4">Audit trail</Link>} />
          {audit.length ? (
            <ul className="divide-y-2 divide-ink/10">
              {audit.map((a) => (
                <li key={a.id} className="py-2.5">
                  <p className="text-sm"><span className="font-medium">{getUser(a.actorId)?.name}</span> changed {a.field}: <span className="font-mono">{a.oldValue ?? "—"} → {a.newValue ?? "—"}</span></p>
                  <p className="text-xs text-muted">{a.reason} · {fmtDate(a.at.slice(0, 10))}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No changes yet" hint="Every rating change and pipeline move shows up here with its reason." />
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Tasks title="Managers to review" items={off.map((m) => ({ href: "/calibration", text: `${m.manager.name}: ${m.flags.join(", ")} (${m.n} ratings)`, flag: true }))} />
        <Upcoming />
      </div>
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
    </>
  );
}

<<<<<<< HEAD
export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ denied?: string; m?: string; d?: string }> }) {
  const viewer = await requireRole();
  const sp = await searchParams;
  const { denied } = sp;
=======
export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const viewer = await requireRole();
  const { denied } = await searchParams;
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
  return (
    <>
      {denied && (
        <p role="alert" className="mb-6 rounded-md border-[3px] border-ink bg-card px-4 py-3">
          That page isn&apos;t available to your role. Switch role from the top bar to see it.
        </p>
      )}
<<<<<<< HEAD
      {viewer.role === "employee" && <EmployeeOverview viewer={viewer} sp={sp} />}
      {viewer.role === "manager" && <ManagerOverview viewer={viewer} sp={sp} />}
      {viewer.role === "hr" && <HrOverview viewer={viewer} sp={sp} />}
=======
      {viewer.role === "employee" && <EmployeeOverview viewer={viewer} />}
      {viewer.role === "manager" && <ManagerOverview viewer={viewer} />}
      {viewer.role === "hr" && <HrOverview viewer={viewer} />}
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
    </>
  );
}
