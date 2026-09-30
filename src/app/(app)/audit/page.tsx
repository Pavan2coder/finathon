import Link from "next/link";
import { Empty, PageHeader } from "@/components/ui";
import { getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

const ENTITY = { rating: "Rating", user: "Promotion stage", import: "Evidence import" } as Record<string, string>;

function subjectOf(entity: string, entityId: number) {
  if (entity === "rating") {
    const r = store.ratings.find((x) => x.id === entityId);
    return r ? getUser(r.userId) : null;
  }
  if (entity === "user") return getUser(entityId);
  return null;
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ entity?: string; actor?: string }> }) {
  await requireRole("hr");
  const { entity = "", actor = "" } = await searchParams;
  const actors = [...new Set(store.audit.map((a) => a.actorId))].map((id) => getUser(id)!).sort((a, b) => a.name.localeCompare(b.name));
  const rows = store.audit
    .filter((a) => !entity || a.entity === entity)
    .filter((a) => !actor || a.actorId === Number(actor))
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <>
      <PageHeader title="Audit trail" lead="Every rating change, pipeline move and import, with who made it and why. Entries can't be edited or deleted." />
      <form className="brutal mb-6 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label htmlFor="entity" className="label mb-1 block">Change type</label>
          <select id="entity" name="entity" defaultValue={entity} className="field">
            <option value="">All changes</option>
            {Object.entries(ENTITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="actor" className="label mb-1 block">Changed by</label>
          <select id="actor" name="actor" defaultValue={actor} className="field">
            <option value="">Anyone</option>
            {actors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary">Apply filters</button>
      </form>
      {rows.length ? (
        <ol className="relative space-y-3 border-l-[3px] border-ink pl-6">
          {rows.map((a) => {
            const s = subjectOf(a.entity, a.entityId);
            return (
              <li key={a.id} className="brutal relative p-4">
                <span aria-hidden className="absolute top-5 -left-[33px] size-3.5 rounded-sm border-2 border-ink bg-primary" />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">
                    {ENTITY[a.entity] ?? a.entity}
                    {s && <> for <Link href={`/people/${s.id}`} className="underline underline-offset-4">{s.name}</Link></>}
                  </p>
                  <time className="font-mono text-xs text-muted" dateTime={a.at}>{a.at.slice(0, 16).replace("T", " ")}</time>
                </div>
                <p className="mt-1 font-mono text-sm">
                  {a.oldValue ?? "—"} <span aria-label="changed to">→</span> {a.newValue ?? "—"}
                </p>
                <p className="mt-2 text-sm">“{a.reason}”</p>
                <p className="mt-1 text-xs text-muted">by {getUser(a.actorId)?.name}</p>
              </li>
            );
          })}
        </ol>
      ) : (
        <Empty title="No changes match these filters" hint="Rating changes and pipeline moves appear here as soon as they're saved." />
      )}
    </>
  );
}
