"use client";

import { useSubmit } from "@/lib/useSubmit";
import { SendHorizontal, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormState } from "@/app/(app)/actions";
import { sendEmail, sendMessage } from "@/app/(app)/messages/actions";

/** Re-fetches server data on an interval while the tab is visible, so chats and inboxes pick up new messages. */
export function AutoRefresh({ ms = 5000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, ms);
    return () => clearInterval(t);
  }, [router, ms]);
  return null;
}

export function ChatComposer({ toId, name }: { toId: number; name: string }) {
  const [state, onSubmit, pending] = useSubmit<FormState>(sendMessage);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) form.current?.reset(); }, [state]);
  return (
    <form ref={form} onSubmit={onSubmit} className="flex gap-2 border-t-[3px] border-ink p-3">
      <input type="hidden" name="toId" value={toId} />
      <label htmlFor="chat-msg" className="sr-only">Message {name}</label>
      <input id="chat-msg" name="text" autoComplete="off" className="field" placeholder={`Message ${name.split(" ")[0]}`} />
      <button className="btn btn-primary px-3" disabled={pending} aria-label="Send"><SendHorizontal size={16} /></button>
      {state?.error && <p role="alert" className="sr-only">{state.error}</p>}
    </form>
  );
}

export function ScrollToEnd({ dep }: { dep: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ block: "end" }); }, [dep]);
  return <div ref={ref} />;
}

type Person = { id: number; name: string; email: string };

/** Searchable multi-select that renders chosen people as removable chips and posts a comma list. */
function PeopleField({ name, label, people, initial = [], error }: { name: string; label: string; people: Person[]; initial?: number[]; error?: string }) {
  const [chosen, setChosen] = useState<number[]>(initial);
  const [q, setQ] = useState("");
  const matches = q ? people.filter((p) => !chosen.includes(p.id) && (p.name + p.email).toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  const id = `pf-${name}`;
  return (
    <div>
      <label htmlFor={id} className="label mb-1 block">{label}</label>
      <input type="hidden" name={name} value={chosen.join(",")} />
      <div className="field flex flex-wrap items-center gap-1.5 py-1.5">
        {chosen.map((c) => {
          const p = people.find((x) => x.id === c)!;
          return (
            <span key={c} className="flex items-center gap-1 rounded border-2 border-ink bg-accent px-1.5 text-sm text-[#0f1417]">
              {p.name}
              <button type="button" onClick={() => setChosen(chosen.filter((x) => x !== c))} aria-label={`Remove ${p.name}`}><X size={12} /></button>
            </span>
          );
        })}
        <input
          id={id}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && matches[0]) { e.preventDefault(); setChosen([...chosen, matches[0].id]); setQ(""); } }}
          className="min-w-32 flex-1 bg-transparent outline-none"
          placeholder={chosen.length ? "" : "Search users"}
          aria-invalid={!!error}
          autoComplete="off"
        />
      </div>
      {matches.length > 0 && (
        <ul className="mt-1 rounded-md border-2 border-ink bg-card shadow-brutal-sm" role="listbox">
          {matches.map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => { setChosen([...chosen, m.id]); setQ(""); }} className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent hover:text-[#0f1417]">
                {m.name} <span className="text-muted">{m.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-sm text-alert-ink">{error}</p>}
    </div>
  );
}

export function EmailComposer({ people, threadId, subject, to }: { people: Person[]; threadId?: number; subject?: string; to?: number[] }) {
  const [state, onSubmit, pending] = useSubmit<FormState>(sendEmail);
  const [showCc, setShowCc] = useState(false);
  const err = state?.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {threadId && <input type="hidden" name="threadId" value={threadId} />}
      <PeopleField name="to" label="To" people={people} initial={to} error={err.to} />
      {showCc ? (
        <>
          <PeopleField name="cc" label="CC" people={people} />
          <PeopleField name="tags" label="Tag users (they get a copy and a mention)" people={people} />
        </>
      ) : (
        <button type="button" onClick={() => setShowCc(true)} className="text-sm underline underline-offset-4">Add CC or tag users</button>
      )}
      <div>
        <label htmlFor="em-subject" className="label mb-1 block">Subject</label>
        <input id="em-subject" name="subject" defaultValue={subject} className="field" aria-invalid={!!err.subject} />
        {err.subject && <p className="mt-1 text-sm text-alert-ink">{err.subject}</p>}
      </div>
      <div>
        <label htmlFor="em-body" className="label mb-1 block">Message</label>
        <textarea id="em-body" name="body" rows={threadId ? 4 : 8} className="field" placeholder="Write your email…" aria-invalid={!!err.body} />
        {err.body && <p className="mt-1 text-sm text-alert-ink">{err.body}</p>}
      </div>
      <button className="btn btn-primary" disabled={pending}><SendHorizontal size={16} /> {pending ? "Sending…" : threadId ? "Send reply" : "Send email"}</button>
      {state?.ok && <p role="status" className="rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm text-[#0f1417]">{state.ok}</p>}
    </form>
  );
}
