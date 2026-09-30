"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import type { FormState } from "../actions";

const Event = z.object({
  title: z.string().trim().min(3, "Give the event a name."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  kind: z.enum(["deadline", "calibration", "holiday"]),
});

export async function createEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireRole("hr");
  const parsed = Event.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  store.events.push({ id: Math.max(0, ...store.events.map((e) => e.id)) + 1, ...parsed.data });
  revalidatePath("/calendar");
  revalidatePath("/");
  return { ok: `Added “${parsed.data.title}” on ${parsed.data.date}.` };
}
