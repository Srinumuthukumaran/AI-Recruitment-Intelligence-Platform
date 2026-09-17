import React, { useState, useEffect } from 'react';
import { User, Mail, FileText, CheckCircle2, Shield, Save, Loader2, Key } from 'lucide-react';
import candidateService from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { Link } from 'react-router-dom';

const CandidateProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await candidateService.getMyProfile();
        setProfile(data);
        setName(data.name || user?.name || '');
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await candidateService.updateMyProfile({ name: name.trim() });
      setProfile((prev) => ({ ...prev, name: updated.name }));
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving profile configuration..." />;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <User className="w-6 h-6 text-purple-400" />
          <span>Candidate Account & Profile</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your personal details and verify your resume credentials.
        </p>
      </div>

      <ErrorAlert message={error} />

      {success && (
        <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Profile Edit Card */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Registered Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || profile?.email || ''}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-400 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Email serves as your primary TalentIQ system identifier and cannot be altered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Account Role
              </span>
              <div className="px-3.5 py-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-300 font-semibold">
                ROLE_CANDIDATE
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Candidate Identifier
              </span>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                #{profile?.id || 'Unassigned'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Resume Status Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">PDF Resume Status</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile?.hasResume ? 'Resume uploaded and parsed via Apache PDFBox.' : 'No resume on file.'}
            </p>
          </div>
        </div>

        <Link
          to="/candidate/resume"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          {profile?.hasResume ? 'View / Update Resume' : 'Upload Resume'}
        </Link>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
