"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { coworkers, getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import type { FormState } from "../actions";

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
