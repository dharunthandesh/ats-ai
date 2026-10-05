import React, { useState, useEffect } from 'react';
import { interviewApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EvaluationScorecardModal } from '../../components/interview/EvaluationScorecardModal';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
} from 'lucide-react';

export const InterviewsPage = () => {
  const { isInterviewer } = useAuth();
  const { success, error } = useNotification();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedForScorecard, setSelectedForScorecard] = useState(null);

  useEffect(() => {
    loadInterviews();
  }, [statusFilter]);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const res = await interviewApi.getInterviews({
        status: statusFilter || undefined,
      });
      setInterviews(res.data || []);
    } catch (err) {
      error(`Failed to load interviews: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await interviewApi.updateStatus(id, status);
      success(`Interview marked as ${status}`);
      loadInterviews();
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            Interview Schedule & Scorecards
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track upcoming technical and HR rounds, access meeting links, and submit evaluations.
          </p>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Interviews Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Candidate & Job</th>
                <th className="px-6 py-4">Round</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Meeting</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {interviews.map((intv) => {
                const statusVariants = {
                  SCHEDULED: 'purple',
                  COMPLETED: 'emerald',
                  CANCELLED: 'rose',
                  RESCHEDULED: 'amber',
                };

                return (
                  <tr key={intv._id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Candidate & Job */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-white text-sm">
                          {intv.candidateId?.fullName || 'Candidate'}
                        </p>
                        <p className="text-slate-400 mt-0.5">{intv.jobId?.title}</p>
                      </div>
                    </td>

                    {/* Round */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-200">
                        {intv.roundType} Round
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{new Date(intv.scheduledStartTime).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <Badge variant={statusVariants[intv.status] || 'slate'} size="xs">
                        {intv.status}
                      </Badge>
                    </td>

                    {/* Meeting Link */}
                    <td className="px-6 py-4">
                      {intv.meetingLink ? (
                        <a
                          href={intv.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Launch Link
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">Not provided</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedForScorecard(intv)}
                      >
                        {intv.status === 'COMPLETED' ? 'View / Edit Score' : 'Scorecard'}
                      </Button>

                      {intv.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleUpdateStatus(intv._id, 'CANCELLED')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Cancel Interview"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {interviews.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-xs">
                    No interviews match the selected status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EvaluationScorecardModal
        isOpen={!!selectedForScorecard}
        onClose={() => setSelectedForScorecard(null)}
        interview={selectedForScorecard}
        onSubmitted={() => loadInterviews()}
      />
    </div>
  );
};
