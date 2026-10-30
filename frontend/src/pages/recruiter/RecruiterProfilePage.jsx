import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Building, CheckCircle2, Key, Database, Cpu } from 'lucide-react';
import ErrorAlert from '../../components/common/ErrorAlert';

const RecruiterProfilePage = () => {
  const { user } = useAuth();
  const [success, setSuccess] = useState(null);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <User className="w-6 h-6 text-purple-400" />
          <span>Recruiter Account Settings</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your recruitment portal profile and review integrated AI services.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] space-y-6 shadow-xl shadow-purple-950/20">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Account Credentials</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="px-3.5 py-2.5 bg-[#172238]/60 border border-white/[0.06] rounded-xl text-sm text-slate-200">
              {user?.name || 'Recruiter Admin'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="px-3.5 py-2.5 bg-[#172238]/60 border border-white/[0.06] rounded-xl text-sm text-slate-200 flex items-center justify-between">
              <span>{user?.email}</span>
              <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Active
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Role Authority
            </label>
            <div className="px-3.5 py-2.5 bg-[#172238]/60 border border-white/[0.06] rounded-xl text-sm text-purple-300 font-semibold">
              ROLE_RECRUITER
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Authentication Method
            </label>
            <div className="px-3.5 py-2.5 bg-[#172238]/60 border border-white/[0.06] rounded-xl text-sm text-slate-200 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>JWT Bearer Token (HMAC-SHA256)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform & AI Status */}
      <div className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] space-y-4 shadow-xl shadow-purple-950/20">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Platform & Integration Health</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#172238]/60 border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Database</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white">MySQL 8.0</p>
            <p className="text-[11px] text-slate-400">Connected & Verified</p>
          </div>

          <div className="p-4 rounded-xl bg-[#172238]/60 border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">PDF Extraction</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white">Apache PDFBox 3.0</p>
            <p className="text-[11px] text-slate-400">Active Parser</p>
          </div>

          <div className="p-4 rounded-xl bg-[#172238]/60 border border-white/[0.06] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">AI Intelligence</span>
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
            <p className="text-sm font-bold text-white">Google GenAI Java SDK</p>
            <p className="text-[11px] text-slate-400">Evaluation Engine</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfilePage;
