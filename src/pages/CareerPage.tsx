import React, { useState, useEffect } from 'react';
import { User, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Employee } from '../types';
import { mockEmployees } from '../data/employees';
import { CareerLadder } from '../components/Career/CareerLadder';
import { PromotionReadinessWidget } from '../components/Career/PromotionReadinessWidget';
import { Badge } from '../components/Common/Badge';

export const CareerPage: React.FC = () => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>('emp-01');
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    loadCareerData(selectedEmpId);
  }, [selectedEmpId]);

  const loadCareerData = async (id: string) => {
    const emp = await api.getEmployee(id);
    setEmployee(emp || mockEmployees[0]);
  };

  if (!employee) return null;

  const { careerProgression } = employee;

  return (
    <div className="space-y-6">
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Career Progression & Readiness
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Transparent level expectations, objective criteria fulfillment, and succession paths
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            <User className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-600">Employee:</span>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {mockEmployees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Employee Summary Banner */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            {employee.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{employee.name}</h2>
              <Badge variant="purple">{employee.role}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Department: {employee.department} · Evaluating Manager: {employee.manager}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Step</span>
            <span className="text-xs font-bold text-slate-800">{careerProgression.currentRole}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Horizon</span>
            <span className="text-xs font-bold text-indigo-600">{careerProgression.potentialNextRole}</span>
          </div>
        </div>
      </div>

      {/* PROMOTION READINESS WIDGET & 9-CRITERIA CHECKLIST */}
      <PromotionReadinessWidget
        score={careerProgression.readinessScore}
        criteriaMetCount={careerProgression.criteriaMetCount}
        totalCriteriaCount={careerProgression.totalCriteriaCount}
        criteria={careerProgression.criteria}
        targetRole={careerProgression.potentialNextRole}
      />

      {/* VISUAL CAREER PROGRESSION LADDER */}
      <CareerLadder
        ladder={careerProgression.ladder}
        currentRole={careerProgression.currentRole}
        potentialNextRole={careerProgression.potentialNextRole}
      />
    </div>
  );
};
