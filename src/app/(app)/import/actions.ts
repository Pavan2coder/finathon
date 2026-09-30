"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import { IMPORT_TYPES, type ImportResult, type ImportType, type RowError } from "./schemas";

const MAX_BYTES = 1_000_000;
const nextId = (rows: { id: number }[]) => Math.max(0, ...rows.map((r) => r.id)) + 1;

export async function importCsv(_prev: ImportResult, formData: FormData): Promise<ImportResult> {
  const viewer = await requireRole("hr");
  const type = String(formData.get("type")) as ImportType;
  const def = IMPORT_TYPES[type];
  if (!def) return { error: "Pick an evidence type." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV file to upload." };
  if (file.size > MAX_BYTES) return { error: "That file is over 1 MB. Split it and upload the parts." };

  const parsed = Papa.parse<Record<string, string>>(await file.text(), { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim().toLowerCase() });
  if (!parsed.data.length) return { error: "The file has a header row but no data rows." };

  const byEmail = new Map(store.users.map((u) => [u.email.toLowerCase(), u]));
  const byCycle = new Map(store.cycles.map((c) => [c.name.toLowerCase(), c]));
  const errors: RowError[] = [];
  const good: { data: Record<string, unknown>; row: number }[] = [];

  parsed.data.forEach((raw, i) => {
    const row = i + 2; // header is row 1
    const r = def.schema.safeParse(raw);
    if (!r.success) {
      for (const issue of r.error.issues) errors.push({ row, column: String(issue.path[0] ?? "—"), message: issue.message });
      return;
    }
    const d = r.data as Record<string, unknown>;
    for (const col of ["email", "subject_email", "author_email"])
      if (typeof d[col] === "string" && !byEmail.has((d[col] as string).toLowerCase())) errors.push({ row, column: col, message: `No person with email ${d[col]}` });
    if (typeof d.cycle === "string" && !byCycle.has(d.cycle.toLowerCase())) errors.push({ row, column: "cycle", message: `Unknown cycle "${d.cycle}". Use e.g. H2 2026.` });
    good.push({ data: d, row });
  });

  // All or nothing: one bad row means nothing is written.
  if (errors.length) return { errors };

  for (const { data: d } of good) {
    const uid = (k: string) => byEmail.get(String(d[k]).toLowerCase())!.id;
    const cid = () => byCycle.get(String(d.cycle).toLowerCase())!.id;
    switch (type) {
      case "goals":
        store.goals.push({ id: nextId(store.goals), userId: uid("email"), cycleId: cid(), title: String(d.title), target: Number(d.target), actual: Number(d.actual) });
        break;
      case "deliverables":
        store.deliverables.push({ id: nextId(store.deliverables), userId: uid("email"), projectId: null, cycleId: cid(), title: String(d.title), due: String(d.due), delivered: d.delivered ? String(d.delivered) : null, quality: Number(d.quality), skills: d.skills as string[] });
        break;
      case "feedback":
        store.feedback.push({ id: nextId(store.feedback), subjectId: uid("subject_email"), authorId: uid("author_email"), kind: d.kind as "peer" | "manager", cycleId: cid(), score: Number(d.score), text: String(d.text), skills: d.skills as string[] });
        break;
      case "trainings":
        store.trainings.push({ id: nextId(store.trainings), userId: uid("email"), course: String(d.course), skill: String(d.skill), status: d.status as "planned" | "in_progress" | "done", completedAt: d.status === "done" ? new Date().toLocaleDateString("en-CA") : null });
        break;
      case "attendance":
        store.attendance.push({ id: nextId(store.attendance), userId: uid("email"), cycleId: cid(), month: String(d.month), workDays: Number(d.work_days), presentDays: Number(d.present_days) });
        break;
      case "impact":
        store.impact.push({ id: nextId(store.impact), userId: uid("email"), cycleId: cid(), metric: String(d.metric), value: Number(d.value), note: String(d.note ?? "") });
        break;
    }
  }
  writeAudit({ entity: "import", entityId: 0, field: type, oldValue: null, newValue: `${good.length} rows`, reason: `CSV import: ${file.name}`, actorId: viewer.id });
  revalidatePath("/", "layout");
  return { inserted: good.length, type: def.label };
}
