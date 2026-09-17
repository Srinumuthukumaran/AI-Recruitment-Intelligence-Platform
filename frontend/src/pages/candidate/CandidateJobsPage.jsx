import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Briefcase,
  MapPin,
  Clock,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import jobService from '../../services/jobService';
import matchService from '../../services/matchService';
import candidateService from '../../services/candidateService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import MatchScoreBadge from '../../components/recruiter/MatchScoreBadge';

const CandidateJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, MATCHED_ONLY

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [jobsData, profileData] = await Promise.all([
          jobService.getAllJobs(),
          candidateService.getMyProfile(),
        ]);
        setJobs(jobsData || []);
        setProfile(profileData);

        if (profileData?.id) {
          try {
            const matchesData = await matchService.getMyMatches();
            setMatches(matchesData || []);
          } catch (err) {
            console.warn('Matches fetch error:', err.message);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load job listings.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Discovering job positions and match scores..." />;
  }

  const jobsWithMatches = jobs.map((job) => {
    const match = matches.find((m) => m.job?.id === job.id);
    return {
      ...job,
      match,
      score: match?.matchScore ?? null,
    };
  });

  // Sort by match score if evaluated
  const sortedJobs = [...jobsWithMatches].sort((a, b) => (b.score || 0) - (a.score || 0));

  const filteredJobs = sortedJobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      job.title?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q) ||
      job.requiredSkills?.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (filterMode === 'MATCHED_ONLY' && !job.match) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Compass className="w-6 h-6 text-indigo-400" />
            <span>Discover Opportunities & Match Scores</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Explore open jobs and see your AI-analyzed compatibility scores, matching skills, and gap recommendations.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-medium self-end sm:self-auto">
          {jobs.length} Open Positions • {matches.length} Evaluated
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, location, required skills..."
          />
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto text-xs">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterMode === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            All Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setFilterMode('MATCHED_ONLY')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterMode === 'MATCHED_ONLY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            Evaluated Matches ({matches.length})
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={searchQuery ? 'No matching jobs found' : 'No jobs available'}
          description={
            searchQuery
              ? 'Try modifying your search term or clearing the filter.'
              : 'New open job positions will appear here once published by recruiters.'
          }
          actionText={searchQuery ? 'Clear Search' : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  {job.match ? (
                    <MatchScoreBadge score={job.match.matchScore} size="sm" showCategory={false} />
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      Open
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{job.experience || 'Flexible'}</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Match preview / highlights if evaluated */}
                {job.match && (
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                    {job.match.matchingSkills && (
                      <div className="text-[11px] text-emerald-400 truncate">
                        ✓ Matching: <span className="text-slate-200">{job.match.matchingSkills}</span>
                      </div>
                    )}
                    {job.match.missingSkills && (
                      <div className="text-[11px] text-amber-400 truncate">
                        • Gaps: <span className="text-slate-300">{job.match.missingSkills}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Required skills */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Key Requirements
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills?.split(',').slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-800/80 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700/60"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  to={`/candidate/jobs/${job.id}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>View Details & Gaps</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to={`/candidate/skills?jobId=${job.id}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-950/50 hover:bg-purple-950/80 text-purple-300 border border-purple-500/30 transition-colors"
                >
                  Skill Gap
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateJobsPage;
