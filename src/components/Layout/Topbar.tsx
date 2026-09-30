import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  User,
  FolderGit2,
  Cpu,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  X
} from 'lucide-react';
import { mockEmployees } from '../../data/employees';
import { Badge } from '../Common/Badge';

interface TopbarProps {
  onMobileMenuOpen: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter employees, projects, and skills based on search
  const q = searchQuery.toLowerCase().trim();

  const matchingEmployees = q
    ? mockEmployees.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchingProjects = q
    ? mockEmployees
        .flatMap(e => e.projects.map(p => ({ ...p, employeeName: e.name, employeeId: e.id })))
        .filter(p => p.name.toLowerCase().includes(q) || p.outcome.toLowerCase().includes(q))
        .slice(0, 3)
    : [];

  const matchingSkills = q
    ? ['System Design', 'Technical Execution', 'Python / Distributed Systems', 'Leadership & Mentorship', 'Causal Inference', 'Accessibility']
        .filter(s => s.toLowerCase().includes(q))
        .slice(0, 3)
    : [];

  const hasResults = matchingEmployees.length > 0 || matchingProjects.length > 0 || matchingSkills.length > 0;

  const handleSelectEmployee = (id: string) => {
    navigate(`/employees/${id}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const notifications = [
    {
      id: 'notif-1',
      title: '3 calibration alerts require committee review',
      detail: 'High divergence detected for Rahul Sharma (-1.1) and Priya Nair (+1.2)',
      time: '15m ago',
      type: 'warning',
      actionUrl: '/calibration'
    },
    {
      id: 'notif-2',
      title: '12 performance reviews finalized',
      detail: 'Engineering and Product department evaluations submitted',
      time: '1h ago',
      type: 'success',
      actionUrl: '/dashboard'
    },
    {
      id: 'notif-3',
      title: '5 employees updated development plans',
      detail: 'Milestone progress logged in distributed systems & research tracks',
      time: '3h ago',
      type: 'info',
      actionUrl: '/skills'
    }
  ];

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile menu trigger & cycle indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="purple" size="md">
            Cycle H1-2026 Active
          </Badge>
          <span className="text-xs text-slate-400 font-medium">Calibration Stage</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-lg relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search employees, projects, or skills (e.g. Rahul, Payment, System Design)..."
            className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-lg pl-9 pr-8 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Instant Search Suggestions Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            {hasResults ? (
              <div className="p-2 space-y-3 max-h-96 overflow-y-auto">
                {/* Employees section */}
                {matchingEmployees.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-indigo-500" />
                      Employees
                    </div>
                    {matchingEmployees.map(emp => (
                      <div
                        key={emp.id}
                        onClick={() => handleSelectEmployee(emp.id)}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center">
                            {emp.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{emp.name}</p>
                            <p className="text-xs text-slate-500">{emp.role} · {emp.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {emp.evidenceScore}% Evid.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects section */}
                {matchingProjects.length > 0 && (
                  <div className="border-t border-slate-100 pt-2">
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FolderGit2 className="w-3 h-3 text-sky-500" />
                      Projects
                    </div>
                    {matchingProjects.map(proj => (
                      <div
                        key={proj.id}
                        onClick={() => handleSelectEmployee(proj.employeeId)}
                        className="p-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-900">{proj.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{proj.outcome} · Contributor: {proj.employeeName}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills section */}
                {matchingSkills.length > 0 && (
                  <div className="border-t border-slate-100 pt-2">
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-violet-500" />
                      Skills & Competencies
                    </div>
                    {matchingSkills.map(skill => (
                      <div
                        key={skill}
                        onClick={() => {
                          navigate('/skills');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="text-sm text-slate-800">{skill}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">
                No matching employees, projects, or skills found for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Topbar Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications & Alerts</span>
                <span className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer">Mark all read</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      navigate(n.actionUrl);
                      setIsNotificationsOpen(false);
                    }}
                    className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3"
                  >
                    {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                    {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                    {n.type === 'info' && <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />}

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.detail}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                <button
                  onClick={() => {
                    navigate('/calibration');
                    setIsNotificationsOpen(false);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  View Calibration Queue →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current User avatar button */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-slate-100">
            ER
          </div>
          <span className="hidden md:inline text-xs font-semibold text-slate-700">Elena R.</span>
        </div>
      </div>
    </header>
  );
};
