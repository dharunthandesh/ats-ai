import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { JobCreatePage } from './pages/jobs/JobCreatePage';
import { JobDetailPage } from './pages/jobs/JobDetailPage';
import { JobEditPage } from './pages/jobs/JobEditPage';
import { PipelinePage } from './pages/pipeline/PipelinePage';
import { CandidatesPage } from './pages/candidates/CandidatesPage';
import { InterviewsPage } from './pages/interviews/InterviewsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { UsersPage } from './pages/users/UsersPage';

export function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/new" element={<JobCreatePage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/jobs/:id/edit" element={<JobEditPage />} />
                <Route path="/jobs/:jobId/pipeline" element={<PipelinePage />} />
                <Route path="/candidates" element={<CandidatesPage />} />
                <Route path="/interviews" element={<InterviewsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />

                {/* HR Administrator Exclusive User Management */}
                <Route element={<ProtectedRoute requiredRole="HR_ADMIN" />}>
                  <Route path="/settings/users" element={<UsersPage />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
