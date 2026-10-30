import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Sparkles, LogOut, User as UserIcon, Bell, CheckCircle2, AlertCircle, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import candidateService from '../../services/candidateService';
import TalentIQLogo from './TalentIQLogo';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout, isRecruiter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [candidateProfile, setCandidateProfile] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (!isRecruiter && user) {
      candidateService
        .getMyProfile()
        .then((data) => setCandidateProfile(data))
        .catch(() => {});
    }
  }, [isRecruiter, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homePath = isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard';
  const hasDecision =
    candidateProfile?.submissionStatus &&
    ['SHORTLISTED', 'REJECTED', 'VALIDATED'].includes(candidateProfile.submissionStatus);

  // Compute breadcrumb title
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/dashboard')) return 'Dashboard Overview';
    if (p.includes('/jobs')) return 'Job Openings & Requirements';
    if (p.includes('/candidates')) return 'Candidate Directory & AI Analysis';
    if (p.includes('/copilot')) return 'AI Recruiter Copilot';
    if (p.includes('/interview')) return 'Interview Assistant';
    if (p.includes('/analytics')) return 'Recruitment Analytics & Insights';
    if (p.includes('/resume')) return 'Resume Parsing & Upload';
    if (p.includes('/matches')) return 'Job Matches & Alignment';
    if (p.includes('/skills')) return 'Skill Gap Analysis';
    if (p.includes('/profile')) return 'Account Profile & Settings';
    return 'Workspace';
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/[0.08] bg-[#080B16]/90 px-4 md:px-6 backdrop-blur-md select-none">
      {/* Left side: Hamburger (mobile) + Brand Logo + Breadcrumb */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#121A2B] md:hidden transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to={homePath} className="flex items-center">
          <TalentIQLogo size="md" />
        </Link>

        {/* Desktop Breadcrumb divider */}
        <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-white/[0.08] text-xs">
          <span className="text-slate-400 font-medium">Platform</span>
          <span className="text-slate-500">/</span>
          <span className="text-white font-semibold">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right side: Notifications + User Profile Chip & Actions */}
      <div className="flex items-center space-x-3">
        {/* Candidate Notification Bell */}
        {!isRecruiter && (
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              title="Application Notifications"
              className={`relative p-2 rounded-xl border transition-all ${
                hasDecision
                  ? candidateProfile.submissionStatus === 'SHORTLISTED'
                    ? 'text-purple-300 bg-purple-950/40 border-purple-500/40 hover:bg-purple-900/50'
                    : candidateProfile.submissionStatus === 'REJECTED'
                    ? 'text-rose-300 bg-rose-950/40 border-rose-500/40 hover:bg-rose-900/50'
                    : 'text-emerald-300 bg-emerald-950/40 border-emerald-500/40 hover:bg-emerald-900/50'
                  : 'text-slate-400 bg-[#121A2B] border-white/[0.08] hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              {hasDecision && (
                <span
                  className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping ${
                    candidateProfile.submissionStatus === 'SHORTLISTED'
                      ? 'bg-purple-400'
                      : candidateProfile.submissionStatus === 'REJECTED'
                      ? 'bg-rose-400'
                      : 'bg-emerald-400'
                  }`}
                />
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0D1222] border border-white/[0.12] shadow-2xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Application Notifications
                  </span>
                  <span className="text-[10px] text-slate-400">Recruiter Updates</span>
                </div>

                {candidateProfile?.submissionStatus === 'SHORTLISTED' ? (
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-black text-purple-300 uppercase tracking-wider">
                        SELECTED / SHORTLISTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {candidateProfile.validationNotes ||
                        'Great news! The recruiter has reviewed your resume and you have been SHORTLISTED for interview rounds!'}
                    </p>
                    {candidateProfile.validatedAt && (
                      <span className="text-[10px] text-slate-400 block">
                        Updated {new Date(candidateProfile.validatedAt).toLocaleDateString()}
                      </span>
                    )}
                    <Link
                      to="/candidate/interview"
                      onClick={() => setIsNotificationOpen(false)}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-purple-400 hover:text-purple-300"
                    >
                      <span>Prepare for Interviews</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : candidateProfile?.submissionStatus === 'REJECTED' ? (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-black text-rose-300 uppercase tracking-wider">
                        APPLICATION REJECTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {candidateProfile.validationNotes ||
                        'The recruiter evaluated your resume and your profile was not selected for this role. Check your skill gaps to improve.'}
                    </p>
                    {candidateProfile.validatedAt && (
                      <span className="text-[10px] text-slate-400 block">
                        Updated {new Date(candidateProfile.validatedAt).toLocaleDateString()}
                      </span>
                    )}
                    <Link
                      to="/candidate/skills"
                      onClick={() => setIsNotificationOpen(false)}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-rose-400 hover:text-rose-300"
                    >
                      <span>View Skill Gaps & Improve</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : candidateProfile?.submissionStatus === 'VALIDATED' ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">Application Validated</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {candidateProfile.validationNotes ||
                        'Your resume has been validated and accepted into the recruiter talent pool.'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400">
                    <span>No new notifications at this time.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* User Profile Chip */}
        {user && (
          <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-white/[0.08]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                {user.name || user.email?.split('@')[0]}
              </span>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-400 hover:bg-rose-950/20 border border-white/[0.08] hover:border-rose-500/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
