import { Shell } from "@/components/shell/Shell";
<<<<<<< HEAD
import { calibration, store, visibleUserIds } from "@/lib/data/repo";
=======
import { calibration, store } from "@/lib/data/repo";
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
import { requireRole } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireRole();
  const flagged = calibration().cases.filter((c) => c.flagged && (viewer.role === "hr" || c.managerId === viewer.id)).length;
  const requests = store.requests.filter((r) => r.reviewerId === viewer.id && (r.status === "sent" || r.status === "followed_up")).length;
<<<<<<< HEAD
  const team = new Set(visibleUserIds(viewer));
  const leaves = viewer.role === "employee" ? 0 : store.leaves.filter((l) => l.status === "pending" && team.has(l.userId)).length;
  return (
    <Shell viewer={{ id: viewer.id, name: viewer.name, role: viewer.role, title: viewer.title }} badges={{ flags: flagged, requests, leaves }}>
=======
  return (
    <Shell viewer={{ id: viewer.id, name: viewer.name, role: viewer.role, title: viewer.title }} badges={{ flags: flagged, requests }}>
>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
      {children}
    </Shell>
  );
}
