import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = {
  INTERVIEW_REMINDER: 'INTERVIEW_REMINDER',
  STAGE_UPDATE: 'STAGE_UPDATE',
  FEEDBACK_REQUESTED: 'FEEDBACK_REQUESTED',
  OFFER_STATUS: 'OFFER_STATUS',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
};

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient user is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: Object.values(NOTIFICATION_TYPES),
        message: '{VALUE} is not a valid notification type',
      },
      default: NOTIFICATION_TYPES.SYSTEM_ALERT,
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Application', 'Interview', 'Job', 'Candidate', 'InterviewFeedback', 'User'],
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for unread notifications per user
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
