import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { mockDepartmentAchievements } from '../../data/performance';
import { Card, CardHeader, CardContent } from '../Common/Card';

export const GoalAchievementChart: React.FC = () => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700">
          <p className="font-bold text-sm text-indigo-300">{data.department}</p>
          <div className="pt-1 border-t border-slate-700/80 space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Goal Achievement:</span>
              <span className="font-bold text-emerald-400">{data.goalAchievement}%</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Avg Evidence Score:</span>
              <span className="font-bold text-white">{data.evidenceAvg}%</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Reviews Completed:</span>
              <span className="font-semibold text-slate-300">{data.reviewCompletionRate}%</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Department Size:</span>
              <span className="text-slate-300">{data.headcount} employees</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Department Goal Achievement"
        subtitle="Objective milestone completion across operational units"
      />
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockDepartmentAchievements}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="department"
                tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                width={85}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="goalAchievement" radius={[0, 6, 6, 0]} maxBarSize={22}>
                {mockDepartmentAchievements.map((entry, index) => {
                  const colors = ['#4f46e5', '#6366f1', '#818cf8', '#0ea5e9', '#06b6d4'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Highest: <strong className="text-slate-800">Sales (89%)</strong></span>
          <span>Lowest: <strong className="text-slate-800">Marketing (81%)</strong></span>
          <span>Org Average: <strong className="text-indigo-600">85.6%</strong></span>
        </div>
      </CardContent>
    </Card>
  );
};
