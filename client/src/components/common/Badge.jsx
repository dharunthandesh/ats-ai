import React from 'react';

export const Badge = ({ children, variant = 'slate', size = 'sm', className = '' }) => {
  const variantStyles = {
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    indigo: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
    blue: 'bg-blue-950/80 text-blue-300 border-blue-700/60',
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    green: 'bg-green-950/80 text-green-300 border-green-700/60',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    orange: 'bg-orange-950/80 text-orange-300 border-orange-700/60',
    rose: 'bg-rose-950/80 text-rose-300 border-rose-700/60',
    purple: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[11px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant] || variantStyles.slate} ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
};
