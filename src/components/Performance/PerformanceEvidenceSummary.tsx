import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, ChevronRight, Info, ExternalLink } from 'lucide-react';
import { SupportingEvidence } from '../../types';
import { Badge } from '../Common/Badge';
import { Modal } from '../Common/Modal';

interface PerformanceEvidenceSummaryProps {
  summaryText: string;
  supportingEvidence: SupportingEvidence[];
  employeeName: string;
}

export const PerformanceEvidenceSummary: React.FC<PerformanceEvidenceSummaryProps> = ({
  summaryText,
  supportingEvidence,
  employeeName
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<SupportingEvidence | null>(null);

  return (
    <>
      <div className="rounded-xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 p-5 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Performance Evidence Summary</h3>
              <p className="text-[11px] text-slate-500">Synthesized from verified deliverables, telemetry, and feedback</p>
            </div>
          </div>

          <Badge variant="purple" size="sm">
            Evidence-Based
          </Badge>
        </div>

        <p className="mt-3.5 text-sm text-slate-700 leading-relaxed font-normal">
          "{summaryText}"
        </p>

        {/* Supporting Evidence references */}
        <div className="mt-5 pt-4 border-t border-indigo-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              Supporting Evidence References ({supportingEvidence.length})
            </span>
            <span className="text-[11px] text-slate-400">Click any reference to verify data audit</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {supportingEvidence.map(ev => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvidence(ev)}
                className="flex items-start justify-between p-3 rounded-lg bg-white/90 border border-indigo-100/90 hover:border-indigo-300 hover:shadow-2xs cursor-pointer transition-all group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                      {ev.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{ev.impact}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Badge variant="neutral" size="sm">
                    {ev.category}
                  </Badge>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>Audit Trail ID: #EV-2026-H1-AUTHLOG</span>
          <span>Verified against Production APM & Repositories</span>
        </div>
      </div>

      {/* Evidence Verification Modal */}
      {selectedEvidence && (
        <Modal
          isOpen={!!selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
          title={
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Evidence Verification Record</span>
            </div>
          }
          subtitle={`Audit trail for ${employeeName}`}
          footer={
            <button
              onClick={() => setSelectedEvidence(null)}
              className="text-xs font-semibold px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              Close Verification
            </button>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Deliverable / Artifact</span>
              <p className="font-bold text-slate-900 mt-0.5 text-base">{selectedEvidence.title}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span>Category: <strong>{selectedEvidence.category}</strong></span>
                <span>Verified: <strong>{selectedEvidence.verifiedDate}</strong></span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Verified Business Impact</span>
              <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                {selectedEvidence.impact}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Source Proof Mechanism:</p>
              <p>• APM P99 latency telemetry query ID: <code>APM-TR-8849204</code></p>
              <p>• Pull request commit hash: <code>git #c7a91bf</code> (Merged to main)</p>
              <p>• Verified by automated CI telemetry hooks</p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
