import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Briefcase,
  Copy,
  Check,
  Loader2,
  FileQuestion,
  ChevronDown,
  Pencil,
  Trash2,
} from 'lucide-react';
import candidateService from '../../services/candidateService';
import matchService from '../../services/matchService';
import jobService from '../../services/jobService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import MatchScoreBadge, { getScoreCategory } from '../../components/recruiter/MatchScoreBadge';
import Modal from '../../components/common/Modal';

const CandidateDetailPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetJobId = searchParams.get('jobId');
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [matches, setMatches] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(targetJobId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Edit Candidate state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', resumeText: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete Candidate state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Re-analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [copiedResume, setCopiedResume] = useState(false);
  const [showRawResume, setShowRawResume] = useState(false);

  // Recruiter Validation state
  const [validationNotes, setValidationNotes] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [candData, matchesData, jobsData] = await Promise.all([
        candidateService.getCandidateById(id),
        matchService.getCandidateMatches(id),
        jobService.getAllJobs(),
      ]);

      setCandidate(candData);
      setValidationNotes(candData?.validationNotes || '');
      setMatches(matchesData || []);
      setJobs(jobsData || []);

      if (targetJobId) {
        setSelectedJobId(targetJobId);
      } else if (matchesData && matchesData.length > 0) {
        setSelectedJobId(String(matchesData[0].job?.id));
      } else if (jobsData && jobsData.length > 0) {
        setSelectedJobId(String(jobsData[0].id));
      }
    } catch (err) {
      setError(err.message || 'Failed to load candidate profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (status) => {
    if (!candidate) return;
    setIsValidating(true);
    try {
      const updated = await candidateService.validateCandidate(candidate.id, status, validationNotes);
      setCandidate((prev) => ({ ...prev, ...updated }));
      setNotification({
        type: 'success',
        message: `Candidate marked as ${status}!`,
      });
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err) {
      setError(err.message || 'Validation action failed.');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRunAnalysis = async () => {
    if (!selectedJobId) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      await matchService.analyzeCandidate(id, selectedJobId);
      await loadData();
    } catch (err) {
      setAnalyzeError(err.message || 'AI evaluation failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyResume = () => {
    if (candidate?.resumeText) {
      navigator.clipboard.writeText(candidate.resumeText);
      setCopiedResume(true);
      setTimeout(() => setCopiedResume(false), 2000);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      name: candidate?.name || '',
      email: candidate?.email || '',
      resumeText: candidate?.resumeText || '',
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveCandidate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError(null);
    try {
      const updated = await candidateService.updateCandidate(candidate.id, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        resumeText: editFormData.resumeText,
      });
      setCandidate((prev) => ({ ...prev, ...updated }));
      setIsEditModalOpen(false);
      setNotification({
        type: 'success',
        message: 'Candidate profile updated successfully!',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update candidate profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await candidateService.deleteCandidate(candidate.id);
      navigate('/recruiter/candidates');
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to remove candidate.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading candidate profile and AI evaluations..." />;
  }

  if (!candidate) {
    return (
      <EmptyState
        title="Candidate Not Found"
        description="The candidate record could not be retrieved."
        actionText="Back to Candidates"
        onAction={() => navigate('/recruiter/candidates')}
      />
    );
  }

  // Active selected match
  const currentMatch = matches.find((m) => String(m.job?.id) === String(selectedJobId));
  const currentJob = jobs.find((j) => String(j.id) === String(selectedJobId));

  const scoreCategory = currentMatch ? getScoreCategory(currentMatch.matchScore) : null;

  return (
    <div className="space-y-8">
      {/* Top back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/recruiter/candidates"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidates</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openEditModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Pencil className="w-3.5 h-3.5 text-indigo-400" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={openDeleteModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-500/30 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Remove Candidate</span>
          </button>

          {currentMatch && (
            <Link
              to={`/recruiter/interview?jobId=${currentMatch.job?.id}&candidateId=${candidate.id}`}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all"
            >
              <FileQuestion className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generate Interview Questions</span>
            </Link>
          )}
        </div>
      </div>

      {notification && (
        <div
          className={`flex items-center space-x-2 p-3.5 rounded-xl border text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <ErrorAlert message={error} onRetry={loadData} />
      <ErrorAlert message={analyzeError} onRetry={handleRunAnalysis} title="AI Analysis Issue" />

      {/* Candidate Profile Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-600/30 flex-shrink-0">
              {candidate.name ? candidate.name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {candidate.name || 'Candidate Profile'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Candidate #{candidate.id}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {candidate.resumeText
                      ? 'PDF Resume on file'
                      : 'No resume uploaded yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Selector for Evaluation */}
          {jobs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Evaluate Against Job:
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={String(j.id)}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Recruiter Validation & Application Review Panel */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <span>Recruiter Decision & Review</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Candidate Validation Status</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review qualifications, approve credentials, and update candidate's application pipeline status.
            </p>
          </div>

          <div>
            {candidate.submissionStatus === 'VALIDATED' ? (
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Validated Candidate</span>
              </span>
            ) : candidate.submissionStatus === 'SHORTLISTED' ? (
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Shortlisted for Role</span>
              </span>
            ) : candidate.submissionStatus === 'REJECTED' ? (
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-950/80 text-red-300 border border-red-500/40">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>Rejected / Needs Revision</span>
              </span>
            ) : candidate.submissionStatus === 'SUBMITTED' ? (
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse mr-0.5" />
                <span>Submitted by Candidate • Awaiting Validation</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                <span>Draft Profile</span>
              </span>
            )}
          </div>
        </div>

        {/* Timestamps & Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1">Candidate Submission Date:</span>
            <strong className="text-slate-200">
              {candidate.submittedAt ? new Date(candidate.submittedAt).toLocaleString() : 'Not recorded'}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1">Validation Record:</span>
            <strong className="text-slate-200">
              {candidate.validatedAt
                ? `Validated on ${new Date(candidate.validatedAt).toLocaleString()} ${candidate.validatedBy ? `by ${candidate.validatedBy}` : ''}`
                : 'Pending recruiter review'}
            </strong>
          </div>
        </div>

        {/* Validation Notes Input & Action Buttons */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Recruiter Validation Feedback / Review Notes
          </label>
          <textarea
            rows={3}
            value={validationNotes}
            onChange={(e) => setValidationNotes(e.target.value)}
            placeholder="Add recruiter feedback or validation notes (visible to both recruiters and candidate)..."
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-400">
              Select an action below to update candidate's status in the recruitment workflow.
            </p>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                disabled={isValidating}
                onClick={() => handleValidate('REJECTED')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-300 bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 transition-all disabled:opacity-50"
              >
                <span>Reject</span>
              </button>

              <button
                type="button"
                disabled={isValidating}
                onClick={() => handleValidate('SHORTLISTED')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Shortlist Candidate</span>
              </button>

              <button
                type="button"
                disabled={isValidating}
                onClick={() => handleValidate('VALIDATED')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Validate Candidate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI MATCH RESULT UI SECTION (Requirement 7) */}
      {currentMatch ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>AI Candidate Match Evaluation</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated for position:{' '}
                <strong className="text-slate-200">{currentMatch.job?.title}</strong>
              </p>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Re-analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Re-analyze with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Score & Key Highlights Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Match Score Indicator */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Overall Match Score
              </span>
              <div className="relative flex items-center justify-center w-28 h-28 my-1">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={
                      currentMatch.matchScore >= 90
                        ? 'text-emerald-500'
                        : currentMatch.matchScore >= 80
                        ? 'text-blue-500'
                        : currentMatch.matchScore >= 70
                        ? 'text-amber-500'
                        : 'text-purple-500'
                    }
                    strokeDasharray={`${currentMatch.matchScore || 0}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">
                    {currentMatch.matchScore || 0}%
                  </span>
                </div>
              </div>
              <span className={`text-xs font-bold mt-2 ${scoreCategory.textClass.split(' ')[0]}`}>
                {scoreCategory.label}
              </span>
            </div>

            {/* Experience Match */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Experience Alignment
              </span>
              <div className="my-4">
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {currentMatch.experienceMatch || 'Moderate'}
                </span>
                <p className="text-xs text-slate-400 mt-2">
                  Alignment between the candidate's verified background and the required experience level ({currentMatch.job?.experience || 'Standard'}).
                </p>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Job: {currentMatch.job?.title}</span>
              </div>
            </div>

            {/* AI Decision Support Summary */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Decision Support
              </span>
              <div className="my-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentMatch.explanation || 'Detailed AI evaluation completed for this candidate against role specifications.'}
                </p>
              </div>
              <div className="text-[10px] text-indigo-400 font-medium bg-indigo-950/40 p-2 rounded-lg border border-indigo-500/20">
                ℹ️ Recommendation only. Human recruiter final review required.
              </div>
            </div>
          </div>

          {/* Skills Comparison: Matching vs Missing (Requirement 7) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/10">
              <div className="flex items-center space-x-2 text-emerald-400 mb-3">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  Matching Skills (Verified in Resume)
                </h3>
              </div>
              <div className="space-y-1.5">
                {currentMatch.matchingSkills?.split(/[\n,]+/).map((s, i) => {
                  const clean = s.replace(/^[•\-*✓\s]+/, '').trim();
                  if (!clean) return null;
                  return (
                    <div
                      key={i}
                      className="flex items-center space-x-2 text-xs text-slate-200 py-1 px-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20"
                    >
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{clean}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="glass-card rounded-2xl p-6 border border-amber-500/20 bg-amber-950/10">
              <div className="flex items-center space-x-2 text-amber-400 mb-3">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  Missing Skills (Gaps Identified)
                </h3>
              </div>
              <div className="space-y-1.5">
                {currentMatch.missingSkills?.split(/[\n,]+/).map((s, i) => {
                  const clean = s.replace(/^[•\-*⚠\s]+/, '').trim();
                  if (!clean) return null;
                  return (
                    <div
                      key={i}
                      className="flex items-center space-x-2 text-xs text-amber-200 py-1 px-2.5 rounded-lg bg-amber-950/30 border border-amber-500/20"
                    >
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{clean}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses (Requirement 7) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                Candidate Strengths
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                {currentMatch.strengths || 'Strong technical foundation demonstrated in resume experience.'}
              </p>
            </div>

            {/* Weaknesses */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                Areas for Improvement / Weaknesses
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
                {currentMatch.weaknesses || 'Minor technical gaps identified relative to target position specs.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Unanalyzed State for selected job */
        <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Not Yet Analyzed Against {currentJob?.title || 'Selected Job'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click the button below to parse this candidate's resume qualifications against the job description using Google Gemini.
            </p>
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={!candidate.resumeText || isAnalyzing}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Match with AI</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Extracted Resume Text Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Extracted Resume Content (Apache PDFBox)</h3>
          </div>

          <div className="flex items-center space-x-2">
            {candidate.resumeText && (
              <button
                onClick={handleCopyResume}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {copiedResume ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowRawResume(!showRawResume)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1"
            >
              {showRawResume ? 'Hide Text' : 'View Full Text'}
            </button>
          </div>
        </div>

        {showRawResume && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800/80 max-h-96 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {candidate.resumeText || 'No resume text has been extracted for this candidate.'}
          </div>
        )}
      </div>

      {/* Edit Candidate Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Candidate: ${candidate?.name || candidate?.email}`}
        maxWidth="max-w-2xl"
      >
        <ErrorAlert message={editError} />

        <form onSubmit={handleSaveCandidate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Candidate Full Name
            </label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              placeholder="e.g. Alex Mercer"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              placeholder="e.g. candidate@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Parsed Resume Qualifications & Experience
            </label>
            <textarea
              rows={8}
              value={editFormData.resumeText}
              onChange={(e) => setEditFormData({ ...editFormData, resumeText: e.target.value })}
              placeholder="Paste or edit candidate's resume content, technical skills, or project background..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Modifying resume text will update the qualifications used by Google Gemini for future AI evaluations.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Candidate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Candidate Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Candidate"
        maxWidth="max-w-md"
      >
        <ErrorAlert message={deleteError} />

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-xs">
              Are you sure you want to remove candidate <strong className="text-white">{candidate?.name || candidate?.email}</strong>?
            </p>
          </div>

          <p className="text-xs text-slate-400">
            This will permanently remove the candidate's profile, resume credentials, and any AI matching scores. This action cannot be undone.
          </p>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Candidate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateDetailPage;
