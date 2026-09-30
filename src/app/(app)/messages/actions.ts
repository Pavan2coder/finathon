"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import type { FormState } from "../actions";

const nextId = (rows: { id: number }[]) => Math.max(0, ...rows.map((r) => r.id)) + 1;

const Message = z.object({ toId: z.coerce.number().int(), text: z.string().trim().min(1, "Type a message.").max(2000) });

export async function sendMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireRole();
  const parsed = Message.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!getUser(parsed.data.toId) || parsed.data.toId === viewer.id) return { error: "Pick someone to message." };
  store.messages.push({ id: nextId(store.messages), fromId: viewer.id, toId: parsed.data.toId, text: parsed.data.text, at: new Date().toISOString() });
  revalidatePath("/chat");
  return { ok: "sent" };
}

const ids = z.string().transform((s) => s.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0));

const Email = z.object({
  to: ids.refine((a) => a.length > 0, "Add at least one recipient."),
  cc: ids.default([]),
  tags: ids.default([]),
  subject: z.string().trim().min(1, "Add a subject.").max(200),
  body: z.string().trim().min(1, "Write the email.").max(10000),
  threadId: z.coerce.number().int().optional(),
});

export async function sendEmail(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireRole();
  const parsed = Email.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  const e = parsed.data;
  const unknown = [...e.to, ...e.cc, ...e.tags].find((id) => !getUser(id));
  if (unknown) return { fieldErrors: { to: "One of the recipients doesn't exist." } };
  const threadId = e.threadId && store.emails.some((m) => m.threadId === e.threadId) ? e.threadId : Math.max(0, ...store.emails.map((m) => m.threadId)) + 1;
  store.emails.push({ id: nextId(store.emails), threadId, fromId: viewer.id, to: e.to, cc: e.cc, tags: e.tags, subject: e.subject, body: e.body, at: new Date().toISOString() });
  revalidatePath("/email");
  return { ok: e.threadId ? "Reply sent." : "Email sent." };
}
