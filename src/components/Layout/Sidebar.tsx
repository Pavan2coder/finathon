import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Sparkles,
  GitBranch,
  Scale,
  FileText,
  Settings,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../Common/Badge';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', path: '/employees', icon: Users, badge: '20' },
    { name: 'Performance', path: '/performance', icon: BarChart3 },
    { name: 'Skills & Development', path: '/skills', icon: Sparkles },
    { name: 'Career Paths', path: '/career', icon: GitBranch },
    { name: 'Calibration', path: '/calibration', icon: Scale, badge: '12', badgeVariant: 'warning' as const, highlight: true },
    { name: 'Reports', path: '/reports', icon: FileText }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-2xs lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/30">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white tracking-tight">EvalSense</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Performance Intelligence</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Intelligence Engine
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  } ${item.highlight && !isActive ? 'hover:bg-amber-950/20' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeVariant === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="pt-5 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            System & Calibration
          </div>

          <NavLink
            to="/settings"
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`
            }
          >
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
            <span>Settings & Rules</span>
          </NavLink>
        </div>

        {/* Calibration Protocol Notice */}
        <div className="mx-3 mb-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Evidence Guard active</p>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                Evaluation calibration flags highlight rating variance, not individual ranking.
              </p>
            </div>
          </div>
        </div>

        {/* Current User footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                ER
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">Elena Rostova</p>
                <p className="text-[10px] text-slate-400 truncate">HR Calibration Director</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
};
