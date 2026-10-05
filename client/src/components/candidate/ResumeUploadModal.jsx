import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { candidateApi, jobApi } from '../../api';
import { useNotification } from '../../context/NotificationContext';
import { UploadCloud, FileText, CheckCircle2, Sparkles, X } from 'lucide-react';

export const ResumeUploadModal = ({ isOpen, onClose, defaultJobId = '', onUploadComplete }) => {
  const { success, error } = useNotification();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(defaultJobId);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedResults, setParsedResults] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedJobId(defaultJobId);
      setParsedResults([]);
      setSelectedFiles([]);
      // Load active jobs for dropdown
      jobApi.getJobs({ status: 'ACTIVE' }).then((res) => {
        setJobs(res.data || []);
      }).catch(console.error);
    }
  }, [isOpen, defaultJobId]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadAndParse = async () => {
    if (selectedFiles.length === 0) {
      error('Please select at least one PDF or DOCX resume.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('resumes', file);
      });
      if (selectedJobId) {
        formData.append('jobId', selectedJobId);
      }

      const res = await candidateApi.uploadResumes(formData);
      const dataArray = Array.isArray(res.data) ? res.data : [res.data];
      setParsedResults(dataArray);
      success(`Successfully parsed ${dataArray.length} candidate resume(s)!`);

      if (onUploadComplete) {
        onUploadComplete(dataArray);
      }
    } catch (err) {
      error(`Parsing failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload & Parse Candidate Resumes"
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            {parsedResults.length > 0 ? 'Close' : 'Cancel'}
          </Button>
          {parsedResults.length === 0 && (
            <Button
              variant="primary"
              size="sm"
              isLoading={isUploading}
              onClick={handleUploadAndParse}
              icon={Sparkles}
            >
              Parse with NLP Engine
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        {/* Job Association Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Assign to Job Requisition (Optional)
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">General Candidate Pool (No Job Selected)</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.department})
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Selecting a job automatically calculates AI skill match scores and places candidates into the pipeline.
          </p>
        </div>

        {/* Upload Drop Zone */}
        {parsedResults.length === 0 && (
          <div>
            <label className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all group">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">
                Drag & Drop resumes here, or <span className="text-indigo-400 underline">browse</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX up to 10MB each (Batch uploads supported)
              </p>
            </label>

            {/* Selected Files Queue */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Files Selected ({selectedFiles.length})
                </h5>
                <div className="max-h-36 overflow-y-auto space-y-1.5">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-slate-200 truncate">{file.name}</span>
                        <span className="text-slate-500">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Parsed Output Summary */}
        {parsedResults.length > 0 && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Resume parsing completed. Extracted structured candidate profiles:</span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {parsedResults.map((item, idx) => {
                const c = item.candidate || {};
                const app = item.application;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h6 className="text-sm font-bold text-white">{c.fullName}</h6>
                        <span className="text-xs text-slate-400">({c.email})</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Tenure: <span className="text-slate-200">{c.calculatedTotalExperienceYears} yrs</span> • Degree: <span className="text-slate-200">{c.highestDegree}</span>
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(c.extractedSkills || []).slice(0, 6).map((skill) => (
                          <Badge key={skill} variant="indigo" size="xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {app && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-extrabold text-emerald-400">
                          {app.overallMatchScore}%
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">
                          AI Match
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
