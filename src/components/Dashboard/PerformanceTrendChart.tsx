import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { mockOrgPerformanceTrend } from '../../data/performance';
import { Card, CardHeader, CardContent } from '../Common/Card';

export const PerformanceTrendChart: React.FC = () => {
  const [activeCycle, setActiveCycle] = useState<string>('All');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5">
          <p className="font-bold text-sm text-indigo-300">Review Cycle: {label}</p>
          <div className="pt-1.5 border-t border-slate-700/80 space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Average Evidence Score:</span>
              <span className="font-bold text-emerald-400">{data.evidenceScore}%</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Goal Completion Rate:</span>
              <span className="font-bold text-indigo-300">{data.goalCompletionRate}%</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Avg Manager Rating:</span>
              <span className="font-bold text-white">{data.managerRatingAvg} / 5.0</span>
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
        title="Performance Trend"
        subtitle="Average verified performance evidence across review cycles"
        action={
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
            <span>+12.0% growth since 2024</span>
          </div>
        }
      />
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockOrgPerformanceTrend}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="evidenceScoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="goalRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="cycle" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} ticks={[60, 70, 80, 90, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="evidenceScore"
                name="Average Evidence Score"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#evidenceScoreGradient)"
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="goalCompletionRate"
                name="Goal Completion Rate"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#goalRateGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Multi-cycle milestones pills */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
          <div className="p-2 rounded-lg bg-slate-50">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">2024 Baseline</span>
            <p className="text-base font-extrabold text-slate-700 mt-0.5">71%</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-50">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">2025 Midpoint</span>
            <p className="text-base font-extrabold text-slate-700 mt-0.5">77%</p>
          </div>
          <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100">
            <span className="text-[10px] text-indigo-700 font-bold uppercase">2026 Current Cycle</span>
            <p className="text-base font-extrabold text-indigo-950 mt-0.5">83%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
