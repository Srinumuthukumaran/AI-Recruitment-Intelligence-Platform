import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileQuestion,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  Briefcase,
  User,
  Sliders,
  CheckCircle2,
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

const InterviewGeneratorPage = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';
  const initialCandidateId = searchParams.get('candidateId') || '';

  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Controls
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [selectedCandidateId, setSelectedCandidateId] = useState(initialCandidateId);
  const [difficulty, setDifficulty] = useState('Mid-level');
  const [questionCount, setQuestionCount] = useState(5);

  // Generated state
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [jobsData, candidatesData] = await Promise.all([
          jobService.getAllJobs(),
          candidateService.getAllCandidates(),
        ]);
        setJobs(jobsData || []);
        setCandidates(candidatesData || []);

        if (!selectedJobId && jobsData?.length > 0) {
          setSelectedJobId(String(jobsData[0].id));
        }
        if (!selectedCandidateId && candidatesData?.length > 0) {
          setSelectedCandidateId(String(candidatesData[0].id));
        }
      } catch (err) {
        setError(err.message || 'Failed to load prerequisite recruitment data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedJobId || !selectedCandidateId) {
      setError('Please select both a job position and a candidate.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const data = await aiService.generateInterviewQuestions({
        jobId: Number(selectedJobId),
        candidateId: Number(selectedCandidateId),
        difficulty,
        questionCount: Number(questionCount),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to generate tailored interview questions.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySingle = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyAll = () => {
    if (!result?.questions) return;
    const formatted = result.questions
      .map(
        (q, i) =>
          `[${q.category.toUpperCase()}] Q${i + 1}: ${q.question}\nFocus: ${q.focusArea}\nGuidance: ${q.guidance}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.questions) return;
    const formatted =
      `TalentIQ AI Interview Questions\n` +
      `Job: ${result.jobTitle}\n` +
      `Candidate: ${result.candidateName}\n` +
      `Difficulty: ${result.difficulty}\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `==================================================\n\n` +
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
    a.download = `Interview_Questions_${result.candidateName?.replace(/\s+/g, '_')}_${result.jobTitle?.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category) => {
    const c = category?.toLowerCase() || '';
    if (c.includes('tech')) return <Code2 className="w-4 h-4 text-purple-400" />;
    if (c.includes('project')) return <Cpu className="w-4 h-4 text-sky-400" />;
    if (c.includes('problem')) return <HelpCircle className="w-4 h-4 text-amber-400" />;
    return <MessageSquare className="w-4 h-4 text-emerald-400" />;
  };

  const getCategoryColor = (category) => {
    const c = category?.toLowerCase() || '';
    if (c.includes('tech')) return 'border-purple-500/30 bg-purple-950/20 text-purple-300';
    if (c.includes('project')) return 'border-sky-500/30 bg-sky-950/20 text-sky-300';
    if (c.includes('problem')) return 'border-amber-500/30 bg-amber-950/20 text-amber-300';
    return 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300';
  };

  if (loading) {
    return <LoadingSpinner message="Loading interview configuration options..." />;
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pb-2 border-b border-white/[0.08]">
        <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
          <FileQuestion className="w-4 h-4" />
          <span>Evaluation Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Interview Question Generator
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-sky-500 text-white px-2 py-0.5 rounded-full shadow-sm">
            4-Category Engine
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Synthesize role-calibrated technical, project, problem-solving, and behavioral questions calibrated to the candidate's exact resume.
        </p>
      </div>

      <ErrorAlert message={error} onRetry={handleGenerate} />

      {/* Generator Controls Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.08] bg-[#121A2B] space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Job select */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              <span>Target Job Position</span>
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B16] border border-white/[0.12] text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={String(j.id)}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Candidate select */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Target Candidate</span>
            </label>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B16] border border-white/[0.12] text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
            >
              {candidates.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name || c.email?.split('@')[0]} ({c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Difficulty Level</span>
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B16] border border-white/[0.12] text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Junior / Entry-level">Junior / Entry-level</option>
              <option value="Mid-level">Mid-level (Default)</option>
              <option value="Senior Specialist">Senior Specialist</option>
              <option value="Lead / Principal Architect">Lead / Principal Architect</option>
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Question Count</span>
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B16] border border-white/[0.12] text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
            >
              <option value={4}>4 Questions (1 per category)</option>
              <option value={5}>5 Questions (Balanced)</option>
              <option value={8}>8 Questions (In-depth)</option>
              <option value={10}>10 Questions (Comprehensive)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-white/[0.08]">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating tailored questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Questions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Output */}
      {result ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Generated Questions for {result.candidateName}
              </h2>
              <p className="text-xs text-slate-400">
                Position: <span className="text-slate-200 font-semibold">{result.jobTitle}</span> • Difficulty: {result.difficulty}
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={handleCopyAll}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#121A2B] hover:bg-[#172238] text-slate-300 border border-white/[0.08] transition-colors cursor-pointer"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'Copied All!' : 'Copy All'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#121A2B] hover:bg-[#172238] text-slate-300 border border-white/[0.08] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download (.txt)</span>
              </button>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {result.questions?.map((q, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] flex flex-col justify-between hover:border-purple-500/40 transition-all group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getCategoryColor(
                        q.category
                      )}`}
                    >
                      {getCategoryIcon(q.category)}
                      <span>{q.category}</span>
                    </span>

                    <button
                      onClick={() => handleCopySingle(q.question, idx)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="Copy Question"
                    >
                      {copiedId === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                    {idx + 1}. {q.question}
                  </h3>

                  {q.focusArea && (
                    <div className="mt-3 text-xs text-purple-300 flex items-center space-x-1">
                      <strong>Focus:</strong>
                      <span>{q.focusArea}</span>
                    </div>
                  )}

                  {q.guidance && (
                    <div className="mt-3 p-3 rounded-xl bg-[#080B16] border border-white/[0.06] text-xs text-slate-300 leading-relaxed">
                      <strong className="text-white block mb-0.5">Evaluation Guidance:</strong>
                      {q.guidance}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileQuestion}
          title="No questions generated yet"
          description="Select a job position and candidate above, then click 'Generate Questions' to synthesize tailored interview inquiries."
          actionText="Generate Sample Questions"
          onAction={handleGenerate}
        />
      )}
    </div>
  );
};

export default InterviewGeneratorPage;
