import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { mockManagerPatterns } from '../../data/calibration';
import { Card, CardHeader, CardContent } from '../Common/Card';
import { Info } from 'lucide-react';

export const ManagerDistributionChart: React.FC = () => {
  const [metricView, setMetricView] = useState<'ratings' | 'pctFourPlus'>('ratings');

  const chartData = mockManagerPatterns.map(m => ({
    name: m.managerName,
    avg: m.averageRating,
    median: m.medianRating,
    pctFourPlus: m.pctRatedFourPlus,
    variance: m.ratingVariance,
    evidenceAvg: (m.avgEvidenceScore / 20).toFixed(2), // normalize 0-100 to 0-5 scale for visual comparison
    tendency: m.tendency,
    teamSize: m.teamSize
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1.5 border border-slate-700">
          <p className="font-bold text-sm text-indigo-300">{label}</p>
          <p className="text-slate-300">Team Size: <span className="font-semibold text-white">{data.teamSize} direct reports</span></p>
          <div className="pt-1 border-t border-slate-700/80 space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Average Rating:</span>
              <span className="font-semibold text-white">{data.avg} / 5.0</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Median Rating:</span>
              <span className="font-semibold text-white">{data.median} / 5.0</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">% Rated 4.0+:</span>
              <span className="font-semibold text-amber-400">{data.pctFourPlus}%</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Rating Variance:</span>
              <span className="font-semibold text-white">{data.variance}</span>
            </p>
          </div>
          <div className="pt-1 border-t border-slate-700/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tendency Pattern</span>
            <span className={`font-semibold ${
              data.tendency.includes('Strict') ? 'text-amber-400' :
              data.tendency.includes('Lenient') ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {data.tendency}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader
        title="Manager Rating Distribution & Tendency"
        subtitle="Identifies systemic rating divergence across evaluating leaders"
        action={
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setMetricView('ratings')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                metricView === 'ratings'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ratings (1–5)
            </button>
            <button
              onClick={() => setMetricView('pctFourPlus')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                metricView === 'pctFourPlus'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              % Rated 4+
            </button>
          </div>
        }
      />
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {metricView === 'ratings' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="avg" name="Average Rating" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="median" name="Median Rating" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="evidenceAvg" name="Evidence Avg (Scaled)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="pctFourPlus" name="% of Team Rated 4.0 or Above" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Manager comparative summary pill list */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          {mockManagerPatterns.map(m => (
            <div key={m.managerId} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <p className="font-semibold text-slate-800 truncate">{m.managerName}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Avg: <strong>{m.averageRating}</strong></span>
                <span>4+: <strong>{m.pctRatedFourPlus}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
