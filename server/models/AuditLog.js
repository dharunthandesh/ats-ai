import mongoose from 'mongoose';

export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  STAGE_TRANSITION: 'STAGE_TRANSITION',
  STATUS_CHANGE: 'STATUS_CHANGE',
  RESUME_PARSED: 'RESUME_PARSED',
  FEEDBACK_SUBMITTED: 'FEEDBACK_SUBMITTED',
};

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor user reference is required'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      enum: {
        values: Object.values(AUDIT_ACTIONS),
        message: '{VALUE} is not a recognized audit action',
      },
      index: true,
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: [
        'User',
        'Job',
        'Candidate',
        'Resume',
        'CandidateSkill',
        'Application',
        'Interview',
        'InterviewFeedback',
        'Notification',
      ],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target entity ID is required'],
      index: true,
    },
    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newState: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // We use explicit timestamp field
  }
);

// Compound index for audit investigation
auditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
