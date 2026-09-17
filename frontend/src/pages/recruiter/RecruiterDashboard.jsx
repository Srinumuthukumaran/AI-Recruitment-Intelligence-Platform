import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  Sparkles,
  BotMessageSquare,
  ArrowRight,
  ChevronRight,
  Award,
  Clock,
  UserCheck,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import matchService from '../../services/matchService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import MatchScoreBadge from '../../components/recruiter/MatchScoreBadge';

import { useAuth } from '../../context/AuthContext';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load recruiter dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading TalentIQ recruitment metrics..." />;
  }

  const statCards = [
    {
      title: 'Active Jobs',
      value: stats?.totalJobs ?? 0,
      icon: Briefcase,
      color: 'indigo',
      link: '/recruiter/jobs',
    },
    {
      title: 'Candidates',
      value: stats?.totalCandidates ?? 0,
      icon: Users,
      color: 'purple',
      link: '/recruiter/candidates',
    },
    {
      title: 'Pending Review',
      value: stats?.pendingSubmissions ?? 0,
      icon: Clock,
      color: 'amber',
      link: '/recruiter/candidates?status=SUBMITTED',
      highlight: (stats?.pendingSubmissions ?? 0) > 0,
    },
    {
      title: 'Matches Evaluated',
      value: stats?.totalMatches ?? 0,
      icon: CheckCircle2,
      color: 'emerald',
      link: '/recruiter/analytics',
    },
    {
      title: 'Avg Match Score',
      value: `${stats?.averageMatchScore ?? 0}%`,
      icon: TrendingUp,
      color: 'blue',
      link: '/recruiter/analytics',
    },
  ];


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Welcome back, {user?.name || 'SRINU'}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time AI matching, candidate ranking, and recruitment overview.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/recruiter/copilot"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            <BotMessageSquare className="w-4 h-4" />
            <span>AI Copilot</span>
          </Link>

          <Link
            to="/recruiter/jobs"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Job</span>
          </Link>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={loadDashboardData} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const isAmber = card.color === 'amber';
          return (
            <Link
              key={i}
              to={card.link}
              className={`glass-card glass-card-hover rounded-2xl p-4 sm:p-5 border flex flex-col justify-between transition-all ${
                card.highlight
                  ? 'border-amber-500/50 bg-amber-500/5 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isAmber
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                      : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    isAmber && card.highlight ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {card.value}
                </span>
                {isAmber && card.highlight && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                    Action Req.
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Candidate Submissions Awaiting Validation */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Recent Candidate Submissions</span>
                {(stats?.pendingSubmissions ?? 0) > 0 && (
                  <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {stats?.pendingSubmissions} Awaiting Review
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Resumes submitted directly by candidates from their portal awaiting recruiter validation
              </p>
            </div>
          </div>
          <Link
            to="/recruiter/candidates?status=SUBMITTED"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>View all submitted</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentSubmissions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-1">Candidate</th>
                  <th className="pb-3 px-3">Experience</th>
                  <th className="pb-3 px-3">Skills</th>
                  <th className="pb-3 px-3">Submitted At</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 pr-1 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {stats.recentSubmissions.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pl-1">
                      <div className="font-semibold text-slate-100">
                        {candidate.name || candidate.email?.split('@')[0]}
                      </div>
                      <div className="text-[11px] text-slate-400">{candidate.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {candidate.experience || 'Not specified'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {candidate.skills
                          ? candidate.skills
                              .split(',')
                              .slice(0, 3)
                              .map((s, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-medium bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/50"
                                >
                                  {s.trim()}
                                </span>
                              ))
                          : <span className="text-slate-500 italic">None listed</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {candidate.submittedAt
                        ? new Date(candidate.submittedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recently'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>Awaiting Validation</span>
                      </span>
                    </td>
                    <td className="py-3 pr-1 text-right">
                      <Link
                        to={`/recruiter/candidates/${candidate.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Review & Validate</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
            <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-200">No pending candidate submissions</p>
            <p className="text-xs text-slate-400 mt-1">
              All candidate resumes have been reviewed, or new candidates have not submitted yet.
            </p>
          </div>
        )}
      </div>

      {/* Quick Action Banner */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>TalentIQ Copilot Ready</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Need assistance evaluating candidates or generating interview questions?
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              Ask AI Recruiter Copilot questions about candidates, compare skills against job descriptions, or generate tailored interview questions.
            </p>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={() => navigate('/recruiter/copilot')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-colors shadow-sm"
            >
              Ask AI Copilot
            </button>
            <button
              onClick={() => navigate('/recruiter/interview')}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
            >
              Generate Questions
            </button>
          </div>
        </div>
      </div>

      {/* 2 Column Layout: Recent Jobs & Top Ranked Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Recent Job Postings</span>
            </h3>
            <Link
              to="/recruiter/jobs"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recentJobs?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/recruiter/jobs/${job.id}`}
                  className="block p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{job.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {job.location || 'Remote'} • {job.experience || 'Any Experience'}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      View Details
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {job.requiredSkills?.split(',').slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No jobs posted yet.{' '}
              <Link to="/recruiter/jobs" className="text-indigo-400 font-semibold underline">
                Create the first job
              </Link>
            </div>
          )}
        </div>

        {/* Top Candidates */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Top Ranked Candidates</span>
            </h3>
            <Link
              to="/recruiter/candidates"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.topCandidates?.length > 0 ? (
            <div className="space-y-3">
              {stats.topCandidates.map((match) => (
                <Link
                  key={match.id}
                  to={`/recruiter/candidates/${match.candidate?.id}`}
                  className="block p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">
                        {match.candidate?.name || match.candidate?.email?.split('@')[0]}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Matched to: {match.job?.title}
                      </p>
                    </div>
                    <MatchScoreBadge score={match.matchScore} size="sm" />
                  </div>
                  {match.strengths && (
                    <p className="mt-2 text-xs text-slate-300 line-clamp-1 italic">
                      "{match.strengths}"
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No candidate evaluations recorded yet.{' '}
              <Link to="/recruiter/candidates" className="text-indigo-400 font-semibold underline">
                Evaluate candidates
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
