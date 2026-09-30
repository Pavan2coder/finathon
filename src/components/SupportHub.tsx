"use client";

import { useSubmit } from "@/lib/useSubmit";
import { BookOpen, LifeBuoy, SendHorizontal, Ticket } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import type { FormState } from "@/app/(app)/actions";
import { askSupport, createTicket } from "@/app/(app)/support/actions";
import { Modal } from "./Modal";

type Msg = { from: "you" | "agent"; text: string; suggest?: string[]; at: string };
const time = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

function TicketForm({ onDone }: { onDone: () => void }) {
  const [state, onSubmit, pending] = useSubmit<FormState>(createTicket);
  useEffect(() => { if (state?.ok) { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); } }, [state, onDone]);
  const err = state?.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="tk-subject" className="label mb-1 block">Subject</label>
        <input id="tk-subject" name="subject" className="field" aria-invalid={!!err.subject} />
        {err.subject && <p className="mt-1 text-sm text-alert-ink">{err.subject}</p>}
      </div>
      <div>
        <label htmlFor="tk-body" className="label mb-1 block">What's going on?</label>
        <textarea id="tk-body" name="body" rows={4} className="field" aria-invalid={!!err.body} />
        {err.body && <p className="mt-1 text-sm text-alert-ink">{err.body}</p>}
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Raising…" : "Raise ticket"}</button>
      {state?.ok && <p role="status" className="rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm text-[#0f1417]">{state.ok}</p>}
    </form>
  );
}

export function SupportHub({ name, faq }: { name: string; faq: { q: string; a: string }[] }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, start] = useTransition();
  const [ticket, setTicket] = useState(false);
  const [kb, setKb] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { setMsgs([{ from: "agent", text: `Hello ${name.split(" ")[0]}! I'm the EvalSense help agent. Ask how something works, or use the quick actions.`, at: time() }]); }, [name]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "you", text, at: time() }]);
    setQ("");
    start(async () => {
      const r = await askSupport(text);
      setMsgs((m) => [...m, { from: "agent", text: r.text, suggest: r.suggest, at: time() }]);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="brutal flex h-[min(70vh,680px)] flex-col p-0">
        <header className="flex items-center gap-3 border-b-[3px] border-ink px-4 py-3">
          <LifeBuoy size={18} className="text-primary" />
          <p className="flex-1 font-medium">Help agent</p>
          <span className="flex items-center gap-2 text-xs"><span className="relative flex size-2"><span className="anim-ping absolute inline-flex size-full rounded-full bg-accent" /><span className="relative size-2 rounded-full border border-ink bg-accent" /></span>Online</span>
        </header>
        <div className="grid-paper flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "you" ? "justify-end" : ""}`}>
              <div className={`max-w-[80%] rounded-md border-2 border-ink px-3 py-2 shadow-brutal-sm ${m.from === "you" ? "bg-primary text-white" : "bg-card"}`}>
                <p>{m.text}</p>
                {m.suggest && (
                  <div className="mt-2 flex flex-col gap-1">
                    {m.suggest.map((s) => <button key={s} onClick={() => ask(s)} className="rounded border-2 border-ink px-2 py-1 text-left text-sm hover:bg-accent hover:text-[#0f1417]">{s}</button>)}
                  </div>
                )}
                <p className="mt-1 text-right text-[10px] opacity-60">{m.at}</p>
              </div>
            </div>
          ))}
          {busy && <div className="skeleton h-10 w-48 rounded-md" aria-label="Typing" />}
          <div ref={end} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex gap-2 border-t-[3px] border-ink p-3">
          <label htmlFor="sup-q" className="sr-only">Ask a question</label>
          <input id="sup-q" value={q} onChange={(e) => setQ(e.target.value)} className="field" placeholder="How do I request leave?" />
          <button className="btn btn-primary px-3" disabled={busy || !q.trim()} aria-label="Send"><SendHorizontal size={16} /></button>
        </form>
      </section>

      <aside className="space-y-4">
        <p className="label text-muted">Quick actions</p>
        {[
          { icon: SendHorizontal, title: "How is my score calculated?", sub: "Weights and sources", onClick: () => ask("How is my evidence score calculated?") },
          { icon: Ticket, title: "Create a ticket", sub: "Get help from HR", onClick: () => setTicket(true) },
          { icon: BookOpen, title: "Knowledge base", sub: "Every help article", onClick: () => setKb(true) },
        ].map((a) => (
          <button key={a.title} onClick={a.onClick} className="brutal brutal-lift flex w-full items-center gap-3 p-4 text-left">
            <span className="grid size-10 place-items-center rounded-md border-2 border-ink bg-accent text-[#0f1417]"><a.icon size={18} /></span>
            <span><span className="block font-medium">{a.title}</span><span className="block text-sm text-muted">{a.sub}</span></span>
          </button>
        ))}
        <div className="brutal p-4 text-sm">
          <p className="font-medium">How it works</p>
          <p className="mt-1 text-muted">The help agent answers from EvalSense's own help articles, so answers match how the app actually works. Anything it can't answer becomes a ticket for HR.</p>
        </div>
      </aside>

      <Modal open={ticket} onClose={() => setTicket(false)} title="Create a ticket" description="HR sees every ticket and replies by email.">
        <TicketForm onDone={() => setTicket(false)} />
      </Modal>
      <Modal open={kb} onClose={() => setKb(false)} title="Knowledge base" width={640}>
        <div className="space-y-2">
          {faq.map((f) => (
            <details key={f.q} className="rounded-md border-2 border-ink p-3 open:bg-bg">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm">{f.a}</p>
            </details>
          ))}
        </div>
      </Modal>
    </div>
  );
}
