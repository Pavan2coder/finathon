"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { writeAudit } from "@/lib/audit";
import { activeCycle, getUser, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

const Adjust = z.object({
  userId: z.number().int(),
  rating: z.number().min(1).max(5).multipleOf(0.5, "Ratings go in half-point steps."),
  reason: z.string().trim().min(10, "Say why in at least 10 characters — this goes in the audit trail."),
});

export async function adjustRating(input: { userId: number; rating: number; reason: string }): Promise<{ error?: string }> {
  const viewer = await requireRole("manager", "hr");
  const parsed = Adjust.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { userId, rating, reason } = parsed.data;
  const row = store.ratings.find((r) => r.userId === userId && r.cycleId === activeCycle().id);
  if (!row) return { error: "No rating for this cycle yet." };
  if (viewer.role === "manager" && row.managerId !== viewer.id) return { error: "Only the rating manager or HR can change this rating." };
  if (!getUser(userId)) return { error: "Unknown employee." };
  writeAudit({ entity: "rating", entityId: row.id, field: "rating", oldValue: String(row.rating), newValue: String(rating), reason, actorId: viewer.id });
  row.rating = rating;
  revalidatePath("/calibration");
  revalidatePath("/");
  return {};
}
