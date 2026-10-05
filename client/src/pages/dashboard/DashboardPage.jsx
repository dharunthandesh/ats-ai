import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, jobApi, interviewApi, applicationApi } from '../../api';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { MatchScoreGauge } from '../../components/matching/MatchScoreGauge';
import { MatchExplanationModal } from '../../components/matching/MatchExplanationModal';
import { EvaluationScorecardModal } from '../../components/interview/EvaluationScorecardModal';
import { ResumeUploadModal } from '../../components/candidate/ResumeUploadModal';
import { CreateJobModal } from '../../components/jobs/CreateJobModal';
import {
  Briefcase,
  Users,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isRecruiter } = useAuth();

  const [stats, setStats] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [topApplications, setTopApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedAppForExplanation, setSelectedAppForExplanation] = useState(null);
  const [selectedInterviewForScorecard, setSelectedInterviewForScorecard] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, jobsRes, interviewsRes] = await Promise.all([
        analyticsApi.getOverview(),
        jobApi.getJobs({ limit: 4, status: 'ACTIVE' }),
        interviewApi.getInterviews({ status: 'SCHEDULED' }),
      ]);

      setStats(analyticsRes.data);
      setActiveJobs(jobsRes.data || []);
      setUpcomingInterviews(interviewsRes.data || []);

      // If active jobs exist, fetch top candidates for the first job
      if (jobsRes.data?.length > 0) {
        const topAppRes = await applicationApi.getJobApplications(jobsRes.data[0]._id, {
          minScore: 60,
        });
        setTopApplications(topAppRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    {
      title: 'Active Requisitions',
      value: stats?.totalJobs || 0,
      icon: Briefcase,
      color: 'indigo',
      sub: 'Open roles across teams',
    },
    {
      title: 'Talent Pool',
      value: stats?.totalCandidates || 0,
      icon: Users,
      color: 'blue',
      sub: 'Parsed structured resumes',
    },
    {
      title: 'Avg AI Match Quality',
      value: `${stats?.avgScores?.overall || 82}%`,
      icon: Sparkles,
      color: 'emerald',
      sub: 'Weighted NLP accuracy',
    },
    {
      title: 'Time to Hire',
      value: `${stats?.avgTimeToHireDays || 14}d`,
      icon: Clock,
      color: 'amber',
      sub: 'Average cycle duration',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800/80 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                {user?.role?.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">Department: {user?.department}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Your candidate pipeline is actively processing resumes. Review high-affinity applicants, scheduled rounds, and AI recommendations below.
            </p>
          </div>

          {isRecruiter && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="md"
                icon={UploadCloud}
                onClick={() => setIsUploadModalOpen(true)}
              >
                Upload Resumes
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => setIsCreateJobOpen(true)}
              >
                Post Job
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-card border border-slate-800/80 hover:border-slate-700 transition-all flex items-start justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {kpi.title}
                </p>
                <h3 className="text-2xl font-black text-white mt-1">{kpi.value}</h3>
                <p className="text-[11px] text-slate-500 mt-1">{kpi.sub}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Dual Grid: Active Requisitions & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Requisitions (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Active Job Requisitions
            </h3>
            <button
              onClick={() => navigate('/jobs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div
                key={job._id}
                className="p-4 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white hover:text-indigo-400 cursor-pointer"
                        onClick={() => navigate(`/jobs/${job._id}/pipeline`)}>
                      {job.title}
                    </h4>
                    <Badge variant="emerald" size="xs">
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    {job.department} • {job.location} • Min {job.minExperienceYears}y exp
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(job.requiredSkills || []).slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="slate" size="xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-bold text-indigo-400">
                      {job.totalApplications || 0}
                    </span>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Applicants</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/jobs/${job._id}/pipeline`)}
                  >
                    Open Kanban
                  </Button>
                </div>
              </div>
            ))}

            {activeJobs.length === 0 && !loading && (
              <div className="p-8 text-center glass-card rounded-2xl text-slate-500 text-xs">
                No active job requisitions found. Click "Post Job" to create one.
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming Interviews Timeline (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Scheduled Rounds
            </h3>
            <button
              onClick={() => navigate('/interviews')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors"
            >
              All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingInterviews.slice(0, 4).map((intv) => (
              <div
                key={intv._id}
                className="p-3.5 rounded-2xl glass-card border border-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      {intv.candidateId?.fullName || 'Candidate'}
                    </h5>
                    <p className="text-[11px] text-slate-400">{intv.jobId?.title}</p>
                  </div>
                  <Badge variant="purple" size="xs">
                    {intv.roundType}
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{new Date(intv.scheduledStartTime).toLocaleString()}</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {intv.meetingLink ? (
                    <a
                      href={intv.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline font-medium text-[11px]"
                    >
                      Join Meeting
                    </a>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Link pending</span>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedInterviewForScorecard(intv)}
                  >
                    Scorecard
                  </Button>
                </div>
              </div>
            ))}

            {upcomingInterviews.length === 0 && !loading && (
              <div className="p-8 text-center glass-card rounded-2xl text-slate-500 text-xs">
                No interviews scheduled for this period.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top AI Match Spotlight */}
      {topApplications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              High-Affinity AI Candidates Spotlight
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topApplications.slice(0, 3).map((app) => (
              <div
                key={app._id}
                className="p-4 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      {app.candidateId?.fullName}
                    </h5>
                    <p className="text-xs text-slate-400">{app.candidateId?.email}</p>
                  </div>
                  <MatchScoreGauge
                    score={app.overallMatchScore}
                    size="sm"
                    onClick={() => setSelectedAppForExplanation(app)}
                  />
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {app.matchExplanation}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <Badge variant="indigo" size="xs">
                    Stage: {app.stage}
                  </Badge>
                  <button
                    onClick={() => setSelectedAppForExplanation(app)}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    Why this score?
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <MatchExplanationModal
        isOpen={!!selectedAppForExplanation}
        onClose={() => setSelectedAppForExplanation(null)}
        application={selectedAppForExplanation}
      />

      <EvaluationScorecardModal
        isOpen={!!selectedInterviewForScorecard}
        onClose={() => setSelectedInterviewForScorecard(null)}
        interview={selectedInterviewForScorecard}
        onSubmitted={() => loadDashboardData()}
      />

      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => loadDashboardData()}
      />

      <CreateJobModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
        onJobCreated={() => loadDashboardData()}
      />
    </div>
  );
};
