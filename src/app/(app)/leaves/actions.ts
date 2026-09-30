"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { writeAudit } from "@/lib/audit";
import { LEAVE_ALLOWANCE } from "@/lib/data/generate";
import { canSee, getUser, store } from "@/lib/data/repo";
import { leaveDays, leaveUsed } from "@/lib/leave";
import { requireRole } from "@/lib/session";
import type { FormState } from "../actions";

const Request = z
  .object({
    type: z.enum(["casual", "sick", "vacation", "wfh"]),
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a start date."),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick an end date."),
    reason: z.string().trim().min(3, "Add a short reason."),
  })
  .refine((v) => v.to >= v.from, { message: "The end date is before the start date.", path: ["to"] });

export async function requestLeave(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireRole();
  const parsed = Request.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])) };
  const r = parsed.data;
  const days = leaveDays(r.from, r.to);
  if (days === 0) return { fieldErrors: { to: "Those dates are all weekends — no leave needed." } };
  const left = LEAVE_ALLOWANCE[r.type] - leaveUsed(viewer.id, r.type, true);
  if (days > left) return { fieldErrors: { to: `That's ${days} working days but you have ${left} left.` } };
  const overlap = store.leaves.some((l) => l.userId === viewer.id && l.status !== "rejected" && l.from <= r.to && l.to >= r.from);
  if (overlap) return { fieldErrors: { from: "You already have leave booked on some of these dates." } };
  store.leaves.push({ id: Math.max(0, ...store.leaves.map((l) => l.id)) + 1, userId: viewer.id, ...r, status: "pending", decidedBy: null, at: new Date().toISOString() });
  revalidatePath("/leaves");
  return { ok: `Requested ${days} day${days === 1 ? "" : "s"}. Your manager will approve or reject it.` };
}

export async function decideLeave(formData: FormData) {
  const viewer = await requireRole("manager", "hr");
  const { id, decision } = z.object({ id: z.coerce.number().int(), decision: z.enum(["approved", "rejected"]) }).parse(Object.fromEntries(formData));
  const leave = store.leaves.find((l) => l.id === id);
  if (!leave || !canSee(viewer, leave.userId)) throw new Error("You can only decide leave for your own team.");
  if (leave.status !== "pending") return;
  leave.status = decision;
  leave.decidedBy = viewer.id;
  writeAudit({ entity: "leave", entityId: id, field: "status", oldValue: "pending", newValue: decision, reason: `${decision === "approved" ? "Approved" : "Rejected"} ${leave.type} leave for ${getUser(leave.userId)?.name}`, actorId: viewer.id });
  revalidatePath("/leaves");
  revalidatePath("/", "layout");
}

export async function cancelLeave(formData: FormData) {
  const viewer = await requireRole();
  const id = z.coerce.number().int().parse(formData.get("id"));
  const leave = store.leaves.find((l) => l.id === id);
  if (!leave || leave.userId !== viewer.id || leave.status !== "pending") return;
  store.leaves.splice(store.leaves.indexOf(leave), 1);
  revalidatePath("/leaves");
}
