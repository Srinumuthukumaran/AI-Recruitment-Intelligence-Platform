import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Compass,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Briefcase,
  UploadCloud,
  Check,
  Award,
} from 'lucide-react';
import candidateService from '../../services/candidateService';
import matchService from '../../services/matchService';
import jobService from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import MatchScoreBadge from '../../components/recruiter/MatchScoreBadge';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileData, jobsData] = await Promise.all([
          candidateService.getMyProfile(),
          jobService.getAllJobs(),
        ]);
        setProfile(profileData);
        setJobs(jobsData || []);

        // Fetch candidate matches if profile exists
        if (profileData?.id) {
          try {
            const matchesData = await matchService.getMyMatches();
            setMatches(matchesData || []);
          } catch (err) {
            console.warn('No matches evaluated yet for candidate:', err.message);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load candidate dashboard.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your candidate career portal..." />;
  }

  const hasResume = profile?.hasResume || profile?.resumeText != null;
  const bestMatch = matches.length > 0 ? matches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))[0] : null;

  // Aggregate missing skills across matches for quick skill gap preview
  const missingSkillsSet = new Set();
  const matchingSkillsSet = new Set();
  matches.forEach((m) => {
    if (m.missingSkills) {
      m.missingSkills.split(/[\n,]+/).forEach((s) => {
        const clean = s.replace(/^[•\-*⚠\s]+/, '').trim();
        if (clean && clean.length > 1) missingSkillsSet.add(clean);
      });
    }
    if (m.matchingSkills) {
      m.matchingSkills.split(/[\n,]+/).forEach((s) => {
        const clean = s.replace(/^[•\-*✓\s]+/, '').trim();
        if (clean && clean.length > 1) matchingSkillsSet.add(clean);
      });
    }
  });

  const missingSkillsList = Array.from(missingSkillsSet).slice(0, 5);
  const matchingSkillsList = Array.from(matchingSkillsSet).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-purple-950/30 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>TalentIQ Career Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile?.name || user?.name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Track your resume analysis, discover matched opportunities, identify critical skill gaps, and prepare for interviews.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link
              to="/candidate/resume"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{hasResume ? 'Manage Resume' : 'Upload Resume'}</span>
            </Link>

            <Link
              to="/candidate/jobs"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Browse Jobs</span>
            </Link>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} />

      {/* Recruiter Decision & Validation Notification Banner (SELECTED / REJECTED / VALIDATED) */}
      {profile?.submissionStatus === 'SHORTLISTED' ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-emerald-950/80 border-2 border-purple-500/50 shadow-xl shadow-purple-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-600 text-white shadow-sm">
                  SELECTED / SHORTLISTED
                </span>
                {profile.validatedAt && (
                  <span className="text-[11px] text-slate-400">
                    Decision on {new Date(profile.validatedAt).toLocaleDateString()} {profile.validatedBy ? `by ${profile.validatedBy}` : ''}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Congratulations! You have been Selected & Shortlisted by the Recruiter!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {profile.validationNotes ||
                  'Your resume qualifications, skills alignment, and experience have been evaluated and approved. You are shortlisted for open position interviews!'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-end md:self-auto flex-shrink-0">
            <Link
              to="/candidate/interview"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/20"
            >
              Practice Interview
            </Link>
            <Link
              to="/candidate/matches"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              View Match Breakdown
            </Link>
          </div>
        </div>
      ) : profile?.submissionStatus === 'REJECTED' ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/90 via-slate-900/90 to-amber-950/60 border-2 border-red-500/50 shadow-xl shadow-red-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 flex-shrink-0 mt-0.5">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-sm">
                  APPLICATION REJECTED
                </span>
                {profile.validatedAt && (
                  <span className="text-[11px] text-slate-400">
                    Decision on {new Date(profile.validatedAt).toLocaleDateString()} {profile.validatedBy ? `by ${profile.validatedBy}` : ''}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Application Status Update: Rejected by Recruiter
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {profile.validationNotes ||
                  'The recruiter has reviewed your resume. Certain technical competencies or experience requirements did not match the open positions for this cycle. Review your skill gaps and update your resume to reapply.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 self-end md:self-auto flex-shrink-0">
            <Link
              to="/candidate/skills"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              Review Skill Gaps
            </Link>
            <Link
              to="/candidate/resume"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-600/20"
            >
              Update & Resubmit Resume
            </Link>
          </div>
        </div>
      ) : profile?.submissionStatus === 'VALIDATED' ? (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start space-x-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white flex items-center space-x-2">
              <span>Application Validated by Recruiter</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold text-[10px]">
                VALIDATED
              </span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              {profile.validationNotes || 'Your submitted resume and technical qualifications have been verified and approved.'}
            </p>
            {profile.validatedAt && (
              <p className="text-[11px] text-slate-400">
                Validated on {new Date(profile.validatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ) : profile?.submissionStatus === 'SUBMITTED' ? (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start space-x-3 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0 mt-1" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-white">Application Submitted • In Recruiter Review</h4>
            <p className="text-slate-300">
              Your resume has been submitted and is currently being evaluated by the recruitment team.
            </p>
          </div>
        </div>
      ) : null}

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Resume Status */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Resume Status
            </span>
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="my-3">
            {hasResume ? (
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-xl font-bold text-white">Parsed & Ready</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertCircle className="w-6 h-6" />
                <span className="text-xl font-bold text-white">Upload Needed</span>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {hasResume
                ? 'Extracted via Apache PDFBox engine.'
                : 'Upload a PDF resume to unlock AI matching.'}
            </p>
          </div>
          <Link
            to="/candidate/resume"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>{hasResume ? 'Manage resume' : 'Upload now'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Recruiter Submission & Validation Status (Section Link to Recruiter) */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recruiter Status
            </span>
            <Briefcase className="w-5 h-5 text-purple-400" />
          </div>
          <div className="my-3">
            {profile?.submissionStatus === 'SHORTLISTED' ? (
              <div>
                <div className="flex items-center space-x-2 text-purple-400">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-xl font-bold text-white">Shortlisted</span>
                </div>
                <p className="text-xs text-purple-300/80 font-medium mt-1">Selected for Role / Interview</p>
              </div>
            ) : profile?.submissionStatus === 'REJECTED' ? (
              <div>
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-xl font-bold text-white">Rejected</span>
                </div>
                <p className="text-xs text-red-300/80 font-medium mt-1">Needs Revision / Reapply</p>
              </div>
            ) : profile?.submissionStatus === 'VALIDATED' ? (
              <div>
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-xl font-bold text-white">Validated</span>
                </div>
                <p className="text-xs text-emerald-300/80 font-medium mt-1">Approved by Recruiter</p>
              </div>
            ) : profile?.submissionStatus === 'SUBMITTED' ? (
              <div>
                <div className="flex items-center space-x-2 text-amber-400">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xl font-bold text-white">In Review</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Submitted to Recruiter</p>
              </div>
            ) : (
              <div>
                <div className="text-xl font-bold text-slate-400">Draft Profile</div>
                <p className="text-xs text-slate-500 mt-1">Upload resume to submit</p>
              </div>
            )}
          </div>
          <Link
            to="/candidate/resume"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>Track application</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Profile Completion */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Profile Completion
            </span>
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-white">
              {hasResume ? '100%' : '50%'}
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                style={{ width: hasResume ? '100%' : '50%' }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {hasResume ? 'Account & resume complete.' : 'Upload resume to reach 100%'}
            </p>
          </div>
          <Link
            to="/candidate/profile"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>Edit profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Best Job Match */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Best Job Match
            </span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="my-3">
            {bestMatch ? (
              <div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {bestMatch.matchScore}%
                </div>
                <p className="text-xs text-slate-300 font-semibold mt-1 truncate">
                  {bestMatch.job?.title}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-slate-400">Pending Evaluation</div>
                <p className="text-xs text-slate-500 mt-1">Browse open jobs to see match</p>
              </div>
            )}
          </div>
          <Link
            to={bestMatch ? `/candidate/matches` : `/candidate/jobs`}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>{bestMatch ? 'Inspect match breakdown' : 'Explore opportunities'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2 Column Section: Recommended Jobs & Skill Gap Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Jobs (Section 15 & 16) */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Recommended Jobs for You</span>
            </h3>
            <Link
              to="/candidate/jobs"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>View all ({jobs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No open positions posted at this time.</p>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 4).map((job) => {
                const jobMatch = matches.find((m) => m.job?.id === job.id);
                return (
                  <Link
                    key={job.id}
                    to={`/candidate/jobs/${job.id}`}
                    className="block p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-100">{job.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {job.location || 'Remote'} • {job.experience || 'Any level'}
                        </p>
                      </div>

                      {jobMatch ? (
                        <MatchScoreBadge score={jobMatch.matchScore} size="sm" />
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                          Open Role
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {job.requiredSkills?.split(',').slice(0, 4).map((s, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Skill Gap & Strengths Summary (Section 15) */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Skill Gaps & Recommendations</span>
            </h3>
            <Link
              to="/candidate/skills"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>Full Analysis</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Missing skills to improve */}
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-2">
              Skills to Improve (Gaps Identified)
            </span>
            {missingSkillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missingSkillsList.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-950/30 text-amber-200 border border-amber-500/20"
                  >
                    <span>⚠</span>
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                {hasResume
                  ? 'Great alignment! No prominent skill gaps identified so far.'
                  : 'Upload your resume to receive AI skill gap insights.'}
              </p>
            )}
          </div>

          {/* Top validated skills */}
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
              Skills You Have (Verified)
            </span>
            {matchingSkillsList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchingSkillsList.map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-950/30 text-emerald-200 border border-emerald-500/20"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Upload your resume to extract validated skills.
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between">
            <span>Want detailed learning recommendations for open jobs?</span>
            <Link
              to="/candidate/skills"
              className="font-bold underline text-indigo-300 hover:text-white"
            >
              Analyze
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
