import mongoose from 'mongoose';

export const INTERVIEW_TYPES = {
  SCREENING: 'SCREENING',
  TECHNICAL: 'TECHNICAL',
  BEHAVIORAL: 'BEHAVIORAL',
  SYSTEM_DESIGN: 'SYSTEM_DESIGN',
  HR: 'HR',
};

export const INTERVIEW_STATUSES = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
  NO_SHOW: 'NO_SHOW',
};

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
      index: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Interviewer user reference is required'],
      index: true,
    },
    interviewType: {
      type: String,
      enum: {
        values: Object.values(INTERVIEW_TYPES),
        message: '{VALUE} is not a valid interview type',
      },
      default: INTERVIEW_TYPES.TECHNICAL,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Interview scheduled date and time is required'],
      index: true,
    },
    duration: {
      type: Number,
      required: [true, 'Interview duration in minutes is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      default: 60,
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: Object.values(INTERVIEW_STATUSES),
        message: '{VALUE} is not a valid interview status',
      },
      default: INTERVIEW_STATUSES.SCHEDULED,
      index: true,
    },
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewFeedback',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for scheduling queries
interviewSchema.index({ interviewer: 1, scheduledAt: 1 });
interviewSchema.index({ applicationId: 1, status: 1 });

export const Interview = mongoose.model('Interview', interviewSchema);
