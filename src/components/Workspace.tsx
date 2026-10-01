import { CheckCircle2, Clock } from "lucide-react";
import { toggleTask } from "@/app/(app)/workspace/actions";
import { getUser, store, todayISO } from "@/lib/data/repo";

const PRIORITY: Record<string, string> = { low: "bg-card", medium: "bg-accent text-[#0f1417]", high: "bg-primary text-white", critical: "bg-alert text-[#0f1417]" };

export function Tile({ icon: Icon, label, value, tone = "ink" }: { icon: typeof Clock; label: string; value: string; tone?: "ink" | "primary" | "accent" | "alert" }) {
  const color = { ink: "", primary: "text-primary", accent: "text-[var(--series-2)]", alert: "text-alert-ink" }[tone];
  return (
    <div className="brutal p-4">
      <span className="grid size-10 place-items-center rounded-md border-2 border-ink bg-accent text-[#0f1417]"><Icon size={18} /></span>
      <p className="label mt-3 text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export function TaskRow({ t, viewerId }: { t: (typeof store.tasks)[number]; viewerId: number }) {
  const other = getUser(t.assigneeId === viewerId ? t.creatorId : t.assigneeId);
  const overdue = t.status === "open" && t.due < todayISO();
  return (
    <li className="flex items-center gap-3 rounded-md border-2 border-ink px-3 py-2">
      <form action={toggleTask}>
        <input type="hidden" name="id" value={t.id} />
        <button className={`grid size-5 place-items-center rounded border-2 border-ink ${t.status === "done" ? "bg-accent" : "bg-card"}`} aria-label={t.status === "done" ? `Mark "${t.title}" as not done` : `Mark "${t.title}" as done`}>
          {t.status === "done" && <CheckCircle2 size={12} className="text-[#0f1417]" />}
        </button>
      </form>
      <div className="min-w-0 flex-1">
        <p className={`truncate ${t.status === "done" ? "text-muted line-through" : ""}`}>{t.title}</p>
        <p className="truncate text-xs text-muted">
          {t.kind === "stretch" ? "Stretch assignment · " : ""}
          {t.assigneeId === viewerId ? (t.creatorId === viewerId ? "Self" : `From ${other?.name}`) : `For ${other?.name}`} · due {t.due}
          {overdue && <span className="text-alert-ink"> · overdue</span>}
        </p>
      </div>
      <span className={`label rounded border-2 border-ink px-1.5 text-[10px] ${PRIORITY[t.priority]}`}>{t.priority}</span>
    </li>
  );
}
