import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { PerformanceTrendPoint } from '../../types';
import { Card, CardHeader, CardContent } from '../Common/Card';

interface EmployeePerformanceChartProps {
  trend: PerformanceTrendPoint[];
  employeeName: string;
}

export const EmployeePerformanceChart: React.FC<EmployeePerformanceChartProps> = ({
  trend,
  employeeName
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-48">
          <p className="font-bold text-sm text-indigo-300">Review Cycle: {label}</p>
          <div className="pt-1.5 border-t border-slate-700/80 space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Verified Evidence:</span>
              <span className="font-bold text-indigo-400">{data.evidenceScore}%</span>
            </p>
            {data.peerScore && (
              <p className="flex justify-between gap-4">
                <span className="text-slate-400">Peer Feedback Score:</span>
                <span className="font-bold text-emerald-400">{data.peerScore}%</span>
              </p>
            )}
            {data.departmentAverage && (
              <p className="flex justify-between gap-4">
                <span className="text-slate-400">Department Avg:</span>
                <span className="font-semibold text-slate-300">{data.departmentAverage}%</span>
              </p>
            )}
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Manager Rating:</span>
              <span className="font-bold text-amber-400">{data.managerRating} / 5.0</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader
        title="Multi-Cycle Performance Trajectory"
        subtitle={`Historical evidence scores vs department benchmarks for ${employeeName}`}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Upward Growth Trend (+12% over 5 cycles)
            </span>
          </div>
        }
      />
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="cycle" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[65, 100]} ticks={[70, 80, 90, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              <Line
                type="monotone"
                dataKey="evidenceScore"
                name="Evidence Score"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 5, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />

              <Line
                type="monotone"
                dataKey="peerScore"
                name="Peer 360 Score"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 4, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }}
              />

              <Line
                type="monotone"
                dataKey="departmentAverage"
                name="Department Benchmark"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
