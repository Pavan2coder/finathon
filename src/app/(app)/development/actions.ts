"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canSee, store } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";

const Update = z.object({ id: z.coerce.number().int(), progress: z.coerce.number().int().min(0).max(100) });

export async function updateDevPlanItem(formData: FormData) {
  const viewer = await requireRole("employee", "manager");
  const { id, progress } = Update.parse(Object.fromEntries(formData));
  const item = store.devItems.find((d) => d.id === id);
  if (!item || !canSee(viewer, item.userId)) throw new Error("You can only update your own plan or your reports' plans.");
  item.progress = progress;
  item.status = progress >= 100 ? "done" : progress > 0 ? "in_progress" : "todo";
  revalidatePath("/development");
  revalidatePath("/");
}
