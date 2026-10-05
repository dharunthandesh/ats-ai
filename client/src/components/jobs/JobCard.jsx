import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  Award,
  Users,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { JobStatusBadge } from './JobStatusBadge';

export const JobCard = ({ job, canManage = false, onDelete }) => {
  const navigate = useNavigate();

  const formattedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

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

  const experienceText =
    job.minimumExperience !== undefined && job.maximumExperience !== undefined
      ? `${job.minimumExperience} - ${job.maximumExperience} yrs`
      : `${job.minimumExperience || 0}+ yrs`;

  return (
    <div className="group relative bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between backdrop-blur-sm">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded-md inline-block mb-1.5">
              {job.department || 'General'}
            </span>
            <Link
              to={`/jobs/${job._id}`}
              className="block group-hover:text-indigo-300 transition-colors"
            >
              <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">
                {job.title}
              </h3>
            </Link>
          </div>
          <JobStatusBadge status={job.status} size="sm" />
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 my-3">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {job.location || 'Remote'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            {formatEmploymentType(job.employmentType)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {experienceText}
          </span>
        </div>

        {/* Short Description */}
        {job.description && (
          <p className="text-xs text-slate-400 line-clamp-2 my-2.5 leading-relaxed">
            {job.description}
          </p>
        )}

        {/* Required Skills */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="mt-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Required Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                >
                  {skill}
                </span>
              ))}
              {job.requiredSkills.length > 4 && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/40 text-slate-400 border border-slate-800">
                  +{job.requiredSkills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-4 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(`/jobs/${job._id}`)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate(`/jobs/${job._id}/pipeline`)}
            className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60 transition-colors"
            title="View Pipeline"
          >
            <Users className="w-4 h-4" />
          </button>

          {canManage && (
            <>
              <button
                onClick={() => navigate(`/jobs/${job._id}/edit`)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                title="Edit Job"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {onDelete && (
                <button
                  onClick={() => onDelete(job._id, job.title)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
