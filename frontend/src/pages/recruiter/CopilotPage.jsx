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
} from 'lucide-react';
import aiService from '../../services/aiService';
import jobService from '../../services/jobService';
import ErrorAlert from '../../components/common/ErrorAlert';

const CopilotPage = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your TalentIQ AI Recruiter Copilot. I analyze candidate resumes, compare skills against job descriptions, explain ranking rationale, and identify critical skill gaps. How can I assist your hiring workflow today?",
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
    'Why was this candidate ranked higher?',
    'Which candidates have Spring Boot experience?',
    'What skills are most commonly missing?',
    'Give me the top 3 candidates for this position.',
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
        text: res.answer || "I have analyzed the current recruitment context.",
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
        text: "Chat cleared. Ready for your next recruitment query!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] space-y-4">
      {/* Header with Job Focus context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <BotMessageSquare className="w-6 h-6 text-indigo-400" />
              <span>AI Recruiter Copilot</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full shadow-sm">
              Live Assistant
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time conversational recruitment intelligence powered by Google Gemini.
          </p>
        </div>

        {/* Job context selector */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Context:</span>
          </div>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
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
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ErrorAlert message={error} onRetry={() => handleSend(messages[messages.length - 1]?.text)} />

      {/* Quick Prompt Suggestions */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-500 uppercase flex-shrink-0">
          Suggested:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isThinking}
            className="text-[11px] font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all whitespace-nowrap flex-shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6 space-y-4">
        {messages.map((msg, index) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={index}
              className={`flex items-start space-x-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-indigo-600/20 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isAi
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px] opacity-70">
                  <span>{isAi ? 'TalentIQ Copilot' : 'Recruiter'} • {msg.timestamp}</span>
                  {isAi && (
                    <button
                      onClick={() => handleCopy(msg.text, index)}
                      className="hover:opacity-100 p-0.5 ml-2 transition-opacity"
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-indigo-600/20 mt-1">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-indigo-300 flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>TalentIQ Copilot is analyzing candidate qualifications and ranking data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
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
              ? `Ask anything about candidates for the selected job position...`
              : `Ask Copilot about any candidate, skill match, or ranking rationale...`
          }
          className="w-full pl-4 pr-24 py-3.5 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
        />

        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="absolute inset-y-1.5 right-1.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1.5 shadow-md shadow-indigo-600/25"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default CopilotPage;
