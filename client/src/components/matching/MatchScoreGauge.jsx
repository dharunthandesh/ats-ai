import React from 'react';
import { Sparkles } from 'lucide-react';

export const MatchScoreGauge = ({ score = 0, size = 'md', showLabel = true, onClick }) => {
  const getScoreColor = (val) => {
    if (val >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' };
    if (val >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/40' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/40' };
  };

  const colors = getScoreColor(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold ${colors.bg} ${colors.border} ${colors.text} ${sizeClasses[size] || sizeClasses.md} ${
        onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''
      }`}
      title="Click to view AI Match & Explainability Breakdown"
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>{score}%</span>
      {showLabel && <span className="font-normal text-[11px] opacity-80">Match</span>}
    </div>
  );
};
