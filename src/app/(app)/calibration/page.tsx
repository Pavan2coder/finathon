import { EvidenceScatter } from "@/components/charts";
import { FlaggedQueue } from "@/components/FlaggedQueue";
import { RatingStrips } from "@/components/RatingStrips";
import { Card, CardHead, PageHeader, StatTile } from "@/components/ui";
import { activeCycle, calibration } from "@/lib/data/repo";
import { THRESHOLDS } from "@/lib/engine";
import { requireRole } from "@/lib/session";

export default async function CalibrationPage() {
  const viewer = await requireRole("manager", "hr");
  const { cases, managers } = calibration();
  const scoped = viewer.role === "hr" ? cases : cases.filter((c) => c.managerId === viewer.id);
  const orgMean = Math.round((cases.reduce((a, c) => a + c.rating, 0) / cases.length) * 100) / 100;
  const rows = (viewer.role === "hr" ? managers : managers.filter((m) => m.managerId === viewer.id)).map((m) => ({
    id: m.managerId,
    name: m.manager.name,
    mean: m.meanRating,
    medianResidual: m.medianResidual,
    flags: m.flags,
    ratings: cases.filter((c) => c.managerId === m.managerId).map((c) => ({ value: c.rating, flagged: c.flagged, who: c.user.name })),
  }));

  // Expected-rating curve sampled across the evidence range for the shaded band.
  const sorted = [...cases].sort((a, b) => a.evidence - b.evidence);
  const band = [35, 45, 55, 65, 75, 85, 95].map((x) => {
    const near = sorted.reduce((best, c) => (Math.abs(c.evidence - x) < Math.abs(best.evidence - x) ? c : best), sorted[0]);
    return { x, lo: near.expected - THRESHOLDS.contradictionResidual, hi: near.expected + THRESHOLDS.contradictionResidual };
  });
  const flagged = scoped.filter((c) => c.flagged);
  const offPattern = managers.filter((m) => m.flags.some((f) => f !== "insufficient_data"));

  return (
    <>
      <PageHeader
        title="Calibration"
        lead={`${activeCycle().name}. This page compares how managers rate, not how people rank. Each rating is checked against the rating its evidence predicts; final calls stay with people.`}
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={viewer.role === "hr" ? "Ratings this cycle" : "Your ratings"} value={scoped.length} />
        <StatTile label="Org average rating" value={orgMean} />
        {viewer.role === "hr" ? (
          <StatTile label="Managers off-pattern" value={offPattern.length} tone="primary" note={`of ${managers.length}`} />
        ) : (
          <StatTile label="Your gap vs evidence" value={managers.find((m) => m.managerId === viewer.id)?.medianResidual ?? 0} note="±0.5 is calibrated" tone="primary" />
        )}
        <StatTile label="Disagree with evidence" value={flagged.length} tone={flagged.length ? "alert" : "card"} note={`±${THRESHOLDS.contradictionResidual} or more`} />
      </div>

      <Card className="mb-6">
        <CardHead label="Rating distributions" title={viewer.role === "hr" ? "How each manager rates" : "How you rate compared with the org"} />
        <RatingStrips rows={rows} orgMean={orgMean} />
      </Card>

      <div className="grid gap-6">
        <Card paper>
          <CardHead label="Evidence vs rating" title="Does each rating match its evidence?" />
          <EvidenceScatter
            band={band}
            points={scoped.map((c) => ({ evidence: c.evidence, rating: c.rating, flagged: c.flagged, tooltip: `${c.user.name} (${c.manager.name})` }))}
          />
          <p className="mt-2 text-xs text-muted">Shaded band: within {THRESHOLDS.contradictionResidual} points of the rating the evidence predicts.</p>
        </Card>
        <Card>
          <CardHead label="Review queue" title="Ratings that disagree with evidence" />
          <FlaggedQueue
            cases={flagged.map((c) => ({ userId: c.userId, name: c.user.name, manager: c.manager.name, evidence: c.evidence, rating: c.rating, expected: c.expected, residual: c.residual }))}
          />
        </Card>
      </div>
    </>
  );
}
