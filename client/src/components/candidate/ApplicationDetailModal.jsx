import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { MatchScoreGauge } from '../matching/MatchScoreGauge';
import { applicationApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import {
  FileText,
  Calendar,
  MessageSquare,
  DollarSign,
  Send,
  Download,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ApplicationDetailModal = ({
  isOpen,
  onClose,
  applicationId,
  onOpenScorecard,
  onOpenSchedule,
  onDataUpdated,
}) => {
  const { success, error } = useNotification();
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Offer fields
  const [offerAmount, setOfferAmount] = useState(150000);
  const [offerStartDate, setOfferStartDate] = useState('');
  const [savingOffer, setSavingOffer] = useState(false);

  useEffect(() => {
    if (isOpen && applicationId) {
      loadApplicationDetails();
    }
  }, [isOpen, applicationId]);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      const res = await applicationApi.getApplicationById(applicationId);
      setAppData(res.data);
      if (res.data.offerDetails?.amount) {
        setOfferAmount(res.data.offerDetails.amount);
      }
      if (res.data.offerDetails?.startDate) {
        setOfferStartDate(new Date(res.data.offerDetails.startDate).toISOString().slice(0, 10));
      }
    } catch (err) {
      error(`Failed to load application details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setSubmittingNote(true);
      await applicationApi.addNote(applicationId, { text: newNote.trim() });
      setNewNote('');
      success('Note added');
      await loadApplicationDetails();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      error(`Failed to add note: ${err.message}`);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleUpdateOffer = async (status, sendEmail = false) => {
    try {
      setSavingOffer(true);
      await applicationApi.updateOffer(applicationId, {
        amount: offerAmount,
        currency: 'USD',
        startDate: offerStartDate || undefined,
        status,
        sendEmailAlert: sendEmail,
      });
      success(`Offer updated (${status})`);
      await loadApplicationDetails();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      error(`Failed to update offer: ${err.message}`);
    } finally {
      setSavingOffer(false);
    }
  };

  if (!isOpen) return null;

  const candidate = appData?.candidateId || {};
  const job = appData?.jobId || {};
  const interviews = appData?.interviews || [];
  const evaluations = appData?.evaluations || [];
  const activityLogs = appData?.activityLogs || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Application & Evaluation Feed"
      maxWidth="max-w-4xl"
    >
      {loading || !appData ? (
        <div className="py-12 flex justify-center items-center text-slate-400">
          Loading application...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Profile Bar */}
          <div className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900/50 border border-indigo-700/40 text-indigo-300 font-bold text-lg flex items-center justify-center">
                {candidate.fullName?.[0] || 'C'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{candidate.fullName}</h3>
                <p className="text-xs text-slate-400">
                  {candidate.email} • {candidate.phone || 'No phone'} • {candidate.location || 'Remote'}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="indigo" size="xs">
                    Stage: {appData.stage}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    Applying for: <strong className="text-slate-200">{job.title}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MatchScoreGauge score={appData.overallMatchScore} size="lg" />
              {candidate.resumeFilePath && (
                <a
                  href={`/api/v1/candidates/${candidate._id}/resume`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  Resume
                </a>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Calendar}
              onClick={() => onOpenSchedule && onOpenSchedule(appData)}
            >
              Schedule Interview
            </Button>
          </div>

          {/* Grid Layout: Left Column = Candidate Profile & Notes, Right Column = Interviews & Evaluations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Summary & Extracted Skills & Notes */}
            <div className="space-y-4">
              {/* Summary */}
              {candidate.summary && (
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Candidate Summary
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">{candidate.summary}</p>
                </div>
              )}

              {/* Skills */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Extracted Skills ({candidate.extractedSkills?.length || 0})
                </h5>
                <div className="flex flex-wrap gap-1">
                  {(candidate.extractedSkills || []).map((skill) => (
                    <Badge key={skill} variant="slate" size="xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Internal Recruiter Notes */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  Internal Recruiter Notes ({appData.notes?.length || 0})
                </h5>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {(appData.notes || []).map((note, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-indigo-300">
                          {note.author?.name || 'Recruiter'}
                        </span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-200">{note.text}</p>
                    </div>
                  ))}
                  {(appData.notes || []).length === 0 && (
                    <p className="text-xs text-slate-500 italic">No internal notes yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add feedback or note..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={submittingNote}
                    icon={Send}
                  >
                    Post
                  </Button>
                </form>
              </div>
            </div>

            {/* Right: Interview History & Evaluations & Offer Management */}
            <div className="space-y-4">
              {/* Scheduled Interviews */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Interview Rounds ({interviews.length})
                </h5>

                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {interviews.map((intv) => (
                    <div
                      key={intv._id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{intv.roundType} Round</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                            {intv.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(intv.scheduledStartTime).toLocaleString()}
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onOpenScorecard && onOpenScorecard(intv)}
                      >
                        Scorecard
                      </Button>
                    </div>
                  ))}
                  {interviews.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No interviews scheduled yet.</p>
                  )}
                </div>
              </div>

              {/* Submitted Scorecards */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Interviewer Evaluations ({evaluations.length})
                </h5>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {evaluations.map((ev) => (
                    <div
                      key={ev._id}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">
                          {ev.interviewerId?.name || 'Interviewer'}
                        </span>
                        <Badge
                          variant={
                            ev.recommendation === 'STRONG_HIRE' || ev.recommendation === 'HIRE'
                              ? 'emerald'
                              : 'rose'
                          }
                          size="xs"
                        >
                          {ev.recommendation} ({ev.overallScore}/5)
                        </Badge>
                      </div>
                      {ev.strengths && (
                        <p className="text-[11px] text-slate-300">
                          <strong>Strengths:</strong> {ev.strengths}
                        </p>
                      )}
                      {ev.areasOfImprovement && (
                        <p className="text-[11px] text-slate-400">
                          <strong>Gaps:</strong> {ev.areasOfImprovement}
                        </p>
                      )}
                    </div>
                  ))}
                  {evaluations.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No scorecards submitted yet.</p>
                  )}
                </div>
              </div>

              {/* Offer Management Panel */}
              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Job Offer Management
                </h5>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400">Salary (USD / yr)</label>
                    <input
                      type="number"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Start Date</label>
                    <input
                      type="date"
                      value={offerStartDate}
                      onChange={(e) => setOfferStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="success"
                    size="sm"
                    isLoading={savingOffer}
                    onClick={() => handleUpdateOffer('PENDING', true)}
                  >
                    Extend Offer & Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={savingOffer}
                    onClick={() => handleUpdateOffer('ACCEPTED')}
                  >
                    Mark Hired
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
