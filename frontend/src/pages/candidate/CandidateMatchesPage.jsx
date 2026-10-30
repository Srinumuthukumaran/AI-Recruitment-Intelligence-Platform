import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Sparkles,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileQuestion,
  ChevronRight,
} from 'lucide-react';
import matchService from '../../services/matchService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import MatchScoreBadge from '../../components/recruiter/MatchScoreBadge';

const CandidateMatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await matchService.getMyMatches();
        setMatches(data || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve match evaluations.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Retrieving your evaluated job matches..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <CheckSquare className="w-6 h-6 text-purple-400" />
          <span>My AI Job Evaluations</span>
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Detailed evaluation scores, strengths, weaknesses, and skill gaps assessed across job positions.
        </p>
      </div>

      <ErrorAlert message={error} />

      {/* Recruiter Evaluation Notifications */}
      {matches.some((m) => m.validationStatus === 'SHORTLISTED') && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-emerald-950/80 border-2 border-purple-500/40 flex items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse flex-shrink-0" />
            <div>
              <strong className="text-white block text-sm">Congratulations! Selected / Shortlisted for Position(s)</strong>
              <span className="text-slate-300">A recruiter has shortlisted your profile for the highlighted opportunities below.</span>
            </div>
          </div>
          <Link
            to="/candidate/interview"
            className="px-3.5 py-1.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex-shrink-0 transition-all shadow-md shadow-purple-600/25"
          >
            Interview Practice
          </Link>
        </div>
      )}

      {matches.some((m) => m.validationStatus === 'REJECTED') && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <strong className="text-white block text-sm">Application Update: Status Rejected</strong>
              <span className="text-slate-300">One or more positions were marked as rejected. Review your skill gaps to reapply.</span>
            </div>
          </div>
          <Link
            to="/candidate/skills"
            className="px-3.5 py-1.5 rounded-xl font-bold bg-[#172238] hover:bg-[#1f2d4a] text-slate-200 border border-white/[0.08] flex-shrink-0 transition-all"
          >
            Skill Gap Breakdown
          </Link>
        </div>
      )}

      {matches.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No evaluations found yet"
          description="Your resume has not yet been submitted or evaluated against open jobs. Upload and submit your resume in the Resume section to generate instant AI match evaluations."
          actionText="Upload & Submit Resume"
          onAction={() => (window.location.href = '/candidate/resume')}
        />
      ) : (
        <div className="space-y-5">
          {matches.map((match) => (
            <div
              key={match.id}
              className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] space-y-5 hover:border-purple-500/30 transition-all shadow-xl shadow-purple-950/15"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Evaluated Position</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{match.job?.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {match.job?.location || 'Remote'} • Required: {match.job?.requiredSkills}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end space-y-1">
                  <div className="flex items-center space-x-2">
                    {match.validationStatus === 'SHORTLISTED' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-black bg-purple-600 text-white shadow-sm border border-purple-400">
                        <Sparkles className="w-3 h-3 text-white animate-pulse" />
                        <span>SELECTED / SHORTLISTED</span>
                      </span>
                    ) : match.validationStatus === 'REJECTED' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-black bg-red-600 text-white shadow-sm border border-red-400">
                        <AlertCircle className="w-3 h-3 text-white" />
                        <span>REJECTED</span>
                      </span>
                    ) : match.validationStatus === 'VALIDATED' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Validated</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>Submitted • In Review</span>
                      </span>
                    )}
                    <MatchScoreBadge score={match.matchScore} size="lg" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Experience: <strong className="text-slate-200">{match.experienceMatch || 'Moderate'}</strong>
                  </span>
                </div>
              </div>

              {match.recruiterNotes && (
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs">
                  <span className="font-bold text-purple-300 block mb-0.5">Recruiter Note:</span>
                  <p className="text-slate-200">{match.recruiterNotes}</p>
                </div>
              )}

              {/* Skills breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
                  <span className="font-bold text-emerald-400 block mb-1.5 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Matching Skills Verified</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {match.matchingSkills || 'No matching skills explicitly listed.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs">
                  <span className="font-bold text-amber-400 block mb-1.5 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Missing Skills to Learn</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {match.missingSkills || 'None identified! Excellent skill coverage.'}
                  </p>
                </div>
              </div>

              {/* Strengths and Explanation */}
              {match.explanation && (
                <div className="p-4 rounded-xl bg-[#172238]/60 border border-white/[0.06] text-xs text-slate-300 leading-relaxed">
                  <strong className="text-purple-300 block mb-1">AI Evaluator Commentary:</strong>
                  {match.explanation}
                </div>
              )}

              {/* Action shortcuts */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/[0.08]">
                <Link
                  to={`/candidate/skills?jobId=${match.job?.id}`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Skill Gap Breakdown</span>
                </Link>

                <Link
                  to={`/candidate/interview?jobId=${match.job?.id}`}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all shadow-sm"
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                  <span>Practice Questions</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateMatchesPage;
