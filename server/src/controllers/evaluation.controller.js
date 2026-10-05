import { Evaluation } from '../models/Evaluation.js';
import { Interview } from '../models/Interview.js';
import { Application } from '../models/Application.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const submitEvaluation = async (req, res, next) => {
  try {
    const {
      interviewId,
      technicalSkillsRating,
      problemSolvingRating,
      communicationRating,
      culturalFitRating,
      overallScore,
      recommendation,
      strengths,
      areasOfImprovement,
      privateNotes,
    } = req.body;

    if (!interviewId || !overallScore || !recommendation) {
      throw ApiError.badRequest('Interview ID, overall score, and recommendation are required.');
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw ApiError.notFound('Interview not found.');
    }

    // Upsert evaluation for this interviewer
    const evaluation = await Evaluation.findOneAndUpdate(
      {
        interviewId,
        interviewerId: req.user._id,
      },
      {
        interviewId,
        interviewerId: req.user._id,
        applicationId: interview.applicationId,
        technicalSkillsRating: Number(technicalSkillsRating) || 3,
        problemSolvingRating: Number(problemSolvingRating) || 3,
        communicationRating: Number(communicationRating) || 3,
        culturalFitRating: Number(culturalFitRating) || 3,
        overallScore: Number(overallScore) || 3,
        recommendation,
        strengths: strengths || '',
        areasOfImprovement: areasOfImprovement || '',
        privateNotes: privateNotes || '',
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate('interviewerId', 'name email role department');

    // Mark interview as completed
    interview.status = 'COMPLETED';
    await interview.save();

    // Log Activity
    await ActivityLog.create({
      applicationId: interview.applicationId,
      actorId: req.user._id,
      actionType: 'EVALUATION_SUBMITTED',
      previousState: 'INTERVIEW',
      newState: 'EVALUATED',
      notes: `Scorecard submitted by ${req.user.name}: ${recommendation} (Score: ${overallScore}/5)`,
    });

    return ApiResponse.created(res, evaluation, 'Scorecard submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const getEvaluationsByApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const evaluations = await Evaluation.find({ applicationId })
      .populate('interviewerId', 'name email role department avatar')
      .populate('interviewId', 'roundType scheduledStartTime');

    return ApiResponse.success(res, evaluations, 'Evaluations retrieved');
  } catch (error) {
    next(error);
  }
};
