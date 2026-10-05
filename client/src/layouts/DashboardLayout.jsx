import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { ResumeUploadModal } from '../components/candidate/ResumeUploadModal';
import { CreateJobModal } from '../components/jobs/CreateJobModal';

export const DashboardLayout = () => {
  const location = useLocation();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);

  // Derive title from pathname
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Executive Recruiter Dashboard';
    if (path.includes('/pipeline')) return 'Kanban Candidate Pipeline';
    if (path.includes('/jobs')) return 'Job Requisitions';
    if (path.includes('/candidates')) return 'Candidate Pool';
    if (path.includes('/interviews')) return 'Interview Schedule & Evaluations';
    if (path.includes('/analytics')) return 'Recruitment Analytics & Reports';
    if (path.includes('/settings/users')) return 'System User Management';
    return 'TalentPulse ATS';
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          title={getPageTitle()}
          onUploadClick={() => setIsUploadOpen(true)}
          onCreateJobClick={() => setIsCreateJobOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals accessible from Navbar */}
      <ResumeUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={() => {
          // Trigger window reload or state update if on relevant view
          window.location.reload();
        }}
      />

      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
        onJobCreated={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};
