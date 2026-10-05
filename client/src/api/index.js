import axiosClient from './axiosClient';

// Auth APIs
export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  getMe: () => axiosClient.get('/auth/me'),
  listUsers: () => axiosClient.get('/auth/users'),
  updateUser: (id, data) => axiosClient.put(`/auth/users/${id}`, data),
};

// Jobs APIs
export const jobApi = {
  getJobs: (params) => axiosClient.get('/jobs', { params }),
  getJobById: (id) => axiosClient.get(`/jobs/${id}`),
  createJob: (data) => axiosClient.post('/jobs', data),
  updateJob: (id, data) => axiosClient.put(`/jobs/${id}`, data),
  toggleStatus: (id, status) => axiosClient.patch(`/jobs/${id}/status`, { status }),
  deleteJob: (id) => axiosClient.delete(`/jobs/${id}`),
};

// Candidate APIs
export const candidateApi = {
  getCandidates: (params) => axiosClient.get('/candidates', { params }),
  getCandidateById: (id) => axiosClient.get(`/candidates/${id}`),
  uploadResumes: (formData) =>
    axiosClient.post('/candidates/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateCandidate: (id, data) => axiosClient.put(`/candidates/${id}`, data),
};

// Application & Kanban Pipeline APIs
export const applicationApi = {
  getJobApplications: (jobId, params) =>
    axiosClient.get(`/applications/job/${jobId}`, { params }),
  getApplicationById: (id) => axiosClient.get(`/applications/${id}`),
  apply: (data) => axiosClient.post('/applications', data),
  updateStage: (id, data) => axiosClient.patch(`/applications/${id}/stage`, data),
  reRank: (jobId) => axiosClient.post(`/applications/job/${jobId}/re-rank`),
  addNote: (id, data) => axiosClient.post(`/applications/${id}/notes`, data),
  updateOffer: (id, data) => axiosClient.patch(`/applications/${id}/offer`, data),
};

// Interview APIs
export const interviewApi = {
  getInterviews: (params) => axiosClient.get('/interviews', { params }),
  getInterviewById: (id) => axiosClient.get(`/interviews/${id}`),
  schedule: (data) => axiosClient.post('/interviews', data),
  updateStatus: (id, status) => axiosClient.patch(`/interviews/${id}/status`, { status }),
};

// Evaluation Scorecard APIs
export const evaluationApi = {
  submit: (data) => axiosClient.post('/evaluations', data),
  getByApplication: (applicationId) =>
    axiosClient.get(`/evaluations/application/${applicationId}`),
};

// Analytics & Export APIs
export const analyticsApi = {
  getOverview: (params) => axiosClient.get('/analytics/overview', { params }),
  getCsvExportUrl: (jobId) => `/api/v1/analytics/export/csv${jobId ? `?jobId=${jobId}` : ''}`,
  getPdfExportUrl: (jobId) => `/api/v1/analytics/export/pdf${jobId ? `?jobId=${jobId}` : ''}`,
};
