import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { MatchScoreGauge } from '../matching/MatchScoreGauge';
import { Badge } from '../common/Badge';
import { Calendar, FileText, ChevronRight, Mail, Clock } from 'lucide-react';

export const CandidateCard = ({
  application,
  index,
  onOpenExplanation,
  onScheduleInterview,
  onSelectApplication,
}) => {
  const candidate = application.candidateId || {};
  const expYears = candidate.calculatedTotalExperienceYears || 0;

  return (
    <Draggable draggableId={application._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 rounded-xl border transition-all duration-200 select-none ${
            snapshot.isDragging
              ? 'bg-slate-800 border-indigo-500 shadow-2xl scale-105 rotate-1 z-50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700/80 hover:bg-slate-850 shadow-sm'
          }`}
        >
          {/* Card Top: Candidate Info & AI Match Score */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex-1 min-w-0">
              <h4
                onClick={() => onSelectApplication && onSelectApplication(application)}
                className="text-sm font-bold text-white hover:text-indigo-400 cursor-pointer transition-colors truncate"
              >
                {candidate.fullName || 'Candidate'}
              </h4>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-500" />
                {candidate.email}
              </p>
            </div>

            <MatchScoreGauge
              score={application.overallMatchScore}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onOpenExplanation(application);
              }}
            />
          </div>

          {/* Experience & Degree Meta */}
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {expYears}y exp
            </span>
            <span className="text-slate-600">•</span>
            <span className="truncate">{candidate.highestDegree || 'Degree'}</span>
          </div>

          {/* Top Extracted Skills Preview */}
          <div className="flex flex-wrap gap-1 mb-3">
            {(candidate.extractedSkills || []).slice(0, 3).map((skill) => (
              <Badge key={skill} variant="slate" size="xs">
                {skill}
              </Badge>
            ))}
            {(candidate.extractedSkills || []).length > 3 && (
              <span className="text-[10px] text-slate-500 px-1 py-0.5">
                +{(candidate.extractedSkills || []).length - 3} more
              </span>
            )}
          </div>

          {/* Card Actions */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={() => onScheduleInterview && onScheduleInterview(application)}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              Schedule
            </button>

            <button
              onClick={() => onSelectApplication && onSelectApplication(application)}
              className="text-slate-400 hover:text-white flex items-center gap-0.5 transition-colors"
            >
              Details
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};
