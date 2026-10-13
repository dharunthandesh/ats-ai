import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    interviewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    roundType: {
      type: String,
      enum: ['SCREENING', 'TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'HR'],
      default: 'TECHNICAL',
    },
    scheduledStartTime: {
      type: Date,
      required: true,
      index: true,
    },
    scheduledEndTime: {
      type: Date,
      required: true,
    },
    meetingLink: {
      type: String,
      default: '',
    },
    locationNotes: {
      type: String,
      default: 'Google Meet / Zoom',
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'],
      default: 'SCHEDULED',
      index: true,
    },
    reminderSent24h: {
      type: Boolean,
      default: false,
    },
    reminderSent1h: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Interview = mongoose.models.Interview || mongoose.model('Interview', interviewSchema);
