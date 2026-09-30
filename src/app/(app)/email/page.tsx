import Link from "next/link";
import { AutoRefresh, EmailComposer } from "@/components/Messaging";
import { Empty, Initials, PageHeader } from "@/components/ui";
import { getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

type Tab = "inbox" | "sent" | "compose";

export default async function EmailPage({ searchParams }: { searchParams: Promise<{ tab?: string; t?: string }> }) {
  const viewer = await requireRole();
  const sp = await searchParams;
  const tab: Tab = sp.tab === "sent" || sp.tab === "compose" ? sp.tab : "inbox";
  const people = store.users.filter((u) => u.id !== viewer.id).map((u) => ({ id: u.id, name: u.name, email: u.email })).sort((a, b) => a.name.localeCompare(b.name));
  const involves = (m: (typeof store.emails)[number]) => [...m.to, ...m.cc, ...m.tags].includes(viewer.id);
  const threads = new Map<number, (typeof store.emails)[number][]>();
  for (const m of store.emails) if (tab === "sent" ? m.fromId === viewer.id : involves(m) || (m.fromId === viewer.id && store.emails.some((x) => x.threadId === m.threadId && involves(x)))) threads.set(m.threadId, [...(threads.get(m.threadId) ?? []), m]);
  const list = [...threads.values()].sort((a, b) => b.at(-1)!.at.localeCompare(a.at(-1)!.at));
  const openId = Number(sp.t) || list[0]?.[0].threadId;
  const open = store.emails.filter((m) => m.threadId === openId && (m.fromId === viewer.id || involves(m) || store.emails.some((x) => x.threadId === openId && (involves(x) || x.fromId === viewer.id))));
  const tabs: [Tab, string][] = [["inbox", "Inbox"], ["sent", "Sent"], ["compose", "Compose"]];
  const replyTo = open.length ? [...new Set([open[0].fromId, ...open[0].to].filter((id) => id !== viewer.id))] : [];

  return (
    <>
      <PageHeader title="Email center" lead="Send, receive and reply inside EvalSense. Tag people to loop them in." />
      <AutoRefresh ms={8000} />
      <nav className="mb-4 flex gap-2" aria-label="Mailboxes">
        {tabs.map(([k, l]) => (
          <Link key={k} href={`/email?tab=${k}`} aria-current={tab === k ? "page" : undefined} className={`label rounded-md border-[3px] border-ink px-3 py-1.5 ${tab === k ? "bg-ink text-bg" : "bg-card hover:bg-accent hover:text-[#0f1417]"}`}>{l}</Link>
        ))}
      </nav>
      {tab === "compose" ? (
        <div className="brutal max-w-3xl p-5"><EmailComposer people={people} /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="brutal p-0">
            <h2 className="border-b-[3px] border-ink px-4 py-3 font-medium">{tab === "inbox" ? "Inbox threads" : "Sent"}</h2>
            {list.length ? (
              <ul>
                {list.map((th) => {
                  const last = th.at(-1)!;
                  const from = getUser(last.fromId)!;
                  return (
                    <li key={th[0].threadId} className="border-b-2 border-ink/10 last:border-0">
                      <Link href={`/email?tab=${tab}&t=${th[0].threadId}`} className={`flex gap-3 px-4 py-3 ${openId === th[0].threadId ? "bg-accent text-[#0f1417]" : "hover:bg-bg"}`}>
                        <Initials name={from.name} />
                        <span className="min-w-0 flex-1">
                          <span className="flex justify-between gap-2 text-sm"><span className="truncate font-medium">{th[0].subject}</span><span className="shrink-0 font-mono text-[11px] opacity-70">{last.at.slice(5, 10)}</span></span>
                          <span className="block truncate text-xs opacity-70">{from.name}: {last.body}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-4"><Empty title="No threads yet." hint="Emails sent to you land here." /></div>
            )}
          </section>
          <section className="brutal p-5">
            <h2 className="label mb-3 text-muted">Conversation</h2>
            {open.length ? (
              <>
                <h3 className="font-display text-3xl leading-tight">{open[0].subject}</h3>
                <ol className="mt-4 space-y-3">
                  {open.map((m) => (
                    <li key={m.id} className="rounded-md border-2 border-ink p-4">
                      <p className="text-sm"><span className="font-medium">{getUser(m.fromId)?.name}</span> <span className="text-muted">to {m.to.map((id) => getUser(id)?.name).slice(0, 3).join(", ")}{m.to.length > 3 ? ` +${m.to.length - 3}` : ""}{m.cc.length ? ` · cc ${m.cc.map((id) => getUser(id)?.name).join(", ")}` : ""}</span></p>
                      {m.tags.length > 0 && <p className="mt-1 text-xs">{m.tags.map((id) => <span key={id} className="mr-1 rounded border border-ink bg-accent px-1 text-[#0f1417]">@{getUser(id)?.name}</span>)}</p>}
                      <p className="mt-2 whitespace-pre-line">{m.body}</p>
                      <p className="mt-2 font-mono text-[11px] text-muted">{new Date(m.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                    </li>
                  ))}
                </ol>
                <div className="mt-5 border-t-2 border-ink/15 pt-4">
                  <p className="label mb-2">Reply</p>
                  <EmailComposer people={people} threadId={open[0].threadId} subject={open[0].subject.startsWith("Re:") ? open[0].subject : `Re: ${open[0].subject}`} to={replyTo} />
                </div>
              </>
            ) : (
              <Empty title="Select a thread." />
            )}
          </section>
        </div>
      )}
    </>
  );
}
