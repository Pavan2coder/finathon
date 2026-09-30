"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TRACK_SKILLS } from "@/lib/data/generate";
import { activeCycle, canSee, getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import type { FormState } from "../actions";

const Id = z.object({ id: z.coerce.number().int() });

function ownedRequest(viewerId: number, role: string, id: number) {
  const r = store.requests.find((x) => x.id === id);
  if (!r) throw new Error("That request no longer exists.");
  const viewer = getUser(viewerId)!;
  if (role !== "hr" && !canSee(viewer, r.subjectId)) throw new Error("You can only manage requests about your team.");
  return r;
}

export async function sendFeedbackRequest(formData: FormData) {
  const viewer = await requireRole("manager", "hr");
  const r = ownedRequest(viewer.id, viewer.role, Id.parse(Object.fromEntries(formData)).id);
  r.status = "sent";
  r.sentAt = new Date().toISOString();
  revalidatePath("/feedback");
}

export async function followUpFeedbackRequest(formData: FormData) {
  const viewer = await requireRole("manager", "hr");
  const r = ownedRequest(viewer.id, viewer.role, Id.parse(Object.fromEntries(formData)).id);
  r.status = "followed_up";
  revalidatePath("/feedback");
}

const NewRequest = z.object({ subjectId: z.coerce.number().int(), reviewerId: z.coerce.number().int() }).refine((v) => v.subjectId !== v.reviewerId, "Pick a reviewer other than the person being reviewed.");

export async function createFeedbackRequest(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireRole("manager");
  const parsed = NewRequest.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { subjectId, reviewerId } = parsed.data;
  if (!canSee(viewer, subjectId)) return { error: "You can only request feedback about your own reports." };
  store.requests.push({ id: Math.max(...store.requests.map((r) => r.id)) + 1, subjectId, reviewerId, cycleId: activeCycle().id, status: "sent", sentAt: new Date().toISOString() });
  revalidatePath("/feedback");
  return { ok: `Request sent to ${getUser(reviewerId)?.name}.` };
}

const Respond = z.object({
  id: z.coerce.number().int(),
  score: z.coerce.number().min(1).max(5),
  skill: z.string().min(1),
  text: z.string().trim().min(15, "Give a specific example in at least 15 characters."),
});

export async function respondToFeedback(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireRole();
  const parsed = Respond.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  const { id, score, skill, text } = parsed.data;
  const r = store.requests.find((x) => x.id === id);
  if (!r || r.reviewerId !== viewer.id) return { error: "This request isn't addressed to you." };
  const subject = getUser(r.subjectId)!;
  if (!TRACK_SKILLS[subject.track]?.includes(skill)) return { fieldErrors: { skill: "Pick one of the listed skills." } };
  store.feedback.push({ id: Math.max(...store.feedback.map((f) => f.id)) + 1, subjectId: r.subjectId, authorId: viewer.id, kind: "peer", cycleId: r.cycleId, score, text, skills: [skill] });
  r.status = "responded";
  revalidatePath("/feedback");
  revalidatePath("/");
  return { ok: `Feedback for ${subject.name} saved. It now counts toward their evidence.` };
}
