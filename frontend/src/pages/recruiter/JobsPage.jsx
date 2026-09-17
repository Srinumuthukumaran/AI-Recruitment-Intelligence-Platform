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
} from 'lucide-react';
import jobService from '../../services/jobService';
import matchService from '../../services/matchService';
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
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This will remove the job and its rankings.`)) {
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
    return (
      job.title?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q) ||
      job.requiredSkills?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Postings</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage your open positions, requirements, and candidate matching pipelines.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      <ErrorAlert message={error} onRetry={fetchJobs} />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, location, skills..."
          />
        </div>
        <div className="text-xs text-slate-400 font-medium self-end sm:self-auto">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </div>
      </div>

      {/* Job List */}
      {loading ? (
        <LoadingSpinner message="Loading job listings..." />
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={searchQuery ? 'No matching jobs' : 'No jobs posted yet'}
          description={
            searchQuery
              ? 'Try adjusting your search criteria or clear the search input.'
              : 'Create your first job posting to start analyzing candidates and AI rankings.'
          }
          actionText={searchQuery ? 'Clear Search' : 'Create Job'}
          onAction={searchQuery ? () => setSearchQuery('') : () => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  <button
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    disabled={isDeleting === job.id}
                    title="Delete Job"
                    className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-950/30 transition-colors"
                  >
                    {isDeleting === job.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{job.experience || 'Flexible'}</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Required Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills?.split(',').map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-800/80 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700/60"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <Link
                  to={`/recruiter/jobs/${job.id}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details & Rankings</span>
                </Link>

                <Link
                  to={`/recruiter/jobs/${job.id}`}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
                >
                  Rankings
                </Link>
              </div>
            </div>
          ))}
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
              placeholder="e.g. Java Spring Boot Backend Developer"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                placeholder="e.g. Remote / New York, NY / Hybrid"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
                placeholder="e.g. 2-5 years / Mid-level / Senior"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
              placeholder="e.g. Java, Spring Boot, MySQL, REST APIs, Docker, AWS"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
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
              placeholder="Describe the responsibilities, architecture, key objectives, and day-to-day requirements for this position..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Job...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Job Posting</span>
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
