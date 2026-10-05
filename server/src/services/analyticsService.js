import mongoose from 'mongoose';
import { Job } from '../models/Job.js';
import { Candidate } from '../models/Candidate.js';
import { Application } from '../models/Application.js';
import { Interview } from '../models/Interview.js';
import { STAGE_LIST } from '../constants/applicationStages.js';

/**
 * Calculates recruitment funnel, KPI averages, and skill breakdowns
 */
export const getRecruitmentAnalytics = async (jobIdFilter = null) => {
  let matchFilter = {};
  if (jobIdFilter) {
    try {
      matchFilter = { jobId: new mongoose.Types.ObjectId(jobIdFilter) };
    } catch {
      matchFilter = { jobId: jobIdFilter };
    }
  }


  // 1. Total counts
  const [totalJobs, totalCandidates, totalApplications, totalInterviews] = await Promise.all([
    Job.countDocuments({ status: { $ne: 'CLOSED' } }),
    Candidate.countDocuments(),
    Application.countDocuments(matchFilter),
    Interview.countDocuments(),
  ]);

  // 2. Stage distribution (Funnel)
  const stageAgg = await Application.aggregate([
    { $match: matchFilter },
    { $group: { _id: '$stage', count: { $sum: 1 } } },
  ]);

  const stageCounts = {};
  STAGE_LIST.forEach((stage) => {
    stageCounts[stage] = 0;
  });
  stageAgg.forEach((item) => {
    stageCounts[item._id] = item.count;
  });

  // 3. Average Match Score across all applications
  const scoreAgg = await Application.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        avgOverall: { $avg: '$overallMatchScore' },
        avgSkills: { $avg: '$matchBreakdown.skillsScore' },
        avgExp: { $avg: '$matchBreakdown.experienceScore' },
      },
    },
  ]);

  const avgScores = scoreAgg[0] || { avgOverall: 0, avgSkills: 0, avgExp: 0 };

  // 4. Time to hire for Hired candidates (in days)
  const hiredApps = await Application.find({
    ...matchFilter,
    stage: 'HIRED',
  }).select('createdAt updatedAt');

  let avgTimeToHireDays = 0;
  if (hiredApps.length > 0) {
    const totalDays = hiredApps.reduce((acc, app) => {
      const diffTime = Math.abs(new Date(app.updatedAt) - new Date(app.createdAt));
      return acc + Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, 0);
    avgTimeToHireDays = Math.round(totalDays / hiredApps.length);
  }

  // 5. In-demand skills vs supplied candidate skills
  const topCandidateSkills = await Candidate.aggregate([
    { $unwind: '$extractedSkills' },
    { $group: { _id: '$extractedSkills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const topJobSkills = await Job.aggregate([
    { $unwind: '$requiredSkills' },
    { $group: { _id: '$requiredSkills', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return {
    totalJobs,
    totalCandidates,
    totalApplications,
    totalInterviews,
    avgTimeToHireDays,
    stageCounts,
    avgScores: {
      overall: Math.round(avgScores.avgOverall || 0),
      skills: Math.round(avgScores.avgSkills || 0),
      experience: Math.round(avgScores.avgExp || 0),
    },
    topCandidateSkills: topCandidateSkills.map((s) => ({ skill: s._id, count: s.count })),
    topJobSkills: topJobSkills.map((s) => ({ skill: s._id, count: s.count })),
  };
};
