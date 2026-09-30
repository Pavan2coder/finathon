import React, { useState } from 'react';
import { Calendar, CheckCircle2, ChevronRight, Award, User, Target, ExternalLink } from 'lucide-react';
import { DevelopmentPlanItem } from '../../types';
import { Badge } from '../Common/Badge';
import { Button } from '../Common/Button';
import { Modal } from '../Common/Modal';
import { Card, CardHeader, CardContent } from '../Common/Card';

interface DevelopmentPlanCardsProps {
  plans: DevelopmentPlanItem[];
  employeeName: string;
}

export const DevelopmentPlanCards: React.FC<DevelopmentPlanCardsProps> = ({
  plans,
  employeeName
}) => {
  const [selectedPlan, setSelectedPlan] = useState<DevelopmentPlanItem | null>(null);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Development Plans</h3>
            <p className="text-xs text-slate-500">Structured growth milestones aligned with competency elevation</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {plans.length} In Progress
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <Card
              key={plan.id}
              className="p-5 flex flex-col justify-between hover:border-indigo-300 transition-all hover:shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="purple" size="sm">
                    {plan.type}
                  </Badge>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{plan.deadline}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {plan.goal}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {plan.recommendedAction}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Milestone Progress</span>
                    <span className="font-bold text-indigo-600">{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {plan.mentor ? (
                  <span className="text-[11px] text-slate-500 truncate max-w-36">
                    Mentor: <strong>{plan.mentor}</strong>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Self-Directed</span>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlan(plan)}
                >
                  View Plan
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Plan Detail Modal */}
      {selectedPlan && (
        <Modal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          title={
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <span>Development Plan & Syllabus</span>
            </div>
          }
          subtitle={`Custom curriculum for ${employeeName}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">Target Completion: <strong>{selectedPlan.deadline}</strong></span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedPlan(null)}
              >
                Close Plan
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Development Objective</span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">{selectedPlan.goal}</h4>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{selectedPlan.recommendedAction}</p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Milestones & Deliverable Checkpoints
              </span>
              <div className="space-y-2">
                {selectedPlan.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${idx === 0 ? 'text-emerald-500' : 'text-slate-300'}`} />
                    <div>
                      <p className="font-semibold text-slate-800">{m}</p>
                      <span className="text-[10px] text-slate-400">
                        {idx === 0 ? 'Verified Completed' : 'Pending Review'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPlan.mentor && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span>Assigned Senior Sponsor / Mentor: <strong>{selectedPlan.mentor}</strong></span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
