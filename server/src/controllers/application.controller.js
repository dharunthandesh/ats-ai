import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { Candidate } from '../models/Candidate.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Interview } from '../models/Interview.js';
import { Evaluation } from '../models/Evaluation.js';
import { calculateCandidateMatch } from '../services/matching/scoringEngine.js';
import { sendOfferLetterEmail, sendRejectionEmail } from '../services/emailService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { STAGE_LIST } from '../constants/applicationStages.js';

export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, candidateId } = req.body;

    if (!jobId || !candidateId) {
      throw ApiError.badRequest('Both jobId and candidateId are required.');
    }

    const [job, candidate] = await Promise.all([
      Job.findById(jobId),
      Candidate.findById(candidateId),
    ]);

    if (!job) throw ApiError.notFound('Job not found.');
    if (!candidate) throw ApiError.notFound('Candidate not found.');

    const existingApp = await Application.findOne({ jobId, candidateId });
    if (existingApp) {
      throw ApiError.conflict('Candidate has already applied for this job.');
    }

    const matchResult = calculateCandidateMatch(candidate, job);

    const application = await Application.create({
      jobId,
      candidateId,
      stage: 'APPLIED',
      overallMatchScore: matchResult.overallMatchScore,
      matchBreakdown: matchResult.matchBreakdown,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      matchExplanation: matchResult.matchExplanation,
    });

    if (req.user) {
      await ActivityLog.create({
        applicationId: application._id,
        actorId: req.user._id,
        actionType: 'STAGE_CHANGE',
        previousState: 'NONE',
        newState: 'APPLIED',
        notes: `Application initiated. AI Match Score: ${matchResult.overallMatchScore}%`,
      });
    }

    return ApiResponse.created(res, application, 'Application created with AI match score');
  } catch (error) {
    next(error);
  }
};

export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { stage, minScore, sort = 'overallMatchScore' } = req.query;

    const filter = { jobId };
    if (stage) filter.stage = stage;
    if (minScore) filter.overallMatchScore = { $gte: Number(minScore) };

    const sortOption = {};
    if (sort === 'overallMatchScore') {
      sortOption.overallMatchScore = -1;
    } else {
      sortOption.createdAt = -1;
    }

    const applications = await Application.find(filter)
      .populate('candidateId')
      .populate('currentAssignee', 'name email avatar')
      .sort(sortOption);

    return ApiResponse.success(res, applications, 'Job applications retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id)
      .populate('candidateId')
      .populate('jobId')
      .populate('notes.author', 'name email role')
      .populate('currentAssignee', 'name email');

    if (!application) {
      throw ApiError.notFound('Application not found.');
    }

    // Fetch related interviews, evaluations, and activity logs
    const [interviews, evaluations, activityLogs] = await Promise.all([
      Interview.find({ applicationId: id }).populate('interviewers', 'name email role'),
      Evaluation.find({ applicationId: id }).populate('interviewerId', 'name email role'),
      ActivityLog.find({ applicationId: id }).populate('actorId', 'name email role').sort({ timestamp: -1 }),
    ]);

    return ApiResponse.success(
      res,
      {
        ...application.toObject(),
        interviews,
        evaluations,
        activityLogs,
      },
      'Application details retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage, rejectionReason } = req.body;

    if (!STAGE_LIST.includes(stage)) {
      throw ApiError.badRequest(`Invalid stage. Must be one of: ${STAGE_LIST.join(', ')}`);
    }

    const application = await Application.findById(id)
      .populate('candidateId')
      .populate('jobId');

    if (!application) {
      throw ApiError.notFound('Application not found.');
    }

    const previousStage = application.stage;
    application.stage = stage;
    if (rejectionReason) {
      application.rejectionReason = rejectionReason;
    }
    await application.save();

    // Log Activity
    if (req.user) {
      await ActivityLog.create({
        applicationId: application._id,
        actorId: req.user._id,
        actionType: stage === 'REJECTED' ? 'CANDIDATE_REJECTED' : 'STAGE_CHANGE',
        previousState: previousStage,
        newState: stage,
        notes: rejectionReason ? `Reason: ${rejectionReason}` : `Pipeline moved from ${previousStage} to ${stage}`,
      });
    }

    // Trigger Rejection Email if moved to REJECTED
    if (stage === 'REJECTED' && application.candidateId?.email) {
      await sendRejectionEmail({
        candidateName: application.candidateId.fullName,
        candidateEmail: application.candidateId.email,
        jobTitle: application.jobId?.title || 'Open Position',
      });
    }

    return ApiResponse.success(res, application, `Candidate moved to ${stage}`);
  } catch (error) {
    next(error);
  }
};

export const reRankJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      throw ApiError.notFound('Job not found.');
    }

    const applications = await Application.find({ jobId }).populate('candidateId');
    let updatedCount = 0;

    for (const app of applications) {
      if (app.candidateId) {
        const matchResult = calculateCandidateMatch(app.candidateId, job);
        app.overallMatchScore = matchResult.overallMatchScore;
        app.matchBreakdown = matchResult.matchBreakdown;
        app.matchedSkills = matchResult.matchedSkills;
        app.missingSkills = matchResult.missingSkills;
        app.matchExplanation = matchResult.matchExplanation;
        await app.save();
        updatedCount++;
      }
    }

    return ApiResponse.success(
      res,
      { updatedCount },
      `Re-ranked ${updatedCount} candidates against current job requirements`
    );
  } catch (error) {
    next(error);
  }
};

export const addApplicationNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      throw ApiError.badRequest('Note content cannot be empty.');
    }

    const application = await Application.findById(id);
    if (!application) {
      throw ApiError.notFound('Application not found.');
    }

    application.notes.push({
      author: req.user._id,
      text: text.trim(),
    });

    await application.save();

    await ActivityLog.create({
      applicationId: application._id,
      actorId: req.user._id,
      actionType: 'NOTE_ADDED',
      previousState: application.stage,
      newState: application.stage,
      notes: text.trim(),
    });

    const populatedApp = await Application.findById(id).populate('notes.author', 'name email role');

    return ApiResponse.created(res, populatedApp.notes, 'Note added successfully');
  } catch (error) {
    next(error);
  }
};

export const updateOfferDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, currency, startDate, status, sendEmailAlert } = req.body;

    const application = await Application.findById(id)
      .populate('candidateId')
      .populate('jobId');

    if (!application) {
      throw ApiError.notFound('Application not found.');
    }

    application.offerDetails = {
      amount: Number(amount) || application.offerDetails?.amount || 0,
      currency: currency || application.offerDetails?.currency || 'USD',
      startDate: startDate || application.offerDetails?.startDate,
      status: status || application.offerDetails?.status || 'PENDING',
      sentAt: status === 'PENDING' ? new Date() : application.offerDetails?.sentAt,
    };

    if (status === 'ACCEPTED') {
      application.stage = 'HIRED';
    } else if (status === 'PENDING') {
      application.stage = 'OFFER_EXTENDED';
    }

    await application.save();

    if (sendEmailAlert && application.candidateId?.email) {
      await sendOfferLetterEmail({
        candidateName: application.candidateId.fullName,
        candidateEmail: application.candidateId.email,
        jobTitle: application.jobId?.title || 'Position',
        salaryAmount: application.offerDetails.amount,
        currency: application.offerDetails.currency,
        startDate: application.offerDetails.startDate,
      });
    }

    return ApiResponse.success(res, application, 'Offer details updated successfully');
  } catch (error) {
    next(error);
  }
};
