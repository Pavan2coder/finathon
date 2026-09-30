import React, { useState, useEffect } from 'react';
import { User, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { Employee, SkillItem } from '../types';
import { mockEmployees } from '../data/employees';
import { SkillRadar } from '../components/Skills/SkillRadar';
import { SkillGapTable } from '../components/Skills/SkillGapTable';
import { DevelopmentPlanCards } from '../components/Skills/DevelopmentPlanCards';
import { Button } from '../components/Common/Button';
import { Modal } from '../components/Common/Modal';
import { useToast } from '../components/Common/Toast';

export const SkillsPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedEmpId, setSelectedEmpId] = useState<string>('emp-01');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollingSkill, setEnrollingSkill] = useState<SkillItem | null>(null);

  useEffect(() => {
    loadEmployeeSkills(selectedEmpId);
  }, [selectedEmpId]);

  const loadEmployeeSkills = async (id: string) => {
    const emp = await api.getEmployee(id);
    setEmployee(emp || mockEmployees[0]);
  };

  const handleEnrollClick = (skill: SkillItem) => {
    setEnrollingSkill(skill);
    setIsEnrollModalOpen(true);
  };

  const handleConfirmEnrollment = () => {
    setIsEnrollModalOpen(false);
    showToast({
      title: 'Training registration confirmed',
      message: `Enrolled ${employee?.name} in "${enrollingSkill?.recommendedAction}". Plan added to development queue.`,
      type: 'success'
    });
  };

  if (!employee) return null;

  return (
    <div className="space-y-6">
      {/* Header & Employee Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Skills & Development
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Competency radar mapping, role expectation gap analysis, and tailored training plans
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

      {/* Selected Employee Context Pill */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
            {employee.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{employee.name}</h2>
              <span className="text-xs text-indigo-300 font-medium">{employee.role}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Department: {employee.department} · Evaluating Manager: {employee.manager}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Skills</span>
            <span className="font-extrabold text-emerald-400 text-base">{employee.skills.length} Competencies</span>
          </div>
          <div className="border-l border-slate-700 pl-4 text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Skill Growth Score</span>
            <span className="font-extrabold text-indigo-300 text-base">{employee.summary.skillGrowth}%</span>
          </div>
        </div>
      </div>

      {/* Competency Radar Chart & Quick Gap Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <SkillRadar skills={employee.skills} employeeName={employee.name} />
        </div>

        {/* Competency Scorecard summary */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Primary Skill Breakdown
              </span>
              <span className="text-xs text-slate-400">Current vs Required (5.0 Scale)</span>
            </div>

            <div className="space-y-3">
              {employee.skills.slice(0, 4).map((skill: SkillItem) => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{skill.name}</span>
                    <span className="text-slate-600">
                      <strong>{skill.current}</strong> / {skill.required}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${(skill.current / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* L&D Curriculum integration info */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3 text-xs leading-relaxed text-indigo-900">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">L&D Competency Integration</p>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                Identified skill gaps automatically link to specialized enterprise learning tracks and mentored stretch projects.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DEVELOPMENT GAP ANALYSIS TABLE */}
      <div>
        <SkillGapTable
          skills={employee.skills}
          onOpenTraining={handleEnrollClick}
        />
      </div>

      {/* ACTIVE DEVELOPMENT PLAN CARDS */}
      <div>
        <DevelopmentPlanCards
          plans={employee.developmentPlan}
          employeeName={employee.name}
        />
      </div>

      {/* Enrollment Modal */}
      {enrollingSkill && (
        <Modal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          title="Enroll in Recommended Action Plan"
          subtitle={`Curriculum for ${enrollingSkill.name}`}
          footer={
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsEnrollModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmEnrollment}>
                Confirm Enrollment
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Course / Initiative</span>
              <p className="font-bold text-slate-900 mt-0.5">{enrollingSkill.recommendedAction}</p>
              <p className="text-xs text-slate-500 mt-1">Addresses skill gap of -{enrollingSkill.gap} points to achieve role benchmark (4.0).</p>
            </div>

            <p className="text-xs text-slate-600">
              Upon confirmation, this training module will be registered to {employee.name}'s active development plans with assigned mentoring checkpoints.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
