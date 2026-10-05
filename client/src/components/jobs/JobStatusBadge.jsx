import React from 'react';

export const JobStatusBadge = ({ status = 'ACTIVE', size = 'sm' }) => {
  const styles = {
    ACTIVE: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-sm shadow-emerald-900/20',
    DRAFT: 'bg-slate-900/80 text-slate-300 border-slate-700/60',
    PAUSED: 'bg-amber-950/80 text-amber-300 border-amber-700/60 shadow-sm shadow-amber-900/20',
    CLOSED: 'bg-rose-950/80 text-rose-300 border-rose-700/60 shadow-sm shadow-rose-900/20',
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm font-semibold',
  };

  const dotColors = {
    ACTIVE: 'bg-emerald-400',
    DRAFT: 'bg-slate-400',
    PAUSED: 'bg-amber-400',
    CLOSED: 'bg-rose-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${
        styles[status] || styles.ACTIVE
      } ${sizeClasses[size] || sizeClasses.sm}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] || 'bg-slate-400'}`} />
      {status}
    </span>
  );
};
