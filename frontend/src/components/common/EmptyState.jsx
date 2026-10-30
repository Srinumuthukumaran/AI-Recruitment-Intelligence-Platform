import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There is currently no data to display.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-white/[0.08] bg-[#121A2B]/60 backdrop-blur-sm my-4">
      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
