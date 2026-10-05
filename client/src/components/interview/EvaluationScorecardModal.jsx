import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { evaluationApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Star, CheckCircle2 } from 'lucide-react';

export const EvaluationScorecardModal = ({ isOpen, onClose, interview, onSubmitted }) => {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);

  const [ratings, setRatings] = useState({
    technicalSkillsRating: 4,
    problemSolvingRating: 4,
    communicationRating: 4,
    culturalFitRating: 4,
    overallScore: 4,
    recommendation: 'HIRE',
    strengths: '',
    areasOfImprovement: '',
    privateNotes: '',
  });

  if (!interview) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await evaluationApi.submit({
        interviewId: interview._id,
        ...ratings,
      });
      success('Evaluation scorecard submitted successfully');
      if (onSubmitted) onSubmitted(res.data);
      onClose();
    } catch (err) {
      error(`Failed to submit evaluation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderRatingButtons = (field, currentVal) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRatings({ ...ratings, [field]: star })}
          className={`w-9 h-9 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
            currentVal === star
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
          }`}
        >
          {star}
        </button>
      ))}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Evaluation Scorecard"
      maxWidth="max-w-2xl"
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
            icon={CheckCircle2}
          >
            Submit Scorecard
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">
              {interview.candidateId?.fullName || 'Candidate'}
            </h4>
            <p className="text-xs text-slate-400">
              Round: {interview.roundType} • {interview.jobId?.title}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
            {interview.status}
          </span>
        </div>

        {/* 1-5 Numerical Ratings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Technical Competence (1 - 5)
            </label>
            {renderRatingButtons('technicalSkillsRating', ratings.technicalSkillsRating)}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Problem Solving (1 - 5)
            </label>
            {renderRatingButtons('problemSolvingRating', ratings.problemSolvingRating)}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Communication & Clarity (1 - 5)
            </label>
            {renderRatingButtons('communicationRating', ratings.communicationRating)}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Cultural Alignment (1 - 5)
            </label>
            {renderRatingButtons('culturalFitRating', ratings.culturalFitRating)}
          </div>
        </div>

        {/* Overall Score & Recommendation */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white">Overall Assessment Score</label>
            {renderRatingButtons('overallScore', ratings.overallScore)}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Hiring Recommendation
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 'STRONG_HIRE', label: 'Strong Hire', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300' },
                { val: 'HIRE', label: 'Hire', color: 'border-indigo-500 bg-indigo-950/40 text-indigo-300' },
                { val: 'HOLD', label: 'Hold / Borderline', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
                { val: 'REJECT', label: 'Reject', color: 'border-rose-500 bg-rose-950/40 text-rose-300' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setRatings({ ...ratings, recommendation: opt.val })}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    ratings.recommendation === opt.val
                      ? opt.color
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Written Feedback */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Strengths & Observations
            </label>
            <textarea
              rows={2}
              value={ratings.strengths}
              onChange={(e) => setRatings({ ...ratings, strengths: e.target.value })}
              placeholder="Ex: Solid depth in system architecture, proactive code cleanliness..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Areas of Improvement & Knowledge Gaps
            </label>
            <textarea
              rows={2}
              value={ratings.areasOfImprovement}
              onChange={(e) => setRatings({ ...ratings, areasOfImprovement: e.target.value })}
              placeholder="Ex: Needs more hands-on familiarity with Kubernetes cluster management..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
