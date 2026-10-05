import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { jobApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { Briefcase, Plus } from 'lucide-react';

export const CreateJobModal = ({ isOpen, onClose, onJobCreated }) => {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    employmentType: 'FULL_TIME',
    experienceLevel: 'MID',
    minExperienceYears: 3,
    requiredSkills: '',
    preferredSkills: '',
    description: '',
    responsibilities: '',
    salaryMin: 120000,
    salaryMax: 160000,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.requiredSkills) {
      error('Please fill in title, description, and required skills.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        minExperienceYears: Number(formData.minExperienceYears),
        requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        preferredSkills: formData.preferredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        description: formData.description,
        responsibilities: formData.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean),
        salaryRange: {
          min: Number(formData.salaryMin),
          max: Number(formData.salaryMax),
          currency: 'USD',
        },
        status: 'ACTIVE',
      };

      const res = await jobApi.createJob(payload);
      success('Job requisition posted successfully!');
      if (onJobCreated) onJobCreated(res.data);
      onClose();
    } catch (err) {
      error(`Failed to create job: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Job Requisition"
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={loading}
            onClick={handleSubmit}
            icon={Plus}
          >
            Publish Job Requisition
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Department */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Frontend Architect"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Department *
            </label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g. Engineering, Product, Design"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Location & Experience Settings */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Remote, San Francisco"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Employment Type
            </label>
            <select
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="REMOTE">Fully Remote</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Min Exp (Years)
            </label>
            <input
              type="number"
              min="0"
              value={formData.minExperienceYears}
              onChange={(e) => setFormData({ ...formData, minExperienceYears: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Required Skills * (Comma separated)
          </label>
          <input
            type="text"
            required
            value={formData.requiredSkills}
            onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
            placeholder="e.g. React, Node.js, TypeScript, MongoDB, Docker"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Preferred / Nice-to-have Skills (Comma separated)
          </label>
          <input
            type="text"
            value={formData.preferredSkills}
            onChange={(e) => setFormData({ ...formData, preferredSkills: e.target.value })}
            placeholder="e.g. AWS, Kubernetes, GraphQL, Tailwind CSS"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Job Description *
          </label>
          <textarea
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Overview of the position, scope of work, and team impact..."
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Responsibilities */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Key Responsibilities (One per line)
          </label>
          <textarea
            rows={2}
            value={formData.responsibilities}
            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
            placeholder="Architect scalable microservices&#10;Lead sprint planning and code reviews"
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Salary Minimum ($ USD)
            </label>
            <input
              type="number"
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Salary Maximum ($ USD)
            </label>
            <input
              type="number"
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
