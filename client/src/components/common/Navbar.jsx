import React from 'react';
import { Bell, Sparkles, Plus, UploadCloud } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ title, onUploadClick, onCreateJobClick }) => {
  const { user, isRecruiter } = useAuth();

  return (
    <header className="h-16 px-8 glass-panel border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Path */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-white font-display tracking-tight">{title}</h2>
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>TalentPulse AI Online</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {isRecruiter && onUploadClick && (
          <Button
            variant="outline"
            size="sm"
            icon={UploadCloud}
            onClick={onUploadClick}
            className="hover:border-indigo-500 hover:text-indigo-300"
          >
            Parse Resumes
          </Button>
        )}

        {isRecruiter && onCreateJobClick && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onCreateJobClick}
          >
            Create Job
          </Button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
          </button>
        </div>
      </div>
    </header>
  );
};
