import { SupportHub } from "@/components/SupportHub";
import { Chip, PageHeader } from "@/components/ui";
import { getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import { resolveTicket } from "./actions";
import { FAQ } from "./faq";

export default async function SupportPage() {
  const viewer = await requireRole();
  const tickets = store.tickets.filter((t) => viewer.role === "hr" || t.userId === viewer.id).sort((a, b) => a.status.localeCompare(b.status) || b.at.localeCompare(a.at));
  return (
    <>
      <PageHeader title="Support hub" lead="Answers about how EvalSense works, and a direct line to HR." />
      <SupportHub name={viewer.name} faq={FAQ.map(({ q, a }) => ({ q, a }))} />
      <section className="brutal mt-6 p-5">
        <h2 className="mb-3 font-display text-2xl">{viewer.role === "hr" ? "All tickets" : "My tickets"}</h2>
        {tickets.length ? (
          <ul className="space-y-2">
            {tickets.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-md border-2 border-ink p-3">
                <span className="font-mono text-sm">#{t.id}</span>
                <div className="min-w-48 flex-1">
                  <p className="font-medium">{t.subject}</p>
                  <p className="text-sm text-muted">{viewer.role === "hr" && `${getUser(t.userId)?.name} · `}{t.body}</p>
                </div>
                <Chip kind={t.status === "open" ? "ok" : "inconsistent"}>{t.status}</Chip>
                {viewer.role === "hr" && (
                  <form action={resolveTicket}><input type="hidden" name="id" value={t.id} /><button className="btn btn-ghost px-3 py-1">{t.status === "open" ? "Mark resolved" : "Reopen"}</button></form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No tickets yet.</p>
        )}
      </section>
    </>
  );
}
