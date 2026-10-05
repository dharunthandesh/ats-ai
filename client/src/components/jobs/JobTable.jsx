import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Briefcase,
  Users,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { JobStatusBadge } from './JobStatusBadge';

export const JobTable = ({ jobs = [], canManage = false, onDelete }) => {
  const navigate = useNavigate();

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

  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
        <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-200">No jobs found</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No requisitions matched your current filters. Try changing or clearing your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Title & Department</th>
              <th className="py-3.5 px-4">Location & Type</th>
              <th className="py-3.5 px-4">Experience</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Required Skills</th>
              <th className="py-3.5 px-4">Created</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {jobs.map((job) => {
              const experienceText =
                job.minimumExperience !== undefined && job.maximumExperience !== undefined
                  ? `${job.minimumExperience} - ${job.maximumExperience} yrs`
                  : `${job.minimumExperience || 0}+ yrs`;

              const formattedDate = job.createdAt
                ? new Date(job.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—';

              return (
                <tr
                  key={job._id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Job Title & Department */}
                  <td className="py-4 px-4 sm:px-6">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="font-bold text-white group-hover:text-indigo-300 transition-colors text-sm line-clamp-1"
                    >
                      {job.title}
                    </Link>
                    <span className="text-[11px] text-indigo-400 font-medium mt-0.5 inline-block">
                      {job.department || 'General'}
                    </span>
                  </td>

                  {/* Location & Type */}
                  <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatEmploymentType(job.employmentType)}
                    </div>
                  </td>

                  {/* Experience */}
                  <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{experienceText}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <JobStatusBadge status={job.status} size="xs" />
                  </td>

                  {/* Skills */}
                  <td className="py-4 px-4 max-w-[220px]">
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills?.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {skill}
                        </span>
                      ))}
                      {(job.requiredSkills?.length || 0) > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                          +{job.requiredSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Created */}
                  <td className="py-4 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                    {formattedDate}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="View Requisition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/jobs/${job._id}/pipeline`)}
                        className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60 transition-colors"
                        title="Pipeline & Applications"
                      >
                        <Users className="w-4 h-4" />
                      </button>

                      {canManage && (
                        <>
                          <button
                            onClick={() => navigate(`/jobs/${job._id}/edit`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                            title="Edit Requisition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {onDelete && (
                            <button
                              onClick={() => onDelete(job._id, job.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                              title="Delete Requisition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
