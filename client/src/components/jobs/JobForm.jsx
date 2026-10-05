import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Tag,
  AlertCircle,
  X,
  Plus,
  Save,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../common/Button';

export const JobForm = ({
  initialValues = {},
  onSubmit,
  loading = false,
  isEdit = false,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: '',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    minimumExperience: 0,
    maximumExperience: 3,
    description: '',
    requiredSkills: [],
    preferredSkills: [],
  });

  const [reqSkillInput, setReqSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        title: initialValues.title || '',
        department: initialValues.department || 'Engineering',
        location: initialValues.location || '',
        employmentType: initialValues.employmentType || 'FULL_TIME',
        status: initialValues.status || 'ACTIVE',
        minimumExperience:
          initialValues.minimumExperience !== undefined ? initialValues.minimumExperience : 0,
        maximumExperience:
          initialValues.maximumExperience !== undefined ? initialValues.maximumExperience : 3,
        description: initialValues.description || '',
        requiredSkills: Array.isArray(initialValues.requiredSkills)
          ? [...initialValues.requiredSkills]
          : [],
        preferredSkills: Array.isArray(initialValues.preferredSkills)
          ? [...initialValues.preferredSkills]
          : [],
      });
    }
  }, [initialValues]);

  const departments = [
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

  const employmentTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'REMOTE', label: 'Remote' },
  ];

  const statuses = [
    { value: 'ACTIVE', label: 'Active (Open for applications)' },
    { value: 'DRAFT', label: 'Draft (Internal review)' },
    { value: 'PAUSED', label: 'Paused (Temporarily on hold)' },
    { value: 'CLOSED', label: 'Closed (Hiring completed)' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'minimumExperience' || name === 'maximumExperience'
          ? Math.max(0, parseInt(value, 10) || 0)
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Skill Chip handlers
  const handleAddReqSkill = (e) => {
    e.preventDefault();
    const trimmed = reqSkillInput.trim();
    if (!trimmed) return;
    if (!formData.requiredSkills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, trimmed],
      }));
    }
    setReqSkillInput('');
    if (errors.requiredSkills) {
      setErrors((prev) => ({ ...prev, requiredSkills: null }));
    }
  };

  const handleRemoveReqSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddPrefSkill = (e) => {
    e.preventDefault();
    const trimmed = prefSkillInput.trim();
    if (!trimmed) return;
    if (!formData.preferredSkills.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        preferredSkills: [...prev.preferredSkills, trimmed],
      }));
    }
    setPrefSkillInput('');
  };

  const handleRemovePrefSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      preferredSkills: prev.preferredSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'Job title must be at least 3 characters.';
    }

    if (!formData.department || formData.department.trim().length < 2) {
      newErrors.department = 'Department is required.';
    }

    if (!formData.location || formData.location.trim().length < 2) {
      newErrors.location = 'Location is required (e.g. Remote, New York, NY).';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Job description must be at least 10 characters.';
    }

    if (!formData.requiredSkills || formData.requiredSkills.length === 0) {
      newErrors.requiredSkills = 'At least one required skill must be specified.';
    }

    if (formData.minimumExperience < 0) {
      newErrors.minimumExperience = 'Minimum experience cannot be negative.';
    }

    if (formData.maximumExperience < formData.minimumExperience) {
      newErrors.maximumExperience = 'Maximum experience cannot be less than minimum experience.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Job Details Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          Requisition Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Job Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Job Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Full Stack Engineer"
              className={`w-full bg-slate-950/70 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-rose-500 focus:ring-rose-500/40'
                  : 'border-slate-700/80 focus:ring-indigo-500/40 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Department <span className="text-rose-400">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-slate-900 text-white">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Location <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Remote or San Francisco, CA"
                className={`w-full bg-slate-950/70 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.location
                    ? 'border-rose-500 focus:ring-rose-500/40'
                    : 'border-slate-700/80 focus:ring-indigo-500/40 focus:border-indigo-500'
                }`}
              />
            </div>
            {errors.location && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.location}
              </p>
            )}
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Employment Type <span className="text-rose-400">*</span>
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {employmentTypes.map((type) => (
                <option key={type.value} value={type.value} className="bg-slate-900 text-white">
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status <span className="text-rose-400">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st.value} value={st.value} className="bg-slate-900 text-white">
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Experience & Skills Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Experience & Competencies
        </h3>

        {/* Experience Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Minimum Experience (Years) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              name="minimumExperience"
              value={formData.minimumExperience}
              onChange={handleChange}
              className={`w-full bg-slate-950/70 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                errors.minimumExperience
                  ? 'border-rose-500 focus:ring-rose-500/40'
                  : 'border-slate-700/80 focus:ring-indigo-500/40 focus:border-indigo-500'
              }`}
            />
            {errors.minimumExperience && (
              <p className="text-xs text-rose-400 mt-1">{errors.minimumExperience}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Maximum Experience (Years) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              name="maximumExperience"
              value={formData.maximumExperience}
              onChange={handleChange}
              className={`w-full bg-slate-950/70 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                errors.maximumExperience
                  ? 'border-rose-500 focus:ring-rose-500/40'
                  : 'border-slate-700/80 focus:ring-indigo-500/40 focus:border-indigo-500'
              }`}
            />
            {errors.maximumExperience && (
              <p className="text-xs text-rose-400 mt-1 text-rose-400">
                {errors.maximumExperience}
              </p>
            )}
          </div>
        </div>

        {/* Required Skills Chip Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Required Skills <span className="text-rose-400">*</span>
            <span className="text-slate-400 text-[11px] font-normal ml-2">
              (AI engine matches these explicitly)
            </span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={reqSkillInput}
              onChange={(e) => setReqSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddReqSkill(e);
                }
              }}
              placeholder="e.g. React.js, Node.js, Python, TypeScript..."
              className="flex-1 bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={handleAddReqSkill}
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[32px] p-2 bg-slate-950/40 border border-slate-800 rounded-xl">
            {formData.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/50"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveReqSkill(skill)}
                  className="hover:text-rose-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {formData.requiredSkills.length === 0 && (
              <span className="text-xs text-slate-500 italic py-0.5">
                No required skills added yet. Type a skill above and press Enter.
              </span>
            )}
          </div>
          {errors.requiredSkills && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.requiredSkills}
            </p>
          )}
        </div>

        {/* Preferred Skills Chip Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Preferred / Bonus Skills
            <span className="text-slate-400 text-[11px] font-normal ml-2">
              (Bonus weighting in AI scoring)
            </span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={prefSkillInput}
              onChange={(e) => setPrefSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPrefSkill(e);
                }
              }}
              placeholder="e.g. AWS, Docker, GraphQL, Kubernetes..."
              className="flex-1 bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={handleAddPrefSkill}
            >
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[32px] p-2 bg-slate-950/40 border border-slate-800 rounded-xl">
            {formData.preferredSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-700/50"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemovePrefSkill(skill)}
                  className="hover:text-rose-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {formData.preferredSkills.length === 0 && (
              <span className="text-xs text-slate-500 italic py-0.5">
                Optional. Add preferred or 'nice-to-have' skills here.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6 backdrop-blur-sm space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-400" />
          Job Description & Responsibilities <span className="text-rose-400">*</span>
        </h3>

        <div>
          <textarea
            name="description"
            rows={7}
            value={formData.description}
            onChange={handleChange}
            placeholder="Outline the responsibilities, team dynamics, mission, and day-to-day expectations..."
            className={`w-full bg-slate-950/70 border rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 leading-relaxed transition-all ${
              errors.description
                ? 'border-rose-500 focus:ring-rose-500/40'
                : 'border-slate-700/80 focus:ring-indigo-500/40 focus:border-indigo-500'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.description}
            </p>
          )}
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          variant="primary"
          icon={Save}
          loading={loading}
          disabled={loading}
          className="shadow-lg shadow-indigo-600/30"
        >
          {isEdit ? 'Save Changes' : 'Publish Requisition'}
        </Button>
      </div>
    </form>
  );
};
