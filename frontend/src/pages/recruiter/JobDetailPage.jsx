import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowLeft,
  Users,
  Sparkles,
  BotMessageSquare,
  FileQuestion,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import jobService from '../../services/jobService';
import matchService from '../../services/matchService';
import candidateService from '../../services/candidateService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import MatchScoreBadge from '../../components/recruiter/MatchScoreBadge';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [rankedMatches, setRankedMatches] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('ALL'); // ALL, 90+, 80-89, 70-79, <70

  // Analyze state
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [selectedCandidateToAnalyze, setSelectedCandidateToAnalyze] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobData, matchesData, candidatesData] = await Promise.all([
        jobService.getJobById(id),
        matchService.getRankedCandidates(id),
        candidateService.getAllCandidates(),
      ]);
      setJob(jobData);
      setRankedMatches(matchesData || []);
      setAllCandidates(candidatesData || []);
    } catch (err) {
      setError(err.message || 'Failed to load job details and rankings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAnalyzeCandidate = async (candidateId) => {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      await matchService.analyzeCandidate(candidateId, id);
      setIsAnalyzeModalOpen(false);
      setSelectedCandidateToAnalyze('');
      await loadData();
    } catch (err) {
      setAnalyzeError(err.message || 'Unable to analyze candidate with AI.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStatusChange = async (match, newStatus) => {
    try {
      await matchService.validateMatch(
        match.id,
        newStatus,
        `Recruiter updated candidate to ${newStatus} for ${job?.title || 'this position'}`
      );
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update validation status.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading job specifications and candidate rankings..." />;
  }

  if (!job) {
    return (
      <EmptyState
        title="Job Not Found"
        description="The requested job posting does not exist or has been removed."
        actionText="Back to Jobs"
        onAction={() => navigate('/recruiter/jobs')}
      />
    );
  }

  // Filter rankings
  const filteredMatches = rankedMatches.filter((match) => {
    const candidateName = match.candidate?.name?.toLowerCase() || '';
    const candidateEmail = match.candidate?.email?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch = candidateName.includes(q) || candidateEmail.includes(q);

    if (!matchesSearch) return false;

    const score = match.matchScore || 0;
    if (scoreFilter === '90+') return score >= 90;
    if (scoreFilter === '80-89') return score >= 80 && score < 90;
    if (scoreFilter === '70-79') return score >= 70 && score < 80;
    if (scoreFilter === '<70') return score < 70;
    return true;
  });

  // Candidates who haven't been analyzed for this job yet
  const analyzedCandidateIds = new Set(rankedMatches.map((m) => m.candidate?.id));
  const unanalyzedCandidates = allCandidates.filter(
    (c) => !analyzedCandidateIds.has(c.id) && c.resumeText
  );

  return (
    <div className="space-y-8">
      {/* Back button & quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </Link>

        <div className="flex items-center space-x-2.5">
          <Link
            to={`/recruiter/copilot?jobId=${job.id}`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all"
          >
            <BotMessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>Ask Copilot about this Job</span>
          </Link>

          <Link
            to={`/recruiter/interview?jobId=${job.id}`}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <FileQuestion className="w-3.5 h-3.5 text-indigo-400" />
            <span>Generate Interview Questions</span>
          </Link>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={loadData} />

      {/* Job Details Card */}
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
                <span>{job.experience || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                <Users className="w-4 h-4" />
                <span>{rankedMatches.length} candidates analyzed</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAnalyzeModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all self-start"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze New Candidate</span>
          </button>
        </div>

        {/* Description */}
        <div className="pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Job Description & Scope
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Required Skills */}
        <div className="pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Target Requirements & Required Skills
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
      </div>

      {/* Candidate Rankings Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>AI Candidate Rankings</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked from highest match score to lowest.
            </p>
          </div>

          {/* Score Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {['ALL', '90+', '80-89', '70-79', '<70'].map((f) => (
              <button
                key={f}
                onClick={() => setScoreFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  scoreFilter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {f === 'ALL' ? 'All Matches' : f}
              </button>
            ))}
          </div>
        </div>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search ranked candidates by name or email..."
        />

        {/* Rankings Table / Cards */}
        {filteredMatches.length === 0 ? (
          <EmptyState
            icon={Users}
            title={searchQuery ? 'No candidates match search' : 'No candidates analyzed for this job yet'}
            description={
              searchQuery
                ? 'Try adjusting your search query or score filter.'
                : 'Select a candidate with an uploaded resume to run the Gemini match analysis.'
            }
            actionText={unanalyzedCandidates.length > 0 ? 'Analyze a Candidate Now' : undefined}
            onAction={unanalyzedCandidates.length > 0 ? () => setIsAnalyzeModalOpen(true) : undefined}
          />
        ) : (
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                    <th className="py-3.5 px-4 sm:px-6">Status</th>
                    <th className="py-3.5 px-4 sm:px-6">Match Score</th>
                    <th className="py-3.5 px-4 sm:px-6">Matching Skills</th>
                    <th className="py-3.5 px-4 sm:px-6">Missing Skills</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredMatches.map((match, index) => (
                    <tr
                      key={match.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-slate-300">
                            #{index + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-100 text-sm group-hover:text-indigo-300 transition-colors">
                              {match.candidate?.name || 'Unnamed Candidate'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {match.candidate?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        {match.validationStatus === 'VALIDATED' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Validated</span>
                          </span>
                        ) : match.validationStatus === 'SHORTLISTED' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/30">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Shortlisted</span>
                          </span>
                        ) : match.validationStatus === 'REJECTED' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/30">
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-0.5" />
                            <span>Submitted</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6">
                        <MatchScoreBadge score={match.matchScore} size="sm" />
                      </td>

                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        <div className="line-clamp-2 text-slate-300">
                          {match.matchingSkills || 'None identified'}
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        <div className="line-clamp-2 text-amber-300/80">
                          {match.missingSkills || 'None identified'}
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(match, 'SHORTLISTED')}
                          title="Shortlist / Select Candidate"
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            match.validationStatus === 'SHORTLISTED'
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>Shortlist</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(match, 'REJECTED')}
                          title="Reject Candidate"
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            match.validationStatus === 'REJECTED'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30'
                          }`}
                        >
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(match, 'VALIDATED')}
                          title="Validate Candidate"
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            match.validationStatus === 'VALIDATED'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Validate</span>
                        </button>

                        <Link
                          to={`/recruiter/candidates/${match.candidate?.id}?jobId=${job.id}`}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
                        >
                          <span>Analysis</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Analyze Candidate Modal */}
      <Modal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        title={`Analyze Candidate for ${job.title}`}
      >
        <ErrorAlert message={analyzeError} />

        {unanalyzedCandidates.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-200">No unanalyzed candidates available</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All candidates with uploaded resumes have already been evaluated for this position.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Select a candidate with an uploaded PDF resume to evaluate against this job description using Google Gemini.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {unanalyzedCandidates.map((cand) => (
                <label
                  key={cand.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCandidateToAnalyze === String(cand.id)
                      ? 'border-indigo-500 bg-indigo-600/10 text-indigo-200'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="candidate"
                      value={cand.id}
                      checked={selectedCandidateToAnalyze === String(cand.id)}
                      onChange={(e) => setSelectedCandidateToAnalyze(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-semibold text-sm text-slate-100">
                        {cand.name || cand.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-slate-400">{cand.email}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    Resume Ready
                  </span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAnalyzeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedCandidateToAnalyze || isAnalyzing}
                onClick={() => handleAnalyzeCandidate(selectedCandidateToAnalyze)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobDetailPage;
