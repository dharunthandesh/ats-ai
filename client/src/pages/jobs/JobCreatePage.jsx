import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Briefcase } from 'lucide-react';
import { jobApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { JobForm } from '../../components/jobs/JobForm';

export const JobCreatePage = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      const res = await jobApi.createJob(formData);
      success('Job requisition created successfully!');
      if (res?.data?._id) {
        navigate(`/jobs/${res.data._id}`);
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      error(err.message || 'Failed to create job requisition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Heading */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Requisitions
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-indigo-400" />
              Create Job Requisition
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure job parameters, required competencies, and experience thresholds for AI matching.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Scoring Ready</span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <JobForm
        onSubmit={handleSubmit}
        loading={loading}
        onCancel={() => navigate('/jobs')}
      />
    </div>
  );
};
