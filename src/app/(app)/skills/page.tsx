import { CareerGraph } from "@/components/CareerGraph";
import { SkillRadar, TrendChart } from "@/components/charts";
import { PersonPicker } from "@/components/PersonPicker";
import { Card, CardHead, Empty, PageHeader } from "@/components/ui";
import { TITLES } from "@/lib/data/generate";
import { profile, store } from "@/lib/data/repo";
import { assessSkills } from "@/lib/engine";
import { subjectFor } from "@/lib/scope";
import { requireRole } from "@/lib/session";

export default async function SkillsPage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const viewer = await requireRole();
  const { subject, people } = subjectFor(viewer, (await searchParams).user);
  const p = profile(subject.id);
  const title = (track: string, level: number) => TITLES[track]?.[level - 1] ?? `${track} L${level}`;

  const names = [...new Set([...p.nextReqs.map((r) => r.skill), ...p.curReqs.map((r) => r.skill)])];
  const lvl = new Map(p.skills.map((s) => [s.skill, s.level]));
  const radar = names.map((skill) => ({
    skill,
    demonstrated: lvl.get(skill) ?? 0,
    current: p.curReqs.find((r) => r.skill === skill)?.requiredLevel ?? 0,
    next: p.nextReqs.find((r) => r.skill === skill)?.requiredLevel ?? 0,
  }));

  // Skill growth: re-assess using only evidence up to each cycle.
  const top = [...p.gaps.map((g) => g.skill), ...names].filter((s, i, a) => a.indexOf(s) === i).slice(0, 2);
  const growth = store.cycles.map((c) => {
    const levels = assessSkills({
      deliverables: store.deliverables.filter((x) => x.userId === subject.id && x.cycleId <= c.id),
      projects: store.members.filter((m) => m.userId === subject.id).map((m) => ({ ...store.projects.find((q) => q.id === m.projectId)!, contribution: m.contribution })).filter((q) => q.cycleId <= c.id),
      feedback: store.feedback.filter((f) => f.subjectId === subject.id && f.cycleId <= c.id),
    });
    return { cycle: c.name, ...Object.fromEntries(top.map((s) => [s, levels.find((l) => l.skill === s)?.level ?? 0])) };
  });

  return (
    <>
      <PageHeader
        title="Skills & gaps"
        lead={`${subject.name === viewer.name ? "Your" : `${subject.name}'s`} skills, measured from tagged work and feedback, against what ${title(subject.track, subject.level)} and ${title(subject.track, subject.level + 1)} need.`}
        actions={people.length ? <PersonPicker people={people} value={subject.id} /> : undefined}
      />
      <div className="mb-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card paper>
          <CardHead label="Skill assessment" title="Demonstrated against role expectations" />
          <SkillRadar data={radar} />
        </Card>
        <Card>
          <CardHead label="Development gaps" title={`To reach ${title(subject.track, subject.level + 1)}`} />
          {p.recs.length ? (
            <ul className="space-y-3">
              {p.recs.map((r) => (
                <li key={r.skill} className="rounded-md border-2 border-ink p-3">
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{r.skill}</span>
                    <span className="font-mono text-sm tabular-nums">{lvl.get(r.skill) ?? 0} → {(lvl.get(r.skill) ?? 0) + r.gap}</span>
                  </p>
                  <p className="mt-1 text-sm"><span className="label mr-2 text-muted">Course</span>{r.training}</p>
                  <p className="text-sm"><span className="label mr-2 text-muted">Stretch</span>{r.stretch}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No gaps against the next level" hint="Every required skill is at or above the bar." />
          )}
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card paper>
          <CardHead label="Skill growth" title="Level over time" />
          <TrendChart data={growth} series={top.map((s) => ({ key: s, label: s }))} domain={[0, 5]} />
        </Card>
        <Card>
          <CardHead label="Career path" title="Where this could go next" />
          {p.paths.length ? (
            <CareerGraph current={subject.title} paths={p.paths} titleFor={(x) => title(x.track, x.level)} />
          ) : (
            <Empty title="Top of the track" hint="No higher level is defined for this track yet." />
          )}
        </Card>
      </div>
    </>
  );
}
