import React, { useState } from 'react';
import { Target, Briefcase, MessageSquare, CheckCircle2, Clock, AlertCircle, FileText, Star, User } from 'lucide-react';
import { GoalItem, ProjectItem, FeedbackItem } from '../../types';
import { Card, CardHeader, CardContent } from '../Common/Card';
import { Badge } from '../Common/Badge';

interface EvidenceSectionProps {
  goals: GoalItem[];
  projects: ProjectItem[];
  feedback: FeedbackItem[];
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({
  goals,
  projects,
  feedback
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'goals' | 'projects' | 'feedback'>('all');

  const completedGoalsCount = goals.filter(g => g.status === 'Achieved' || g.status === 'Exceeded').length;
  const totalGoals = goals.length;
  const goalPercentage = Math.round((completedGoalsCount / (totalGoals || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Evidence Section Nav Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Objective Performance Evidence</h2>
          <p className="text-xs text-slate-500">Verifiable deliverables, project benchmarks, and 360 multi-rater feedback</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Evidence
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'goals' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Goals ({goals.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'projects' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'feedback' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Feedback ({feedback.length})
          </button>
        </div>
      </div>

      {/* GOALS SECTION */}
      {(activeTab === 'all' || activeTab === 'goals') && (
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Goals & Key Deliverables</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {completedGoalsCount} of {totalGoals} Completed
                </span>
              </div>
            }
            subtitle="Quantitative target attainment tracked against production metrics"
            action={
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${goalPercentage}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-800">{goalPercentage}%</span>
              </div>
            }
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map(goal => (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {goal.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                        {goal.title}
                      </h4>
                    </div>
                    <Badge
                      variant={
                        goal.status === 'Exceeded'
                          ? 'purple'
                          : goal.status === 'Achieved'
                          ? 'success'
                          : 'warning'
                      }
                      dot
                    >
                      {goal.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Target Goal</span>
                      <span className="font-semibold text-slate-700">{goal.target}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Actual Verified</span>
                      <span className="font-bold text-indigo-700">{goal.actual}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      <strong>Evidence:</strong> {goal.evidence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PROJECTS SECTION */}
      {(activeTab === 'all' || activeTab === 'projects') && (
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>Major Project Initiatives</span>
                <Badge variant="neutral" size="sm">
                  {projects.length} Verified Projects
                </Badge>
              </div>
            }
            subtitle="Scoped initiatives, technical roles, business impact, and deliverable artifacts"
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-2xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {project.name}
                      </h4>
                      <Badge
                        variant={
                          project.businessImpact === 'Critical'
                            ? 'danger'
                            : project.businessImpact === 'High'
                            ? 'purple'
                            : 'neutral'
                        }
                      >
                        {project.businessImpact} Impact
                      </Badge>
                    </div>

                    <p className="text-xs font-semibold text-indigo-600">
                      {project.role}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Outcome</span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {project.outcome}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Completion: <strong>{project.completion}%</strong></span>
                      <span>{project.duration}</span>
                    </div>

                    <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="truncate">Evidence: {project.evidence}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FEEDBACK SECTION */}
      {(activeTab === 'all' || activeTab === 'feedback') && (
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>Peer & Manager Feedback</span>
                <Badge variant="neutral" size="sm">
                  {feedback.length} Verified Reviews
                </Badge>
              </div>
            }
            subtitle="Qualitative 360 commentary mapped to competency skills and sentiment"
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedback.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.reviewerType === 'Manager'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : item.reviewerType === 'Cross-Functional'
                            ? 'bg-sky-100 text-sky-900 border border-sky-200'
                            : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                        }`}>
                          {item.reviewerType}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{item.reviewerName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{item.date}</span>
                    </div>

                    <blockquote className="text-xs text-slate-700 italic border-l-2 border-indigo-400 pl-3 py-1 leading-relaxed">
                      "{item.feedback}"
                    </blockquote>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Skills:</span>
                      {item.relatedSkills.map(skill => (
                        <span
                          key={skill}
                          className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <span className={`text-[10px] font-bold uppercase ${
                      item.sentiment === 'Positive' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
