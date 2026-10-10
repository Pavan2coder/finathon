import Link from "next/link";
import { BrutalBars, TrendChart } from "@/components/charts";
import { Card, CardHead, Meter, PersonLink, StatTile } from "@/components/ui";
import type { UserRow } from "@/lib/data/generate";
import { activeCycle, evidenceFor, profile, ratingFor, store, visibleUserIds } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : 0);
const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;

// Each portal gets its own hero colour so the three dashboards read differently at a glance.
const HERO = {
  employee: "bg-accent text-[#0f1417]",
  manager: "bg-[#0f1417] text-[#ebebed]",
  hr: "bg-primary text-white",
} as const;

function Hero({ role, eyebrow, headline, sub, name }: { role: keyof typeof HERO; eyebrow: string; headline: string; sub: string; name: string }) {
  return (
    <section className={`brutal relative mb-6 overflow-hidden p-6 sm:p-10 ${HERO[role]}`}>
      <p className="label opacity-80">{eyebrow} · {name.split(" ")[0]} · {activeCycle().name} review cycle</p>
      <h1 className="font-display mt-3 max-w-[22ch] text-4xl leading-[0.95] tracking-[-0.02em] sm:text-6xl">{headline}</h1>
      <p className="mt-4 max-w-[60ch] text-lg leading-relaxed font-light opacity-90">{sub}</p>
    </section>
  );
}

// ---- Employee: "my evidence" — score and what it is made of ----
function EmployeeOverview({ viewer }: { viewer: UserRow }) {
  const p = profile(viewer.id);
  const ev = p.current.evidence;
  const goalAttainment = ev.components.find((c) => c.key === "goals")?.value ?? 0;
  return (
    <>
      <Hero
        role="employee"
        eyebrow="My evidence"
        headline={`Your evidence score is ${ev.score} out of 100.`}
        sub={`Built from ${ev.components.length} of 7 sources this cycle. Every number links back to the data behind it.`}
        name={viewer.name}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile label="Evidence score" value={ev.score} suffix="/100" note="This cycle" tone="primary" />
        <StatTile label="Goal attainment" value={Math.round(goalAttainment)} suffix="%" note={`Across ${plural(p.goals.length, "goal")}`} />
        <StatTile label="Sources" value={ev.components.length} suffix="/7" note={ev.missing.length ? `Missing: ${ev.missing.join(", ")}` : "All sources present"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card paper>
          <CardHead label="Evidence profile" title="What your score is made of" right={<Link href={`/people/${viewer.id}`} className="label underline underline-offset-4">See sources</Link>} />
          <BrutalBars
            layout="vertical"
            label="Score"
            height={260}
            data={ev.components.map((c) => ({ name: c.label, value: Math.round(c.value), tooltip: `${Math.round(c.weight * 100)}% of the score` }))}
          />
        </Card>
        <Card paper>
          <CardHead label="Performance trend" title="Your evidence score by cycle" />
          <TrendChart data={p.history.map((h) => ({ cycle: h.cycle.name, score: h.evidence.score }))} series={[{ key: "score", label: "Evidence score" }]} />
        </Card>
      </div>
    </>
  );
}

// ---- Manager: "my team" — evidence score per report ----
function ManagerOverview({ viewer }: { viewer: UserRow }) {
  const cycle = activeCycle();
  const team = visibleUserIds(viewer);
  const reports = store.users.filter((u) => team.includes(u.id)).sort((a, b) => a.name.localeCompare(b.name));
  const teamAvg = avg(team.map((id) => evidenceFor(id, cycle.id).score));
  return (
    <>
      <Hero
        role="manager"
        eyebrow="My team"
        headline={`Your team averages ${teamAvg} on evidence this cycle.`}
        sub="Open anyone to see the goals, work and feedback behind their score."
        name={viewer.name}
      />
      <div className="mb-6 grid grid-cols-2 gap-4">
        <StatTile label="Direct reports" value={team.length} />
        <StatTile label="Team evidence" value={teamAvg} suffix="avg" note="This cycle" tone="primary" />
      </div>

      <Card>
        <CardHead label="Team evidence" title="Your reports this cycle" right={<span className="text-xs text-muted">Sorted by name. EvalSense never ranks people.</span>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="label border-b-2 border-ink text-muted">
                <th className="py-2 pr-3">Person</th>
                <th className="py-2 pr-3">Evidence</th>
                <th className="py-2">Your rating</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-ink/10">
              {reports.map((u) => {
                const score = evidenceFor(u.id, cycle.id).score;
                return (
                  <tr key={u.id}>
                    <td className="py-2.5 pr-3"><PersonLink id={u.id} name={u.name} sub={u.title} /></td>
                    <td className="w-48 py-2.5 pr-3">
                      <div className="flex items-center gap-2"><Meter value={score} /><span className="w-10 font-mono text-sm tabular-nums">{Math.round(score)}</span></div>
                    </td>
                    <td className="py-2.5 font-mono text-sm tabular-nums">{ratingFor(u.id, cycle.id)?.rating ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// ---- HR: "org evidence" — scores across departments ----
function HrOverview({ viewer }: { viewer: UserRow }) {
  const cycle = activeCycle();
  const employees = store.users.filter((u) => u.role === "employee");
  const managers = store.users.filter((u) => u.role === "manager").length;
  const depts = [...new Set(employees.map((u) => u.dept))].sort();
  const scoreOf = (u: UserRow) => evidenceFor(u.id, cycle.id).score;
  const byDept = depts.map((d) => ({ name: d, value: avg(employees.filter((u) => u.dept === d).map(scoreOf)) }));
  return (
    <>
      <Hero
        role="hr"
        eyebrow="Org evidence"
        headline={`${employees.length} employees scored from evidence this cycle.`}
        sub="Scores come from goals, projects, deliverables, peers, impact, training and attendance."
        name={viewer.name}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile label="Employees" value={employees.length} note={`${managers} managers`} />
        <StatTile label="Org evidence" value={avg(employees.map(scoreOf))} suffix="avg" note={cycle.name} tone="primary" />
        <StatTile label="Departments" value={depts.length} />
      </div>

      <Card paper>
        <CardHead label="Evidence by department" title="Average evidence score" right={<Link href="/people" className="label underline underline-offset-4">All people</Link>} />
        <BrutalBars layout="vertical" label="Avg score" height={280} domain={[0, 100]} data={byDept} />
      </Card>
    </>
  );
}

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const viewer = await requireRole();
  const { denied } = await searchParams;
  return (
    <>
      {denied && (
        <p role="alert" className="mb-6 rounded-md border-[3px] border-ink bg-card px-4 py-3">
          That page isn&apos;t available to your role. Switch role from the top bar to see it.
        </p>
      )}
      {viewer.role === "employee" && <EmployeeOverview viewer={viewer} />}
      {viewer.role === "manager" && <ManagerOverview viewer={viewer} />}
      {viewer.role === "hr" && <HrOverview viewer={viewer} />}
    </>
  );
}
