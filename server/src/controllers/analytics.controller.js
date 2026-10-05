import { getRecruitmentAnalytics } from '../services/analyticsService.js';
import { exportApplicationsCsv, exportAnalyticsPdf } from '../services/exportService.js';
import { Application } from '../models/Application.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getOverview = async (req, res, next) => {
  try {
    const { jobId } = req.query;
    const analytics = await getRecruitmentAnalytics(jobId || null);
    return ApiResponse.success(res, analytics, 'Recruitment analytics retrieved');
  } catch (error) {
    next(error);
  }
};

export const exportCsv = async (req, res, next) => {
  try {
    const { jobId } = req.query;
    const filter = jobId ? { jobId } : {};

    const applications = await Application.find(filter)
      .populate('candidateId')
      .populate('jobId')
      .sort({ overallMatchScore: -1 });

    const csvData = exportApplicationsCsv(applications);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=TalentPulse_Applications_${Date.now()}.csv`
    );
    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

export const exportPdf = async (req, res, next) => {
  try {
    const { jobId } = req.query;
    const [analytics, topCandidates] = await Promise.all([
      getRecruitmentAnalytics(jobId || null),
      Application.find(jobId ? { jobId } : {})
        .populate('candidateId')
        .populate('jobId')
        .sort({ overallMatchScore: -1 })
        .limit(10),
    ]);

    exportAnalyticsPdf(analytics, topCandidates, res);
  } catch (error) {
    next(error);
  }
};
