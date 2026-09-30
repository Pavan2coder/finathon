import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { mockScatterData, ScatterPoint } from '../../data/calibration';
import { Card, CardHeader, CardContent } from '../Common/Card';
import { Badge } from '../Common/Badge';

interface EvidenceVsRatingScatterProps {
  onSelectEmployee?: (employeeId: string) => void;
  onOpenAlert?: (alertId: string) => void;
}

export const EvidenceVsRatingScatter: React.FC<EvidenceVsRatingScatterProps> = ({
  onSelectEmployee,
  onOpenAlert
}) => {
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [hoveredPoint, setHoveredPoint] = useState<ScatterPoint | null>(null);

  const filteredData = filterDepartment === 'All'
    ? mockScatterData
    : mockScatterData.filter(d => d.department === filterDepartment);

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ScatterPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs min-w-56 space-y-1.5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5">
            <span className="font-bold text-sm text-indigo-300">{data.name}</span>
            <Badge variant={data.isAlert ? (data.varianceType === 'under_rated' ? 'warning' : 'danger') : 'success'}>
              {data.isAlert ? (data.varianceType === 'under_rated' ? 'Strict Divergence' : 'Leniency Divergence') : 'Aligned'}
            </Badge>
          </div>

          <p className="text-slate-300">{data.role} · <span className="text-slate-400">{data.department}</span></p>
          <p className="text-slate-400">Evaluating Manager: <span className="text-slate-200 font-medium">{data.manager}</span></p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/80">
            <div className="p-1.5 bg-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block">Evidence Score</span>
              <span className="text-sm font-bold text-emerald-400">{data.evidenceScore}%</span>
            </div>
            <div className="p-1.5 bg-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block">Manager Rating</span>
              <span className="text-sm font-bold text-indigo-300">{data.managerRating} / 5.0</span>
            </div>
          </div>

          <p className="text-[10px] text-indigo-300 font-medium pt-1">
            Click to view calibration details
          </p>
        </div>
      );
    }
    return null;
  };

  const handlePointClick = (point: ScatterPoint) => {
    if (onSelectEmployee) {
      onSelectEmployee(point.id);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Evidence Score vs Manager Evaluation Rating"
        subtitle="Scatter matrix identifying deviations from expected cohort correlation"
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2 hidden sm:flex">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>Strict Inconsistency</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block ml-2" />
              <span>Leniency Inconsistency</span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block ml-2" />
              <span>Normal Alignment</span>
            </div>

            <select
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        }
      />
      <CardContent>
        <div className="h-80 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                dataKey="evidenceScore"
                name="Evidence Score"
                unit="%"
                domain={[65, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Objective Performance Evidence Score (%)', position: 'bottom', offset: 0, fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                type="number"
                dataKey="managerRating"
                name="Manager Rating"
                domain={[2.5, 5.2]}
                ticks={[3.0, 3.5, 4.0, 4.5, 5.0]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Manager Qualitative Rating (1–5)', angle: -90, position: 'left', offset: 20, fontSize: 11, fill: '#94a3b8' }}
              />
              <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />

              {/* Reference expectation band */}
              <ReferenceLine y={4.0} stroke="#e2e8f0" strokeDasharray="4 4" label={{ value: 'Nominal Expectation Band', fill: '#94a3b8', fontSize: 10, position: 'right' }} />

              <Scatter
                name="Employees"
                data={filteredData}
                onClick={(entry: any) => handlePointClick(entry)}
                cursor="pointer"
              >
                {filteredData.map(entry => {
                  let fillColor = '#6366f1'; // Normal aligned
                  if (entry.isAlert && entry.varianceType === 'under_rated') {
                    fillColor = '#f59e0b'; // Amber - high evidence, low rating (e.g. Rahul Sharma)
                  } else if (entry.isAlert && entry.varianceType === 'over_rated') {
                    fillColor = '#f43f5e'; // Rose - leniency bias (e.g. Priya Nair)
                  }
                  return (
                    <Cell
                      key={entry.id}
                      fill={fillColor}
                      stroke="#ffffff"
                      strokeWidth={2}
                      r={entry.isAlert ? 8 : 6}
                      className="transition-all hover:scale-125"
                    />
                  );
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Highlight callouts below chart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900">High Evidence / Low Rating Cohort</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Notice <strong>Rahul Sharma</strong> (90% evidence / 3.1 rating) and <strong>Vikram Malhotra</strong> (88% evidence / 3.4 rating) both evaluated by Anil Kumar.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200/80 flex items-start gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
            <div>
              <p className="font-semibold text-rose-900">Leniency Divergence Cohort</p>
              <p className="text-rose-800 text-[11px] mt-0.5">
                Notice <strong>Priya Nair</strong> (74% evidence / 4.9 rating) evaluated by Kiran Rao, reflecting a wide positive variance gap.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
