import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { SkillItem } from '../../types';
import { Card, CardHeader, CardContent } from '../Common/Card';

interface SkillRadarProps {
  skills: SkillItem[];
  employeeName: string;
}

export const SkillRadar: React.FC<SkillRadarProps> = ({ skills, employeeName }) => {
  const radarData = skills.map(s => ({
    subject: s.name.length > 18 ? s.name.substring(0, 16) + '...' : s.name,
    fullName: s.name,
    current: s.current,
    required: s.required,
    gap: s.gap
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
          <p className="font-bold text-sm text-indigo-300">{data.fullName}</p>
          <div className="pt-1 border-t border-slate-700 space-y-0.5">
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Current Level:</span>
              <span className="font-bold text-indigo-400">{data.current} / 5.0</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Role Benchmark:</span>
              <span className="font-bold text-slate-300">{data.required} / 5.0</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-400">Competency Gap:</span>
              <span className={`font-bold ${data.gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {data.gap > 0 ? `-${data.gap}` : 'Exceeds target'}
              </span>
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
        title="Competency Radar & Level Mapping"
        subtitle={`Current validated capability vs target role expectations for ${employeeName}`}
      />
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 5]}
                tick={{ fill: '#94a3b8', fontSize: 9 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
              <Radar
                name="Current Validated Level"
                dataKey="current"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Radar
                name="Required Role Target"
                dataKey="required"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.15}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs text-center">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Strongest Competency</span>
            <span className="font-bold text-emerald-600 mt-0.5 block">Collaboration (4.8)</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Growth Area</span>
            <span className="font-bold text-amber-600 mt-0.5 block">System Design (2.9)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
