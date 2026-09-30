"use client";

import { Download, FileUp, Plus, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { addPipelineNote, importPipeline, movePipelineStage } from "@/app/(app)/pipeline/actions";

export type Stage = "not_ready" | "developing" | "near_ready" | "ready" | "promoted";
export interface TimelineItem { at: string; kind: "note" | "activity" | "stage"; title: string; details: string; who: string }
export interface PipelineCard {
  id: number;
  name: string;
  email: string;
  title: string;
  readiness: number;
  unmet: string[];
  stage: Stage;
  managerId: number | null;
  managerName: string;
  timeline: TimelineItem[];
}

// apple-design: critically damped by default; a touch of bounce only once a flick has carried momentum.
const SETTLE = { type: "spring", bounce: 0, duration: 0.4 } as const;
const THROWN = { type: "spring", bounce: 0.2, duration: 0.4 } as const;
const SHEET = { type: "spring", bounce: 0.1, duration: 0.35 } as const;
/** Apple's momentum projection (decel 0.99 = snappier than scroll): where a flick would come to rest. */
const project = (v: number, rate = 0.99) => ((v / 1000) * rate) / (1 - rate);

export const STAGES: { key: Stage; label: string }[] = [
  { key: "not_ready", label: "Not ready" },
  { key: "developing", label: "Developing" },
  { key: "near_ready", label: "Near ready" },
  { key: "ready", label: "Ready" },
  { key: "promoted", label: "Promoted" },
];
const stageLabel = (s: Stage) => STAGES.find((x) => x.key === s)!.label;

function exportCsv(cards: PipelineCard[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = [["name", "email", "title", "manager", "stage", "readiness", "still_needed"], ...cards.map((c) => [c.name, c.email, c.title, c.managerName, c.stage, c.readiness, c.unmet.join("; ")])];
  const url = URL.createObjectURL(new Blob([rows.map((r) => r.map(esc).join(",")).join("\n")], { type: "text/csv" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "talent-pipeline.csv" });
  a.click();
  URL.revokeObjectURL(url);
}

export function PipelineBoard({ initial, managers }: { initial: PipelineCard[]; managers: { id: number; name: string }[] }) {
  const [cards, setCards] = useState(initial);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [pending, setPending] = useState<{ card: PipelineCard; to: Stage } | null>(null);
  const [over, setOver] = useState<Stage | null>(null);
  const [q, setQ] = useState("");
  const [stageF, setStageF] = useState<Stage | "">("");
  const [ownerF, setOwnerF] = useState<number | "">("");
  const [open, setOpen] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [nominating, setNominating] = useState(false);
  const [thrown, setThrown] = useState(false);
  const dragged = useRef(false);
  const cols = useRef(new Map<Stage, HTMLElement>());
  useEffect(() => { setCards(initial); }, [initial]);
  // column under a viewport x coordinate
  const columnAt = (x: number) => [...cols.current].find(([, el]) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right; })?.[0] ?? null;

  const shown = cards.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) && (!stageF || c.stage === stageF) && (!ownerF || c.managerId === ownerF));
  const request = (card: PipelineCard, to: Stage) => card.stage !== to && setPending({ card, to });
  const detail = cards.find((c) => c.id === open) ?? null;

  return (
    <>
      <div className="brutal mb-5 flex flex-wrap items-center gap-3 p-3">
        <label htmlFor="pq" className="sr-only">Search</label>
        <input id="pq" className="field max-w-xs flex-1" placeholder="Search name…" value={q} onChange={(e) => setQ(e.target.value)} />
        <label htmlFor="pstage" className="sr-only">Stage</label>
        <select id="pstage" value={stageF} onChange={(e) => setStageF(e.target.value as Stage | "")} className="field w-auto">
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        {managers.length > 1 && (
          <>
            <label htmlFor="powner" className="sr-only">Manager</label>
            <select id="powner" value={ownerF} onChange={(e) => setOwnerF(e.target.value ? Number(e.target.value) : "")} className="field w-auto">
              <option value="">All managers</option>
              {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </>
        )}
        <div className="flex" role="group" aria-label="View">
          {(["kanban", "table"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`label border-[3px] border-ink px-3 py-2 first:rounded-l-md last:rounded-r-md last:border-l-0 ${view === v ? "bg-ink text-bg" : "bg-card"}`}>
              {v === "kanban" ? "Kanban" : "Table"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={() => setImporting(true)} className="btn btn-ghost"><FileUp size={16} /> Import</button>
          <button onClick={() => exportCsv(shown)} className="btn btn-ghost"><Download size={16} /> Export</button>
          <button onClick={() => setNominating(true)} className="btn btn-primary"><Plus size={16} /> Nominate</button>
        </div>
      </div>

      {view === "kanban" ? (
        <LayoutGroup>
          <div className="-mx-4 overflow-x-auto px-4 pb-4">
            <div className="grid min-w-[1100px] grid-cols-5 gap-4">
              {STAGES.map((s) => {
                const col = shown.filter((c) => c.stage === s.key);
                return (
                  <section
                    key={s.key}
                    aria-label={s.label}
                    ref={(el) => { if (el) cols.current.set(s.key, el); }}
                    className={`flex flex-col rounded-md border-[3px] border-ink transition-colors ${over === s.key ? "bg-accent/30" : "bg-card"}`}
                  >
                    <header className={`flex items-center justify-between border-b-[3px] border-ink px-3 py-2.5 ${s.key === "ready" ? "bg-accent text-[#0f1417]" : s.key === "promoted" ? "bg-primary text-white" : ""}`}>
                      <h2 className="font-medium">{s.label}</h2>
                      <span className="label rounded border-2 border-current px-1.5">{col.length}</span>
                    </header>
                    <div className="flex min-h-40 flex-1 flex-col gap-2.5 p-2.5">
                      {col.map((c) => (
                        <motion.div
                          key={c.id}
                          layout
                          layoutId={`card-${c.id}`}
                          transition={thrown ? THROWN : SETTLE}
                          // 1:1 pointer drag that keeps the grab offset; springs home from wherever it is if not dropped on a new column
                          drag
                          dragSnapToOrigin
                          dragMomentum={false}
                          dragTransition={{ bounceStiffness: 500, bounceDamping: 40 }}
                          whileDrag={{ scale: 1.03, rotate: 1.5, zIndex: 50, cursor: "grabbing" }}
                          onPointerDownCapture={() => (dragged.current = false)}
                          onDragStart={() => { setThrown(false); dragged.current = true; }}
                          onClickCapture={(e) => { if (dragged.current) { e.preventDefault(); e.stopPropagation(); dragged.current = false; } }}
                          onDrag={(_, info) => setOver(columnAt(info.point.x - window.scrollX + project(info.velocity.x, 0.9)))}
                          onDragEnd={(_, info) => {
                            setOver(null);
                            // decide from where the flick is heading, not where the pointer let go
                            const target = columnAt(info.point.x - window.scrollX + project(info.velocity.x));
                            setThrown(Math.abs(info.velocity.x) > 400);
                            if (target) request(c, target);
                          }}
                          className="relative touch-none"
                        >
                          <article className="cursor-grab rounded-md border-2 border-ink bg-card p-3 shadow-brutal-sm select-none" onClick={() => setOpen(c.id)}>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted">{c.title}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-2 flex-1 rounded-sm border border-ink bg-bg">
                                <div className="h-full bg-primary" style={{ width: `${c.readiness}%` }} />
                              </div>
                              <span className="font-mono text-xs tabular-nums">{c.readiness}%</span>
                            </div>
                            {c.unmet[0] && <p className="mt-2 line-clamp-2 text-xs text-muted">Needs: {c.unmet[0]}</p>}
                            <label className="sr-only" htmlFor={`mv${c.id}`}>Move {c.name} to</label>
                            <select id={`mv${c.id}`} value={c.stage} onClick={(e) => e.stopPropagation()} onPointerDownCapture={(e) => e.stopPropagation()} onChange={(e) => request(c, e.target.value as Stage)} className="label mt-2 w-full rounded border-2 border-ink bg-card px-1.5 py-1 text-[10px]">
                              {STAGES.map((x) => <option key={x.key} value={x.key}>Move to: {x.label}</option>)}
                            </select>
                          </article>
                        </motion.div>
                      ))}
                      {!col.length && <p className="rounded-md border-2 border-dashed border-ink/30 p-4 text-center text-sm text-muted">Drop people here</p>}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </LayoutGroup>
      ) : (
        <div className="brutal overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="label border-b-[3px] border-ink text-left"><th className="px-4 py-3 font-normal">Person</th><th className="px-4 font-normal">Manager</th><th className="px-4 font-normal">Stage</th><th className="px-4 font-normal">Readiness</th><th className="px-4 font-normal">Still needed</th></tr></thead>
            <tbody>
              {[...shown].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                <tr key={c.id} className="cursor-pointer border-b-2 border-ink/10 last:border-0 hover:bg-bg" onClick={() => setOpen(c.id)}>
                  <td className="px-4 py-2.5"><p className="font-medium">{c.name}</p><p className="text-xs text-muted">{c.title}</p></td>
                  <td className="px-4">{c.managerName}</td>
                  <td className="px-4">{stageLabel(c.stage)}</td>
                  <td className="px-4 font-mono">{c.readiness}%</td>
                  <td className="px-4 text-muted">{c.unmet[0] ?? "Nothing — every criterion met"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>{detail && <DetailDrawer key={detail.id} card={detail} onClose={() => setOpen(null)} onMove={(to) => request(detail, to)} onNote={(item) => setCards((cs) => cs.map((c) => (c.id === detail.id ? { ...c, timeline: [item, ...c.timeline] } : c)))} />}</AnimatePresence>

      {pending && (
        <ReasonDialog
          title={`Move ${pending.card.name} to ${stageLabel(pending.to)}?`}
          onCancel={() => setPending(null)}
          onConfirm={async (reason) => {
            const res = await movePipelineStage({ userId: pending.card.id, stage: pending.to, reason });
            if (res.error) return res.error;
            const item: TimelineItem = { at: new Date().toISOString(), kind: "stage", title: `${stageLabel(pending.card.stage)} → ${stageLabel(pending.to)}`, details: reason, who: "You" };
            setCards((cs) => cs.map((c) => (c.id === pending.card.id ? { ...c, stage: pending.to, timeline: [item, ...c.timeline] } : c)));
            setPending(null);
            return null;
          }}
        />
      )}

      {nominating && (
        <ReasonDialog
          title="Nominate for promotion"
          confirmLabel="Nominate and log reason"
          onCancel={() => setNominating(false)}
          onConfirm={async (reason) => {
            const sel = document.getElementById("nom-who") as HTMLSelectElement | null;
            const card = cards.find((c) => c.id === Number(sel?.value));
            if (!card) return "Pick who you're nominating.";
            const res = await movePipelineStage({ userId: card.id, stage: "ready", reason });
            if (res.error) return res.error;
            setCards((cs) => cs.map((c) => (c.id === card.id ? { ...c, stage: "ready", timeline: [{ at: new Date().toISOString(), kind: "stage", title: `${stageLabel(c.stage)} → Ready (nominated)`, details: reason, who: "You" }, ...c.timeline] } : c)));
            setNominating(false);
            return null;
          }}
        >
          <label htmlFor="nom-who" className="label mb-1 block">Person</label>
          <select id="nom-who" className="field" defaultValue="">
            <option value="" disabled>Select a person…</option>
            {cards.filter((c) => c.stage !== "ready" && c.stage !== "promoted").sort((a, b) => a.name.localeCompare(b.name)).map((c) => <option key={c.id} value={c.id}>{c.name} — {c.readiness}% of criteria</option>)}
          </select>
          <p className="mt-2 text-xs text-muted">Moves them to Ready. Their unmet criteria stay visible to the committee.</p>
        </ReasonDialog>
      )}

      {importing && <ImportDialog onClose={() => setImporting(false)} />}
    </>
  );
}

function DetailDrawer({ card, onClose, onMove, onNote }: { card: PipelineCard; onClose: () => void; onMove: (to: Stage) => void; onNote: (i: TimelineItem) => void }) {
  const reduce = useReducedMotion();
  const [kind, setKind] = useState<"note" | "activity">("note");
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${card.name} details`}>
      <motion.button aria-label="Close" className="absolute inset-0 bg-[#0f1417]/50" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      {/* enters from the right and leaves to the right (apple-design §7) */}
      <motion.aside
        className="absolute inset-y-0 right-0 flex w-[min(460px,100vw)] flex-col overflow-y-auto border-l-[3px] border-ink bg-card"
        initial={{ x: reduce ? 0 : "100%", opacity: reduce ? 0 : 1 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: reduce ? 0 : "100%", opacity: reduce ? 0 : 1 }}
        transition={SHEET}
      >
        <header className="flex items-start gap-3 border-b-[3px] border-ink p-5">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-3xl leading-tight">{card.name}</h2>
            <p className="text-sm text-muted">{card.title} · reports to {card.managerName}</p>
            <p className="mt-1 text-sm">{card.email}</p>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-bg" aria-label="Close"><X size={18} /></button>
        </header>
        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="dr-stage" className="label">Stage</label>
            <select id="dr-stage" value={card.stage} onChange={(e) => onMove(e.target.value as Stage)} className="field w-auto">
              {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
            <Link href={`/people/${card.id}`} className="ml-auto text-sm underline underline-offset-4">Open evidence profile</Link>
          </div>
          <div>
            <p className="label mb-1 text-muted">Readiness · {card.readiness}% of criteria met</p>
            <div className="h-3 rounded-sm border-2 border-ink bg-bg"><div className="h-full bg-primary" style={{ width: `${card.readiness}%` }} /></div>
            {card.unmet.length > 0 && <ul className="mt-2 space-y-1 text-sm">{card.unmet.map((u) => <li key={u} className="flex gap-2"><span className="mt-1.5 inline-block size-2 shrink-0 border border-ink" />{u}</li>)}</ul>}
          </div>
          <form
            className="space-y-2 rounded-md border-2 border-ink p-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget;
              const fd = new FormData(f);
              const title = String(fd.get("title") ?? ""), details = String(fd.get("details") ?? "");
              start(async () => {
                const res = await addPipelineNote({ subjectId: card.id, kind, title, details });
                if (res.error) return setError(res.error);
                setError(null);
                f.reset();
                onNote({ at: new Date().toISOString(), kind, title, details, who: "You" });
              });
            }}
          >
            <div className="flex gap-2" role="group" aria-label="Entry type">
              {(["note", "activity"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setKind(k)} aria-pressed={kind === k} className={`label rounded border-2 border-ink px-2 py-1 ${kind === k ? "bg-accent text-[#0f1417]" : ""}`}>{k === "note" ? "Note" : "Log activity"}</button>
              ))}
            </div>
            <label htmlFor="dr-title" className="sr-only">Title</label>
            <input id="dr-title" name="title" className="field" placeholder={kind === "note" ? "Note title" : "1:1, design review, nomination…"} aria-invalid={!!error} />
            <label htmlFor="dr-details" className="sr-only">Details</label>
            <textarea id="dr-details" name="details" rows={2} className="field" placeholder="Details (optional)" />
            {error && <p className="text-sm text-alert-ink">{error}</p>}
            <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Saving…" : "Add"}</button>
          </form>
          <div>
            <p className="label mb-2 text-muted">Activity timeline</p>
            {card.timeline.length ? (
              <ol className="relative space-y-3 border-l-[3px] border-ink pl-5">
                {card.timeline.map((t, i) => (
                  <li key={i} className="relative">
                    <span aria-hidden className={`absolute top-1.5 -left-[27px] size-3 rounded-sm border-2 border-ink ${t.kind === "stage" ? "bg-primary" : t.kind === "activity" ? "bg-accent" : "bg-card"}`} />
                    <p className="text-sm font-medium">{t.title}</p>
                    {t.details && <p className="text-sm text-muted">{t.details}</p>}
                    <p className="font-mono text-[11px] text-muted">{t.who} · {new Date(t.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">Nothing logged yet.</p>
            )}
          </div>
        </div>
      </motion.aside>
    </div>
  );
}

function ImportDialog({ onClose }: { onClose: () => void }) {
  const [result, setResult] = useState<{ moved?: number; errors?: string[] } | null>(null);
  const [busy, start] = useTransition();
  return (
    <ReasonlessDialog title="Import pipeline" onClose={onClose}>
      <p className="text-sm text-muted">Upload a CSV with the columns <span className="font-mono">email, stage</span> and optionally <span className="font-mono">reason</span>. Stages: not_ready, developing, near_ready, ready, promoted. If any row is wrong, nothing moves.</p>
      <input
        type="file"
        accept=".csv,text/csv"
        aria-label="CSV file"
        className="field mt-3"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          start(async () => setResult(await importPipeline(await file.text())));
        }}
      />
      {busy && <p className="mt-2 text-sm">Checking rows…</p>}
      {result?.moved !== undefined && <p role="status" className="mt-3 rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm text-[#0f1417]">Moved {result.moved} people. Reload to see the board update.</p>}
      {result?.errors && <ul role="alert" className="mt-3 space-y-1 text-sm text-alert-ink">{result.errors.map((e) => <li key={e}>{e}</li>)}</ul>}
    </ReasonlessDialog>
  );
}

function ReasonlessDialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} onClose={onClose} className="brutal m-auto w-[min(520px,calc(100vw-2rem))] p-5 text-ink backdrop:bg-[#0f1417]/60">
      <div className="mb-3 flex items-start justify-between"><h2 className="font-display text-2xl">{title}</h2><button onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      {children}
    </dialog>
  );
}

/** Modal that requires a written reason. Returns an error string from onConfirm to keep it open. */
export function ReasonDialog({ title, onCancel, onConfirm, confirmLabel = "Move and log reason", children }: { title: string; onCancel: () => void; onConfirm: (reason: string) => Promise<string | null>; confirmLabel?: string; children?: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} onClose={onCancel} className="brutal m-auto w-[min(520px,calc(100vw-2rem))] p-0 text-ink backdrop:bg-[#0f1417]/60">
      <form
        className="p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const reason = String(new FormData(e.currentTarget).get("reason") ?? "");
          start(async () => setError(await onConfirm(reason)));
        }}
      >
        <h2 className="font-display text-2xl">{title}</h2>
        {children && <div className="mt-4">{children}</div>}
        <label htmlFor="reason" className="label mt-4 mb-1 block">Reason (saved to the audit trail)</label>
        <textarea id="reason" name="reason" rows={3} autoFocus={!children} className="field" aria-invalid={!!error} aria-describedby={error ? "reason-err" : undefined} placeholder="Two cycles above the bar; led the payments migration." />
        {error && <p id="reason-err" className="mt-1 text-sm text-alert-ink">{error}</p>}
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : confirmLabel}</button>
        </div>
      </form>
    </dialog>
  );
}
