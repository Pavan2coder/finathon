import { PipelineBoard, type TimelineItem } from "@/components/PipelineBoard";
import { PageHeader, StatTile } from "@/components/ui";
import { getUser, profile, store, visibleUserIds } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

const LABEL: Record<string, string> = { not_ready: "Not ready", developing: "Developing", near_ready: "Near ready", ready: "Ready", promoted: "Promoted" };

export default async function PipelinePage() {
  const viewer = await requireRole("manager", "hr");
  const cards = visibleUserIds(viewer).map((id) => {
    const u = getUser(id)!;
    const p = profile(id);
    const mgr = u.managerId ? getUser(u.managerId) : null;
    const timeline: TimelineItem[] = [
      ...store.notes.filter((n) => n.subjectId === id).map((n) => ({ at: n.at, kind: n.kind, title: n.title, details: n.details, who: getUser(n.authorId)?.name ?? "" })),
      ...store.audit.filter((a) => a.entity === "user" && a.entityId === id && a.field === "promotionStage").map((a) => ({ at: a.at, kind: "stage" as const, title: `${LABEL[a.oldValue ?? ""] ?? a.oldValue} → ${LABEL[a.newValue ?? ""] ?? a.newValue}`, details: a.reason, who: getUser(a.actorId)?.name ?? "" })),
    ].sort((a, b) => b.at.localeCompare(a.at));
    return { id, name: u.name, email: u.email, title: u.title, stage: u.promotionStage, readiness: p.readiness.percent, unmet: p.readiness.unmet, managerId: u.managerId, managerName: mgr?.name ?? "—", timeline };
  });
  const managers = [...new Map(cards.filter((c) => c.managerId).map((c) => [c.managerId!, { id: c.managerId!, name: c.managerName }])).values()].sort((a, b) => a.name.localeCompare(b.name));
  const active = cards.filter((c) => c.stage !== "promoted");
  const avg = active.length ? Math.round(active.reduce((a, c) => a + c.readiness, 0) / active.length) : 0;

  return (
    <>
      <PageHeader title="Talent pipeline" lead="Track people through promotion readiness. Drag a card to move it; every move asks for a reason and lands in the audit trail. Readiness comes from the criteria, never from rank." />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="In pipeline" value={active.length} />
        <StatTile label="Average readiness" value={avg} suffix="%" tone="primary" />
        <StatTile label="Near or ready" value={cards.filter((c) => c.stage === "near_ready" || c.stage === "ready").length} tone="accent" />
        <StatTile label="Promoted" value={cards.filter((c) => c.stage === "promoted").length} />
      </div>
      <PipelineBoard initial={cards.sort((a, b) => a.name.localeCompare(b.name))} managers={managers} />
    </>
  );
}
