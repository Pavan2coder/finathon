"use client";

import { useSubmit } from "@/lib/useSubmit";
import { logEvidence, type FormState } from "@/app/(app)/actions";

export function LogEvidenceForm() {
  const [state, onSubmit, pending] = useSubmit<FormState>(logEvidence);
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <fieldset className="flex gap-2">
        <legend className="sr-only">What are you logging?</legend>
        {[["deliverable", "Deliverable"], ["impact", "Business impact"]].map(([v, l], i) => (
          <label key={v} className="flex-1 cursor-pointer">
            <input type="radio" name="kind" value={v} defaultChecked={i === 0} className="peer sr-only" />
            <span className="label block rounded-md border-[3px] border-ink px-3 py-2 text-center peer-checked:bg-accent peer-checked:text-[#0f1417] peer-focus-visible:outline-3 peer-focus-visible:outline-primary">{l}</span>
          </label>
        ))}
      </fieldset>
      <div>
        <label htmlFor="ev-title" className="label mb-1 block">What did you ship or change?</label>
        <input id="ev-title" name="title" className="field" placeholder="Shipped the billing retry flow" aria-invalid={!!state?.fieldErrors?.title} />
        {state?.fieldErrors?.title && <p className="mt-1 text-sm text-alert-ink">{state.fieldErrors.title}</p>}
      </div>
      <div>
        <label htmlFor="ev-detail" className="label mb-1 block">Link or detail (optional)</label>
        <textarea id="ev-detail" name="detail" rows={2} className="field" placeholder="PR #412, cut failed payments by 18%" />
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Logging…" : "Log evidence"}</button>
      {state?.ok && <p role="status" className="rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm text-[#0f1417]">{state.ok}</p>}
    </form>
  );
}
