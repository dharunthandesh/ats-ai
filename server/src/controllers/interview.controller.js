import { Interview } from '../models/Interview.js';
import { Application } from '../models/Application.js';
import { Candidate } from '../models/Candidate.js';
import { Job } from '../models/Job.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { sendInterviewInviteEmail } from '../services/emailService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const scheduleInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      interviewers,
      roundType,
      scheduledStartTime,
      scheduledEndTime,
      meetingLink,
      locationNotes,
      sendEmail = true,
    } = req.body;

    if (!applicationId || !scheduledStartTime || !scheduledEndTime) {
      throw ApiError.badRequest('Application ID, start time, and end time are required.');
    }

    const application = await Application.findById(applicationId)
      .populate('candidateId')
      .populate('jobId');

    if (!application) {
      throw ApiError.notFound('Application not found.');
    }

    const interview = await Interview.create({
      applicationId,
      jobId: application.jobId._id,
      candidateId: application.candidateId._id,
      interviewers: interviewers || [req.user._id],
      roundType: roundType || 'TECHNICAL',
      scheduledStartTime,
      scheduledEndTime,
      meetingLink: meetingLink || 'https://meet.google.com/talentpulse-interview',
      locationNotes: locationNotes || 'Video Conference',
    });

    // Advance application stage
    const previousStage = application.stage;
    const nextStage = roundType === 'HR' ? 'HR_ROUND' : 'TECHNICAL_ROUND';
    application.stage = nextStage;
    await application.save();

    // Log Activity
    await ActivityLog.create({
      applicationId: application._id,
      actorId: req.user._id,
      actionType: 'INTERVIEW_SCHEDULED',
      previousState: previousStage,
      newState: nextStage,
      notes: `${roundType} round scheduled for ${new Date(scheduledStartTime).toLocaleString()}`,
    });

    // Send candidate email invitation
    if (sendEmail && application.candidateId?.email) {
      await sendInterviewInviteEmail({
        candidateName: application.candidateId.fullName,
        candidateEmail: application.candidateId.email,
        jobTitle: application.jobId.title,
        roundType: roundType || 'Technical',
        startTime: scheduledStartTime,
        meetingLink: interview.meetingLink,
      });
    }

    const populated = await Interview.findById(interview._id)
      .populate('candidateId')
      .populate('jobId')
      .populate('interviewers', 'name email role department');

    return ApiResponse.created(res, populated, 'Interview scheduled successfully');
  } catch (error) {
    next(error);
  }
};

export const getInterviews = async (req, res, next) => {
  try {
    const { status, date, interviewerId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (interviewerId) filter.interviewers = interviewerId;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.scheduledStartTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const interviews = await Interview.find(filter)
      .populate('candidateId', 'fullName email phone extractedSkills')
      .populate('jobId', 'title department')
      .populate('interviewers', 'name email role department avatar')
      .sort({ scheduledStartTime: 1 });

    return ApiResponse.success(res, interviews, 'Interviews retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id)
      .populate('candidateId')
      .populate('jobId')
      .populate('interviewers', 'name email role department avatar');

    if (!interview) {
      throw ApiError.notFound('Interview not found.');
    }

    return ApiResponse.success(res, interview, 'Interview retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateInterviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const interview = await Interview.findByIdAndUpdate(id, { status }, { new: true });
    if (!interview) {
      throw ApiError.notFound('Interview not found.');
    }

    return ApiResponse.success(res, interview, `Interview status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};
