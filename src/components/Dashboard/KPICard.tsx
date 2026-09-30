import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../Common/Card';

export interface KPICardProps {
  title: string;
  value: string | number;
  subvalue?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subvalue,
  trend,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
  onClick
}) => {
  return (
    <Card
      hoverable={!!onClick}
      className={`p-5 transition-all ${onClick ? 'cursor-pointer hover:border-indigo-300' : ''}`}
    >
      <div onClick={onClick} className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
            {subvalue && (
              <span className="text-xs font-medium text-slate-400">
                {subvalue}
              </span>
            )}
          </div>

          {trend && (
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span className={trend.isPositive ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                {trend.value}
              </span>
              {trend.label && <span className="text-slate-400">{trend.label}</span>}
            </div>
          )}
        </div>

        <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
      </div>
    </Card>
  );
};
