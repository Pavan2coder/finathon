"use client";

import { useSubmit } from "@/lib/useSubmit";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormState } from "@/app/(app)/actions";
import { createTask } from "@/app/(app)/workspace/actions";
import { Modal } from "./Modal";

type Person = { id: number; name: string };

function TaskForm({ people, selfId, defaultDue, lockDue, onDone }: { people: Person[]; selfId: number; defaultDue: string; lockDue?: boolean; onDone: () => void }) {
  const [state, onSubmit, pending] = useSubmit<FormState>(createTask);
  useEffect(() => { if (state?.ok) { const t = setTimeout(onDone, 900); return () => clearTimeout(t); } }, [state, onDone]);
  const err = state?.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor="t-title" className="label mb-1 block">Task title *</label>
        <input id="t-title" name="title" className="field" autoFocus aria-invalid={!!err.title} />
        {err.title && <p className="mt-1 text-sm text-alert-ink">{err.title}</p>}
      </div>
      <div>
        <label htmlFor="t-who" className="label mb-1 block">Assign to *</label>
        <select id="t-who" name="assigneeId" defaultValue={people.length ? "" : selfId} className="field" aria-invalid={!!err.assigneeId}>
          <option value="" disabled>Select a coworker…</option>
          <option value={selfId}>Me</option>
          {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {err.assigneeId && <p className="mt-1 text-sm text-alert-ink">{err.assigneeId}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="t-due" className="label mb-1 block">Due date *</label>
          <input id="t-due" name="due" type="date" defaultValue={defaultDue} readOnly={lockDue} className="field" />
          {err.due && <p className="mt-1 text-sm text-alert-ink">{err.due}</p>}
        </div>
        <div>
          <label htmlFor="t-pri" className="label mb-1 block">Priority</label>
          <select id="t-pri" name="priority" defaultValue="medium" className="field">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="t-kind" className="label mb-1 block">Type</label>
        <select id="t-kind" name="kind" defaultValue="task" className="field">
          <option value="task">Task</option>
          <option value="stretch">Stretch assignment (development)</option>
        </select>
      </div>
      <div>
        <label htmlFor="t-notes" className="label mb-1 block">Notes (optional)</label>
        <textarea id="t-notes" name="notes" rows={2} className="field" />
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Saving…" : "Save task"}</button>
      {state?.ok && <p role="status" className="rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm text-[#0f1417]">{state.ok}</p>}
    </form>
  );
}

export function TaskButton({ label, people, selfId, defaultDue, lockDue, variant = "primary" }: { label: string; people: Person[]; selfId: number; defaultDue: string; lockDue?: boolean; variant?: "primary" | "ghost" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={`btn ${variant === "primary" ? "btn-primary" : "btn-ghost"} ${variant === "primary" ? "w-full" : ""}`}><Plus size={16} /> {label}</button>
      <Modal open={open} onClose={() => setOpen(false)} title={label} description={`${people.length} coworkers available`}>
        <TaskForm people={people} selfId={selfId} defaultDue={defaultDue} lockDue={lockDue} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
