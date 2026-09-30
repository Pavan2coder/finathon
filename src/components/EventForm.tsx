"use client";

import { useSubmit } from "@/lib/useSubmit";
import type { FormState } from "@/app/(app)/actions";
import { createEvent } from "@/app/(app)/calendar/actions";

export function EventForm({ defaultDate }: { defaultDate: string }) {
  const [state, onSubmit, pending] = useSubmit<FormState>(createEvent);
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="ev-name" className="label mb-1 block">Event</label>
        <input id="ev-name" name="title" className="field" placeholder="Sales calibration" aria-invalid={!!state?.fieldErrors?.title} />
        {state?.fieldErrors?.title && <p className="mt-1 text-sm text-alert-ink">{state.fieldErrors.title}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ev-date" className="label mb-1 block">Date</label>
          <input id="ev-date" name="date" type="date" defaultValue={defaultDate} className="field" />
        </div>
        <div>
          <label htmlFor="ev-kind" className="label mb-1 block">Type</label>
          <select id="ev-kind" name="kind" className="field">
            <option value="deadline">Deadline</option>
            <option value="calibration">Calibration</option>
            <option value="holiday">Holiday</option>
          </select>
        </div>
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>Add event</button>
      {state?.ok && <p role="status" className="rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm text-[#0f1417]">{state.ok}</p>}
    </form>
  );
}
