import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  TrendingUp,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Target,
  Clock,
  Layers,
  FileQuestion,
} from 'lucide-react';
import aiService from '../../services/aiService';
import jobService from '../../services/jobService';
import candidateService from '../../services/candidateService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import MatchScoreBadge from '../../components/recruiter/MatchScoreBadge';

const SkillGapPage = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const jobsData = await jobService.getAllJobs();
        setJobs(jobsData || []);

        const target = initialJobId || (jobsData && jobsData[0]?.id ? String(jobsData[0].id) : '');
        setSelectedJobId(target);

        if (target) {
          await analyzeGap(target);
        }
      } catch (err) {
        setError(err.message || 'Failed to load initial job data.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const analyzeGap = async (jobId) => {
    if (!jobId) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await aiService.getMySkillGap(jobId);
      setGapData(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve skill gap analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleJobChange = async (e) => {
    const newJobId = e.target.value;
    setSelectedJobId(newJobId);
    await analyzeGap(newJobId);
  };

  if (loading) {
    return <LoadingSpinner message="Calculating skill requirements and gaps..." />;
  }

  const selectedJob = jobs.find((j) => String(j.id) === String(selectedJobId));

  const getPriorityColor = (priority) => {
    const p = priority?.toUpperCase();
    if (p === 'HIGH') return 'text-red-400 bg-red-950/50 border-red-500/30';
    if (p === 'MEDIUM') return 'text-amber-400 bg-amber-950/50 border-amber-500/30';
    return 'text-blue-400 bg-blue-950/50 border-blue-500/30';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <span>AI Skill Gap Analysis</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Compare your verified resume skills against role specifications with actionable AI learning recommendations.
          </p>
        </div>

        {/* Job selector */}
        {jobs.length > 0 && (
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Target Job:
            </span>
            <select
              value={selectedJobId}
              onChange={handleJobChange}
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

      <ErrorAlert message={error} onRetry={() => analyzeGap(selectedJobId)} />

      {isAnalyzing && (
        <LoadingSpinner message="Evaluating skill alignment and synthesizing tailored learning paths..." />
      )}

      {gapData && !isAnalyzing && (
        <div className="space-y-8">
          {/* Target Job Overview Card */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                Target Role
              </span>
              <h2 className="text-xl font-bold text-white">{gapData.jobTitle}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Required Skills: {selectedJob?.requiredSkills}
              </p>
            </div>

            <div className="flex flex-col sm:items-end flex-shrink-0">
              <span className="text-xs text-slate-400 mb-1">Estimated Compatibility</span>
              <MatchScoreBadge score={gapData.matchScore} size="lg" />
            </div>
          </div>

          {/* Section 14: Skills You Have vs Skills to Improve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills You Have */}
            <div className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/10 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  Skills You Have (Verified in Resume)
                </h3>
              </div>

              {gapData.skillsYouHave?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {gapData.skillsYouHave.map((skill, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 py-2 px-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-slate-200 font-medium"
                    >
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2">
                  No matching technical keywords were explicitly detected in your resume text for this position.
                </p>
              )}
            </div>

            {/* Skills to Improve */}
            <div className="glass-card rounded-2xl p-6 border border-amber-500/20 bg-amber-950/10 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  Skills to Improve (Critical Gaps)
                </h3>
              </div>

              {gapData.skillsToImprove?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {gapData.skillsToImprove.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-slate-200"
                    >
                      <div className="flex items-center space-x-1.5 font-medium truncate">
                        <span className="text-amber-400 font-bold">⚠</span>
                        <span className="truncate">{item.skill}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2">
                  Outstanding alignment! No prominent missing skills identified for this job.
                </p>
              )}
            </div>
          </div>

          {/* AI-Generated Learning Recommendations (Section 14) */}
          {gapData.skillsToImprove?.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span>Prioritized Learning Roadmap & Recommendations</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Close your skill gaps with practical learning paths tailored for this position.
                  </p>
                </div>

                <Link
                  to={`/candidate/interview?jobId=${selectedJobId}`}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
                >
                  <FileQuestion className="w-3.5 h-3.5" />
                  <span>Practice Questions</span>
                </Link>
              </div>

              <div className="space-y-4">
                {gapData.skillsToImprove.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{item.skill}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getPriorityColor(
                            item.priority
                          )}`}
                        >
                          {item.priority} Priority
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        <strong className="text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                          Why It Matters
                        </strong>
                        <p className="text-slate-300 leading-relaxed">{item.reason}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                        <strong className="text-indigo-400 uppercase tracking-wider text-[10px] block mb-1">
                          Recommended Action Path
                        </strong>
                        <p className="text-indigo-200 leading-relaxed">{item.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillGapPage;
