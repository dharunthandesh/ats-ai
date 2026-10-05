import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { applicationApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../common/Button';
import { Sparkles, Filter, Search, SlidersHorizontal } from 'lucide-react';

const PIPELINE_COLUMNS = [
  { id: 'APPLIED', title: 'Applied', color: 'slate' },
  { id: 'SCREENING', title: 'Screening', color: 'blue' },
  { id: 'SHORTLISTED', title: 'Shortlisted', color: 'indigo' },
  { id: 'TECHNICAL_ROUND', title: 'Technical Round', color: 'amber' },
  { id: 'HR_ROUND', title: 'HR Round', color: 'orange' },
  { id: 'OFFER_EXTENDED', title: 'Offer Extended', color: 'emerald' },
  { id: 'HIRED', title: 'Hired', color: 'green' },
  { id: 'REJECTED', title: 'Rejected', color: 'rose' },
];

export const KanbanBoard = ({
  jobId,
  applications = [],
  onUpdateApplications,
  onOpenExplanation,
  onScheduleInterview,
  onSelectApplication,
}) => {
  const { success, error } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [isReRanking, setIsReRanking] = useState(false);

  // Filter applications based on search & score slider
  const filteredApps = applications.filter((app) => {
    const nameMatch = (app.candidateId?.fullName || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const emailMatch = (app.candidateId?.email || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const scoreMatch = (app.overallMatchScore || 0) >= minScore;
    return (nameMatch || emailMatch) && scoreMatch;
  });

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const targetStage = destination.droppableId;

    // Optimistic Update
    const previousApps = [...applications];
    const updatedApps = applications.map((app) => {
      if (app._id === draggableId) {
        return { ...app, stage: targetStage };
      }
      return app;
    });

    onUpdateApplications(updatedApps);

    try {
      await applicationApi.updateStage(draggableId, { stage: targetStage });
      success(`Candidate moved to ${targetStage.replace(/_/g, ' ')}`);
    } catch (err) {
      error(`Failed to update candidate stage: ${err.message}`);
      // Revert optimistic update
      onUpdateApplications(previousApps);
    }
  };

  const handleReRank = async () => {
    if (!jobId) return;
    try {
      setIsReRanking(true);
      const res = await applicationApi.reRank(jobId);
      success(`Recalculated AI rankings for ${res.data.updatedCount} candidates.`);
      // Refresh applications
      const freshApps = await applicationApi.getJobApplications(jobId);
      onUpdateApplications(freshApps.data);
    } catch (err) {
      error(`Re-ranking failed: ${err.message}`);
    } finally {
      setIsReRanking(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Pipeline Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-slate-800">
        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Match Score Threshold Slider */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Min AI Match:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
            <span className="font-bold text-indigo-400 w-8">{minScore}%</span>
          </div>
        </div>

        {/* Action Button: AI Re-Rank Engine */}
        <Button
          variant="secondary"
          size="sm"
          icon={Sparkles}
          isLoading={isReRanking}
          onClick={handleReRank}
          className="border-indigo-700/50 hover:border-indigo-500 hover:text-indigo-300"
        >
          Re-Score & Rank AI Pipeline
        </Button>
      </div>

      {/* Drag & Drop Horizontal Kanban Columns */}
      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 items-start min-w-max">
            {PIPELINE_COLUMNS.map((column) => {
              const columnApps = filteredApps.filter((app) => app.stage === column.id);
              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  applications={columnApps}
                  onOpenExplanation={onOpenExplanation}
                  onScheduleInterview={onScheduleInterview}
                  onSelectApplication={onSelectApplication}
                />
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};
