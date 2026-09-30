"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { activeCycle, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

export type FormState = { ok?: string; error?: string; fieldErrors?: Record<string, string> } | null;

const LogEvidence = z.object({
  kind: z.enum(["deliverable", "impact"]),
  title: z.string().trim().min(3, "Describe what you did in a few words."),
  detail: z.string().trim().max(300).optional(),
});

export async function logEvidence(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireRole("employee", "manager");
  const parsed = LogEvidence.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  const { kind, title, detail } = parsed.data;
  const cycle = activeCycle();
  const today = new Date().toLocaleDateString("en-CA");
  if (kind === "deliverable") {
    store.deliverables.push({
      id: Math.max(...store.deliverables.map((d) => d.id)) + 1, userId: viewer.id, projectId: null, cycleId: cycle.id,
      title, due: today, delivered: today, quality: 3, skills: [],
    });
  } else {
    store.impact.push({ id: Math.max(...store.impact.map((d) => d.id)) + 1, userId: viewer.id, cycleId: cycle.id, metric: title, value: 50, note: detail || "Self-reported, pending manager review" });
  }
  revalidatePath("/");
  return { ok: kind === "deliverable" ? "Deliverable logged. Your manager will rate its quality." : "Impact logged. Your manager will confirm the value." };
}
