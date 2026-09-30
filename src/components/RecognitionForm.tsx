"use client";

import { useSubmit } from "@/lib/useSubmit";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormState } from "@/app/(app)/actions";
import { createPost } from "@/app/(app)/recognition/actions";
import { Modal } from "./Modal";

type Person = { id: number; name: string; skills: string[] };

function Form({ people, onDone }: { people: Person[]; onDone: () => void }) {
  const [state, onSubmit, pending] = useSubmit<FormState>(createPost);
  const [to, setTo] = useState<number | "">("");
  const [intent, setIntent] = useState<"publish" | "schedule">("publish");
  useEffect(() => { if (state?.ok) { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); } }, [state, onDone]);
  const err = state?.fieldErrors ?? {};
  const skills = people.find((p) => p.id === to)?.skills ?? [];
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="rc-to" className="label mb-1 block">Recognise *</label>
        <select id="rc-to" name="recipientId" value={to} onChange={(e) => setTo(Number(e.target.value))} className="field" aria-invalid={!!err.recipientId}>
          <option value="" disabled>Select a coworker…</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {err.recipientId && <p className="mt-1 text-sm text-alert-ink">{err.recipientId}</p>}
      </div>
      <fieldset>
        <legend className="label mb-1">Skill they showed *</legend>
        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <label key={s} className="cursor-pointer">
                <input type="radio" name="skill" value={s} defaultChecked={i === 0} className="peer sr-only" />
                <span className="label block rounded-md border-2 border-ink px-2.5 py-1 peer-checked:bg-accent peer-checked:text-[#0f1417] peer-focus-visible:outline-3 peer-focus-visible:outline-primary">{s}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Pick a coworker to see their skills.</p>
        )}
        {err.skill && <p className="mt-1 text-sm text-alert-ink">{err.skill}</p>}
      </fieldset>
      <div>
        <label htmlFor="rc-content" className="label mb-1 block">What did they do? *</label>
        <textarea id="rc-content" name="content" rows={4} className="field" placeholder="Unblocked the release by fixing the flaky pipeline overnight." aria-invalid={!!err.content} />
        {err.content && <p className="mt-1 text-sm text-alert-ink">{err.content}</p>}
      </div>
      {intent === "schedule" && (
        <div>
          <label htmlFor="rc-when" className="label mb-1 block">Publish at</label>
          <input id="rc-when" name="scheduledAt" type="datetime-local" className="field" aria-invalid={!!err.scheduledAt} />
          {err.scheduledAt && <p className="mt-1 text-sm text-alert-ink">{err.scheduledAt}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        <button name="intent" value="publish" className="btn btn-primary flex-1" disabled={pending}>Publish now</button>
        {intent === "schedule" ? (
          <button name="intent" value="schedule" className="btn btn-accent" disabled={pending}>Schedule</button>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setIntent("schedule")}>Schedule…</button>
        )}
        <button name="intent" value="draft" className="btn btn-ghost" disabled={pending}>Save draft</button>
      </div>
      <p className="text-xs text-muted">Published recognition counts as peer feedback on their profile.</p>
      {state?.ok && <p role="status" className="rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm text-[#0f1417]">{state.ok}</p>}
    </form>
  );
}

export function NewRecognitionButton({ people }: { people: Person[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus size={16} /> New recognition</button>
      <Modal open={open} onClose={() => setOpen(false)} title="New recognition" description="Thank someone for specific work. Name the skill so it lands on their profile.">
        <Form people={people} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
