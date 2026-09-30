"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TRACK_SKILLS, type PostRow } from "@/lib/data/generate";
import { activeCycle, getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import type { FormState } from "../actions";

const nextId = (rows: { id: number }[]) => Math.max(0, ...rows.map((r) => r.id)) + 1;

/** A published kudos becomes peer-feedback evidence on the recipient's profile. */
function toEvidence(post: (typeof store.posts)[number]) {
  store.feedback.push({ id: nextId(store.feedback), subjectId: post.recipientId, authorId: post.authorId, kind: "peer", cycleId: activeCycle().id, score: 4.5, text: post.content, skills: post.skills });
}

/** Scheduled posts whose time has come are published on read; no background worker needed. */
export async function publishDue() {
  const now = new Date().toISOString();
  for (const p of store.posts)
    if (p.status === "scheduled" && p.scheduledAt && p.scheduledAt <= now) {
      p.status = "published";
      p.at = p.scheduledAt;
      toEvidence(p);
    }
}

const Post = z
  .object({
    recipientId: z.coerce.number().int().positive("Pick who you're recognising."),
    skill: z.string().min(1, "Pick the skill they showed."),
    content: z.string().trim().min(15, "Say what they did in at least 15 characters — specifics make it useful evidence.").max(600),
    intent: z.enum(["draft", "schedule", "publish"]),
    scheduledAt: z.string().optional(),
  })
  .refine((v) => v.intent !== "schedule" || (v.scheduledAt && new Date(v.scheduledAt) > new Date()), { message: "Pick a time in the future.", path: ["scheduledAt"] });

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireRole();
  const parsed = Post.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  const v = parsed.data;
  const to = getUser(v.recipientId);
  if (!to || to.id === viewer.id) return { fieldErrors: { recipientId: "Pick a coworker other than yourself." } };
  if (!(TRACK_SKILLS[to.track] ?? []).includes(v.skill)) return { fieldErrors: { skill: "Pick one of the listed skills." } };
  const status: PostRow["status"] = v.intent === "publish" ? "published" : v.intent === "schedule" ? "scheduled" : "draft";
  const post: PostRow = { id: nextId(store.posts), authorId: viewer.id, recipientId: to.id, skills: [v.skill], content: v.content, status, scheduledAt: v.intent === "schedule" ? new Date(v.scheduledAt!).toISOString() : null, at: new Date().toISOString(), cheers: [] };
  store.posts.push(post);
  if (status === "published") toEvidence(post);
  revalidatePath("/recognition");
  return { ok: status === "published" ? `Published. It now counts as peer evidence for ${to.name}.` : status === "scheduled" ? "Scheduled." : "Saved as a draft." };
}

export async function cheer(formData: FormData) {
  const viewer = await requireRole();
  const post = store.posts.find((p) => p.id === Number(formData.get("id")));
  if (!post || post.status !== "published") return;
  post.cheers = post.cheers.includes(viewer.id) ? post.cheers.filter((c) => c !== viewer.id) : [...post.cheers, viewer.id];
  revalidatePath("/recognition");
}

export async function publishDraft(formData: FormData) {
  const viewer = await requireRole();
  const post = store.posts.find((p) => p.id === Number(formData.get("id")));
  if (!post || post.authorId !== viewer.id || post.status === "published") return;
  post.status = "published";
  post.at = new Date().toISOString();
  toEvidence(post);
  revalidatePath("/recognition");
}
