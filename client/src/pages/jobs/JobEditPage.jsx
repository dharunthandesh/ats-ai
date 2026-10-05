import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, Briefcase } from 'lucide-react';
import { jobApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { JobForm } from '../../components/jobs/JobForm';

export const JobEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useNotification();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoadingJob(true);
      const res = await jobApi.getJobById(id);
      setJob(res.data);
    } catch (err) {
      error(`Failed to load job details: ${err.message}`);
    } finally {
      setLoadingJob(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await jobApi.updateJob(id, formData);
      success('Job requisition updated successfully!');
      navigate(`/jobs/${id}`);
    } catch (err) {
      error(err.message || 'Failed to update job requisition');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading job details for editing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Heading */}
      <div>
        <Link
          to={`/jobs/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Requisition Details
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-indigo-400" />
              Edit Job Requisition
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Update position requirements, experience limits, or role status.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <JobForm
        initialValues={job}
        isEdit={true}
        onSubmit={handleSubmit}
        loading={submitting}
        onCancel={() => navigate(`/jobs/${id}`)}
      />
    </div>
  );
};
