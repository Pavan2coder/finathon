"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
<<<<<<< HEAD
import { coworkers, getUser, openPunch, store, todayISO } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import type { FormState } from "../actions";

// ---- punch in / out ----
// ponytail: codes live in memory for 2 minutes; move to the DB with the rest of the store.
const codes = new Map<number, { code: string; exp: number }>();
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** A short code shown on screen and typed back, so a punch needs someone looking at this device. */
export async function issuePunchCode(): Promise<string> {
  const viewer = await requireRole();
  const code = Array.from({ length: 5 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
  codes.set(viewer.id, { code, exp: Date.now() + 120_000 });
  return code;
}

const MAX_PHOTO = 400_000; // ~300 KB JPEG as a data URL

export async function punch(input: { code: string; photo: string | null }): Promise<{ error?: string; ok?: string }> {
  const viewer = await requireRole();
  const issued = codes.get(viewer.id);
  if (!issued || issued.exp < Date.now()) return { error: "That code expired. Use the new one shown." };
  if (input.code.trim().toUpperCase() !== issued.code) return { error: "The code doesn't match. Type the code shown above." };
  if (!input.photo || !input.photo.startsWith("data:image/")) return { error: "Take a photo with the live camera first." };
  if (input.photo.length > MAX_PHOTO) return { error: "The photo is too large. Retake it." };
  codes.delete(viewer.id);
  const now = new Date().toISOString();
  const open = openPunch(viewer.id);
  if (open) open.outAt = now;
  else store.punches.push({ id: Math.max(0, ...store.punches.map((p) => p.id)) + 1, userId: viewer.id, inAt: now, outAt: null, photo: input.photo });
  revalidatePath("/");
  return { ok: open ? "Punched out. Hours added to this week." : "Punched in. Have a good day." };
}

// ---- work update ----
const Update = z.object({ text: z.string().trim().min(5, "Write at least a sentence about what you worked on.").max(1000) });

export async function submitWorkUpdate(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireRole();
  const parsed = Update.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: { text: parsed.error.issues[0].message } };
  const date = todayISO();
  const existing = store.workUpdates.find((w) => w.userId === viewer.id && w.date === date);
  if (existing) existing.text = parsed.data.text;
  else store.workUpdates.push({ id: Math.max(0, ...store.workUpdates.map((w) => w.id)) + 1, userId: viewer.id, date, text: parsed.data.text });
  revalidatePath("/");
  return { ok: existing ? "Today's update was replaced." : "Update submitted for today." };
}

=======
import { coworkers, getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import type { FormState } from "../actions";

>>>>>>> e24f7031eaf7d9bd7b285f5cc523ddbb1f883a8c
// ---- tasks ----
const Task = z.object({
  title: z.string().trim().min(3, "Give the task a title."),
  assigneeId: z.coerce.number().int().positive("Pick who it's for."),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a due date."),
  priority: z.enum(["low", "medium", "high", "critical"]),
  notes: z.string().trim().max(500).default(""),
  kind: z.enum(["task", "stretch"]).default("task"),
});

export async function createTask(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireRole();
  const parsed = Task.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  const t = parsed.data;
  const allowed = t.assigneeId === viewer.id || coworkers(viewer).some((c) => c.id === t.assigneeId);
  if (!allowed) return { fieldErrors: { assigneeId: "You can only assign tasks to your coworkers." } };
  store.tasks.push({ id: Math.max(0, ...store.tasks.map((x) => x.id)) + 1, ...t, creatorId: viewer.id, status: "open" });
  revalidatePath("/", "layout");
  return { ok: t.assigneeId === viewer.id ? "Task added." : `Task assigned to ${getUser(t.assigneeId)?.name}.` };
}

export async function toggleTask(formData: FormData) {
  const viewer = await requireRole();
  const id = z.coerce.number().int().parse(formData.get("id"));
  const t = store.tasks.find((x) => x.id === id);
  if (!t || (t.assigneeId !== viewer.id && t.creatorId !== viewer.id)) throw new Error("Only the assignee or the person who set the task can change it.");
  t.status = t.status === "done" ? "open" : "done";
  revalidatePath("/", "layout");
}
