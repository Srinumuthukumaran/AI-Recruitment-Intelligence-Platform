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
    return <LoadingSpinner message="Calculating recruitment pipeline metrics..." />;
  }

  // Distribution
  const total = allMatches.length;
  const excellent = allMatches.filter((m) => (m.matchScore || 0) >= 90).length;
  const strong = allMatches.filter((m) => (m.matchScore || 0) >= 80 && (m.matchScore || 0) < 90).length;
  const good = allMatches.filter((m) => (m.matchScore || 0) >= 70 && (m.matchScore || 0) < 80).length;
  const moderate = allMatches.filter((m) => (m.matchScore || 0) < 70).length;

  const getPercent = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <span>Recruitment Analytics & Insights</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Quantitative overview of candidate qualification distribution, average scores, and match trends.
        </p>
      </div>

      <ErrorAlert message={error} />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Evaluated
          </span>
          <div className="text-3xl font-extrabold text-white mt-2">{total}</div>
          <span className="text-xs text-indigo-400 mt-1 block">Candidates matched</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Average Score
          </span>
          <div className="text-3xl font-extrabold text-white mt-2">
            {stats?.averageMatchScore ?? 0}%
          </div>
          <span className="text-xs text-blue-400 mt-1 block">Mean alignment</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Top Tier (80%+)
          </span>
          <div className="text-3xl font-extrabold text-white mt-2">
            {excellent + strong}
          </div>
          <span className="text-xs text-emerald-400 mt-1 block">
            {getPercent(excellent + strong)}% of pool
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Roles
          </span>
          <div className="text-3xl font-extrabold text-white mt-2">
            {stats?.totalJobs ?? 0}
          </div>
          <span className="text-xs text-purple-400 mt-1 block">Positions open</span>
        </div>
      </div>

      {/* Score Tier Breakdown Visualizer */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
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
              <span className="text-slate-200">
                {excellent} candidates ({getPercent(excellent)}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${getPercent(excellent)}%` }}
              />
            </div>
          </div>

          {/* Strong */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-blue-400">Strong Match (80–89%)</span>
              <span className="text-slate-200">
                {strong} candidates ({getPercent(strong)}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${getPercent(strong)}%` }}
              />
            </div>
          </div>

          {/* Good */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-400">Good Match (70–79%)</span>
              <span className="text-slate-200">
                {good} candidates ({getPercent(good)}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${getPercent(good)}%` }}
              />
            </div>
          </div>

          {/* Moderate */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-purple-400">Moderate Match (&lt;70%)</span>
              <span className="text-slate-200">
                {moderate} candidates ({getPercent(moderate)}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${getPercent(moderate)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* All Evaluations Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">All Candidate Evaluations Log</h3>
        {allMatches.length === 0 ? (
          <p className="text-xs text-slate-400">No evaluations recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Position</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {m.candidate?.name || m.candidate?.email}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{m.job?.title}</td>
                    <td className="py-3 px-4">
                      <MatchScoreBadge score={m.matchScore} size="sm" showCategory={false} />
                    </td>
                    <td className="py-3 px-4 text-slate-400">{m.experienceMatch || 'Moderate'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/recruiter/candidates/${m.candidate?.id}?jobId=${m.job?.id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Inspect
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
