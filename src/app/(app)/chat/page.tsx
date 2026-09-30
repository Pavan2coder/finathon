import Link from "next/link";
import { AutoRefresh, ChatComposer, ScrollToEnd } from "@/components/Messaging";
import { Empty, Initials, PageHeader } from "@/components/ui";
import { getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ with?: string; q?: string }> }) {
  const viewer = await requireRole();
  const { with: withId, q = "" } = await searchParams;
  const mine = store.messages.filter((m) => m.fromId === viewer.id || m.toId === viewer.id);
  const lastWith = (id: number) => mine.filter((m) => m.fromId === id || m.toId === id).at(-1);
  // Everyone in the app, people you've talked to first.
  const people = store.users
    .filter((u) => u.id !== viewer.id)
    .filter((u) => !q || (u.name + u.email).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (lastWith(b.id)?.at ?? "").localeCompare(lastWith(a.id)?.at ?? "") || a.name.localeCompare(b.name));
  const other = withId ? getUser(Number(withId)) : null;
  const thread = other ? mine.filter((m) => m.fromId === other.id || m.toId === other.id) : [];

  return (
    <>
      <PageHeader title="Chat" lead="Message anyone who uses EvalSense." />
      <div className="brutal grid h-[min(70vh,720px)] grid-cols-1 overflow-hidden p-0 md:grid-cols-[300px_1fr]">
        <aside className={`flex flex-col border-ink md:border-r-[3px] ${other ? "hidden md:flex" : "flex"}`}>
          <form className="border-b-[3px] border-ink p-3">
            <label htmlFor="chat-q" className="sr-only">Search people</label>
            <input id="chat-q" name="q" defaultValue={q} className="field" placeholder="Search user" />
          </form>
          <p className="label px-4 pt-3 text-muted">{people.length} users</p>
          <ul className="flex-1 overflow-y-auto p-2">
            {people.map((u) => {
              const last = lastWith(u.id);
              return (
                <li key={u.id}>
                  <Link href={`/chat?with=${u.id}`} aria-current={other?.id === u.id ? "true" : undefined} className={`flex items-center gap-3 rounded-md border-2 px-2 py-2 ${other?.id === u.id ? "border-ink bg-accent text-[#0f1417]" : "border-transparent hover:border-ink/30"}`}>
                    <Initials name={u.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{u.name}</span>
                      <span className="block truncate text-xs opacity-70">{last ? last.text : u.email}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>
        <section className={`flex min-h-0 flex-col ${other ? "flex" : "hidden md:flex"}`}>
          {other ? (
            <>
              <AutoRefresh />
              <header className="flex items-center gap-3 border-b-[3px] border-ink px-4 py-3">
                <Link href="/chat" className="md:hidden" aria-label="Back to people">‹</Link>
                <Initials name={other.name} />
                <div><p className="font-medium">{other.name}</p><p className="text-xs text-muted">{other.title}</p></div>
              </header>
              <div className="grid-paper flex-1 space-y-2 overflow-y-auto p-4">
                {thread.length ? thread.map((m) => (
                  <div key={m.id} className={`flex ${m.fromId === viewer.id ? "justify-end" : ""}`}>
                    <p className={`max-w-[70%] rounded-md border-2 border-ink px-3 py-2 text-sm shadow-brutal-sm ${m.fromId === viewer.id ? "bg-primary text-white" : "bg-card"}`}>
                      {m.text}
                      <span className="mt-1 block text-right text-[10px] opacity-70">{new Date(m.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </p>
                  </div>
                )) : <Empty title={`Say hello to ${other.name.split(" ")[0]}`} hint="Messages appear here." />}
                <ScrollToEnd dep={thread.length} />
              </div>
              <ChatComposer toId={other.id} name={other.name} />
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div><p className="font-display text-2xl">Select a user to start chatting</p><p className="mt-1 text-muted">Pick someone from the list to open the conversation.</p></div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
