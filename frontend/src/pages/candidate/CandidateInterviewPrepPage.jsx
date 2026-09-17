import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileQuestion,
  Sparkles,
  Briefcase,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sliders,
  Eye,
  EyeOff,
  Loader2,
  Code2,
  Cpu,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import jobService from '../../services/jobService';
import candidateService from '../../services/candidateService';
import aiService from '../../services/aiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';

const CandidateInterviewPrepPage = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [difficulty, setDifficulty] = useState('Mid-level');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [revealedGuidance, setRevealedGuidance] = useState({});
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const [jobsData, profileData] = await Promise.all([
          jobService.getAllJobs(),
          candidateService.getMyProfile(),
        ]);
        setJobs(jobsData || []);
        setProfile(profileData);

        const target = initialJobId || (jobsData && jobsData[0]?.id ? String(jobsData[0].id) : '');
        setSelectedJobId(target);
      } catch (err) {
        setError(err.message || 'Failed to initialize interview preparation portal.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const handleGenerate = async () => {
    if (!selectedJobId) {
      setError('Please select a target job position.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRevealedGuidance({});

    try {
      const data = await aiService.generateInterviewQuestions({
        jobId: Number(selectedJobId),
        candidateId: profile?.id,
        difficulty,
        questionCount: 5,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to generate tailored interview questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleGuidance = (idx) => {
    setRevealedGuidance((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleDownload = () => {
    if (!result?.questions) return;
    const formatted = `TalentIQ Interview Practice Sheet
Job: ${result.jobTitle}
Candidate: ${result.candidateName || profile?.name}
Difficulty: ${result.difficulty}
==================================================

` +
      result.questions
        .map(
          (q, i) =>
            `${i + 1}. [${q.category}] ${q.question}\n   Focus Area: ${q.focusArea}\n   Guidance: ${q.guidance}\n`
        )
        .join('\n');

    const blob = new Blob([formatted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TalentIQ_Interview_Prep_${result.jobTitle?.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category) => {
    const c = category?.toLowerCase() || '';
    if (c.includes('tech')) return <Code2 className="w-4 h-4 text-indigo-400" />;
    if (c.includes('project')) return <Cpu className="w-4 h-4 text-purple-400" />;
    if (c.includes('problem')) return <HelpCircle className="w-4 h-4 text-amber-400" />;
    return <MessageSquare className="w-4 h-4 text-emerald-400" />;
  };

  if (loading) {
    return <LoadingSpinner message="Preparing interview simulator..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <FileQuestion className="w-6 h-6 text-indigo-400" />
          <span>Interview Preparation Simulator</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Practice questions customized specifically for your resume and target job opening.
        </p>
      </div>

      <ErrorAlert message={error} onRetry={handleGenerate} />

      {/* Control Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Position to Practice For
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={String(j.id)}>
                  {j.title} ({j.location || 'Remote'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Preparation Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Junior / Entry-level">Junior / Entry-level</option>
              <option value="Mid-level">Mid-level (Recommended)</option>
              <option value="Senior Specialist">Senior Specialist</option>
              <option value="Lead / Principal">Lead / Principal</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-800">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedJobId}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing tailored questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Start Practice Session</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Practice Cards */}
      {result ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                Practice Session: {result.jobTitle}
              </h2>
              <p className="text-xs text-slate-400">
                Difficulty: {result.difficulty} • 4 Categories Included
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleDownload}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Prep Sheet</span>
              </button>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Set</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result.questions?.map((q, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-950/20 text-indigo-300">
                    {getCategoryIcon(q.category)}
                    <span>{q.category}</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(q.question, idx)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Copy Question"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => toggleGuidance(idx)}
                      className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-950/30 transition-colors"
                    >
                      {revealedGuidance[idx] ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide Tips</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Show Guidance</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                  {idx + 1}. {q.question}
                </h3>

                {q.focusArea && (
                  <p className="text-xs text-indigo-300">
                    <strong>Evaluated Core Concept:</strong> {q.focusArea}
                  </p>
                )}

                {revealedGuidance[idx] && q.guidance && (
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400 block mb-1">Interview Tip & Answer Strategy:</strong>
                    {q.guidance}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileQuestion}
          title="Ready to Practice"
          description="Click 'Start Practice Session' to generate customized interview questions tailored for your skills and target role."
          actionText="Generate Practice Questions"
          onAction={handleGenerate}
        />
      )}
    </div>
  );
};

export default CandidateInterviewPrepPage;
