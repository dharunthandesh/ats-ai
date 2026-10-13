import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
      index: true,
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    technicalSkillsRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    problemSolvingRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    communicationRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    culturalFitRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overallScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    recommendation: {
      type: String,
      enum: ['STRONG_HIRE', 'HIRE', 'HOLD', 'REJECT'],
      required: true,
    },
    strengths: {
      type: String,
      default: '',
    },
    areasOfImprovement: {
      type: String,
      default: '',
    },
    privateNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate evaluation from same interviewer for same interview
evaluationSchema.index({ interviewId: 1, interviewerId: 1 }, { unique: true });

export const Evaluation = mongoose.models.Evaluation || mongoose.model('Evaluation', evaluationSchema);
