import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Briefcase,
  GraduationCap,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import TalentIQLogo from '../../components/common/TalentIQLogo';
import ErrorAlert from '../../components/common/ErrorAlert';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('RECRUITER');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const user = await register({
        name,
        email,
        password,
        role,
      });

      if (role === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B16] text-[#F8FAFC] flex font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Left Brand Showcase Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/[0.08] bg-gradient-to-br from-[#0D1222] via-[#080B16] to-[#0D1222] relative z-10">
        <div>
          <Link to="/">
            <TalentIQLogo size="lg" showSubtitle={true} />
          </Link>

          <div className="mt-20 max-w-lg space-y-6">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Join TalentIQ Intelligence Platform</span>
            </span>

            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Transform Your Hiring Workflow with Explainable AI.
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Create an account to experience automatic PDF resume parsing, candidate qualification
              rankings, skill gap identification, and AI recruiter copilot assistance.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Recruiter Portal: Post positions, rank candidates, generate interview questions</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Candidate Portal: Upload resume, view matched jobs, practice tailored interviews</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Strict job-related evaluation: Zero demographic bias</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 pt-8 border-t border-white/[0.06]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>TalentIQ Ethical AI Hiring Decision Support</span>
        </div>
      </div>

      {/* Right Registration Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-block mb-3">
              <TalentIQLogo size="md" showSubtitle={true} />
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create TalentIQ Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select your role and enter your details to start.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] bg-[#121A2B]/80 shadow-2xl space-y-6">
            <ErrorAlert message={error} onRetry={handleSubmit} />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('RECRUITER')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      role === 'RECRUITER'
                        ? 'border-purple-500 bg-purple-600/20 text-purple-200 shadow-sm shadow-purple-500/20'
                        : 'border-white/[0.08] bg-[#080B16] text-slate-400 hover:border-white/[0.16]'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 mb-1 text-purple-400" />
                    <span className="text-xs font-bold">Recruiter</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Post jobs & rank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('CANDIDATE')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      role === 'CANDIDATE'
                        ? 'border-sky-500 bg-sky-600/20 text-sky-200 shadow-sm shadow-sky-500/20'
                        : 'border-white/[0.08] bg-[#080B16] text-slate-400 hover:border-white/[0.16]'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 mb-1 text-sky-400" />
                    <span className="text-xs font-bold">Candidate</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Upload & match</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create {role === 'RECRUITER' ? 'Recruiter' : 'Candidate'} Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-1">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
