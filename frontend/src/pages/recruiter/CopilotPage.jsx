import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  User,
  Briefcase,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  CornerDownLeft,
} from 'lucide-react';
import aiService from '../../services/aiService';
import jobService from '../../services/jobService';
import ErrorAlert from '../../components/common/ErrorAlert';

const formatInline = (text) => {
  if (!text) return text;
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="text-slate-300 italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-purple-950/70 text-purple-300 px-1 py-0.5 rounded text-xs">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const FormattedMessage = ({ text, isAi }) => {
  if (!text) return null;
  if (!isAi) {
    return <div className="whitespace-pre-wrap">{text}</div>;
  }

  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-sm font-bold text-purple-300 mt-2.5 mb-1 flex items-center space-x-1.5">
              <span>{formatInline(trimmed.replace(/^###\s+/, ''))}</span>
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-base font-bold text-white mt-3 mb-1.5">
              {formatInline(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-lg font-extrabold text-white mt-3 mb-1.5">
              {formatInline(trimmed.replace(/^#\s+/, ''))}
            </h1>
          );
        }
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-2 border-white/10" />;
        }
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1.5">
              <span className="text-purple-400 mt-1 text-xs">•</span>
              <span className="flex-1">{formatInline(content)}</span>
            </div>
          );
        }
        return <p key={idx}>{formatInline(trimmed)}</p>;
      })}
    </div>
  );
};

const CopilotPage = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your TalentIQ AI Recruiter Copilot powered by Google Gemini. I analyze candidate resumes, compare qualifications against job descriptions, explain ranking rationale, and highlight critical skill gaps. How can I assist your hiring workflow today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'Who are the top candidates for this job?',
    'Explain the strongest qualifications among applicants',
    'Identify common skill gaps for this role',
    'Generate technical interview questions',
    'Compare candidates against the job requirements',
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobService.getAllJobs();
        setJobs(data || []);
      } catch (err) {
        console.error('Failed to load jobs for Copilot context:', err);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (questionToSend) => {
    const query = questionToSend || input;
    if (!query.trim() || isThinking) return;

    const userMessage = {
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    setError(null);

    try {
      const jobId = selectedJobId ? Number(selectedJobId) : null;
      const res = await aiService.askCopilot(query.trim(), jobId);

      const aiMessage = {
        sender: 'ai',
        text: res.answer || 'I have analyzed the current recruitment context.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || 'Unable to communicate with AI Copilot.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Conversation cleared. Ready for your next recruitment query!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[560px] space-y-4 animate-fadeIn">
      {/* Header with Job Focus Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <BotMessageSquare className="w-6 h-6 text-purple-400" />
              <span>AI Recruiter Copilot</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-sky-500 text-white px-2 py-0.5 rounded-full shadow-sm">
              Gemini Powered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time conversational recruitment intelligence, candidate comparisons, and ranking explanations.
          </p>
        </div>

        {/* Job context selector */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Briefcase className="w-3.5 h-3.5 text-purple-400" />
            <span>Scope:</span>
          </div>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#121A2B] border border-white/[0.12] text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">All Jobs & Candidates</option>
            {jobs.map((j) => (
              <option key={j.id} value={String(j.id)}>
                {j.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleResetChat}
            title="Reset conversation"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={() => handleSend(messages[messages.length - 1]?.text)} />

      {/* Suggested Prompt Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
          Suggested:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isThinking}
            className="text-[11px] font-medium bg-[#121A2B] hover:bg-[#172238] text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/[0.08] hover:border-purple-500/40 transition-all whitespace-nowrap flex-shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#080B16] p-4 sm:p-6 space-y-4 shadow-inner">
        {messages.map((msg, index) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={index}
              className={`flex items-start space-x-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-purple-600/20 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isAi
                    ? 'bg-[#121A2B] border border-white/[0.08] text-slate-200'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-purple-600/20'
                }`}
              >
                <FormattedMessage text={msg.text} isAi={isAi} />

                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/10 text-[10px] opacity-70">
                  <span>{isAi ? 'TalentIQ Copilot' : 'Recruiter'} • {msg.timestamp}</span>
                  {isAi && (
                    <button
                      onClick={() => handleCopy(msg.text, index)}
                      className="hover:opacity-100 p-0.5 ml-2 transition-opacity cursor-pointer text-slate-400 hover:text-white"
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 flex-shrink-0 mt-1 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-purple-600/20 mt-1">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-[#121A2B] border border-white/[0.08] rounded-2xl p-4 text-xs text-purple-300 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>TalentIQ Copilot is analyzing candidate qualifications and ranking data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            selectedJobId
              ? 'Ask anything about candidates for the selected position...'
              : 'Ask Copilot about any candidate, skill match, or ranking rationale...'
          }
          className="w-full pl-4 pr-24 py-3.5 bg-[#121A2B] border border-white/[0.12] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
        />

        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="absolute inset-y-1.5 right-1.5 px-4 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1.5 shadow-md shadow-purple-600/25 cursor-pointer"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default CopilotPage;
