import { Shell } from "@/components/shell/Shell";
import { requireRole } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireRole();
  return <Shell viewer={{ id: viewer.id, name: viewer.name, role: viewer.role, title: viewer.title }}>{children}</Shell>;
}
