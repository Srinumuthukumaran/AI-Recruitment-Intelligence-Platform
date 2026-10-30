import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Layers,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import matchService from '../../services/matchService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import MatchScoreBadge from '../../components/recruiter/MatchScoreBadge';
import { Link } from 'react-router-dom';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, matchesData] = await Promise.all([
          dashboardService.getStats(),
          matchService.getAllMatches(),
        ]);
        setStats(statsData);
        setAllMatches(matchesData || []);
      } catch (err) {
        setError(err.message || 'Failed to load recruitment analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating recruitment pipeline metrics and distribution..." />;
  }

  // Distribution calculations
  const total = allMatches.length;
  const excellent = allMatches.filter((m) => (m.matchScore || 0) >= 90).length;
  const strong = allMatches.filter((m) => (m.matchScore || 0) >= 80 && (m.matchScore || 0) < 90).length;
  const good = allMatches.filter((m) => (m.matchScore || 0) >= 70 && (m.matchScore || 0) < 80).length;
  const moderate = allMatches.filter((m) => (m.matchScore || 0) < 70).length;

  const getPercent = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.08]">
        <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          <span>Talent Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>Recruitment Analytics & Insights</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Quantitative overview of candidate qualification distribution, average scores, and match trends across all open jobs.
        </p>
      </div>

      <ErrorAlert message={error} />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/[0.08] bg-[#121A2B]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Evaluated
          </span>
          <div className="text-3xl font-black text-white mt-2">{total}</div>
          <span className="text-xs text-purple-400 mt-1 block font-medium">Candidates matched with AI</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/[0.08] bg-[#121A2B]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Average Score
          </span>
          <div className="text-3xl font-black text-white mt-2">
            {stats?.averageMatchScore ?? 0}%
          </div>
          <span className="text-xs text-sky-400 mt-1 block font-medium">Mean alignment score</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/[0.08] bg-[#121A2B]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Top Tier (80%+)
          </span>
          <div className="text-3xl font-black text-white mt-2">
            {excellent + strong}
          </div>
          <span className="text-xs text-emerald-400 mt-1 block font-medium">
            {getPercent(excellent + strong)}% of evaluated pool
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/[0.08] bg-[#121A2B]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Job Openings
          </span>
          <div className="text-3xl font-black text-white mt-2">
            {stats?.totalJobs ?? 0}
          </div>
          <span className="text-xs text-amber-400 mt-1 block font-medium">Positions actively recruiting</span>
        </div>
      </div>

      {/* Score Tier Breakdown Visualizer */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] bg-[#121A2B] space-y-6">
        <div>
          <h3 className="text-base font-bold text-white">Candidate Match Tier Distribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Categorized across the 4 standard TalentIQ evaluation brackets.
          </p>
        </div>

        <div className="space-y-4">
          {/* Excellent */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-400">Excellent Match (90–100%)</span>
              <span className="text-white">
                {excellent} candidates ({getPercent(excellent)}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${getPercent(excellent)}%` }}
              />
            </div>
          </div>

          {/* Strong */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-sky-400">Strong Match (80–89%)</span>
              <span className="text-white">
                {strong} candidates ({getPercent(strong)}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-700"
                style={{ width: `${getPercent(strong)}%` }}
              />
            </div>
          </div>

          {/* Good */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-400">Good Match (70–79%)</span>
              <span className="text-white">
                {good} candidates ({getPercent(good)}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${getPercent(good)}%` }}
              />
            </div>
          </div>

          {/* Moderate */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-purple-400">Moderate Match (&lt;70%)</span>
              <span className="text-white">
                {moderate} candidates ({getPercent(moderate)}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${getPercent(moderate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* All Evaluations Table */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] bg-[#121A2B] space-y-4">
        <h3 className="text-base font-bold text-white">All Candidate Evaluations Log</h3>
        {allMatches.length === 0 ? (
          <p className="text-xs text-slate-400">No evaluations recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0D1222]/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Job Position</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Experience Alignment</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {allMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {m.candidate?.name || m.candidate?.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{m.job?.title}</td>
                    <td className="py-3.5 px-4">
                      <MatchScoreBadge score={m.matchScore} size="sm" showCategory={false} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{m.experienceMatch || 'Moderate'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/recruiter/candidates/${m.candidate?.id}?jobId=${m.job?.id}`}
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Inspect Analysis
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
