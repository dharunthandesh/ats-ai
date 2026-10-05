import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Sparkles, CheckCircle2, XCircle, Clock, GraduationCap, FileText, Lightbulb } from 'lucide-react';

export const MatchExplanationModal = ({ isOpen, onClose, application }) => {
  if (!application) return null;

  const {
    overallMatchScore = 0,
    matchBreakdown = {},
    matchedSkills = [],
    missingSkills = [],
    matchExplanation = '',
    candidateId = {},
    jobId = {},
  } = application;

  const {
    skillsScore = 0,
    experienceScore = 0,
    educationScore = 0,
    textSimilarityScore = 0,
  } = matchBreakdown;

  const candidateName = candidateId?.fullName || 'Candidate';
  const jobTitle = jobId?.title || 'Job Opening';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Match Analysis & Explainable Breakdown"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/40 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-base">{candidateName}</h4>
            <p className="text-xs text-indigo-300">Applying for: {jobTitle}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">
              {overallMatchScore}%
            </div>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Composite Fit
            </p>
          </div>
        </div>

        {/* Explainability Natural Language Summary */}
        {matchExplanation && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">
                AI Recommendation Rationale
              </h5>
              <p className="text-sm text-slate-300 leading-relaxed">{matchExplanation}</p>
            </div>
          </div>
        )}

        {/* Multi-Factor Scoring Weight Breakdown */}
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Multi-Factor Weighted Breakdown
          </h5>
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Skill Match */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  Skills (40% weight)
                </span>
                <span className="text-sm font-bold text-indigo-400">{skillsScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${skillsScore}%` }}
                />
              </div>
            </div>

            {/* 2. Experience Match */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Experience (25% weight)
                </span>
                <span className="text-sm font-bold text-blue-400">{experienceScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${experienceScore}%` }}
                />
              </div>
            </div>

            {/* 3. Education Match */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  Education (15% weight)
                </span>
                <span className="text-sm font-bold text-emerald-400">{educationScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${educationScore}%` }}
                />
              </div>
            </div>

            {/* 4. Cosine Similarity */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  Cosine Semantic (20%)
                </span>
                <span className="text-sm font-bold text-purple-400">{textSimilarityScore}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${textSimilarityScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Matched Skills vs Missing Skills */}
        <div className="space-y-3">
          <div>
            <h6 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4" /> Matched Skills ({matchedSkills.length})
            </h6>
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.length > 0 ? (
                matchedSkills.map((skill) => (
                  <Badge key={skill} variant="emerald" size="sm">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-500">No direct skills matched.</span>
              )}
            </div>
          </div>

          <div>
            <h6 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
              <XCircle className="w-4 h-4" /> Missing Required Skills ({missingSkills.length})
            </h6>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.length > 0 ? (
                missingSkills.map((skill) => (
                  <Badge key={skill} variant="rose" size="sm">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-emerald-400 font-medium">
                  Candidate meets all required skills.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
