import { ImportForm } from "@/components/ImportForm";
import { PageHeader } from "@/components/ui";
import { requireRole } from "@/lib/session";

export default async function ImportPage() {
  await requireRole("hr");
  return (
    <>
      <PageHeader title="Evidence import" lead="Bring in goals, deliverables, feedback, training, attendance and impact from other systems. Every row is checked first; if any row is wrong, nothing is imported." />
      <ImportForm />
    </>
  );
}
