import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { interviewApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Video, Clock } from 'lucide-react';

export const ScheduleInterviewModal = ({ isOpen, onClose, application, onScheduled }) => {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);

  // Default to tomorrow 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(11, 0, 0, 0);

  const [formData, setFormData] = useState({
    roundType: 'TECHNICAL',
    scheduledStartTime: tomorrow.toISOString().slice(0, 16),
    scheduledEndTime: tomorrowEnd.toISOString().slice(0, 16),
    meetingLink: 'https://meet.google.com/talentpulse-interview',
    locationNotes: 'Google Meet Video Call',
    sendEmail: true,
  });

  if (!application) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await interviewApi.schedule({
        applicationId: application._id,
        ...formData,
      });
      success(`Interview scheduled for ${application.candidateId?.fullName || 'Candidate'}`);
      if (onScheduled) onScheduled(res.data);
      onClose();
    } catch (err) {
      error(`Failed to schedule interview: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Interview Round"
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={loading}
            onClick={handleSubmit}
            icon={Calendar}
          >
            Confirm & Send Invite
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Candidate Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Scheduling interview for:</p>
          <p className="text-sm font-bold text-white mt-0.5">
            {application.candidateId?.fullName} ({application.candidateId?.email})
          </p>
        </div>

        {/* Round Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Round Type
          </label>
          <select
            value={formData.roundType}
            onChange={(e) => setFormData({ ...formData, roundType: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="SCREENING">Initial Recruiter Screening</option>
            <option value="TECHNICAL">Technical & Architecture Round</option>
            <option value="BEHAVIORAL">Behavioral & Culture Alignment</option>
            <option value="SYSTEM_DESIGN">System Design & Live Coding</option>
            <option value="HR">Final HR & Offer Discussion</option>
          </select>
        </div>

        {/* Start & End Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Start Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledStartTime}
              onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> End Time
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledEndTime}
              onChange={(e) => setFormData({ ...formData, scheduledEndTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Meeting Link */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Video className="w-3.5 h-3.5 text-purple-400" /> Video Conference Link
          </label>
          <input
            type="url"
            value={formData.meetingLink}
            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            placeholder="https://meet.google.com/..."
            required
          />
        </div>

        {/* Email Alert Toggle */}
        <label className="flex items-center gap-2.5 pt-2 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.sendEmail}
            onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
            className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Send automated interview invitation email to candidate and panel</span>
        </label>
      </form>
    </Modal>
  );
};
