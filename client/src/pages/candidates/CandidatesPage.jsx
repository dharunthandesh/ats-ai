import React, { useState, useEffect } from 'react';
import { candidateApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ResumeUploadModal } from '../../components/candidate/ResumeUploadModal';
import {
  Users,
  Search,
  UploadCloud,
  Download,
  Mail,
  Phone,
  Clock,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

export const CandidatesPage = () => {
  const { isRecruiter } = useAuth();
  const { error } = useNotification();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [minExpFilter, setMinExpFilter] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, [search, skillFilter, minExpFilter]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const res = await candidateApi.getCandidates({
        search: search || undefined,
        skill: skillFilter || undefined,
        minExp: minExpFilter || undefined,
      });
      setCandidates(res.data || []);
    } catch (err) {
      error(`Failed to load candidates: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Global Candidate Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse structured candidate profiles, extracted skills, and original resume files.
          </p>
        </div>

        {isRecruiter && (
          <Button
            variant="primary"
            size="md"
            icon={UploadCloud}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload & Parse Resumes
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, email, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter by Skill (e.g. React)"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
          />

          <select
            value={minExpFilter}
            onChange={(e) => setMinExpFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Any Experience</option>
            <option value="2">2+ Years</option>
            <option value="4">4+ Years</option>
            <option value="6">6+ Years</option>
          </select>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((c) => (
          <div
            key={c._id}
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-900 to-purple-900 border border-indigo-700/40 text-indigo-300 font-bold text-sm flex items-center justify-center">
                    {c.fullName?.[0] || 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.fullName}</h3>
                    <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      {c.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Experience and Degree */}
              <div className="flex items-center gap-3 text-xs text-slate-400 my-2.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  {c.calculatedTotalExperienceYears}y exp
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 truncate">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  {c.highestDegree}
                </span>
              </div>

              {/* Summary */}
              {c.summary && (
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {c.summary}
                </p>
              )}

              {/* Skills */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Extracted Skills ({c.extractedSkills?.length || 0})
                </p>
                <div className="flex flex-wrap gap-1">
                  {(c.extractedSkills || []).slice(0, 5).map((skill) => (
                    <Badge key={skill} variant="slate" size="xs">
                      {skill}
                    </Badge>
                  ))}
                  {(c.extractedSkills || []).length > 5 && (
                    <span className="text-[10px] text-slate-500 px-1 py-0.5">
                      +{(c.extractedSkills || []).length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Added: {new Date(c.createdAt).toLocaleDateString()}
              </span>

              {c.resumeFilePath && (
                <a
                  href={`/api/v1/candidates/${c._id}/resume`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Resume
                </a>
              )}
            </div>
          </div>
        ))}

        {candidates.length === 0 && !loading && (
          <div className="col-span-3 p-12 text-center glass-panel rounded-2xl text-slate-500 text-sm">
            No candidate profiles found. Use "Upload & Parse Resumes" to add candidates.
          </div>
        )}
      </div>

      <ResumeUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={() => loadCandidates()}
      />
    </div>
  );
};
