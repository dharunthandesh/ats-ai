import React, { useState, useEffect } from 'react';
import { analyticsApi, jobApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export const AnalyticsPage = () => {
  const { error } = useNotification();
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [selectedJobId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, jobsRes] = await Promise.all([
        analyticsApi.getOverview({ jobId: selectedJobId || undefined }),
        jobApi.getJobs(),
      ]);
      setStats(analyticsRes.data);
      setJobs(jobsRes.data || []);
    } catch (err) {
      error(`Failed to load analytics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funnel Data for Bar Chart
  const stages = stats?.stageCounts || {};
  const funnelLabels = Object.keys(stages).map((s) => s.replace(/_/g, ' '));
  const funnelValues = Object.values(stages);

  const funnelChartData = {
    labels: funnelLabels,
    datasets: [
      {
        label: 'Candidates in Stage',
        data: funnelValues,
        backgroundColor: [
          'rgba(148, 163, 184, 0.7)', // slate
          'rgba(59, 130, 246, 0.7)',  // blue
          'rgba(99, 102, 241, 0.7)',  // indigo
          'rgba(168, 85, 247, 0.7)',  // purple
          'rgba(245, 158, 11, 0.7)',  // amber
          'rgba(249, 115, 22, 0.7)',  // orange
          'rgba(16, 185, 129, 0.7)',  // emerald
          'rgba(34, 197, 94, 0.7)',   // green
          'rgba(244, 63, 94, 0.7)',   // rose
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#ffffff',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', stepSize: 1 },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            Recruitment Analytics & Insights
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Conversion funnel drop-offs, candidate time-to-hire, skill gap distribution, and export reports.
          </p>
        </div>

        {/* CSV & PDF Export Buttons */}
        <div className="flex items-center gap-3">
          <a
            href={analyticsApi.getCsvExportUrl(selectedJobId)}
            download
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export CSV
          </a>

          <a
            href={analyticsApi.getPdfExportUrl(selectedJobId)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-indigo-600/25"
          >
            <FileText className="w-4 h-4" />
            Download PDF Report
          </a>
        </div>
      </div>

      {/* Filter by Job Requisition */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Filter Analytics Scope:
        </span>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 max-w-xs"
        >
          <option value="">All Requisitions (Company-Wide)</option>
          {jobs.map((job) => (
            <option key={job._id} value={job._id}>
              {job.title} ({job.department})
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Pipeline Applications
          </p>
          <h3 className="text-2xl font-black text-white mt-1">
            {stats?.totalApplications || 0}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Candidates in active consideration</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Time to Hire
          </p>
          <h3 className="text-2xl font-black text-indigo-400 mt-1">
            {stats?.avgTimeToHireDays || 14} Days
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">From application to accepted offer</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Avg Skills Match Ratio
          </p>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">
            {stats?.avgScores?.skills || 85}%
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Taxonomy overlap accuracy</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Interviews Completed
          </p>
          <h3 className="text-2xl font-black text-purple-400 mt-1">
            {stats?.totalInterviews || 0}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Total rounds conducted</p>
        </div>
      </div>

      {/* Visual Chart: Recruitment Funnel */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Recruitment Conversion Funnel
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Candidate distribution and drop-offs across pipeline progression milestones
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <Bar data={funnelChartData} options={chartOptions} />
        </div>
      </div>

      {/* Skill Demand vs Supply Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most In-Demand Skills */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Top In-Demand Requisition Skills
          </h4>
          <div className="space-y-2">
            {(stats?.topJobSkills || []).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-200">{item.skill}</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-bold">
                  {item.count} jobs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Available Candidate Skills */}
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Candidate Skill Pool Availability
          </h4>
          <div className="space-y-2">
            {(stats?.topCandidateSkills || []).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
              >
                <span className="font-semibold text-slate-200">{item.skill}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold">
                  {item.count} resumes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
