import React from 'react';
import { ArrowRight, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import { CareerLadderStep } from '../../types';
import { Card, CardHeader, CardContent } from '../Common/Card';
import { Badge } from '../Common/Badge';

interface CareerLadderProps {
  ladder: CareerLadderStep[];
  currentRole: string;
  potentialNextRole: string;
}

export const CareerLadder: React.FC<CareerLadderProps> = ({
  ladder,
  currentRole,
  potentialNextRole
}) => {
  return (
    <Card>
      <CardHeader
        title="Role Progression & Engineering Competency Ladder"
        subtitle="Transparent level expectations and advancement milestones"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Current Level:</span>
            <Badge variant="purple" size="md">
              {currentRole}
            </Badge>
          </div>
        }
      />
      <CardContent>
        {/* Connected Progression Steps */}
        <div className="relative">
          {/* Horizontal connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-8 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {ladder.map((step, idx) => {
              const isCurrent = step.status === 'current';
              const isCompleted = step.status === 'completed';
              const isNext = step.status === 'next';

              return (
                <div
                  key={step.role}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : isNext
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      : isCompleted
                      ? 'bg-slate-50/60 border-slate-200 opacity-80'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {step.level}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Achieved
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                          Current Role
                        </span>
                      )}
                      {isNext && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Target Horizon
                        </span>
                      )}
                      {step.status === 'future' && (
                        <span className="text-[11px] font-medium text-slate-400">
                          Future Path
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {step.role}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>{step.timeframe}</span>
                    {idx < ladder.length - 1 && (
                      <span className="text-slate-300 hidden lg:inline">→</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Advancement Vector:</span>
            <span className="text-slate-600 font-medium">{currentRole}</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-bold text-indigo-700">{potentialNextRole}</span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Target evaluation window: <strong>Q1 2027 Calibration Committee</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
