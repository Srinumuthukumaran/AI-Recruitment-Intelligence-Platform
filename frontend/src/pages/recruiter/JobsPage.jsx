import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Clock,
  Trash2,
  Users,
  AlertCircle,
  Loader2,
  Eye,
  CheckCircle2,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import jobService from '../../services/jobService';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  // New Job Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [experience, setExperience] = useState('0-2 years');
  const [location, setLocation] = useState('Remote');
  const [formError, setFormError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getAllJobs();
      setJobs(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !requiredSkills.trim()) {
      setFormError('Please fill in Title, Description, and Required Skills.');
      return;
    }

    setIsCreating(true);
    setFormError(null);

    try {
      await jobService.createJob({
        title: title.trim(),
        description: description.trim(),
        requiredSkills: requiredSkills.trim(),
        experience: experience.trim(),
        location: location.trim(),
      });

      // Reset form & close
      setTitle('');
      setDescription('');
      setRequiredSkills('');
      setExperience('0-2 years');
      setLocation('Remote');
      setIsCreateModalOpen(false);
      await fetchJobs();
    } catch (err) {
      setFormError(err.message || 'Failed to create job posting.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteJob = async (id, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This will remove the job and all associated candidate rankings.`)) {
      return;
    }

    setIsDeleting(id);
    try {
      await jobService.deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      alert(`Failed to delete job: ${err.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      job.title?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q) ||
      job.requiredSkills?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (experienceFilter !== 'ALL') {
      if (!job.experience?.toLowerCase().includes(experienceFilter.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Position Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Job Openings
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Manage your open positions, requirements, candidate pipelines, and AI evaluation criteria.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Opening</span>
        </button>
      </div>

      <ErrorAlert message={error} onRetry={fetchJobs} />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="w-full md:max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by job title, location, required skills..."
          />
        </div>

        <div className="flex items-center space-x-3 self-end md:self-auto">
          {/* Experience Filter */}
          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#121A2B] border border-white/[0.08] text-xs font-medium text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Experience Levels</option>
            <option value="0-2">Entry-level (0-2 yrs)</option>
            <option value="2-5">Mid-level (2-5 yrs)</option>
            <option value="5+">Senior / Lead (5+ yrs)</option>
          </select>

          {/* Grid vs Table View Mode */}
          <div className="flex items-center bg-[#121A2B] border border-white/[0.08] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium hidden sm:inline">
            Showing {filteredJobs.length} of {jobs.length} roles
          </div>
        </div>
      </div>

      {/* Job Content: Grid or Table View */}
      {loading ? (
        <LoadingSpinner message="Loading job listings..." />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={searchQuery || experienceFilter !== 'ALL' ? 'No matching jobs found' : 'No jobs posted yet'}
          description={
            searchQuery || experienceFilter !== 'ALL'
              ? 'Try adjusting your search criteria or clear your filters.'
              : 'Create your first job posting to start analyzing candidates and AI rankings.'
          }
          actionText={searchQuery || experienceFilter !== 'ALL' ? 'Clear Filters' : 'Post New Job'}
          onAction={
            searchQuery || experienceFilter !== 'ALL'
              ? () => {
                  setSearchQuery('');
                  setExperienceFilter('ALL');
                }
              : () => setIsCreateModalOpen(true)
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="glass-card rounded-2xl p-6 border border-white/[0.08] bg-[#121A2B] flex flex-col justify-between hover:border-purple-500/40 transition-all group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      Job #{job.id}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1 mt-1.5">
                      {job.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    disabled={isDeleting === job.id}
                    title="Delete Job"
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    {isDeleting === job.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{job.experience || 'Flexible'}</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags */}
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Required Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills?.split(',').slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-[#172238] text-slate-300 px-2.5 py-0.5 rounded-lg border border-white/[0.06]"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                    {job.requiredSkills?.split(',').length > 5 && (
                      <span className="text-[10px] text-slate-400 font-medium self-center">
                        +{job.requiredSkills.split(',').length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <Link
                  to={`/recruiter/jobs/${job.id}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Pipeline</span>
                </Link>

                <Link
                  to={`/recruiter/jobs/${job.id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-all"
                >
                  View Rankings
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-2xl border border-white/[0.08] bg-[#121A2B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0D1222]/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Required Skills</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <Link to={`/recruiter/jobs/${job.id}`} className="hover:text-purple-300">
                        {job.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{job.location || 'Remote'}</td>
                    <td className="py-3.5 px-4 text-slate-300">{job.experience || 'Flexible'}</td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">
                      {job.requiredSkills}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/recruiter/jobs/${job.id}`}
                        className="text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        Rankings
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post a New Job Opportunity"
      >
        <ErrorAlert message={formError} />

        <form onSubmit={handleCreateJob} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Java Spring Boot Cloud Architect"
              className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote / New York / Hybrid"
                className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Experience Level
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 2-5 years / Senior / Lead"
                className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Required Skills (comma-separated) *
            </label>
            <input
              type="text"
              required
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. Java, Spring Boot, MySQL, Docker, Kubernetes, AWS"
              className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            {requiredSkills.trim() && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {requiredSkills.split(',').map(
                  (s, idx) =>
                    s.trim() && (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30"
                      >
                        {s.trim()}
                      </span>
                    )
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Job Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the responsibilities, architecture, key objectives, and day-to-day requirements for this role..."
              className="w-full px-3.5 py-2.5 bg-[#080B16] border border-white/[0.12] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Job...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publish Job Opening</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobsPage;
