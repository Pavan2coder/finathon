"use client";

import { useSubmit } from "@/lib/useSubmit";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormState } from "@/app/(app)/actions";
import { requestLeave } from "@/app/(app)/leaves/actions";
import { Modal } from "./Modal";

const TYPES = [["casual", "Casual"], ["sick", "Sick"], ["vacation", "Vacation"], ["wfh", "Work from home"]] as const;

function Form({ today, onDone }: { today: string; onDone: () => void }) {
  const [state, onSubmit, pending] = useSubmit<FormState>(requestLeave);
  useEffect(() => { if (state?.ok) { const t = setTimeout(onDone, 1200); return () => clearTimeout(t); } }, [state, onDone]);
  const err = state?.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="lv-type" className="label mb-1 block">Leave type</label>
        <select id="lv-type" name="type" defaultValue="casual" className="field">
          {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="lv-from" className="label mb-1 block">From</label>
          <input id="lv-from" name="from" type="date" min={today} defaultValue={today} className="field" aria-invalid={!!err.from} />
          {err.from && <p className="mt-1 text-sm text-alert-ink">{err.from}</p>}
        </div>
        <div>
          <label htmlFor="lv-to" className="label mb-1 block">To</label>
          <input id="lv-to" name="to" type="date" min={today} defaultValue={today} className="field" aria-invalid={!!err.to} />
          {err.to && <p className="mt-1 text-sm text-alert-ink">{err.to}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="lv-reason" className="label mb-1 block">Reason</label>
        <textarea id="lv-reason" name="reason" rows={3} className="field" placeholder="Briefly describe the reason…" aria-invalid={!!err.reason} />
        {err.reason && <p className="mt-1 text-sm text-alert-ink">{err.reason}</p>}
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Submitting…" : "Submit request"}</button>
      {state?.ok && <p role="status" className="rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm text-[#0f1417]">{state.ok}</p>}
    </form>
  );
}

export function RequestLeaveButton({ today }: { today: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus size={16} /> Request leave</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Request leave" description="Weekends are left out of the day count.">
        <Form today={today} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
