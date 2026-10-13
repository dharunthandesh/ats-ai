import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        'STAGE_CHANGE',
        'RESUME_PARSED',
        'INTERVIEW_SCHEDULED',
        'EVALUATION_SUBMITTED',
        'NOTE_ADDED',
        'OFFER_EXTENDED',
        'CANDIDATE_REJECTED',
      ],
      required: true,
    },
    previousState: {
      type: String,
      default: '',
    },
    newState: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
