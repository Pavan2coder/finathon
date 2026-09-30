"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { writeAudit } from "@/lib/audit";
import { canSee, getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

const Move = z.object({
  userId: z.number().int(),
  stage: z.enum(["not_ready", "developing", "near_ready", "ready", "promoted"]),
  reason: z.string().trim().min(10, "Say why in at least 10 characters — this goes in the audit trail."),
});

export async function movePipelineStage(input: { userId: number; stage: string; reason: string }): Promise<{ error?: string }> {
  const viewer = await requireRole("manager", "hr");
  const parsed = Move.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { userId, stage, reason } = parsed.data;
  const user = getUser(userId);
  if (!user || !canSee(viewer, userId)) return { error: "You can only move people you manage." };
  if (user.promotionStage === stage) return {};
  writeAudit({ entity: "user", entityId: userId, field: "promotionStage", oldValue: user.promotionStage, newValue: stage, reason, actorId: viewer.id });
  user.promotionStage = stage;
  revalidatePath("/pipeline");
  return {};
}

const Note = z.object({
  subjectId: z.number().int(),
  kind: z.enum(["note", "activity"]),
  title: z.string().trim().min(3, "Add a short title."),
  details: z.string().trim().max(1000).default(""),
});

/** Notes and logged activity (1:1s, reviews, nominations) on a person's pipeline card. */
export async function addPipelineNote(input: { subjectId: number; kind: "note" | "activity"; title: string; details: string }): Promise<{ error?: string }> {
  const viewer = await requireRole("manager", "hr");
  const parsed = Note.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!canSee(viewer, parsed.data.subjectId)) return { error: "You can only add notes for people you manage." };
  store.notes.push({ id: Math.max(0, ...store.notes.map((n) => n.id)) + 1, authorId: viewer.id, at: new Date().toISOString(), ...parsed.data });
  revalidatePath("/pipeline");
  return {};
}

const STAGES = ["not_ready", "developing", "near_ready", "ready", "promoted"] as const;

/** CSV of email,stage[,reason]. All rows are checked first; nothing moves if any row is wrong. */
export async function importPipeline(csv: string): Promise<{ moved?: number; errors?: string[] }> {
  const viewer = await requireRole("manager", "hr");
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const header = lines.shift()?.toLowerCase().split(",").map((h) => h.trim()) ?? [];
  const ei = header.indexOf("email"), si = header.indexOf("stage"), ri = header.indexOf("reason");
  if (ei < 0 || si < 0) return { errors: ["The first row must include the columns email and stage."] };
  const errors: string[] = [];
  const moves: { id: number; stage: (typeof STAGES)[number]; reason: string }[] = [];
  lines.forEach((line, i) => {
    const cols = line.split(",").map((c) => c.trim());
    const u = store.users.find((x) => x.email.toLowerCase() === cols[ei]?.toLowerCase());
    const stage = cols[si]?.toLowerCase().replace(/\s+/g, "_") as (typeof STAGES)[number];
    if (!u) return errors.push(`Row ${i + 2}: no person with email ${cols[ei]}`);
    if (!canSee(viewer, u.id)) return errors.push(`Row ${i + 2}: ${u.name} isn't in your team`);
    if (!STAGES.includes(stage)) return errors.push(`Row ${i + 2}: unknown stage "${cols[si]}"`);
    moves.push({ id: u.id, stage, reason: (ri >= 0 && cols[ri]) || "Bulk import" });
  });
  if (errors.length) return { errors };
  for (const m of moves) {
    const u = getUser(m.id)!;
    if (u.promotionStage === m.stage) continue;
    writeAudit({ entity: "user", entityId: u.id, field: "promotionStage", oldValue: u.promotionStage, newValue: m.stage, reason: m.reason, actorId: viewer.id });
    u.promotionStage = m.stage;
  }
  revalidatePath("/pipeline");
  return { moved: moves.length };
}
