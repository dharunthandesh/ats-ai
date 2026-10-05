import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { CandidateCard } from './CandidateCard';

export const KanbanColumn = ({
  column,
  applications = [],
  onOpenExplanation,
  onScheduleInterview,
  onSelectApplication,
}) => {
  const columnColorMap = {
    slate: 'border-t-slate-500',
    blue: 'border-t-blue-500',
    indigo: 'border-t-indigo-500',
    purple: 'border-t-purple-500',
    amber: 'border-t-amber-500',
    orange: 'border-t-orange-500',
    emerald: 'border-t-emerald-500',
    green: 'border-t-green-500',
    rose: 'border-t-rose-500',
  };

  return (
    <div className="w-80 flex-shrink-0 flex flex-col max-h-full rounded-2xl glass-card border border-slate-800/80 overflow-hidden shadow-lg">
      {/* Column Header */}
      <div
        className={`px-4 py-3.5 border-b border-slate-800/80 border-t-4 ${
          columnColorMap[column.color] || 'border-t-indigo-500'
        } flex items-center justify-between bg-slate-900/40`}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-100">{column.title}</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            {applications.length}
          </span>
        </div>
      </div>

      {/* Droppable Candidate Card List */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-2.5 overflow-y-auto min-h-[450px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-indigo-950/20' : 'bg-transparent'
            }`}
          >
            {applications.map((application, index) => (
              <CandidateCard
                key={application._id}
                application={application}
                index={index}
                onOpenExplanation={onOpenExplanation}
                onScheduleInterview={onScheduleInterview}
                onSelectApplication={onSelectApplication}
              />
            ))}
            {provided.placeholder}

            {applications.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-36 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/60 rounded-xl text-slate-600 text-xs text-center p-4">
                <span>No candidates in {column.title}</span>
                <span className="text-[10px] mt-1 text-slate-500">Drag a candidate here</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
