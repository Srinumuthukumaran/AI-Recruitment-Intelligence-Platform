import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { isRecruiter } = useAuth();
  const location = useLocation();

  const recruiterNavItems = [
    { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Candidates', path: '/recruiter/candidates', icon: Users },
    { label: 'AI Copilot', path: '/recruiter/copilot', icon: BotMessageSquare, highlight: true },
    { label: 'Interview Gen', path: '/recruiter/interview', icon: FileQuestion },
    { label: 'Analytics', path: '/recruiter/analytics', icon: BarChart3 },
    { label: 'Profile', path: '/recruiter/profile', icon: UserCircle },
  ];

  const candidateNavItems = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'My Resume', path: '/candidate/resume', icon: FileText },
    { label: 'Recommended Jobs', path: '/candidate/jobs', icon: Compass },
    { label: 'My Matches', path: '/candidate/matches', icon: CheckSquare },
    { label: 'Skill Gaps', path: '/candidate/skills', icon: TrendingUp, highlight: true },
    { label: 'Interview Prep', path: '/candidate/interview', icon: Sparkles },
    { label: 'Profile', path: '/candidate/profile', icon: UserCircle },
  ];

  const navItems = isRecruiter ? recruiterNavItems : candidateNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-md transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between p-4 overflow-y-auto`}
      >
        <div className="space-y-6">
          <div className="px-3 py-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isRecruiter ? 'Recruitment Suite' : 'Candidate Portal'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive
                        ? 'text-indigo-400'
                        : item.highlight
                        ? 'text-purple-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wide bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-1.5 py-0.5 rounded">
                      AI
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Responsible AI footer badge */}
        <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 leading-normal px-2">
          <p className="flex items-center space-x-1.5 text-slate-300 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>TalentIQ Intelligence</span>
          </p>
          <p className="text-slate-400 text-[10px]">
            Decision-support for human recruiters. Final decisions remain with people.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
