"use client";

import Link from "next/link";
import { useState } from "react";
import { adjustRating } from "@/app/(app)/calibration/actions";
import { ReasonDialog } from "./PipelineBoard";

export interface FlaggedCase {
  userId: number;
  name: string;
  manager: string;
  evidence: number;
  rating: number;
  expected: number;
  residual: number;
}

export function FlaggedQueue({ cases }: { cases: FlaggedCase[] }) {
  const [open, setOpen] = useState<FlaggedCase | null>(null);
  const [rating, setRating] = useState(3);
  if (!cases.length)
    return <p className="rounded-md border-[3px] border-dashed border-ink/40 p-6 text-center">No ratings disagree strongly with their evidence.</p>;
  return (
    <>
      <ul className="space-y-2">
        {cases.map((c) => (
          <li key={c.userId} className="flex flex-wrap items-center gap-4 rounded-md border-2 border-ink p-3">
            <span className="anim-pulse-ring inline-block size-3 rounded-full border border-ink bg-alert" aria-hidden />
            <div className="min-w-48 flex-1">
              <Link href={`/people/${c.userId}`} className="font-medium hover:underline">{c.name}</Link>
              <p className="text-sm text-muted">Rated by {c.manager}</p>
            </div>
            <dl className="grid grid-cols-3 gap-4 text-center font-mono tabular-nums">
              <div><dt className="label text-muted">Evidence</dt><dd>{c.evidence}</dd></div>
              <div><dt className="label text-muted">Rating</dt><dd>{c.rating}</dd></div>
              <div><dt className="label text-muted">Expected</dt><dd>{c.expected}</dd></div>
            </dl>
            <button className="btn btn-primary px-3 py-1.5" onClick={() => { setRating(Math.round(c.expected * 2) / 2); setOpen(c); }}>Review rating</button>
          </li>
        ))}
      </ul>
      {open && (
        <ReasonDialog
          title={`Adjust ${open.name}'s rating`}
          confirmLabel="Save rating and reason"
          onCancel={() => setOpen(null)}
          onConfirm={async (reason) => {
            const res = await adjustRating({ userId: open.userId, rating, reason });
            if (res.error) return res.error;
            setOpen(null);
            return null;
          }}
        >
          <label htmlFor="new-rating" className="label mb-1 block">New rating (now {open.rating}, evidence suggests {open.expected})</label>
          <input id="new-rating" type="number" min={1} max={5} step={0.5} value={rating} autoFocus onChange={(e) => setRating(Number(e.target.value))} className="field w-32 font-mono" />
          <p className="mt-2 text-xs text-muted">Keeping the original rating is fine. Write why in the reason either way.</p>
        </ReasonDialog>
      )}
    </>
  );
}
