import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { DepartmentAchievement } from '../data/performance';
import { PerformanceTrendChart } from '../components/Dashboard/PerformanceTrendChart';
import { GoalAchievementChart } from '../components/Dashboard/GoalAchievementChart';
import { Card, CardHeader } from '../components/Common/Card';
import { Badge } from '../components/Common/Badge';
import { Button } from '../components/Common/Button';

export const PerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentAchievement[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const d = await api.getDepartmentAchievements();
    setDepartments(d);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Performance Intelligence Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregate goal completion, quantitative deliverables, and multi-cycle growth trends
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            Cycle H1-2026 Live
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/calibration')}
          >
            Review Inconsistencies →
          </Button>
        </div>
      </div>

      {/* Cycle Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Review Cycle</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">H1-2026 Evaluation</p>
          <span className="text-xs text-indigo-600 font-medium mt-1 block">Active calibration phase</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Deliverables Logged</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">1,240 Artifacts</p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">100% verified via telemetry</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Evaluation Signoffs</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">231 of 248</p>
          <span className="text-xs text-slate-500 mt-1 block">93.1% submitted</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Average Evidence Score</span>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">82.6%</p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">+5.6% vs 2025</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <PerformanceTrendChart />
        </div>
        <div className="lg:col-span-5">
          <GoalAchievementChart />
        </div>
      </div>

      {/* Department Breakdown Table */}
      <Card>
        <CardHeader
          title="Department Evidence & Milestone Audit"
          subtitle="Breakdown of goal achievement and review finalization by business unit"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Goal Achievement</th>
                <th className="py-3 px-4">Average Evidence</th>
                <th className="py-3 px-4">Review Completion</th>
                <th className="py-3 px-4 text-right">Roster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {dept.department}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {dept.headcount} employees
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{dept.goalAchievement}%</span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${dept.goalAchievement}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-indigo-600">
                    {dept.evidenceAvg}%
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={dept.reviewCompletionRate >= 90 ? 'success' : 'warning'}>
                      {dept.reviewCompletionRate}% Completed
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate('/employees')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Team →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
