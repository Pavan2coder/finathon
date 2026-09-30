"use client";

import { useSubmit } from "@/lib/useSubmit";
import { FileUp } from "lucide-react";
import { useState } from "react";
import { importCsv } from "@/app/(app)/import/actions";
import { IMPORT_TYPES, type ImportResult, type ImportType } from "@/app/(app)/import/schemas";

export function ImportForm() {
  const [state, onSubmit, pending] = useSubmit<ImportResult>(importCsv);
  const [type, setType] = useState<ImportType>("goals");
  const [fileName, setFileName] = useState("");
  const sample = IMPORT_TYPES[type].sample;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <form onSubmit={onSubmit} className="brutal space-y-4 p-5">
        <div>
          <label htmlFor="type" className="label mb-1 block">Evidence type</label>
          <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as ImportType)} className="field">
            {(Object.keys(IMPORT_TYPES) as ImportType[]).map((k) => <option key={k} value={k}>{IMPORT_TYPES[k].label}</option>)}
          </select>
        </div>
        <label htmlFor="file" className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-[3px] border-dashed border-ink p-8 text-center hover:bg-bg">
          <FileUp aria-hidden />
          <span className="font-medium">{fileName || "Choose a CSV file"}</span>
          <span className="text-sm text-muted">Up to 1 MB. First row must be the header.</span>
          <input id="file" name="file" type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
        </label>
        <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Checking rows…" : "Import evidence"}</button>
        {state?.error && <p role="alert" className="text-sm text-alert-ink">{state.error}</p>}
        {state?.inserted !== undefined && (
          <p role="status" className="rounded-md border-2 border-ink bg-accent px-3 py-2 text-sm text-[#0f1417]">
            Imported {state.inserted} {state.type?.toLowerCase()} row{state.inserted === 1 ? "" : "s"}. Profiles and calibration now include them.
          </p>
        )}
      </form>

      <div className="space-y-4">
        <div className="brutal p-5">
          <p className="label mb-2 text-muted">Expected columns</p>
          <pre className="overflow-x-auto rounded-md border-2 border-ink bg-bg p-3 font-mono text-xs leading-relaxed">{sample}</pre>
          <a download={`${type}-template.csv`} href={`data:text/csv;charset=utf-8,${encodeURIComponent(sample)}`} className="btn btn-ghost mt-3">Download template</a>
          <p className="mt-3 text-sm text-muted">List several skills with semicolons. Cycles are written as they appear in the app, like “H2 2026”.</p>
        </div>
        {state?.errors && (
          <div role="alert" className="brutal border-alert p-5">
            <p className="font-medium">Nothing was imported. Fix these {state.errors.length} problem{state.errors.length === 1 ? "" : "s"} and upload again.</p>
            <table className="mt-3 w-full text-sm">
              <thead><tr className="label text-left text-muted"><th className="py-1 font-normal">Row</th><th className="font-normal">Column</th><th className="font-normal">Problem</th></tr></thead>
              <tbody>
                {state.errors.slice(0, 50).map((e, i) => (
                  <tr key={i} className="border-t-2 border-ink/10"><td className="py-1.5 font-mono">{e.row}</td><td className="font-mono">{e.column}</td><td>{e.message}</td></tr>
                ))}
              </tbody>
            </table>
            {state.errors.length > 50 && <p className="mt-2 text-sm text-muted">Showing the first 50.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
