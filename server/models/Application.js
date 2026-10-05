import mongoose from 'mongoose';

export const PIPELINE_STAGES = {
  APPLIED: 'APPLIED',
  SCREENING: 'SCREENING',
  SHORTLISTED: 'SHORTLISTED',
  TECHNICAL_ROUND: 'TECHNICAL_ROUND',
  HR_ROUND: 'HR_ROUND',
  OFFER_EXTENDED: 'OFFER_EXTENDED',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
};

export const APPLICATION_STATUSES = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  WITHDRAWN: 'WITHDRAWN',
};

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate reference is required'],
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job requisition reference is required'],
      index: true,
    },
    matchScore: {
      type: Number,
      min: [0, 'Match score cannot be less than 0'],
      max: [100, 'Match score cannot exceed 100'],
      default: 0,
      index: true,
    },
    ranking: {
      type: Number,
      min: [0, 'Ranking cannot be negative'],
      default: 0,
    },
    pipelineStage: {
      type: String,
      enum: {
        values: Object.values(PIPELINE_STAGES),
        message: '{VALUE} is not a valid pipeline stage',
      },
      default: PIPELINE_STAGES.APPLIED,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(APPLICATION_STATUSES),
        message: '{VALUE} is not a valid application status',
      },
      default: APPLICATION_STATUSES.ACTIVE,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent candidate from applying multiple times to the exact same job requisition
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

// Query optimization indexes for Kanban and ranking pipelines
applicationSchema.index({ jobId: 1, pipelineStage: 1 });
applicationSchema.index({ jobId: 1, matchScore: -1 });

export const Application = mongoose.model('Application', applicationSchema);
