import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BotMessageSquare,
  FileCheck2,
  TrendingUp,
  FileQuestion,
  Users,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Compass,
  Star,
  Activity,
  Award,
  Layers,
  Zap,
} from 'lucide-react';
import TalentIQLogo from '../components/common/TalentIQLogo';
import { useAuth } from '../context/AuthContext';
import { RadialScoreRing } from '../components/recruiter/MatchScoreBadge';

const LandingPage = () => {
  const { isAuthenticated, isRecruiter } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'analysis', 'copilot', 'interview'
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    // Smooth entry trigger
    const timer = setTimeout(() => setHasEntered(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const dashboardTarget = isAuthenticated
    ? isRecruiter
      ? '/recruiter/dashboard'
      : '/candidate/dashboard'
    : '/login';

  return (
    <div className="min-h-screen bg-[#080B16] text-[#F8FAFC] relative overflow-hidden flex flex-col font-sans">
      {/* Background ambient lighting and network mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none opacity-40">
        <div className="absolute top-[-100px] left-[15%] w-[480px] h-[480px] bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[-40px] right-[15%] w-[420px] h-[420px] bg-sky-500/15 rounded-full blur-[130px]" />
        <div className="absolute top-[280px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Subtle geometric grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Top Navigation */}
      <header className="relative z-30 w-full border-b border-white/[0.06] bg-[#080B16]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <TalentIQLogo size="md" showSubtitle={true} />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Platform Features
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Live Preview
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              AI Architecture
            </a>
            <a href="#transparency" className="hover:text-white transition-colors">
              Responsible AI
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to={dashboardTarget}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-20">
        {/* HERO SECTION */}
        <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Subtle reveal badge */}
          <div
            className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold mb-6 shadow-sm shadow-purple-500/10 transition-all duration-700 ${
              hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Next-Generation AI Recruitment Intelligence</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="text-slate-300">Powered by Google Gemini</span>
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12] transition-all duration-700 delay-100 ${
              hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Recruit Smarter.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-sky-400 bg-clip-text text-transparent">
              Discover Better Talent.
            </span>
          </h1>

          {/* Supporting Text */}
          <p
            className={`mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Turn resumes into actionable insights with AI-powered candidate matching, explainable
            skill analysis, and intelligent hiring workflows.
          </p>

          {/* CTAs */}
          <div
            className={`mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${
              hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <a
              href="#preview"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-[#121A2B] hover:bg-[#172238] text-white border border-white/10 hover:border-purple-500/40 transition-all shadow-md"
            >
              <Activity className="w-4 h-4 text-sky-400" />
              <span>Explore the Platform</span>
            </a>

            <Link
              to={isAuthenticated ? dashboardTarget : '/register'}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.99] transition-all"
            >
              <span>{isAuthenticated ? 'Open Workspace' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Key Trust Counters */}
          <div
            className={`mt-12 pt-8 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-700 delay-400 ${
              hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1">Explainable AI Scoring</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">PDFBox</div>
              <div className="text-xs text-slate-400 mt-1">High-Precision Extraction</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">4-Category</div>
              <div className="text-xs text-slate-400 mt-1">Interview Question Engine</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">Ethical</div>
              <div className="text-xs text-slate-400 mt-1">Responsible AI Guardrails</div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE LIVE PLATFORM PREVIEW SECTION */}
        <section id="preview" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Interactive Workspace Preview
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-3">
              Designed for High-Volume Recruitment Speed & Quality
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Explore how TalentIQ unifies candidate discovery, circular matching metrics, conversational
              copilot queries, and interview preparation in a unified command center.
            </p>
          </div>

          {/* Interactive Preview Tabs */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'dashboard', label: 'Recruiter Dashboard', icon: Briefcase },
              { id: 'analysis', label: 'AI Match Evaluation', icon: Award },
              { id: 'copilot', label: 'Recruiter AI Copilot', icon: BotMessageSquare },
              { id: 'interview', label: 'Interview Generator', icon: FileQuestion },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 border border-purple-400/40'
                      : 'bg-[#121A2B] text-slate-300 hover:text-white hover:bg-[#172238] border border-white/[0.08]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Platform Preview Container with glowing glass frame */}
          <div className="rounded-3xl border border-white/[0.12] bg-[#0D1222]/90 backdrop-blur-xl p-4 sm:p-8 shadow-2xl shadow-purple-950/30 overflow-hidden relative">
            {/* Top window mock controls */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">
                  app.talentiq.ai / {activeTab}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gemini 2.5 Active</span>
                </span>
              </div>
            </div>

            {/* TAB 1: RECRUITER DASHBOARD PREVIEW */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Metric Cards Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl p-4 sm:p-5 bg-[#121A2B] border border-white/[0.08]">
                    <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
                      <span>Active Jobs</span>
                      <Briefcase className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">12</div>
                    <span className="text-[11px] text-purple-400 mt-1 block">4 high-priority roles</span>
                  </div>

                  <div className="rounded-2xl p-4 sm:p-5 bg-[#121A2B] border border-white/[0.08]">
                    <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
                      <span>Candidates</span>
                      <Users className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">48</div>
                    <span className="text-[11px] text-sky-400 mt-1 block">14 submitted today</span>
                  </div>

                  <div className="rounded-2xl p-4 sm:p-5 bg-[#121A2B] border border-white/[0.08]">
                    <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
                      <span>Evaluated Matches</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">156</div>
                    <span className="text-[11px] text-emerald-400 mt-1 block">Full AI breakdown</span>
                  </div>

                  <div className="rounded-2xl p-4 sm:p-5 bg-[#121A2B] border border-white/[0.08]">
                    <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-semibold">
                      <span>Mean Alignment</span>
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">84.5%</div>
                    <span className="text-[11px] text-amber-400 mt-1 block">+6.2% vs benchmark</span>
                  </div>
                </div>

                {/* Split preview: Recent Candidates + Pipeline Funnel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Candidates preview list */}
                  <div className="lg:col-span-2 rounded-2xl p-5 bg-[#121A2B] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>Top AI Match Rankings</span>
                      </h3>
                      <span className="text-xs text-slate-400">Position: Senior Cloud & Java Architect</span>
                    </div>

                    {[
                      {
                        name: 'Priya Sharma',
                        role: '5+ yrs Exp • Spring Boot, AWS, Docker, Kubernetes',
                        score: 95,
                        status: 'Shortlisted',
                        tagColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                      },
                      {
                        name: 'David Chen',
                        role: '6+ yrs Exp • Java 17, Microservices, Kafka, MySQL',
                        score: 91,
                        status: 'Validated',
                        tagColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                      },
                      {
                        name: 'Ananya Verma',
                        role: 'Junior Dev • Java, REST APIs, OOP, MySQL',
                        score: 78,
                        status: 'Under Review',
                        tagColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                      },
                    ].map((cand, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#172238]/60 border border-white/[0.05] hover:border-purple-500/30 transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-300 font-bold flex items-center justify-center text-sm border border-purple-500/30">
                            {cand.name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{cand.name}</div>
                            <div className="text-xs text-slate-400">{cand.role}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cand.tagColor}`}
                          >
                            {cand.status}
                          </span>
                          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-purple-600 text-white shadow-sm">
                            {cand.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hiring Funnel Stage */}
                  <div className="rounded-2xl p-5 bg-[#121A2B] border border-white/[0.08] flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-1">Recruitment Pipeline Funnel</h3>
                      <p className="text-xs text-slate-400 mb-4">Real-time candidate transition status</p>

                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between text-slate-300 font-medium mb-1">
                            <span>1. Submitted Resumes</span>
                            <span className="font-bold text-white">48 (100%)</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full w-full" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 font-medium mb-1">
                            <span>2. Validated by Recruiter</span>
                            <span className="font-bold text-sky-400">32 (66%)</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full w-[66%]" />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 font-medium mb-1">
                            <span>3. Shortlisted for Interview</span>
                            <span className="font-bold text-emerald-400">14 (29%)</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full w-[29%]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
                      <span>Live backend synced</span>
                      <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1">
                        <span>Open Dashboard</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI MATCH EVALUATION PREVIEW */}
            {activeTab === 'analysis' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Circular Radial Gauge */}
                  <div className="rounded-2xl p-6 bg-[#121A2B] border border-white/[0.08] flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      Candidate Overall Match
                    </span>
                    <RadialScoreRing score={95} size={130} strokeWidth={9} />
                    <p className="text-xs text-emerald-400 font-bold mt-3">Excellent Alignment</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                      Evaluated against Senior Cloud & Java Architect specs.
                    </p>
                  </div>

                  {/* Matching Skills */}
                  <div className="rounded-2xl p-6 bg-[#121A2B] border border-emerald-500/20 bg-emerald-950/10 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                        Matching Skills (Verified)
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Java 17', 'Spring Boot', 'AWS (ECS, S3)', 'Docker', 'Kubernetes', 'MySQL', 'RESTful APIs'].map(
                        (skill, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/50 text-emerald-300 border border-emerald-500/30"
                          >
                            <span>✓</span>
                            <span>{skill}</span>
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Identified Skill Gaps */}
                  <div className="rounded-2xl p-6 bg-[#121A2B] border border-amber-500/20 bg-amber-950/10 space-y-3">
                    <div className="flex items-center space-x-2 text-amber-400">
                      <TrendingUp className="w-5 h-5" />
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                        Skill Gaps (For Review)
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Kafka Event Streaming', 'Terraform IaC', 'Redis Cluster Caching'].map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-500/30"
                        >
                          <span>⚠</span>
                          <span>{skill}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 pt-2">
                      Non-blocking secondary qualifications. Candidate has transferable experience.
                    </p>
                  </div>
                </div>

                {/* AI Rationale Box */}
                <div className="rounded-2xl p-5 bg-[#121A2B] border border-white/[0.08] space-y-2">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Explainable Gemini Analysis Summary</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    "Candidate Priya Sharma demonstrates extensive 5+ years enterprise background in Java 17 and Spring Boot microservice architectures on AWS ECS. Verified direct experience with MySQL query optimization and Docker containerization. Solid cultural and technical alignment for lead engineering positions."
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: AI COPILOT PREVIEW */}
            {activeTab === 'copilot' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="rounded-2xl p-5 bg-[#121A2B] border border-white/[0.08] space-y-4">
                  {/* Message 1: User */}
                  <div className="flex items-start space-x-3 justify-end">
                    <div className="rounded-2xl p-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs sm:text-sm max-w-xl shadow-md">
                      "Copilot, who are the top 2 candidates for our Java Backend role, and what are their key differences?"
                    </div>
                  </div>

                  {/* Message 2: AI */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="rounded-2xl p-4 bg-[#172238] border border-white/[0.08] text-slate-200 text-xs sm:text-sm max-w-2xl space-y-2">
                      <p className="font-semibold text-purple-300">
                        Based on analyzed candidate resumes for Job #1 (Java Backend Developer):
                      </p>
                      <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-300">
                        <li>
                          <strong className="text-white">Priya Sharma (95% Match):</strong> Strongest cloud infrastructure & Kubernetes skills; ideal for lead platform architecture.
                        </li>
                        <li>
                          <strong className="text-white">David Chen (91% Match):</strong> Exceptional database query tuning and transaction throughput experience; ideal for core payment persistence.
                        </li>
                      </ul>
                      <p className="text-[11px] text-slate-400 italic pt-1">
                        Recommendation: Both candidates exceed primary criteria. Suggest scheduling technical rounds focusing on distributed consistency.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prompt suggestion chips */}
                <div className="flex items-center space-x-2 text-xs overflow-x-auto pb-1">
                  <span className="text-slate-400 flex-shrink-0">Suggested:</span>
                  <span className="px-3 py-1 rounded-xl bg-[#121A2B] border border-white/[0.08] text-slate-300 hover:text-white cursor-pointer">
                    Identify critical skill gaps for Job #2
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-[#121A2B] border border-white/[0.08] text-slate-300 hover:text-white cursor-pointer">
                    Generate 5 senior interview questions
                  </span>
                </div>
              </div>
            )}

            {/* TAB 4: INTERVIEW GENERATOR PREVIEW */}
            {activeTab === 'interview' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      category: 'Technical',
                      tagColor: 'border-purple-500/30 bg-purple-950/30 text-purple-300',
                      q: 'How do you design database transaction boundaries and handle optimistic concurrency in high-concurrency Spring Boot microservices?',
                      focus: 'Spring Data JPA & Transaction Isolation',
                      guidance: 'Look for mention of @Transactional propagation, connection pool configuration, and row-level vs optimistic locking.',
                    },
                    {
                      category: 'Project-based',
                      tagColor: 'border-sky-500/30 bg-sky-950/30 text-sky-300',
                      q: 'In your resume you noted reducing latency by 35%. Walk us through the exact diagnostic tools and schema indexes you implemented.',
                      focus: 'Production Optimization & Metrics',
                      guidance: 'Evaluate candidate understanding of execution plans, APM tracing, and database buffer cache hit ratios.',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl p-5 bg-[#121A2B] border border-white/[0.08] flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${item.tagColor} mb-2`}
                        >
                          {item.category} Question
                        </span>
                        <h4 className="text-sm font-semibold text-white leading-snug">{item.q}</h4>
                        <div className="mt-2 text-xs text-purple-300">
                          <strong>Focus:</strong> {item.focus}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-[#172238] border border-white/[0.06] text-xs text-slate-300">
                        <strong className="text-slate-200 block mb-0.5">Recruiter Guidance:</strong>
                        {item.guidance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 6 PRODUCT PILLARS SECTION */}
        <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Engineered for Modern Engineering Recruitment
            </h2>
            <p className="text-base text-slate-300 mt-3">
              Replace subjective resume screening with mathematically sound, explainable AI intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileCheck2,
                title: 'Apache PDFBox Resume Parser',
                desc: 'Deep structural PDF extraction extracts technical competencies, project architectures, years of experience, and credentials with enterprise reliability.',
                accent: 'text-purple-400',
              },
              {
                icon: Award,
                title: 'Multi-Dimensional Match Scoring',
                desc: 'Evaluates candidates on an objective 0–100% scale categorized into 4 tiers: Excellent, Strong, Good, and Moderate alignment.',
                accent: 'text-sky-400',
              },
              {
                icon: TrendingUp,
                title: 'Explainable Skill Gap Identification',
                desc: 'Instantly segregates verified matching skills from missing qualifications, providing immediate clarity for both hiring teams and candidates.',
                accent: 'text-emerald-400',
              },
              {
                icon: BotMessageSquare,
                title: 'AI Recruiter Copilot',
                desc: 'A contextual conversational assistant powered by Google Gemini that analyzes talent pools, explains rankings, and recommends candidates.',
                accent: 'text-amber-400',
              },
              {
                icon: FileQuestion,
                title: 'Adaptive Interview Engine',
                desc: 'Synthesizes custom questions across 4 distinct categories: Technical, Project-based, Problem-solving, and Behavioral, with interviewer guidance.',
                accent: 'text-violet-400',
              },
              {
                icon: ShieldCheck,
                title: 'Responsible & Ethical AI',
                desc: 'Engineered strictly on job-related qualifications. Sensitive personal characteristics are excluded, preserving final decisions with human recruiters.',
                accent: 'text-rose-400',
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-[#121A2B] border border-white/[0.08] hover:border-purple-500/40 transition-all glass-card-hover group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Icon className={`w-6 h-6 ${pillar.accent}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RESPONSIBLE AI & ETHICAL COMMITMENT BANNER */}
        <section id="transparency" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl p-6 sm:p-10 border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-[#121A2B] to-purple-950/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ethical AI Standard</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Human-Centered Decision Support, Not Autonomous Screening
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  TalentIQ evaluates qualifications strictly against objective job requirements. It does not
                  infer or consider sensitive demographic characteristics (race, age, gender, disability, or religion).
                  All match rankings and recommendations are designed to assist human recruiters, who retain full
                  ownership of interview selections and final hiring choices.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  to={isAuthenticated ? dashboardTarget : '/register'}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <span>Experience TalentIQ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/[0.08] bg-[#07090E] py-12 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start space-y-1">
            <TalentIQLogo size="sm" showSubtitle={true} />
            <p className="text-xs text-slate-500 pt-1">
              AI Recruitment Intelligence Platform • Commercial-Grade SaaS Architecture
            </p>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">
              Recruiter Login
            </Link>
            <Link to="/register" className="hover:text-white transition-colors">
              Candidate Portal
            </Link>
            <a href="#transparency" className="hover:text-white transition-colors">
              Ethical AI Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
