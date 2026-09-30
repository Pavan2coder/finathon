"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import type { FormState } from "../actions";
import { FAQ } from "./faq";

export async function askSupport(question: string): Promise<{ text: string; suggest?: string[] }> {
  await requireRole();
  const hit = FAQ.find((f) => f.keys.test(question));
  if (hit) return { text: hit.a };
  return { text: "I couldn't match that to the help articles. Raise a ticket and HR will get back to you, or try one of these:", suggest: FAQ.slice(0, 3).map((f) => f.q) };
}

const Ticket = z.object({
  subject: z.string().trim().min(4, "Add a short subject."),
  body: z.string().trim().min(10, "Describe the problem in a sentence or two."),
});

export async function createTicket(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireRole();
  const parsed = Ticket.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  const id = Math.max(0, ...store.tickets.map((t) => t.id)) + 1;
  store.tickets.push({ id, userId: viewer.id, ...parsed.data, status: "open", at: new Date().toISOString() });
  revalidatePath("/support");
  return { ok: `Ticket #${id} raised. HR will reply by email.` };
}

export async function resolveTicket(formData: FormData) {
  await requireRole("hr");
  const t = store.tickets.find((x) => x.id === Number(formData.get("id")));
  if (t) t.status = t.status === "open" ? "resolved" : "open";
  revalidatePath("/support");
}
