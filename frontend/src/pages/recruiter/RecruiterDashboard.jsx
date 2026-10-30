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
  Activity,
  Layers,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import jobService from '../../services/jobService';
import matchService from '../../services/matchService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import MatchScoreBadge, { RadialScoreRing } from '../../components/recruiter/MatchScoreBadge';
import { useAuth } from '../../context/AuthContext';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, matchesData] = await Promise.all([
        dashboardService.getStats(),
        matchService.getAllMatches().catch(() => []),
      ]);
      setStats(statsData);
      setAllMatches(matchesData || []);
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
    return <LoadingSpinner message="Loading TalentIQ recruitment metrics and candidate rankings..." />;
  }

  // Greeting by time of day
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const recruiterName = user?.name || 'Recruiter';

  // Real KPI calculations from backend
  const totalJobs = stats?.totalJobs ?? 0;
  const totalCandidates = stats?.totalCandidates ?? 0;
  const totalMatches = stats?.totalMatches ?? 0;
  const avgMatchScore = stats?.averageMatchScore ?? 0;
  const pendingSubmissions = stats?.pendingSubmissions ?? 0;
  const validatedCandidates = stats?.validatedCandidates ?? 0;

  // Real Score Distribution Breakdown from matches
  const excellentCount = allMatches.filter((m) => (m.matchScore || 0) >= 90).length;
  const strongCount = allMatches.filter((m) => (m.matchScore || 0) >= 80 && (m.matchScore || 0) < 90).length;
  const goodCount = allMatches.filter((m) => (m.matchScore || 0) >= 70 && (m.matchScore || 0) < 80).length;
  const moderateCount = allMatches.filter((m) => (m.matchScore || 0) < 70).length;
  const totalEvaluated = allMatches.length || 1;

  // Extract frequently required skills from recent jobs
  const skillFrequency = {};
  if (stats?.recentJobs) {
    stats.recentJobs.forEach((job) => {
      if (job.requiredSkills) {
        job.requiredSkills.split(/[,;]+/).forEach((raw) => {
          const s = raw.trim();
          if (s.length > 1) {
            skillFrequency[s] = (skillFrequency[s] || 0) + 1;
          }
        });
      }
    });
  }
  const topInDemandSkills = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const kpiCards = [
    {
      title: 'Active Jobs',
      value: totalJobs,
      sublabel: 'Open positions in pipeline',
      icon: Briefcase,
      color: 'purple',
      link: '/recruiter/jobs',
      badge: 'Active Listings',
    },
    {
      title: 'Total Candidates',
      value: totalCandidates,
      sublabel: 'Applicants in talent pool',
      icon: Users,
      color: 'sky',
      link: '/recruiter/candidates',
      badge: 'Registered',
    },
    {
      title: 'Pending Review',
      value: pendingSubmissions,
      sublabel: 'Submissions awaiting validation',
      icon: Clock,
      color: 'amber',
      link: '/recruiter/candidates?status=SUBMITTED',
      highlight: pendingSubmissions > 0,
      badge: pendingSubmissions > 0 ? 'Action Needed' : 'All Clear',
    },
    {
      title: 'Matches Evaluated',
      value: totalMatches,
      sublabel: 'AI resume-to-job evaluations',
      icon: CheckCircle2,
      color: 'emerald',
      link: '/recruiter/analytics',
      badge: 'Processed',
    },
    {
      title: 'Avg Match Score',
      value: `${avgMatchScore}%`,
      sublabel: 'Mean candidate alignment',
      icon: TrendingUp,
      color: 'violet',
      link: '/recruiter/analytics',
      badge: 'Score Mean',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Recruitment Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {timeGreeting}, {recruiterName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Here is your real-time recruitment activity, candidate ranking intelligence, and pipeline status at a glance.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto flex-shrink-0">
          <Link
            to="/recruiter/copilot"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#121A2B] hover:bg-[#172238] text-white border border-white/[0.08] hover:border-purple-500/40 transition-all shadow-sm"
          >
            <BotMessageSquare className="w-4 h-4 text-purple-400" />
            <span>Ask Copilot</span>
          </Link>

          <Link
            to="/recruiter/jobs"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={loadDashboardData} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          const isAmber = card.color === 'amber';
          return (
            <Link
              key={i}
              to={card.link}
              className={`glass-card glass-card-hover rounded-2xl p-5 border flex flex-col justify-between transition-all group ${
                card.highlight
                  ? 'border-amber-500/50 bg-amber-500/[0.06] shadow-lg shadow-amber-500/10'
                  : 'border-white/[0.08] bg-[#121A2B]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    card.highlight
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <div
                  className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    card.highlight ? 'text-amber-400' : 'text-white'
                  }`}
                >
                  {card.value}
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span className="truncate">{card.sublabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 flex-shrink-0" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Candidate Submissions Awaiting Validation Banner/Table */}
      <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Recent Candidate Submissions</span>
                {pendingSubmissions > 0 && (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {pendingSubmissions} Awaiting Review
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Resumes uploaded by applicants awaiting recruiter verification and interview shortlisting
              </p>
            </div>
          </div>

          <Link
            to="/recruiter/candidates?status=SUBMITTED"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>View all submissions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentSubmissions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-1">Candidate</th>
                  <th className="pb-3 px-3">Submitted Resume</th>
                  <th className="pb-3 px-3">Submission Timestamp</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 pr-1 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {stats.recentSubmissions.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pl-1">
                      <div className="font-semibold text-white">
                        {candidate.name || candidate.email?.split('@')[0]}
                      </div>
                      <div className="text-[11px] text-slate-400">{candidate.email}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        PDF Parsed
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {candidate.submittedAt
                        ? new Date(candidate.submittedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recently'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>Awaiting Review</span>
                      </span>
                    </td>
                    <td className="py-3.5 pr-1 text-right">
                      <Link
                        to={`/recruiter/candidates/${candidate.id}`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm transition-all"
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
          <div className="text-center py-8 rounded-xl border border-dashed border-white/[0.08] bg-black/20">
            <CheckCircle2 className="w-8 h-8 text-emerald-400/70 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No pending candidate submissions</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All candidate resumes have been reviewed, or new applicants have not submitted yet.
            </p>
          </div>
        )}
      </div>

      {/* Analytics Area: Hiring Funnel + Score Distribution + In-Demand Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Match Score Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Score Distribution</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tiered alignment across evaluated pool</p>
            </div>
            <Link to="/recruiter/analytics" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
              Details
            </Link>
          </div>

          <div className="space-y-3.5 pt-1">
            {/* 90-100% */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-400">Excellent (90–100%)</span>
                <span className="text-white">
                  {excellentCount} ({Math.round((excellentCount / totalEvaluated) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${(excellentCount / totalEvaluated) * 100}%` }}
                />
              </div>
            </div>

            {/* 80-89% */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-sky-400">Strong (80–89%)</span>
                <span className="text-white">
                  {strongCount} ({Math.round((strongCount / totalEvaluated) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-700"
                  style={{ width: `${(strongCount / totalEvaluated) * 100}%` }}
                />
              </div>
            </div>

            {/* 70-79% */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-400">Good (70–79%)</span>
                <span className="text-white">
                  {goodCount} ({Math.round((goodCount / totalEvaluated) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${(goodCount / totalEvaluated) * 100}%` }}
                />
              </div>
            </div>

            {/* <70% */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-purple-400">Moderate (&lt;70%)</span>
                <span className="text-white">
                  {moderateCount} ({Math.round((moderateCount / totalEvaluated) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${(moderateCount / totalEvaluated) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recruitment Pipeline Funnel */}
        <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Hiring Pipeline Stages</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Progression through recruitment lifecycle</p>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="p-3 rounded-xl bg-[#172238]/60 border border-white/[0.05] flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">1. Total Ingested Candidates</span>
                <span className="text-[11px] text-slate-400">Directory profiles</span>
              </div>
              <span className="font-extrabold text-sm text-purple-400">{totalCandidates}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#172238]/60 border border-white/[0.05] flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">2. Verified / Validated Resumes</span>
                <span className="text-[11px] text-slate-400">Accepted into recruiter pool</span>
              </div>
              <span className="font-extrabold text-sm text-sky-400">{validatedCandidates}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#172238]/60 border border-white/[0.05] flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white block">3. Evaluated Matches</span>
                <span className="text-[11px] text-slate-400">AI job comparison runs</span>
              </div>
              <span className="font-extrabold text-sm text-emerald-400">{totalMatches}</span>
            </div>
          </div>
        </div>

        {/* Most In-Demand Skills Across Active Jobs */}
        <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>In-Demand Technical Skills</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Most required competencies across open jobs</p>
          </div>

          {topInDemandSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {topInDemandSkills.map(([skill, count], idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/25"
                >
                  <span>{skill}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/30 text-white">
                    {count} {count === 1 ? 'job' : 'jobs'}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 pt-2">
              Post job openings with required skills to see competency frequency metrics.
            </p>
          )}

          <div className="pt-2 text-xs text-slate-400">
            <span>Tip: Ask Copilot to match candidates against specific required skills.</span>
          </div>
        </div>
      </div>

      {/* 2 Column Layout: Recent Jobs & Top Ranked Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>Recent Job Postings</span>
            </h3>
            <Link
              to="/recruiter/jobs"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <span>View all ({totalJobs})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recentJobs?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/recruiter/jobs/${job.id}`}
                  className="block p-4 rounded-xl border border-white/[0.06] bg-[#172238]/60 hover:border-purple-500/40 hover:bg-[#172238] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{job.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {job.location || 'Remote'} • {job.experience || 'Any Experience'}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/15 px-2.5 py-0.5 rounded-lg border border-purple-500/25">
                      Rankings
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {job.requiredSkills?.split(',').slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium bg-black/40 text-slate-300 px-2 py-0.5 rounded-md border border-white/[0.06]"
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
              <Link to="/recruiter/jobs" className="text-purple-400 font-semibold underline">
                Create the first job opening
              </Link>
            </div>
          )}
        </div>

        {/* Top Candidates */}
        <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Top Ranked Candidate Matches</span>
            </h3>
            <Link
              to="/recruiter/candidates"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1"
            >
              <span>View all candidates</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.topCandidates?.length > 0 ? (
            <div className="space-y-3">
              {stats.topCandidates.map((match) => (
                <Link
                  key={match.id}
                  to={`/recruiter/candidates/${match.candidate?.id}?jobId=${match.job?.id}`}
                  className="block p-4 rounded-xl border border-white/[0.06] bg-[#172238]/60 hover:border-purple-500/40 hover:bg-[#172238] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {match.candidate?.name || match.candidate?.email?.split('@')[0]}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Matched to: <span className="text-slate-300 font-medium">{match.job?.title}</span>
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
              <Link to="/recruiter/candidates" className="text-purple-400 font-semibold underline">
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
