import React from 'react';
import { SkillItem } from '../../types';
import { Badge } from '../Common/Badge';
import { Card, CardHeader } from '../Common/Card';
import { AlertCircle, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

interface SkillGapTableProps {
  skills: SkillItem[];
  onOpenTraining?: (skill: SkillItem) => void;
}

export const SkillGapTable: React.FC<SkillGapTableProps> = ({ skills, onOpenTraining }) => {
  return (
    <Card>
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Development Gap Analysis</span>
          </div>
        }
        subtitle="Identifies delta between verified competency and next-level role requirements"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
            <tr>
              <th className="py-3 px-4">Skill / Competency</th>
              <th className="py-3 px-4">Current Level</th>
              <th className="py-3 px-4">Required Benchmark</th>
              <th className="py-3 px-4">Gap (Delta)</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Recommended Action Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {skills.map((skill) => {
              const hasGap = skill.gap > 0;
              return (
                <tr key={skill.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div>{skill.name}</div>
                    <span className="text-[11px] text-slate-400 font-normal">{skill.category}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800">{skill.current}</span>
                    <span className="text-xs text-slate-400"> / 5.0</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-600">{skill.required}</span>
                    <span className="text-xs text-slate-400"> / 5.0</span>
                  </td>

                  <td className="py-3.5 px-4">
                    {hasGap ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-200">
                        -{skill.gap}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                        Target Met (+0.0)
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        skill.status === 'Strong'
                          ? 'success'
                          : skill.status === 'Developing'
                          ? 'warning'
                          : 'danger'
                      }
                      dot
                    >
                      {skill.status}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                    <div className="flex items-center justify-between gap-2">
                      <span className="leading-snug">{skill.recommendedAction}</span>
                      {hasGap && onOpenTraining && (
                        <button
                          onClick={() => onOpenTraining(skill)}
                          className="shrink-0 text-indigo-600 hover:text-indigo-800 font-semibold p-1 hover:underline cursor-pointer"
                        >
                          Enroll →
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
