import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Sparkles, LogOut, User as UserIcon, Bell, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import candidateService from '../../services/candidateService';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout, isRecruiter } = useAuth();
  const navigate = useNavigate();
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
  const hasDecision = candidateProfile?.submissionStatus && ['SHORTLISTED', 'REJECTED', 'VALIDATED'].includes(candidateProfile.submissionStatus);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left side: Hamburger + Brand */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to={homePath} className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-white tracking-tight">TalentIQ</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                AI Platform
              </span>
            </div>
          </div>
        </Link>
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
                    ? 'text-red-300 bg-red-950/40 border-red-500/40 hover:bg-red-900/50'
                    : 'text-emerald-300 bg-emerald-950/40 border-emerald-500/40 hover:bg-emerald-900/50'
                  : 'text-slate-400 bg-slate-900 border-slate-800 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              {hasDecision && (
                <span
                  className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping ${
                    candidateProfile.submissionStatus === 'SHORTLISTED'
                      ? 'bg-purple-400'
                      : candidateProfile.submissionStatus === 'REJECTED'
                      ? 'bg-red-400'
                      : 'bg-emerald-400'
                  }`}
                />
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Application Notifications
                  </span>
                  <span className="text-[10px] text-slate-500">Recruiter Updates</span>
                </div>

                {candidateProfile?.submissionStatus === 'SHORTLISTED' ? (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-black text-purple-300 uppercase tracking-wider">
                        SELECTED / SHORTLISTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-200">
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
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-black text-red-300 uppercase tracking-wider">
                        APPLICATION REJECTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-200">
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
                      className="inline-flex items-center space-x-1 text-xs font-bold text-red-400 hover:text-red-300"
                    >
                      <span>View Skill Gaps & Improve</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : candidateProfile?.submissionStatus === 'VALIDATED' ? (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">Application Validated</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      {candidateProfile.validationNotes || 'Your resume has been validated and accepted into the recruiter talent pool.'}
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

        {user && (
          <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200">{user.name || user.email?.split('@')[0]}</span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-red-400 hover:bg-red-950/20 border border-slate-800 hover:border-red-500/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
