import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BotMessageSquare,
  FileQuestion,
  BarChart3,
  UserCircle,
  FileText,
  Compass,
  CheckSquare,
  Sparkles,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import TalentIQLogo from './TalentIQLogo';

const Sidebar = ({ isOpen, closeSidebar, isCollapsed = false, toggleCollapse }) => {
  const { isRecruiter } = useAuth();
  const location = useLocation();

  const recruiterNavItems = [
    { label: 'Overview', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Job Openings', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Candidate Directory', path: '/recruiter/candidates', icon: Users },
    { label: 'AI Recruiter Copilot', path: '/recruiter/copilot', icon: BotMessageSquare, highlight: true },
    { label: 'Interview Assistant', path: '/recruiter/interview', icon: FileQuestion },
    { label: 'Analytics & Insights', path: '/recruiter/analytics', icon: BarChart3 },
    { label: 'Profile & Settings', path: '/recruiter/profile', icon: UserCircle },
  ];

  const candidateNavItems = [
    { label: 'Career Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'My Resume & PDF', path: '/candidate/resume', icon: FileText },
    { label: 'Recommended Jobs', path: '/candidate/jobs', icon: Compass },
    { label: 'Match Breakdown', path: '/candidate/matches', icon: CheckSquare },
    { label: 'Skill Gap Analysis', path: '/candidate/skills', icon: TrendingUp, highlight: true },
    { label: 'Interview Prep', path: '/candidate/interview', icon: Sparkles },
    { label: 'Profile & Settings', path: '/candidate/profile', icon: UserCircle },
  ];

  const navItems = isRecruiter ? recruiterNavItems : candidateNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 border-r border-white/[0.08] bg-[#0D1222] transition-all duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64 flex flex-col justify-between p-3.5 select-none`}
      >
        <div className="space-y-4">
          {/* Role Section Title & Desktop Collapse Toggle */}
          <div className="flex items-center justify-between px-2 py-1">
            {!isCollapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isRecruiter ? 'Recruitment Intelligence' : 'Candidate Portal'}
              </span>
            )}
            {toggleCollapse && (
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#172238] transition-colors ml-auto"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/recruiter/dashboard' &&
                  item.path !== '/candidate/dashboard' &&
                  location.pathname.startsWith(`${item.path}/`));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  title={isCollapsed ? item.label : undefined}
                  className={`group relative flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-3 py-2.5'
                  } rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/25 to-indigo-600/15 text-white border border-purple-500/30 shadow-sm shadow-purple-600/10'
                      : 'text-slate-400 hover:text-white hover:bg-[#121A2B]'
                  }`}
                >
                  {/* Active accent bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-purple-400 to-sky-400" />
                  )}

                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      isActive
                        ? 'text-purple-400'
                        : item.highlight
                        ? 'text-sky-400 group-hover:text-purple-300'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />

                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.highlight && (
                        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-sky-500 text-white px-1.5 py-0.5 rounded shadow-sm">
                          AI
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Responsible AI Footer Badge */}
        {!isCollapsed ? (
          <div className="pt-4 border-t border-white/[0.08] text-[11px] text-slate-400 leading-normal px-2 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-slate-200 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ethical AI Standard</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Decision support for human recruiters. Final hiring choices remain with people.
            </p>
          </div>
        ) : (
          <div className="pt-3 border-t border-white/[0.08] flex justify-center text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" title="Ethical AI Decision Support" />
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
