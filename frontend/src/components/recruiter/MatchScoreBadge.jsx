import React from 'react';

export const getScoreCategory = (score) => {
  if (score == null) return { label: 'Not Analyzed', color: 'slate', textClass: 'text-slate-400 bg-slate-800/60 border-slate-700' };
  const num = Number(score);
  if (num >= 90) return { label: 'Excellent Match', color: 'emerald', textClass: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30' };
  if (num >= 80) return { label: 'Strong Match', color: 'blue', textClass: 'text-blue-400 bg-blue-950/50 border-blue-500/30' };
  if (num >= 70) return { label: 'Good Match', color: 'amber', textClass: 'text-amber-400 bg-amber-950/50 border-amber-500/30' };
  return { label: 'Moderate Match', color: 'purple', textClass: 'text-purple-400 bg-purple-950/50 border-purple-500/30' };
};

const MatchScoreBadge = ({ score, showCategory = true, size = 'md' }) => {
  const category = getScoreCategory(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-bold',
  };

  if (score == null) {
    return (
      <span className={`inline-flex items-center rounded-lg border font-medium ${category.textClass} ${sizeClasses[size]}`}>
        Unranked
      </span>
    );
  }

  return (
    <div className="inline-flex items-center space-x-2">
      <span className={`inline-flex items-center rounded-lg border font-semibold ${category.textClass} ${sizeClasses[size]}`}>
        {score}%
      </span>
      {showCategory && (
        <span className={`text-xs font-medium ${category.textClass.split(' ')[0]}`}>
          {category.label}
        </span>
      )}
    </div>
  );
};

export default MatchScoreBadge;
