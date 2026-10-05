import mongoose from 'mongoose';

export const RECOMMENDATIONS = {
  STRONG_HIRE: 'STRONG_HIRE',
  HIRE: 'HIRE',
  HOLD: 'HOLD',
  REJECT: 'REJECT',
};

const ratingSubSchema = new mongoose.Schema(
  {
    technicalSkills: { type: Number, min: 1, max: 5, default: 3 },
    problemSolving: { type: Number, min: 1, max: 5, default: 3 },
    communication: { type: Number, min: 1, max: 5, default: 3 },
    culturalFit: { type: Number, min: 1, max: 5, default: 3 },
  },
  { _id: false }
);

const interviewFeedbackSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: [true, 'Interview reference is required'],
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
      index: true,
    },
    interviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Interviewer user reference is required'],
      index: true,
    },
    ratings: {
      type: ratingSubSchema,
      default: () => ({}),
    },
    overallScore: {
      type: Number,
      required: [true, 'Overall score (1 to 5) is required'],
      min: [1, 'Overall score must be at least 1'],
      max: [5, 'Overall score cannot exceed 5'],
    },
    recommendation: {
      type: String,
      required: [true, 'Hiring recommendation is required'],
      enum: {
        values: Object.values(RECOMMENDATIONS),
        message: '{VALUE} is not a valid hiring recommendation',
      },
    },
    strengths: {
      type: String,
      trim: true,
      default: '',
    },
    areasOfImprovement: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One evaluation per interviewer per interview round
interviewFeedbackSchema.index({ interviewId: 1, interviewerId: 1 }, { unique: true });

export const InterviewFeedback = mongoose.model('InterviewFeedback', interviewFeedbackSchema);
