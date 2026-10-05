import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  Users,
  Edit3,
  Trash2,
  Sparkles,
  Award,
  CheckCircle2,
  FileText,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { jobApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { JobStatusBadge } from '../../components/jobs/JobStatusBadge';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isRecruiter, isAdmin } = useAuth();
  const { success, error } = useNotification();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const canManage = isRecruiter || isAdmin;

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const res = await jobApi.getJobById(id);
      setJob(res.data);
    } catch (err) {
      error(`Failed to load job details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete '${job?.title}'?`)) {
      return;
    }

    try {
      setDeleting(true);
      await jobApi.deleteJob(id);
      success('Job requisition deleted successfully.');
      navigate('/jobs');
    } catch (err) {
      error(`Failed to delete job: ${err.message}`);
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await jobApi.updateJob(id, { status: newStatus });
      success(`Requisition status updated to ${newStatus}`);
      loadJob();
    } catch (err) {
      error(err.message);
    }
  };

  const formatEmploymentType = (type) => {
    switch (type) {
      case 'FULL_TIME':
        return 'Full Time';
      case 'PART_TIME':
        return 'Part Time';
      case 'CONTRACT':
        return 'Contract';
      case 'INTERNSHIP':
        return 'Internship';
      case 'REMOTE':
        return 'Remote';
      default:
        return type || 'Full Time';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading job requisition details...</span>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Job Requisition Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          The requested requisition could not be located or may have been removed.
        </p>
        <Link to="/jobs">
          <Button variant="secondary" icon={ArrowLeft}>
            Return to Requisitions
          </Button>
        </Link>
      </div>
    );
  }

  const experienceText =
    job.minimumExperience !== undefined && job.maximumExperience !== undefined
      ? `${job.minimumExperience} - ${job.maximumExperience} years`
      : `${job.minimumExperience || 0}+ years`;

  const formattedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to All Requisitions
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-950/70 border border-indigo-800/60 px-2.5 py-0.5 rounded-md">
                {job.department || 'General'}
              </span>
              <JobStatusBadge status={job.status} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              {job.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="md"
              icon={Users}
              onClick={() => navigate(`/jobs/${job._id}/pipeline`)}
              className="shadow-lg shadow-indigo-600/30"
            >
              Candidate Pipeline
            </Button>

            {canManage && (
              <>
                <Button
                  variant="secondary"
                  size="md"
                  icon={Edit3}
                  onClick={() => navigate(`/jobs/${job._id}/edit`)}
                >
                  Edit
                </Button>

                <Button
                  variant="danger"
                  size="md"
                  icon={Trash2}
                  onClick={handleDelete}
                  loading={deleting}
                  disabled={deleting}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Left specs, Right details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Metadata & Status Controller */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Requisition Info
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location
                </span>
                <span className="font-semibold text-slate-200">{job.location || 'Remote'}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Type
                </span>
                <span className="font-semibold text-slate-200">
                  {formatEmploymentType(job.employmentType)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Experience
                </span>
                <span className="font-semibold text-slate-200">{experienceText}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Created On
                </span>
                <span className="font-semibold text-slate-200">{formattedDate}</span>
              </div>

              {job.createdBy && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" /> Recruiter
                  </span>
                  <span className="font-semibold text-slate-200">
                    {typeof job.createdBy === 'object'
                      ? job.createdBy.name || job.createdBy.email
                      : 'Talent Team'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Quick Switcher (For Recruiters/Admins) */}
          {canManage && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Requisition Status
              </h3>
              <p className="text-xs text-slate-400">
                Change the hiring status to control whether new candidate applications are accepted.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['ACTIVE', 'PAUSED', 'DRAFT', 'CLOSED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      job.status === st
                        ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/80 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Description & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Required Skills Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Required Skills & Core Competencies
            </h3>
            <p className="text-xs text-slate-400">
              The AI matching engine weights these technical requirements with maximum priority.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {job.requiredSkills && job.requiredSkills.length > 0 ? (
                job.requiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 shadow-sm shadow-indigo-950/50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">None specified</span>
              )}
            </div>
          </div>

          {/* Preferred Skills Card */}
          {job.preferredSkills && job.preferredSkills.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Preferred / Bonus Qualifications
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {job.preferredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Description Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Role Description & Specifications
            </h3>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line pt-1">
              {job.description || 'No detailed description provided.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
