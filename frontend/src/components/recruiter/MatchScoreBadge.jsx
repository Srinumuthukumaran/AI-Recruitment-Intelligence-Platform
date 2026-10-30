import React from 'react';

export const getScoreCategory = (score) => {
  if (score == null || score === undefined || isNaN(score)) {
    return {
      label: 'Unranked',
      color: 'slate',
      strokeColor: '#64748B',
      textClass: 'text-slate-400 bg-slate-800/60 border-slate-700/80',
      badgeClass: 'text-slate-400 bg-slate-800/60 border-slate-700/80',
      description: 'Pending AI evaluation',
    };
  }

  const num = Math.round(Number(score));
  if (num >= 90) {
    return {
      label: 'Excellent Match',
      color: 'emerald',
      strokeColor: '#34D399',
      textClass: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
      badgeClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
      description: 'Exceptional qualification and skill alignment',
    };
  }
  if (num >= 80) {
    return {
      label: 'Strong Match',
      color: 'sky',
      strokeColor: '#38BDF8',
      textClass: 'text-sky-400 bg-sky-950/50 border-sky-500/30 shadow-sm shadow-sky-500/10',
      badgeClass: 'text-sky-400 bg-sky-950/40 border-sky-500/30',
      description: 'High compatibility with core job requirements',
    };
  }
  if (num >= 70) {
    return {
      label: 'Good Match',
      color: 'amber',
      strokeColor: '#FBBF24',
      textClass: 'text-amber-400 bg-amber-950/50 border-amber-500/30 shadow-sm shadow-amber-500/10',
      badgeClass: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
      description: 'Meets primary qualifications with minor skill gaps',
    };
  }
  return {
    label: 'Moderate Match',
    color: 'purple',
    strokeColor: '#8B5CF6',
    textClass: 'text-purple-400 bg-purple-950/50 border-purple-500/30 shadow-sm shadow-purple-500/10',
    badgeClass: 'text-purple-400 bg-purple-950/40 border-purple-500/30',
    description: 'Foundational qualifications present; developmental areas noted',
  };
};

export const RadialScoreRing = ({ score, size = 110, strokeWidth = 8, showLabel = true }) => {
  const category = getScoreCategory(score);
  const validScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (validScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center select-none">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={category.strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {validScore}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Score
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-2 text-center">
          <span className={`text-xs font-bold ${category.textClass.split(' ')[0]}`}>
            {category.label}
          </span>
        </div>
      )}
    </div>
  );
};

const MatchScoreBadge = ({ score, showCategory = true, size = 'md', variant = 'badge' }) => {
  if (variant === 'ring') {
    const ringSizes = { sm: 70, md: 96, lg: 120 };
    return <RadialScoreRing score={score} size={ringSizes[size] || 96} showLabel={showCategory} />;
  }

  const category = getScoreCategory(score);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  if (score == null || score === undefined || isNaN(score)) {
    return (
      <span className={`inline-flex items-center rounded-xl border font-medium ${category.textClass} ${sizeClasses[size]}`}>
        Unranked
      </span>
    );
  }

  const roundedScore = Math.round(Number(score));

  return (
    <div className="inline-flex items-center space-x-2">
      <span className={`inline-flex items-center rounded-xl border font-bold ${category.textClass} ${sizeClasses[size]}`}>
        {roundedScore}%
      </span>
      {showCategory && (
        <span className={`text-xs font-semibold ${category.textClass.split(' ')[0]}`}>
          {category.label}
        </span>
      )}
    </div>
  );
};

export default MatchScoreBadge;
