import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import JobsPage from './pages/recruiter/JobsPage';
import JobDetailPage from './pages/recruiter/JobDetailPage';
import CandidatesPage from './pages/recruiter/CandidatesPage';
import CandidateDetailPage from './pages/recruiter/CandidateDetailPage';
import CopilotPage from './pages/recruiter/CopilotPage';
import InterviewGeneratorPage from './pages/recruiter/InterviewGeneratorPage';
import AnalyticsPage from './pages/recruiter/AnalyticsPage';
import RecruiterProfilePage from './pages/recruiter/RecruiterProfilePage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateResumePage from './pages/candidate/CandidateResumePage';
import CandidateJobsPage from './pages/candidate/CandidateJobsPage';
import CandidateJobDetailPage from './pages/candidate/CandidateJobDetailPage';
import CandidateMatchesPage from './pages/candidate/CandidateMatchesPage';
import SkillGapPage from './pages/candidate/SkillGapPage';
import CandidateInterviewPrepPage from './pages/candidate/CandidateInterviewPrepPage';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';

// Other
import NotFound from './pages/NotFound';

const RootRedirect = () => {
  const { isAuthenticated, isRecruiter, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isRecruiter ? (
    <Navigate to="/recruiter/dashboard" replace />
  ) : (
    <Navigate to="/candidate/dashboard" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Recruiter Routes (Protected for RECRUITER) */}
          <Route
            path="/recruiter"
            element={
              <ProtectedRoute allowedRole="RECRUITER">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="candidates/:id" element={<CandidateDetailPage />} />
            <Route path="copilot" element={<CopilotPage />} />
            <Route path="interview" element={<InterviewGeneratorPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="profile" element={<RecruiterProfilePage />} />
          </Route>

          {/* Candidate Routes (Protected for CANDIDATE) */}
          <Route
            path="/candidate"
            element={
              <ProtectedRoute allowedRole="CANDIDATE">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/candidate/dashboard" replace />} />
            <Route path="dashboard" element={<CandidateDashboard />} />
            <Route path="resume" element={<CandidateResumePage />} />
            <Route path="jobs" element={<CandidateJobsPage />} />
            <Route path="jobs/:id" element={<CandidateJobDetailPage />} />
            <Route path="matches" element={<CandidateMatchesPage />} />
            <Route path="skills" element={<SkillGapPage />} />
            <Route path="interview" element={<CandidateInterviewPrepPage />} />
            <Route path="profile" element={<CandidateProfilePage />} />
          </Route>

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
