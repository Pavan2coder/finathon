import { Shell } from "@/components/shell/Shell";
import { calibration, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireRole();
  const flagged = calibration().cases.filter((c) => c.flagged && (viewer.role === "hr" || c.managerId === viewer.id)).length;
  const requests = store.requests.filter((r) => r.reviewerId === viewer.id && (r.status === "sent" || r.status === "followed_up")).length;
  return (
    <Shell viewer={{ id: viewer.id, name: viewer.name, role: viewer.role, title: viewer.title }} badges={{ flags: flagged, requests }}>
      {children}
    </Shell>
  );
}
