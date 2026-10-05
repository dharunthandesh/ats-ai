import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobApi, applicationApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { KanbanBoard } from '../../components/kanban/KanbanBoard';
import { MatchExplanationModal } from '../../components/matching/MatchExplanationModal';
import { ScheduleInterviewModal } from '../../components/interview/ScheduleInterviewModal';
import { EvaluationScorecardModal } from '../../components/interview/EvaluationScorecardModal';
import { ApplicationDetailModal } from '../../components/candidate/ApplicationDetailModal';
import { ResumeUploadModal } from '../../components/candidate/ResumeUploadModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Briefcase,
  UploadCloud,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Users,
  Building,
} from 'lucide-react';

export const PipelinePage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isRecruiter } = useAuth();
  const { error } = useNotification();

  const [allJobs, setAllJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Modals state
  const [explanationApp, setExplanationApp] = useState(null);
  const [scheduleApp, setScheduleApp] = useState(null);
  const [scorecardInterview, setScorecardInterview] = useState(null);
  const [selectedAppDetailId, setSelectedAppDetailId] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    loadPipelineContext();
  }, [jobId]);

  const loadPipelineContext = async () => {
    try {
      setLoading(true);
      const jobsRes = await jobApi.getJobs({ status: 'ACTIVE' });
      const jobList = jobsRes.data || [];
      setAllJobs(jobList);

      // Determine active target job
      const targetJobId = jobId || (jobList[0] ? jobList[0]._id : null);
      if (!targetJobId) {
        setLoading(false);
        return;
      }

      const [jobRes, appsRes] = await Promise.all([
        jobApi.getJobById(targetJobId),
        applicationApi.getJobApplications(targetJobId),
      ]);

      setCurrentJob(jobRes.data);
      setApplications(appsRes.data || []);
    } catch (err) {
      error(`Pipeline load error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSwitch = (newJobId) => {
    navigate(`/jobs/${newJobId}/pipeline`);
  };

  const calculateAvgScore = () => {
    if (applications.length === 0) return 0;
    const sum = applications.reduce((acc, curr) => acc + (curr.overallMatchScore || 0), 0);
    return Math.round(sum / applications.length);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-4">
      {/* Pipeline Header */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/jobs')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Back to jobs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Job Dropdown Switcher */}
          <div>
            <div className="flex items-center gap-2">
              <select
                value={currentJob?._id || ''}
                onChange={(e) => handleJobSwitch(e.target.value)}
                className="font-bold text-lg text-white bg-transparent border-b border-dashed border-indigo-400 focus:outline-none cursor-pointer pr-4"
              >
                {allJobs.map((j) => (
                  <option key={j._id} value={j._id} className="bg-slate-900 text-slate-100">
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span>{currentJob?.department}</span>
              <span>•</span>
              <span>{currentJob?.location}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Min {currentJob?.minExperienceYears} yrs exp</span>
            </div>
          </div>
        </div>

        {/* Stats Pill & Quick Upload Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 uppercase font-semibold text-[10px] block">
                Total Applicants
              </span>
              <span className="font-bold text-white text-sm">{applications.length}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 uppercase font-semibold text-[10px] block">
                Avg Match
              </span>
              <span className="font-bold text-emerald-400 text-sm">{calculateAvgScore()}%</span>
            </div>
          </div>

          {isRecruiter && (
            <Button
              variant="primary"
              size="sm"
              icon={UploadCloud}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Resumes to Job
            </Button>
          )}
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            Loading candidate pipeline...
          </div>
        ) : (
          <KanbanBoard
            jobId={currentJob?._id}
            applications={applications}
            onUpdateApplications={(updated) => setApplications(updated)}
            onOpenExplanation={(app) => setExplanationApp(app)}
            onScheduleInterview={(app) => setScheduleApp(app)}
            onSelectApplication={(app) => setSelectedAppDetailId(app._id)}
          />
        )}
      </div>

      {/* Modals */}
      <MatchExplanationModal
        isOpen={!!explanationApp}
        onClose={() => setExplanationApp(null)}
        application={explanationApp}
      />

      <ScheduleInterviewModal
        isOpen={!!scheduleApp}
        onClose={() => setScheduleApp(null)}
        application={scheduleApp}
        onScheduled={() => loadPipelineContext()}
      />

      <EvaluationScorecardModal
        isOpen={!!scorecardInterview}
        onClose={() => setScorecardInterview(null)}
        interview={scorecardInterview}
        onSubmitted={() => loadPipelineContext()}
      />

      <ApplicationDetailModal
        isOpen={!!selectedAppDetailId}
        onClose={() => setSelectedAppDetailId(null)}
        applicationId={selectedAppDetailId}
        onOpenSchedule={(app) => setScheduleApp(app)}
        onOpenScorecard={(intv) => setScorecardInterview(intv)}
        onDataUpdated={() => loadPipelineContext()}
      />

      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultJobId={currentJob?._id}
        onUploadComplete={() => loadPipelineContext()}
      />
    </div>
  );
};
