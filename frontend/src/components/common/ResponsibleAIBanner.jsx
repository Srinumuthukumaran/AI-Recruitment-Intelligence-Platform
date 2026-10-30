import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

const ResponsibleAIBanner = ({ compact = false }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (compact || isMinimized) {
    return (
      <div className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 mb-6 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>
            <strong className="text-white">Responsible AI Notice:</strong> TalentIQ provides decision support for human recruiters. Final hiring decisions remain with people.
          </span>
        </div>
        {!compact && (
          <button
            onClick={() => setIsMinimized(false)}
            className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 ml-2"
          >
            Expand
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-[#121A2B] to-sky-950/20 p-3.5 sm:p-4 text-xs text-slate-300 mb-6 backdrop-blur-sm shadow-sm relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-purple-300 text-xs uppercase tracking-wider">
                Ethical & Responsible AI Decision Support
              </span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Active Guardrails
              </span>
            </div>
            <p className="mt-1 text-slate-300 leading-relaxed">
              TalentIQ operates strictly as an intelligent decision-support system. All evaluations focus solely on job-related technical qualifications, projects, and demonstrated experience. Sensitive demographic characteristics are never inferred or factored. <strong className="text-white">Final candidate evaluation and hiring decisions always rest with human recruiters.</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMinimized(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors flex-shrink-0"
          title="Minimize banner"
          aria-label="Minimize banner"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ResponsibleAIBanner;
