import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Copy, Check, AlertCircle, Sparkles } from 'lucide-react';
import candidateService from '../../services/candidateService';
import ResumeUploader from '../../components/candidate/ResumeUploader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

const CandidateResumePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.getMyProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message || 'Failed to load candidate resume profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopy = () => {
    if (profile?.resumeText) {
      navigator.clipboard.writeText(profile.resumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your candidate profile..." />;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <FileText className="w-6 h-6 text-indigo-400" />
          <span>My Resume & Profile Credentials</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload and manage your PDF resume. TalentIQ parses your qualifications using Apache PDFBox for AI job matching.
        </p>
      </div>

      <ErrorAlert message={error} onRetry={fetchProfile} />

      {/* Uploader Section */}
      <ResumeUploader
        onUploadSuccess={fetchProfile}
        currentResumeText={profile?.resumeText}
      />

      {/* Recruiter Submission & Validation Status Card */}
      {profile?.resumeText && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <span>Recruiter Module Connection</span>
              </div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Recruiter Application Status</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track how recruiters review, evaluate, and validate your submitted resume.
              </p>
            </div>

            {/* Status Badge */}
            <div>
              {profile.submissionStatus === 'SHORTLISTED' ? (
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  <span>SELECTED / SHORTLISTED</span>
                </span>
              ) : profile.submissionStatus === 'REJECTED' ? (
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-red-600 text-white shadow-md shadow-red-600/30 border border-red-400">
                  <AlertCircle className="w-4 h-4 text-white" />
                  <span>APPLICATION REJECTED</span>
                </span>
              ) : profile.submissionStatus === 'VALIDATED' ? (
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Validated by Recruiter</span>
                </span>
              ) : profile.submissionStatus === 'SUBMITTED' ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Submitted to Recruiter • In Review</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  <span>Resume Ready to Submit</span>
                </span>
              )}
            </div>
          </div>

          {/* Details & Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400 block mb-1">Submission to Recruiter:</span>
              <strong className="text-slate-200">
                {profile.submittedAt ? new Date(profile.submittedAt).toLocaleString() : 'Ready for submission'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-400 block mb-1">Recruiter Validation:</span>
              <strong className="text-slate-200">
                {profile.validatedAt
                  ? `Validated on ${new Date(profile.validatedAt).toLocaleString()} ${profile.validatedBy ? `by ${profile.validatedBy}` : ''}`
                  : profile.submissionStatus === 'SUBMITTED'
                  ? 'Awaiting recruiter validation'
                  : 'Pending submission'}
              </strong>
            </div>
          </div>

          {/* Recruiter Validation Notes */}
          {profile.validationNotes && (
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
              <span className="font-bold text-indigo-300 block mb-1">Recruiter Review Notes:</span>
              <p className="text-slate-200 leading-relaxed">{profile.validationNotes}</p>
            </div>
          )}

          {/* Actions: Re-submit & View Matches */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              {profile.submissionStatus === 'SUBMITTED'
                ? 'Your resume is active and visible to recruiters for job matching.'
                : 'Submitting pushes your latest resume to recruiters and re-computes AI match rankings.'}
            </p>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    await candidateService.submitMyResume();
                    await fetchProfile();
                  } catch (err) {
                    setError(err.message || 'Failed to submit resume to recruiter.');
                    setLoading(false);
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{profile.submissionStatus === 'SUBMITTED' ? 'Re-Submit to Recruiter' : 'Submit to Recruiter'}</span>
              </button>

              <a
                href="/candidate/matches"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <span>View Job Matches</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Text Preview Card */}
      {profile?.resumeText ? (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Extracted Resume Text (Parsed via Apache PDFBox)
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                This parsed representation is used by Google Gemini to analyze your role match scores and identify skill gaps.
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors self-start sm:self-auto"
            >
              {copied ? (
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
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 max-h-[450px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {profile.resumeText}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 border border-slate-800 text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No Resume Uploaded Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload your PDF resume above to have TalentIQ extract your technical skills and generate AI job match evaluations.
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateResumePage;
