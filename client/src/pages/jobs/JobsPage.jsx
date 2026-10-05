import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { jobApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { JobFilters } from '../../components/jobs/JobFilters';
import { JobCard } from '../../components/jobs/JobCard';
import { JobTable } from '../../components/jobs/JobTable';

export const JobsPage = () => {
  const navigate = useNavigate();
  const { isRecruiter, isAdmin } = useAuth();
  const { success, error } = useNotification();

  const canManage = isRecruiter || isAdmin;

  // View mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState('cards');

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
      };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (department) params.department = department;
      if (location.trim()) params.location = location.trim();
      if (employmentType) params.employmentType = employmentType;

      const res = await jobApi.getJobs(params);
      setJobs(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      error(`Failed to load jobs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, department, location, employmentType, error]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setDepartment('');
    setLocation('');
    setEmploymentType('');
    setPage(1);
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete the job '${jobTitle}'?`)) {
      return;
    }
    try {
      await jobApi.deleteJob(jobId);
      success('Job requisition deleted successfully.');
      fetchJobs();
    } catch (err) {
      error(`Failed to delete job: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-400" />
            Job Requisitions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage open roles, configure skill requirements, and track candidate pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Dense Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {canManage && (
            <Link to="/jobs/new">
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                className="shadow-lg shadow-indigo-600/30"
              >
                Create Requisition
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Bar Component */}
      <JobFilters
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={(val) => {
          setStatus(val);
          setPage(1);
        }}
        department={department}
        onDepartmentChange={(val) => {
          setDepartment(val);
          setPage(1);
        }}
        location={location}
        onLocationChange={(val) => {
          setLocation(val);
          setPage(1);
        }}
        employmentType={employmentType}
        onEmploymentTypeChange={(val) => {
          setEmploymentType(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <span className="font-semibold text-white">{jobs.length}</span> of{' '}
          <span className="font-semibold text-white">{pagination.total}</span> requisitions
        </span>

        <button
          onClick={fetchJobs}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State or Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading requisitions from database...</span>
        </div>
      ) : viewMode === 'table' ? (
        <JobTable
          jobs={jobs}
          canManage={canManage}
          onDelete={handleDeleteJob}
        />
      ) : jobs.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
          <Briefcase className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-200">No requisitions found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or create a new job requisition.
          </p>
          {canManage && (
            <Link to="/jobs/new" className="inline-block mt-4">
              <Button variant="secondary" size="sm" icon={Plus}>
                Create New Requisition
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              canManage={canManage}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400">
            Page <span className="font-semibold text-white">{pagination.page}</span> of{' '}
            <span className="font-semibold text-white">{pagination.totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white">
              {pagination.page}
            </span>

            <Button
              variant="outline"
              size="sm"
              iconRight={ChevronRight}
              disabled={!pagination.hasNextPage || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
