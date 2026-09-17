import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileQuestion,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import jobService from '../../services/jobService';
import matchService from '../../services/matchService';
import candidateService from '../../services/candidateService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import MatchScoreBadge from '../../components/recruiter/MatchScoreBadge';

const CandidateJobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [jobData, profileData] = await Promise.all([
          jobService.getJobById(id),
          candidateService.getMyProfile(),
        ]);
        setJob(jobData);
        setProfile(profileData);

        if (profileData?.id) {
          try {
            const check = await matchService.checkMatch(profileData.id, id);
            setMatch(check);
          } catch (err) {
            console.warn('Match check skipped:', err.message);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading position requirements and your compatibility data..." />;
  }

  if (!job) {
    return (
      <EmptyState
        title="Job Not Found"
        description="The requested position is unavailable or has been closed."
        actionText="Back to Job Discovery"
        onAction={() => navigate('/candidate/jobs')}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/candidate/jobs"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to={`/candidate/skills?jobId=${job.id}`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>View Skill Gap Analysis</span>
          </Link>

          <Link
            to={`/candidate/interview?jobId=${job.id}`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>Practice Interview Questions</span>
          </Link>
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* Main Job Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Job Opportunity #{job.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{job.title}</h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>{job.location || 'Remote'}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{job.experience || 'Flexible'}</span>
              </div>
            </div>
          </div>

          {/* Match Score Display if available */}
          {match ? (
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold uppercase text-slate-400 mb-1">Your Match Score</span>
              <MatchScoreBadge score={match.matchScore} size="lg" />
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              Check out the Skill Gap tab to compare your resume directly!
            </div>
          )}
        </div>

        {/* Description */}
        <div className="pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Job Description & Responsibilities
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Required Skills */}
        <div className="pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Required Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills?.split(',').map((skill, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/20"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Match Breakdown if evaluated */}
        {match && (
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Matching */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Skills You Possess</span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {match.matchingSkills || 'Verified in resume profile.'}
              </p>
            </div>

            {/* Missing */}
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Gaps to Address</span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {match.missingSkills || 'None identified! Excellent alignment.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateJobDetailPage;
