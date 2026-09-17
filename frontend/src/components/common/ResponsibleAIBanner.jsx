import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

const ResponsibleAIBanner = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 py-2 px-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300">
        <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
        <span>
          <strong>Responsible AI Notice:</strong> TalentIQ provides AI-assisted recommendations. Final hiring decisions remain with human recruiters.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/50 to-purple-950/30 p-3.5 text-xs text-slate-300 mb-6 backdrop-blur-sm shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-0.5">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-indigo-300">Ethical & Responsible AI Decision Support</span>
          <p className="mt-0.5 text-slate-400 leading-relaxed">
            TalentIQ operates strictly as an intelligent decision-support system. All resume evaluations focus solely on job-related technical qualifications, projects, and relevant experience. Sensitive personal characteristics are never factored. <strong>Final evaluation and hiring decisions always rest with human recruiters.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResponsibleAIBanner;
