"use client";

import { SendHorizontal } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { ask, type Answer, type Intent } from "@/app/(app)/assistant/actions";

type Msg = { from: "you" | "assistant"; text: string[]; cites?: Answer["cites"] };

export function Assistant({ quick, people, greeting }: { quick: { intent: Intent; label: string }[]; people: { id: number; name: string }[]; greeting: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "assistant", text: [greeting] }]);
  const [person, setPerson] = useState(people[0]?.id);
  const [q, setQ] = useState("");
  const [busy, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs]);

  const send = (label: string, payload: { intent?: Intent; question?: string }) => {
    setMsgs((m) => [...m, { from: "you", text: [label] }]);
    start(async () => {
      const a = await ask({ ...payload, personId: person });
      setMsgs((m) => [...m, { from: "assistant", text: a.text, cites: a.cites }]);
    });
  };

  return (
    <div className="brutal flex h-[min(72vh,760px)] flex-col p-0">
      <div className="flex items-center gap-3 border-b-[3px] border-ink px-4 py-3">
        <span className="relative flex size-2.5"><span className="anim-ping absolute inline-flex size-full rounded-full bg-accent" /><span className="relative inline-flex size-2.5 rounded-full border border-ink bg-accent" /></span>
        <p className="flex-1 font-medium">Evidence assistant</p>
        {people.length > 0 && (
          <>
            <label htmlFor="asst-person" className="label text-muted">About</label>
            <select id="asst-person" value={person} onChange={(e) => setPerson(Number(e.target.value))} className="field w-48 py-1">
              {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </>
        )}
      </div>
      <div className="grid-paper flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === "you" ? "justify-end" : ""}`}>
            <div className={`max-w-[80ch] rounded-md border-2 border-ink px-4 py-3 shadow-brutal-sm ${m.from === "you" ? "bg-primary text-white" : "bg-card"}`}>
              {m.text.map((t, j) => <p key={j} className={j ? "mt-1" : ""}>{t}</p>)}
              {m.cites && m.cites.length > 0 && (
                <div className="mt-3 border-t-2 border-ink/15 pt-2">
                  <p className="label mb-1 text-muted">Evidence cited</p>
                  <ul className="space-y-1">
                    {m.cites.map((c) => (
                      <li key={c.ref} className="text-sm"><span className="font-mono text-xs text-muted">{c.ref}</span> {c.kind}: {c.title} — {c.detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="skeleton h-12 w-64 rounded-md border-2 border-ink/20" aria-label="Thinking" />}
        <div ref={end} />
      </div>
      <div className="border-t-[3px] border-ink p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {quick.map((x) => (
            <button key={x.intent} onClick={() => send(x.label, { intent: x.intent })} disabled={busy} className="label rounded-md border-2 border-ink bg-card px-3 py-1.5 hover:bg-accent hover:text-[#0f1417] disabled:opacity-50">{x.label}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) { send(q, { question: q }); setQ(""); } }} className="flex gap-2">
          <label htmlFor="asst-q" className="sr-only">Ask a question</label>
          <input id="asst-q" value={q} onChange={(e) => setQ(e.target.value)} className="field" placeholder="Why was this rating flagged?" />
          <button className="btn btn-primary px-3" disabled={busy || !q.trim()} aria-label="Send"><SendHorizontal size={16} /></button>
        </form>
      </div>
    </div>
  );
}
