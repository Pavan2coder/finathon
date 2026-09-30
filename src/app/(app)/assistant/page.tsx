import { Assistant } from "@/components/Assistant";
import { PageHeader } from "@/components/ui";
import { getUser, visibleUserIds } from "@/lib/data/repo";
import { requireRole } from "@/lib/session";
import type { Intent } from "./actions";

const QUICK: Record<string, { intent: Intent; label: string }[]> = {
  employee: [
    { intent: "next_level", label: "What do I need for the next level?" },
    { intent: "score", label: "Why is my score what it is?" },
    { intent: "skills", label: "Which skills should I work on?" },
  ],
  manager: [
    { intent: "flagged", label: "Why was this rating flagged?" },
    { intent: "compare", label: "How do my ratings compare?" },
    { intent: "close_to_promotion", label: "Who is close to promotion?" },
    { intent: "next_level", label: "What do they need next?" },
  ],
  hr: [
    { intent: "managers", label: "Which managers rate off-pattern?" },
    { intent: "flagged", label: "Why was this rating flagged?" },
    { intent: "compare", label: "Compare all managers" },
    { intent: "next_level", label: "What do they need next?" },
  ],
};

export default async function AssistantPage() {
  const viewer = await requireRole();
  const people = viewer.role === "employee" ? [] : visibleUserIds(viewer).map((id) => ({ id, name: getUser(id)!.name })).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <PageHeader title="Evidence assistant" lead="Ask about scores, gaps and flagged ratings. Every answer comes from the evidence in EvalSense and lists what it used." />
      <Assistant quick={QUICK[viewer.role]} people={people} greeting={`Hi ${viewer.name.split(" ")[0]}. I explain what the evidence says; I don't make the call. Pick a question below or type your own.`} />
    </>
  );
}
