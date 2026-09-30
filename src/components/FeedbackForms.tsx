"use client";

import { useSubmit } from "@/lib/useSubmit";
import type { FormState } from "@/app/(app)/actions";
import { createFeedbackRequest, respondToFeedback } from "@/app/(app)/feedback/actions";

export function RespondForm({ id, name, skills }: { id: number; name: string; skills: string[] }) {
  const [state, onSubmit, pending] = useSubmit<FormState>(respondToFeedback);
  if (state?.ok) return <p role="status" className="rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm text-[#0f1417]">{state.ok}</p>;
  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr]">
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor={`s${id}`} className="label mb-1 block">Score</label>
        <select id={`s${id}`} name="score" defaultValue="4" className="field w-24">
          {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`k${id}`} className="label mb-1 block">Skill this is about</label>
        <select id={`k${id}`} name="skill" className="field" aria-invalid={!!state?.fieldErrors?.skill}>
          {skills.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`t${id}`} className="label mb-1 block">One specific example</label>
        <textarea id={`t${id}`} name="text" rows={2} className="field" placeholder={`What did ${name.split(" ")[0]} do, and what changed because of it?`} aria-invalid={!!state?.fieldErrors?.text} />
        {state?.fieldErrors?.text && <p className="mt-1 text-sm text-alert-ink">{state.fieldErrors.text}</p>}
      </div>
      {state?.error && <p className="text-sm text-alert-ink sm:col-span-2">{state.error}</p>}
      <button className="btn btn-primary sm:col-span-2" disabled={pending}>{pending ? "Saving…" : "Send feedback"}</button>
    </form>
  );
}

export function NewRequestForm({ team }: { team: { id: number; name: string }[] }) {
  const [state, onSubmit, pending] = useSubmit<FormState>(createFeedbackRequest);
  return (
    <form onSubmit={onSubmit} className="brutal mb-6 flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-48 flex-1">
        <label htmlFor="subj" className="label mb-1 block">Feedback about</label>
        <select id="subj" name="subjectId" className="field">{team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      </div>
      <div className="min-w-48 flex-1">
        <label htmlFor="rev" className="label mb-1 block">Ask</label>
        <select id="rev" name="reviewerId" defaultValue={team[1]?.id} className="field">{team.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      </div>
      <button className="btn btn-primary" disabled={pending}>Send request</button>
      {(state?.ok || state?.error) && <p role="status" className={`w-full text-sm ${state.error ? "text-alert-ink" : ""}`}>{state.ok ?? state.error}</p>}
    </form>
  );
}
