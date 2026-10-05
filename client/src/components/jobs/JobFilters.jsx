import React from 'react';
import { Search, RotateCcw, Filter, MapPin, Briefcase, Tag } from 'lucide-react';
import { Button } from '../common/Button';

export const JobFilters = ({
  search = '',
  onSearchChange,
  status = '',
  onStatusChange,
  department = '',
  onDepartmentChange,
  location = '',
  onLocationChange,
  employmentType = '',
  onEmploymentTypeChange,
  onReset,
}) => {
  const departments = [
    'All Departments',
    'Engineering',
    'Product',
    'Design',
    'Data Science & AI',
    'Marketing',
    'Sales',
    'Human Resources',
    'Operations',
    'Finance',
  ];

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'CLOSED', label: 'Closed' },
  ];

  const employmentTypes = [
    { value: '', label: 'All Employment Types' },
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'REMOTE', label: 'Remote' },
  ];

  const hasActiveFilters = Boolean(search || status || department || location || employmentType);

  return (
    <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, skill, or keyword..."
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Department Filter */}
        <div className="lg:col-span-2 relative">
          <select
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept === 'All Departments' ? '' : dept} className="bg-slate-900 text-slate-200">
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Employment Type Filter */}
        <div className="lg:col-span-2 relative">
          <select
            value={employmentType}
            onChange={(e) => onEmploymentTypeChange(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
          >
            {employmentTypes.map((type) => (
              <option key={type.value} value={type.value} className="bg-slate-900 text-slate-200">
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2 relative">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
          >
            {statuses.map((st) => (
              <option key={st.value} value={st.value} className="bg-slate-900 text-slate-200">
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location input or reset button */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Location..."
              className="w-full bg-slate-950/70 border border-slate-700/70 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-3"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
