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
  X,
  ShieldCheck,
} from 'lucide-react';
import candidateService from '../../services/candidateService';
import matchService from '../../services/matchService';
import jobService from '../../services/jobService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import MatchScoreBadge, { getScoreCategory, RadialScoreRing } from '../../components/recruiter/MatchScoreBadge';
import Modal from '../../components/common/Modal';

const CandidateDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
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
    <div className="space-y-8 animate-fadeIn">
      {/* Top back navigation and header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/recruiter/candidates"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Directory</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openEditModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#121A2B] hover:bg-[#172238] text-slate-200 border border-white/[0.08] transition-all cursor-pointer shadow-sm"
          >
            <Pencil className="w-3.5 h-3.5 text-purple-400" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={openDeleteModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 transition-all cursor-pointer shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Remove Candidate</span>
          </button>

          {currentMatch && (
            <Link
              to={`/recruiter/interview?jobId=${currentMatch.job?.id}&candidateId=${candidate.id}`}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 transition-all"
            >
              <FileQuestion className="w-3.5 h-3.5" />
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
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <ErrorAlert message={error} onRetry={loadData} />
      <ErrorAlert message={analyzeError} onRetry={handleRunAnalysis} title="AI Analysis Issue" />

      {/* Candidate Profile Header Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] bg-[#121A2B]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-purple-600/30 flex-shrink-0">
              {candidate.name ? candidate.name[0].toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {candidate.name || 'Candidate Profile'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#172238] text-purple-300 border border-purple-500/20">
                  Candidate #{candidate.id}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1.5">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    {candidate.resumeText ? 'PDF Resume Parsed with PDFBox' : 'No resume uploaded yet'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Selector for Evaluation */}
          {jobs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Evaluate Against:
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-[#080B16] border border-white/[0.12] text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
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

      {/* Recruiter Validation Decision Panel */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] bg-[#121A2B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
              <span>Recruiter Human Review</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Application Validation & Decision
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review AI recommendations, record notes, and advance the candidate through the hiring workflow.
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
                <span>Shortlisted for Interview</span>
              </span>
            ) : candidate.submissionStatus === 'REJECTED' ? (
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Application Rejected</span>
              </span>
            ) : candidate.submissionStatus === 'SUBMITTED' ? (
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse mr-0.5" />
                <span>Submitted • In Recruiter Review</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#172238] text-slate-400 border border-white/[0.08]">
                <span>Draft Profile</span>
              </span>
            )}
          </div>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#080B16] border border-white/[0.06]">
            <span className="text-slate-400 block mb-1">Candidate Submitted At:</span>
            <strong className="text-white">
              {candidate.submittedAt ? new Date(candidate.submittedAt).toLocaleString() : 'Not recorded'}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080B16] border border-white/[0.06]">
            <span className="text-slate-400 block mb-1">Validation Record:</span>
            <strong className="text-white">
              {candidate.validatedAt
                ? `Validated on ${new Date(candidate.validatedAt).toLocaleString()} ${
                    candidate.validatedBy ? `by ${candidate.validatedBy}` : ''
                  }`
                : 'Pending recruiter review'}
            </strong>
          </div>
        </div>

        {/* Feedback Notes Input & Action Buttons */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Recruiter Validation Feedback & Assessment Notes
          </label>
          <textarea
            rows={3}
            value={validationNotes}
            onChange={(e) => setValidationNotes(e.target.value)}
            placeholder="Add recruiter feedback or notes on skills, projects, and interview readiness..."
            className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-400">
              Select an action to update this candidate's status in the hiring pipeline.
            </p>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                disabled={isValidating}
                onClick={() => handleValidate('REJECTED')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>Reject</span>
              </button>

              <button
                type="button"
                disabled={isValidating}
                onClick={() => handleValidate('SHORTLISTED')}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Shortlist Candidate</span>
              </button>

              <button
                type="button"
                disabled={isValidating}
                onClick={() => handleValidate('VALIDATED')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
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

      {/* AI MATCH RESULT SECTION (Section 10 Requirement) */}
      {currentMatch ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>AI Candidate Match Evaluation</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated against position: <strong className="text-white">{currentMatch.job?.title}</strong>
              </p>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Re-analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Re-run AI Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Radial Score Gauge & Alignment Highlight Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Animated Circular Radial Score Gauge */}
            <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Overall Match Score
              </span>
              <RadialScoreRing score={currentMatch.matchScore} size={120} strokeWidth={9} />
              <p className="text-[11px] text-slate-400 mt-2 max-w-xs">
                {scoreCategory.description}
              </p>
            </div>

            {/* Experience Alignment */}
            <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Experience Alignment
              </span>
              <div className="my-3">
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {currentMatch.experienceMatch || 'Moderate Alignment'}
                </span>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  Candidate background evaluated against required experience level ({currentMatch.job?.experience || 'Standard'}).
                </p>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center space-x-1 pt-2 border-t border-white/[0.06]">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span>Job: {currentMatch.job?.title}</span>
              </div>
            </div>

            {/* AI Decision Support Summary */}
            <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                AI Explanation Rationale
              </span>
              <div className="my-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentMatch.explanation || 'Detailed AI evaluation completed for this candidate against role specifications.'}
                </p>
              </div>
              <div className="text-[11px] text-purple-300 bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>AI recommendation only. Human recruiter final review required.</span>
              </div>
            </div>
          </div>

          {/* Skills Comparison: Matching vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/10 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
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
                      className="flex items-center space-x-2 text-xs text-slate-200 py-1.5 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20"
                    >
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{clean}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missing Skills (Skill Gaps) */}
            <div className="glass-card rounded-2xl p-6 border border-amber-500/20 bg-amber-950/10 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Missing Skills (Identified Gaps)
                </h3>
              </div>
              <div className="space-y-1.5">
                {currentMatch.missingSkills?.split(/[\n,]+/).map((s, i) => {
                  const clean = s.replace(/^[•\-*⚠\s]+/, '').trim();
                  if (!clean) return null;
                  return (
                    <div
                      key={i}
                      className="flex items-center space-x-2 text-xs text-amber-200 py-1.5 px-3 rounded-xl bg-amber-950/40 border border-amber-500/20"
                    >
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{clean}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Candidate Strengths
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-[#080B16] p-4 rounded-xl border border-white/[0.06]">
                {currentMatch.strengths || 'Strong technical foundation demonstrated in resume experience.'}
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Areas for Improvement / Weaknesses
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-[#080B16] p-4 rounded-xl border border-white/[0.06]">
                {currentMatch.weaknesses || 'Minor technical gaps identified relative to target position specs.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Unanalyzed State for selected job */
        <div className="glass-card rounded-2xl p-8 border border-white/[0.08] bg-[#121A2B] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Not Yet Analyzed Against {currentJob?.title || 'Selected Job'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Click the button below to evaluate this candidate's resume qualifications against the job description using Google Gemini.
            </p>
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={!candidate.resumeText || isAnalyzing}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 cursor-pointer"
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

      {/* Extracted Resume Text (PDFBox) */}
      <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              Extracted Resume Content (Apache PDFBox)
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {candidate.resumeText && (
              <button
                onClick={handleCopyResume}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-[#172238] hover:bg-white/[0.1] transition-colors cursor-pointer"
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
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 cursor-pointer"
            >
              {showRawResume ? 'Hide Text' : 'View Full Extracted Text'}
            </button>
          </div>
        </div>

        {showRawResume && (
          <div className="mt-3 p-4 rounded-xl bg-[#080B16] border border-white/[0.08] max-h-96 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
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
              className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
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
              className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
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
              className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
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

      {/* Delete Candidate Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Candidate"
        maxWidth="max-w-md"
      >
        <ErrorAlert message={deleteError} />

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <p className="text-xs">
              Are you sure you want to remove candidate <strong className="text-white">{candidate?.name || candidate?.email}</strong>?
            </p>
          </div>

          <p className="text-xs text-slate-400">
            This will permanently remove the candidate's profile, resume credentials, and any AI matching scores.
          </p>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
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
