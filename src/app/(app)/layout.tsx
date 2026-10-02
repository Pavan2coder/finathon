import { Shell } from "@/components/shell/Shell";
import { calibration, store, visibleUserIds } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireRole();
  const flagged = calibration().cases.filter((c) => c.flagged && (viewer.role === "hr" || c.managerId === viewer.id)).length;
  const requests = store.requests.filter((r) => r.reviewerId === viewer.id && (r.status === "sent" || r.status === "followed_up")).length;
  const team = new Set(visibleUserIds(viewer));
  const leaves = viewer.role === "employee" ? 0 : store.leaves.filter((l) => l.status === "pending" && team.has(l.userId)).length;
  return (
    <Shell viewer={{ id: viewer.id, name: viewer.name, role: viewer.role, title: viewer.title }} badges={{ flags: flagged, requests, leaves }}>
      {children}
    </Shell>
  );
}
