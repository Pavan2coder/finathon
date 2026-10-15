import { Empty, PageHeader, PersonLink } from "@/components/ui";
import { activeCycle, evidenceFor, ratingFor, store, visibleUserIds } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ q?: string; dept?: string }> }) {
  const viewer = await requireRole("manager", "hr");
  const { q = "", dept = "" } = await searchParams;
  const ids = new Set(visibleUserIds(viewer));
  const depts = [...new Set(store.users.filter((u) => ids.has(u.id)).map((u) => u.dept))].sort();

  // Sorted by name — never by score. This page is a directory, not a ranking.
  const rows = store.users
    .filter((u) => ids.has(u.id))
    .filter((u) => !q || u.name.toLowerCase().includes(q.toLowerCase()))
    .filter((u) => !dept || u.dept === dept)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader title="People" lead={viewer.role === "hr" ? "Everyone in the current review cycle, listed alphabetically." : "Your direct reports, listed alphabetically."} />
      <form className="brutal mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-48 flex-1">
          <label htmlFor="q" className="label mb-1 block">Search by name</label>
          <input id="q" name="q" defaultValue={q} className="field" placeholder="Priya" />
        </div>
        {depts.length > 1 && (
          <div>
            <label htmlFor="dept" className="label mb-1 block">Department</label>
            <select id="dept" name="dept" defaultValue={dept} className="field">
              <option value="">All departments</option>
              {depts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        )}
        <button className="btn btn-primary">Apply filters</button>
      </form>

      {rows.length ? (
        <div className="brutal overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="label border-b-[3px] border-ink text-left">
                <th className="px-4 py-3 font-normal">Person</th>
                <th className="px-4 py-3 font-normal">Department</th>
                <th className="px-4 py-3 font-normal">Level</th>
                {viewer.role === "hr" && <th className="px-4 py-3 font-normal">Manager</th>}
                <th className="px-4 py-3 font-normal">Evidence</th>
                <th className="px-4 py-3 font-normal">Rating</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                return (
                  <tr key={u.id} className="border-b-2 border-ink/10 last:border-0 hover:bg-bg">
                    <td className="px-4 py-2.5"><PersonLink id={u.id} name={u.name} sub={u.title} /></td>
                    <td className="px-4">{u.dept}</td>
                    <td className="px-4 font-mono">L{u.level}</td>
                    {viewer.role === "hr" && <td className="px-4">{store.users.find((m) => m.id === u.managerId)?.name}</td>}
                    <td className="px-4 font-mono tabular-nums">{evidenceFor(u.id, activeCycle().id).score}</td>
                    <td className="px-4 font-mono tabular-nums">{ratingFor(u.id, activeCycle().id)?.rating ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="Nobody matches these filters" hint="Clear the search or department filter." />
      )}
    </>
  );
}
