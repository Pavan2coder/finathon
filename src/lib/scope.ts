import "server-only";
import { redirect } from "next/navigation";
import type { UserRow } from "./data/generate";
import { canSee, store, visibleUserIds } from "./data/repo";

/** Resolves ?user= for per-person pages: employees always get themselves, others get a visible report. */
export function subjectFor(viewer: UserRow, requested?: string) {
  const people = visibleUserIds(viewer)
    .map((id) => store.users.find((u) => u.id === id)!)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (viewer.role === "employee") return { subject: viewer, people: [] as UserRow[] };
  const id = Number(requested);
  if (requested && !canSee(viewer, id)) redirect("/?denied=1");
  return { subject: people.find((p) => p.id === id) ?? people[0], people };
}
