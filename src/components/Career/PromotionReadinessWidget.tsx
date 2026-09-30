import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Info, HelpCircle } from 'lucide-react';
import { PromotionCriterion } from '../../types';
import { Card, CardHeader, CardContent } from '../Common/Card';
import { Badge } from '../Common/Badge';

interface PromotionReadinessWidgetProps {
  score: number;
  criteriaMetCount: number;
  totalCriteriaCount: number;
  criteria: PromotionCriterion[];
  targetRole: string;
}

export const PromotionReadinessWidget: React.FC<PromotionReadinessWidgetProps> = ({
  score,
  criteriaMetCount,
  totalCriteriaCount,
  criteria,
  targetRole
}) => {
  // SVG circular progress calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card>
      <CardHeader
        title="Role Promotion Readiness Assessment"
        subtitle={`Benchmarked against criteria for advancement to ${targetRole}`}
        action={
          <Badge variant={score >= 75 ? 'success' : 'warning'} size="md">
            Meets {criteriaMetCount}/{totalCriteriaCount} defined readiness criteria
          </Badge>
        }
      />
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Circular Indicator Column */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Active Progress */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={score >= 80 ? '#10b981' : score >= 65 ? '#4f46e5' : '#f59e0b'}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{score}%</span>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Readiness</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs font-bold text-slate-800">
                {criteriaMetCount} of {totalCriteriaCount} Criteria Met
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {totalCriteriaCount - criteriaMetCount} competency gaps in active development
              </p>
            </div>
          </div>

          {/* Criteria Checklist Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Objective Criteria Evaluation Checklist
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Satisfied
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Developing
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {criteria.map((crit) => {
                const isSatisfied = crit.status === 'satisfied';
                return (
                  <div
                    key={crit.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isSatisfied
                        ? 'bg-emerald-50/50 border-emerald-100/80 hover:bg-emerald-50'
                        : 'bg-amber-50/50 border-amber-100/80 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {isSatisfied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {crit.name}
                          </p>
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              isSatisfied
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isSatisfied ? 'Satisfied' : 'Developing'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug line-clamp-2">
                          {crit.evidenceNote}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mandatory Ethical HR Disclaimer Box */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3 shadow-md">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <p className="font-bold text-amber-300">
              Governance & Promotion Decision Principle
            </p>
            <p className="text-slate-300">
              EvalSense provides objective, evidence-based readiness tracking to inform discussions. It does <strong>not</strong> automate promotion decisions or display "Promote Now" directives. <strong>Final promotion decisions remain strictly with HR and departmental management.</strong>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
