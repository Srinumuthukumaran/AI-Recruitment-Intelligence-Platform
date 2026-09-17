import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Sparkles,
  FileText,
  Mail,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  Pencil,
  Trash2,
  UserPlus,
  FileUp,
  Files,
  Zap,
  Check,
  X,
  UploadCloud,
} from 'lucide-react';
import candidateService from '../../services/candidateService';
import matchService from '../../services/matchService';
import jobService from '../../services/jobService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import EmptyState from '../../components/common/EmptyState';
import SearchBar from '../../components/common/SearchBar';
import MatchScoreBadge from '../../components/recruiter/MatchScoreBadge';
import Modal from '../../components/common/Modal';

const PRESET_CANDIDATES = [
  {
    id: 'preset-priya',
    name: 'Priya Sharma',
    email: 'priya.sharma@talentpool.io',
    roleTag: 'Senior Cloud & Java Architect (5 yrs)',
    skills: 'Java 17, Spring Boot, AWS, Docker, Kubernetes, Microservices, MySQL',
    resumeText: `Priya Sharma
Email: priya.sharma@talentpool.io | Phone: +91 98765 43210 | Bangalore, India

PROFESSIONAL SUMMARY:
Senior Software Engineer with 5+ years of experience designing, architecting, and scaling distributed cloud systems and enterprise microservices. Deep expertise in Java, Spring Boot, AWS cloud infrastructure, Docker, Kubernetes, and relational databases.

CORE TECHNICAL SKILLS:
• Programming & Frameworks: Java 17, Spring Boot, Spring Cloud, RESTful APIs, Hibernate/JPA, Microservices
• Cloud & DevOps: AWS (EC2, S3, RDS, ECS, Lambda), Docker, Kubernetes, CI/CD pipelines, Terraform
• Databases & Persistence: MySQL, PostgreSQL, Redis caching
• Architecture & Practices: Distributed Systems, OOP, Test-Driven Development (JUnit, Mockito), Git, Agile/Scrum

EXPERIENCE:
Senior Cloud Engineer | CloudScale Tech (2022 - Present)
• Architected resilient microservices using Java 17 and Spring Boot on AWS ECS with Docker and Kubernetes.
• Implemented database sharding and connection pooling in MySQL, cutting latency by 35%.
• Built robust RESTful APIs secured by JWT and OAuth2.

Backend Engineer | TechNova Solutions (2020 - 2022)
• Developed core business services using Spring Boot and Hibernate with MySQL database persistence.
• Containerized multi-tenant services using Docker and automated deployments via GitHub Actions.

EDUCATION:
B.Tech in Computer Science & Engineering (2016 - 2020)`,
  },
  {
    id: 'preset-karthik',
    name: 'Karthik Raja',
    email: 'karthik.raja@talentpool.io',
    roleTag: 'Frontend React Engineer (Fresher / 1 yr)',
    skills: 'HTML, CSS, JavaScript, React, Tailwind, Vite, REST APIs',
    resumeText: `Karthik Raja
Email: karthik.raja@talentpool.io | Phone: +91 98451 22334 | Chennai, India

PROFESSIONAL SUMMARY:
Dynamic Frontend Developer specializing in modern React, JavaScript (ES6+), HTML5, CSS3, and responsive UI/UX engineering. Passionate about building accessible, performant, and delightful web applications.

CORE TECHNICAL SKILLS:
• Frontend: React, JavaScript, HTML5, CSS3, Tailwind CSS, Vite, Redux Toolkit
• Tools & Workflow: Git, GitHub, REST API integration, Axios, Postman, Responsive Web Design
• Concepts: Component Lifecycle, React Hooks, State Management, DOM manipulation, Performance Optimization

PROJECTS:
• AI Talent Portal UI: Built an intuitive responsive single-page dashboard using React, Tailwind CSS, and Vite.
• E-Commerce Showcase: Engineered a high-performance storefront with modular React components and state management.

EDUCATION:
B.E. in Information Technology (2021 - 2025)`,
  },
  {
    id: 'preset-ananya',
    name: 'Ananya Verma',
    email: 'ananya.verma@talentpool.io',
    roleTag: 'Junior Java Spring Boot Developer (0-2 yrs)',
    skills: 'Java, Spring Boot, MySQL, REST APIs, Git, OOP',
    resumeText: `Ananya Verma
Email: ananya.verma@talentpool.io | Phone: +91 97112 33445 | Delhi, India

PROFESSIONAL SUMMARY:
Enthusiastic and detail-oriented Entry-Level Java Developer with hands-on project experience in Java, Spring Boot, REST APIs, and MySQL. Strong grasp of object-oriented programming principles and software design.

CORE TECHNICAL SKILLS:
• Languages & Frameworks: Java, Spring Boot, Spring Data JPA, RESTful APIs, OOP
• Databases: MySQL, SQL queries, relational schema design
• Tools: Git, GitHub, Maven, Postman, VS Code, IntelliJ IDEA

PROJECTS:
• Student Record Management API: Designed and implemented REST endpoints in Spring Boot with MySQL and input validation.
• Library Catalog System: Built Java-based OOP inventory application with JDBC connection and automated tests.

EDUCATION:
B.Tech in Computer Science (2021 - 2025) - CGPA: 8.7/10`,
  },
  {
    id: 'preset-david',
    name: 'David Chen',
    email: 'david.chen@talentpool.io',
    roleTag: 'Senior Java Backend Engineer (6 yrs)',
    skills: 'Java, Spring Boot, MySQL, REST APIs, Microservices, Kafka',
    resumeText: `David Chen
Email: david.chen@talentpool.io | Phone: +1 415 555 0192 | San Francisco, CA

PROFESSIONAL SUMMARY:
Senior Java Backend Engineer with 6+ years of enterprise experience building high-throughput microservices, robust RESTful APIs, and transactional MySQL architectures using Java and Spring Boot.

CORE TECHNICAL SKILLS:
• Core Tech: Java 17/21, Spring Boot, Spring MVC, Spring Data JPA, Hibernate, REST APIs, Microservices
• Databases: MySQL, PostgreSQL, Query optimization, Indexing, Transactions
• Distributed Systems: Kafka, Redis, Docker, CI/CD, Git, Security (OAuth2, JWT)

EXPERIENCE:
Staff Backend Engineer | FinTech Systems (2021 - Present)
• Led development of core payment routing microservices in Spring Boot handling 10k+ requests/sec.
• Optimized complex MySQL queries and stored procedures, achieving 40% performance gain.

Backend Developer | Enterprise Apps Corp (2018 - 2021)
• Designed and maintained resilient REST APIs with Spring Boot and MySQL.

EDUCATION:
B.S. in Computer Science (2014 - 2018)`,
  },
];

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('ALL');
  const [resumeFilter, setResumeFilter] = useState('ALL'); // ALL, WITH_RESUME, WITHOUT_RESUME

  // Add Candidate state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addTab, setAddTab] = useState('upload'); // 'upload', 'manual', 'bulk', 'presets'
  const [singleFile, setSingleFile] = useState(null);
  const [singleName, setSingleName] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [manualForm, setManualForm] = useState({ name: '', email: '', resumeText: '' });
  const [bulkFiles, setBulkFiles] = useState([]);
  const [selectedPresets, setSelectedPresets] = useState(['preset-priya', 'preset-karthik', 'preset-ananya', 'preset-david']);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  // Quick Analyze state
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  // Edit Candidate state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', resumeText: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete Candidate state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Recruiter Validate Candidate state
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [candidateToValidate, setCandidateToValidate] = useState(null);
  const [validationForm, setValidationForm] = useState({ status: 'VALIDATED', notes: '' });
  const [isValidating, setIsValidating] = useState(false);
  const [validateError, setValidateError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, SUBMITTED, VALIDATED, SHORTLISTED, REJECTED

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [candidatesData, matchesData, jobsData] = await Promise.all([
        candidateService.getAllCandidates(),
        matchService.getAllMatches(),
        jobService.getAllJobs(),
      ]);
      setCandidates(candidatesData || []);
      setMatches(matchesData || []);
      setJobs(jobsData || []);
    } catch (err) {
      setError(err.message || 'Failed to load candidates data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAnalyzeModal = (candidate) => {
    setSelectedCandidate(candidate);
    setSelectedJobId(jobs[0]?.id ? String(jobs[0].id) : '');
    setAnalyzeError(null);
    setIsAnalyzeModalOpen(true);
  };

  const handleRunAnalysis = async () => {
    if (!selectedCandidate || !selectedJobId) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      await matchService.analyzeCandidate(selectedCandidate.id, selectedJobId);
      setIsAnalyzeModalOpen(false);
      await loadData();
    } catch (err) {
      setAnalyzeError(err.message || 'AI candidate analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openEditModal = (candidate) => {
    setCandidateToEdit(candidate);
    setEditFormData({
      name: candidate.name || '',
      email: candidate.email || '',
      resumeText: candidate.resumeText || '',
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveCandidate = async (e) => {
    e.preventDefault();
    if (!candidateToEdit) return;
    setIsSaving(true);
    setEditError(null);
    try {
      const updated = await candidateService.updateCandidate(candidateToEdit.id, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        resumeText: editFormData.resumeText,
      });

      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateToEdit.id ? { ...c, ...updated } : c))
      );
      setIsEditModalOpen(false);
      setNotification({
        type: 'success',
        message: `Candidate "${updated.name || updated.email}" updated successfully!`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update candidate profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (candidate) => {
    setCandidateToDelete(candidate);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!candidateToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await candidateService.deleteCandidate(candidateToDelete.id);
      setCandidates((prev) => prev.filter((c) => c.id !== candidateToDelete.id));
      setMatches((prev) => prev.filter((m) => m.candidate?.id !== candidateToDelete.id));
      setIsDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: `Candidate "${candidateToDelete.name || candidateToDelete.email}" was removed successfully.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || err.message || 'Failed to remove candidate.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openValidateModal = (candidate) => {
    setCandidateToValidate(candidate);
    const initialStatus = ['VALIDATED', 'SHORTLISTED', 'REJECTED'].includes(candidate.submissionStatus)
      ? candidate.submissionStatus
      : 'SHORTLISTED';
    setValidationForm({
      status: initialStatus,
      notes: candidate.validationNotes || '',
    });
    setValidateError(null);
    setIsValidateModalOpen(true);
  };

  const handleConfirmValidation = async (e) => {
    e.preventDefault();
    if (!candidateToValidate) return;
    setIsValidating(true);
    setValidateError(null);
    try {
      const updated = await candidateService.validateCandidate(
        candidateToValidate.id,
        validationForm.status,
        validationForm.notes
      );
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateToValidate.id ? { ...c, ...updated } : c))
      );
      setIsValidateModalOpen(false);
      setNotification({
        type: 'success',
        message: `Candidate "${candidateToValidate.name || candidateToValidate.email}" has been marked as ${validationForm.status}!`,
      });
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err) {
      setValidateError(err.message || 'Failed to update candidate validation status.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCreateManualCandidate = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setAddError(null);
    try {
      const created = await candidateService.createCandidate({
        name: manualForm.name.trim(),
        email: manualForm.email.trim(),
        resumeText: manualForm.resumeText,
      });
      setIsAddModalOpen(false);
      setManualForm({ name: '', email: '', resumeText: '' });
      setNotification({
        type: 'success',
        message: `Candidate "${created.name || created.email}" created successfully!`,
      });
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err) {
      setAddError(err.response?.data?.message || err.message || 'Failed to create candidate.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUploadSingleResume = async (e) => {
    e.preventDefault();
    if (!singleFile) {
      setAddError('Please select a PDF resume file.');
      return;
    }
    setIsAdding(true);
    setAddError(null);
    try {
      const created = await candidateService.uploadCandidateResume(
        singleFile,
        singleName.trim() || undefined,
        singleEmail.trim() || undefined
      );
      setIsAddModalOpen(false);
      setSingleFile(null);
      setSingleName('');
      setSingleEmail('');
      setNotification({
        type: 'success',
        message: `Candidate "${created.name || created.email}" added from PDF resume!`,
      });
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err) {
      setAddError(err.response?.data?.message || err.message || 'Failed to process PDF resume.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBulkUploadResumes = async (e) => {
    e.preventDefault();
    if (!bulkFiles || bulkFiles.length === 0) {
      setAddError('Please select one or more PDF resume files.');
      return;
    }
    setIsAdding(true);
    setAddError(null);
    try {
      const createdList = await candidateService.bulkUploadResumes(bulkFiles);
      setIsAddModalOpen(false);
      setBulkFiles([]);
      setNotification({
        type: 'success',
        message: `Successfully processed and added ${createdList.length} candidate resumes!`,
      });
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err) {
      setAddError(err.response?.data?.message || err.message || 'Bulk upload failed.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddPresetCandidates = async () => {
    const selectedList = PRESET_CANDIDATES.filter((p) => selectedPresets.includes(p.id));
    if (selectedList.length === 0) {
      setAddError('Please select at least one candidate profile to add.');
      return;
    }
    setIsAdding(true);
    setAddError(null);
    try {
      const payload = selectedList.map((p) => ({
        name: p.name,
        email: p.email,
        resumeText: p.resumeText,
      }));
      const createdList = await candidateService.createCandidatesBatch(payload);
      setIsAddModalOpen(false);
      setNotification({
        type: 'success',
        message: `Added ${createdList.length} candidate profiles with instant match scores!`,
      });
      setTimeout(() => setNotification(null), 4000);
      await loadData();
    } catch (err) {
      setAddError(err.response?.data?.message || err.message || 'Failed to add sample candidates.');
    } finally {
      setIsAdding(false);
    }
  };

  // Build candidate with their latest/best match
  const candidateList = candidates.map((cand) => {
    const candMatches = matches.filter((m) => m.candidate?.id === cand.id);
    const bestMatch = candMatches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))[0] || null;
    return {
      ...cand,
      matchesCount: candMatches.length,
      bestMatch,
      allMatches: candMatches,
    };
  });

  const filteredCandidates = candidateList.filter((cand) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      cand.name?.toLowerCase().includes(q) ||
      cand.email?.toLowerCase().includes(q) ||
      cand.resumeText?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (resumeFilter === 'WITH_RESUME' && !cand.resumeText) return false;
    if (resumeFilter === 'WITHOUT_RESUME' && cand.resumeText) return false;

    if (statusFilter !== 'ALL') {
      const currentStatus = cand.submissionStatus || 'NOT_SUBMITTED';
      if (currentStatus !== statusFilter) return false;
    }

    if (selectedJobFilter !== 'ALL') {
      const hasJobMatch = cand.allMatches.some((m) => String(m.job?.id) === selectedJobFilter);
      if (!hasJobMatch) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Directory</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Review applicant profiles, candidate submissions, extracted resume credentials, and AI match evaluations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
          <div className="text-xs text-slate-400 font-medium hidden lg:block">
            {candidates.length} Registered Candidates • {matches.length} Total Matches
          </div>

          <button
            type="button"
            onClick={() => {
              setAddTab('presets');
              setAddError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample Profiles</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAddTab('upload');
              setAddError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`flex items-center space-x-2 p-3.5 rounded-xl border text-xs ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <ErrorAlert message={error} onRetry={loadData} />

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search candidates by name, email, skills..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Filter by Submission / Validation Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="SUBMITTED">Submitted • Awaiting Validation</option>
            <option value="VALIDATED">Validated by Recruiter</option>
            <option value="SHORTLISTED">Shortlisted for Role</option>
            <option value="REJECTED">Rejected / Needs Review</option>
          </select>

          {/* Filter by Job */}
          <select
            value={selectedJobFilter}
            onChange={(e) => setSelectedJobFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Matched Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={String(j.id)}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Filter by Resume */}
          <select
            value={resumeFilter}
            onChange={(e) => setResumeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Resumes</option>
            <option value="WITH_RESUME">Resume Uploaded</option>
            <option value="WITHOUT_RESUME">Missing Resume</option>
          </select>
        </div>
      </div>

      {/* Candidates List */}
      {loading ? (
        <LoadingSpinner message="Loading candidate profiles..." />
      ) : filteredCandidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description={
            searchQuery || selectedJobFilter !== 'ALL' || resumeFilter !== 'ALL'
              ? 'No candidates match your current search and filter settings.'
              : 'Add candidates manually, upload PDF resumes in bulk, or load pre-configured sample profiles to evaluate.'
          }
          actionText={
            searchQuery || selectedJobFilter !== 'ALL' || resumeFilter !== 'ALL'
              ? 'Clear Filters'
              : 'Add Candidate'
          }
          onAction={() => {
            if (searchQuery || selectedJobFilter !== 'ALL' || resumeFilter !== 'ALL') {
              setSearchQuery('');
              setSelectedJobFilter('ALL');
              setResumeFilter('ALL');
            } else {
              setAddTab('upload');
              setAddError(null);
              setIsAddModalOpen(true);
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCandidates.map((cand) => (
            <div
              key={cand.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {cand.name || cand.email?.split('@')[0]}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate max-w-[200px]">{cand.email}</span>
                    </div>

                    {/* Candidate Submission & Validation Status Badge */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {cand.submissionStatus === 'VALIDATED' ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Validated</span>
                        </span>
                      ) : cand.submissionStatus === 'SHORTLISTED' ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 rounded-md">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>Shortlisted</span>
                        </span>
                      ) : cand.submissionStatus === 'REJECTED' ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-red-300 bg-red-950/80 border border-red-500/30 px-2 py-0.5 rounded-md">
                          <X className="w-3 h-3 text-red-400" />
                          <span>Rejected</span>
                        </span>
                      ) : cand.submissionStatus === 'SUBMITTED' ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-0.5" />
                          <span>Submitted • Needs Validation</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-md">
                          Draft Profile
                        </span>
                      )}

                      {cand.submittedAt && (
                        <span className="text-[10px] text-slate-500">
                          • {new Date(cand.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {cand.bestMatch ? (
                    <MatchScoreBadge score={cand.bestMatch.matchScore} size="sm" />
                  ) : cand.resumeText ? (
                    <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-500/30">
                      Ready
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
                      No Resume
                    </span>
                  )}
                </div>

                {/* Best Match details if available */}
                {cand.bestMatch ? (
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Best Match:</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                        {cand.bestMatch.job?.title}
                      </span>
                    </div>

                    {cand.bestMatch.matchingSkills && (
                      <div className="text-[11px] text-slate-300 line-clamp-1">
                        <strong className="text-emerald-400 font-medium">✓ Skills:</strong>{' '}
                        {cand.bestMatch.matchingSkills}
                      </div>
                    )}
                    {cand.bestMatch.missingSkills && (
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        <strong className="text-amber-400 font-medium">• Missing:</strong>{' '}
                        {cand.bestMatch.missingSkills}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800/50 text-xs text-slate-400">
                    {cand.resumeText ? (
                      <span>Resume extracted. Ready to evaluate against open positions.</span>
                    ) : (
                      <span>Waiting for candidate to upload their PDF resume.</span>
                    )}
                  </div>
                )}

                {cand.validationNotes && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-slate-300 line-clamp-1">
                    <strong className="text-indigo-400">Recruiter Note:</strong> {cand.validationNotes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  to={`/recruiter/candidates/${cand.id}`}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Profile & Analysis</span>
                </Link>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openValidateModal(cand)}
                    title="Validate / Shortlist / Reject Candidate"
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      cand.submissionStatus === 'SHORTLISTED'
                        ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/30'
                        : cand.submissionStatus === 'REJECTED'
                        ? 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-500/30'
                        : cand.submissionStatus === 'VALIDATED'
                        ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30'
                        : 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {cand.submissionStatus === 'SHORTLISTED' ? (
                      <Sparkles className="w-3 h-3 text-purple-400" />
                    ) : cand.submissionStatus === 'REJECTED' ? (
                      <X className="w-3 h-3 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                    <span>
                      {cand.submissionStatus === 'SHORTLISTED'
                        ? 'Shortlisted'
                        : cand.submissionStatus === 'REJECTED'
                        ? 'Rejected'
                        : cand.submissionStatus === 'VALIDATED'
                        ? 'Validated'
                        : 'Review'}
                    </span>
                  </button>

                  <button
                    onClick={() => openEditModal(cand)}
                    title="Edit Candidate"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openDeleteModal(cand)}
                    title="Remove Candidate"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {cand.resumeText && jobs.length > 0 && (
                    <button
                      onClick={() => openAnalyzeModal(cand)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Analyze</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Analyze Modal */}
      <Modal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        title={`Analyze ${selectedCandidate?.name || selectedCandidate?.email}`}
      >
        <ErrorAlert message={analyzeError} />

        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Select an open job position to evaluate this candidate's resume qualifications using Google Gemini.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Target Job Position
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.location || 'Remote'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAnalyzeModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedJobId || isAnalyzing}
              onClick={handleRunAnalysis}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Evaluate Match</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Recruiter Validate Candidate Modal */}
      <Modal
        isOpen={isValidateModalOpen}
        onClose={() => setIsValidateModalOpen(false)}
        title={`Validate Candidate: ${candidateToValidate?.name || candidateToValidate?.email}`}
        maxWidth="max-w-lg"
      >
        <ErrorAlert message={validateError} />

        <form onSubmit={handleConfirmValidation} className="space-y-4">
          <p className="text-xs text-slate-300">
            Validate this candidate's submitted credentials, skills alignment, and suitability for open positions.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Validation Decision / Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setValidationForm({ ...validationForm, status: 'VALIDATED' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-1 transition-all ${
                  validationForm.status === 'VALIDATED'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validate</span>
              </button>

              <button
                type="button"
                onClick={() => setValidationForm({ ...validationForm, status: 'SHORTLISTED' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-1 transition-all ${
                  validationForm.status === 'SHORTLISTED'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Shortlist</span>
              </button>

              <button
                type="button"
                onClick={() => setValidationForm({ ...validationForm, status: 'REJECTED' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-1 transition-all ${
                  validationForm.status === 'REJECTED'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-900'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Recruiter Validation Notes / Feedback
            </label>
            <textarea
              rows={4}
              value={validationForm.notes}
              onChange={(e) => setValidationForm({ ...validationForm, notes: e.target.value })}
              placeholder="e.g. Verified resume credentials. Meets Java & Spring Boot requirements. Approved for interview."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsValidateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isValidating}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Validation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Candidate Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Candidate: ${candidateToEdit?.name || candidateToEdit?.email}`}
        maxWidth="max-w-2xl"
      >
        <ErrorAlert message={editError} />

        <form onSubmit={handleSaveCandidate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Candidate Full Name
            </label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              placeholder="e.g. Alex Mercer"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              placeholder="e.g. candidate@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Parsed Resume Qualifications & Experience
            </label>
            <textarea
              rows={8}
              value={editFormData.resumeText}
              onChange={(e) => setEditFormData({ ...editFormData, resumeText: e.target.value })}
              placeholder="Paste or edit candidate's resume content, technical skills, or project background..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Modifying resume text will update the qualifications used by Google Gemini for future AI evaluations.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Candidate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Candidate Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Candidate"
        maxWidth="max-w-md"
      >
        <ErrorAlert message={deleteError} />

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-xs">
              Are you sure you want to remove candidate <strong className="text-white">{candidateToDelete?.name || candidateToDelete?.email}</strong>?
            </p>
          </div>

          <p className="text-xs text-slate-400">
            This will permanently remove the candidate's profile, resume credentials, and any AI matching scores. This action cannot be undone.
          </p>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Candidate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Candidates to TalentIQ"
        maxWidth="max-w-2xl"
      >
        <ErrorAlert message={addError} />

        {/* Tab switcher */}
        <div className="flex items-center border-b border-slate-800 mb-5 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAddTab('upload');
              setAddError(null);
            }}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              addTab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Upload Resume (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAddTab('manual');
              setAddError(null);
            }}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              addTab === 'manual'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manual Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAddTab('bulk');
              setAddError(null);
            }}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              addTab === 'bulk'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Files className="w-3.5 h-3.5" />
            <span>Bulk Upload (Multiple PDFs)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAddTab('presets');
              setAddError(null);
            }}
            className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              addTab === 'presets'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sample Profiles (1-Click)</span>
          </button>
        </div>

        {/* Tab 1: Single PDF Upload */}
        {addTab === 'upload' && (
          <form onSubmit={handleUploadSingleResume} className="space-y-4">
            <p className="text-xs text-slate-300">
              Upload a candidate's PDF resume. Apache PDFBox will parse qualifications, skills, and experience for AI job matching.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Candidate Name <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={singleName}
                  onChange={(e) => setSingleName(e.target.value)}
                  placeholder="Auto-extracted if blank"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Candidate Email <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                  placeholder="Auto-extracted if blank"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* File Dropzone */}
            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center transition-colors bg-slate-950/50">
              <input
                type="file"
                accept=".pdf,application/pdf"
                id="single-resume-input"
                onChange={(e) => setSingleFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                {singleFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{singleFile.name}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(singleFile.size / 1024).toFixed(1)} KB • Click or drop another PDF to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-300">
                      Drop candidate PDF resume here or <span className="text-indigo-400 font-semibold underline">browse</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Supports .pdf files up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!singleFile || isAdding}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Parsing & Adding...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Upload & Add Candidate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Manual Profile Entry */}
        {addTab === 'manual' && (
          <form onSubmit={handleCreateManualCandidate} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300">
                Manually register a candidate profile and input their technical credentials.
              </p>
              <button
                type="button"
                onClick={() =>
                  setManualForm({
                    name: 'Rohan Gupta',
                    email: `rohan.gupta.${Date.now() % 1000}@talentpool.io`,
                    resumeText: `Rohan Gupta\nEmail: rohan.gupta@talentpool.io\n\nFull Stack Java & React Developer with 3 years of experience building web applications using Spring Boot, React, MySQL, and Docker. Experience with REST APIs, Git, and automated testing.`,
                  })
                }
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                + Fill Sample Template
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  placeholder="e.g. Maya Patel"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  placeholder="e.g. maya.patel@example.com"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Resume Content, Skills & Qualifications *
              </label>
              <textarea
                rows={7}
                required
                value={manualForm.resumeText}
                onChange={(e) => setManualForm({ ...manualForm, resumeText: e.target.value })}
                placeholder="Paste candidate technical skills, years of experience, projects, education, and tools..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Candidate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Bulk PDF Upload */}
        {addTab === 'bulk' && (
          <form onSubmit={handleBulkUploadResumes} className="space-y-4">
            <p className="text-xs text-slate-300">
              Select or drop multiple PDF resumes at once. TalentIQ will extract qualifications from each file and register all candidates automatically.
            </p>

            {/* Multiple files dropzone */}
            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center transition-colors bg-slate-950/50">
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  if (e.target.files) {
                    setBulkFiles(Array.from(e.target.files));
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Files className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-300">
                    Drop multiple PDF resumes here or <span className="text-indigo-400 font-semibold underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Hold Ctrl or Shift to select multiple PDF files</p>
                </div>
              </div>
            </div>

            {/* Selected files list */}
            {bulkFiles.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">{bulkFiles.length} files selected:</span>
                  <button
                    type="button"
                    onClick={() => setBulkFiles([])}
                    className="text-red-400 hover:text-red-300 text-[11px]"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-1.5">
                  {bulkFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="text-slate-200 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBulkFiles(bulkFiles.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bulkFiles.length === 0 || isAdding}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing {bulkFiles.length} Resumes...</span>
                  </>
                ) : (
                  <>
                    <Files className="w-4 h-4" />
                    <span>Upload All {bulkFiles.length > 0 ? `(${bulkFiles.length})` : ''}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: 1-Click Sample Presets */}
        {addTab === 'presets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300">
                Instantly populate realistic candidate profiles tailored to your active job listings.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (selectedPresets.length === PRESET_CANDIDATES.length) {
                    setSelectedPresets([]);
                  } else {
                    setSelectedPresets(PRESET_CANDIDATES.map((p) => p.id));
                  }
                }}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                {selectedPresets.length === PRESET_CANDIDATES.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {PRESET_CANDIDATES.map((preset) => {
                const isSelected = selectedPresets.includes(preset.id);
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresets((prev) =>
                        isSelected ? prev.filter((id) => id !== preset.id) : [...prev, preset.id]
                      );
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500/50'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{preset.name}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">
                          {preset.roleTag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{preset.email}</p>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        <strong className="text-slate-300">Skills:</strong> {preset.skills}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedPresets.length === 0 || isAdding}
                onClick={handleAddPresetCandidates}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding Candidates...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Add {selectedPresets.length} Candidate Profiles</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CandidatesPage;
