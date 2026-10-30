import React from 'react';

export const TalentIQLogo = ({ size = 'md', showSubtitle = false, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-xs',
  };

  return (
    <div className={`flex items-center space-x-2.5 group select-none ${className}`}>
      {/* AI Network Emblem */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-sky-500 p-[1.5px] shadow-lg shadow-purple-600/20 group-hover:shadow-purple-600/35 transition-all duration-300 flex-shrink-0`}
      >
        <div className="w-full h-full bg-[#080B16] rounded-[10px] flex items-center justify-center p-1.5 overflow-hidden relative">
          {/* Subtle internal glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-sky-500/10" />

          {/* Neural / Network Vector */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full text-purple-300 relative z-10"
          >
            {/* Outer network links */}
            <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.25" />
            <circle cx="5" cy="7" r="1.8" fill="currentColor" />
            <circle cx="19" cy="7" r="1.8" fill="currentColor" />
            <circle cx="6" cy="17" r="1.8" fill="currentColor" />
            <circle cx="18" cy="17" r="1.8" fill="currentColor" />

            {/* Connecting intelligence paths */}
            <line x1="5" y1="7" x2="12" y2="12" stroke="#8B5CF6" strokeWidth="1.6" />
            <line x1="19" y1="7" x2="12" y2="12" stroke="#38BDF8" strokeWidth="1.6" />
            <line x1="6" y1="17" x2="12" y2="12" stroke="#8B5CF6" strokeWidth="1.6" />
            <line x1="18" y1="17" x2="12" y2="12" stroke="#38BDF8" strokeWidth="1.6" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center space-x-1.5">
          <span className={`font-bold tracking-tight text-white ${textSizes[size]}`}>
            Talent
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-sky-400 bg-clip-text text-transparent font-extrabold ml-0.5">
              IQ
            </span>
          </span>
          <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
            AI
          </span>
        </div>
        {showSubtitle && (
          <span className={`${subSizes[size]} text-slate-400 font-medium tracking-wide mt-0.5`}>
            Recruitment Intelligence
          </span>
        )}
      </div>
    </div>
  );
};

export default TalentIQLogo;
