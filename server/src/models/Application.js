import mongoose from 'mongoose';
import { APPLICATION_STAGES, STAGE_LIST } from '../constants/applicationStages.js';

const noteSubSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    stage: {
      type: String,
      enum: STAGE_LIST,
      default: APPLICATION_STAGES.APPLIED,
      index: true,
    },
    overallMatchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    matchBreakdown: {
      skillsScore: { type: Number, default: 0 },
      experienceScore: { type: Number, default: 0 },
      educationScore: { type: Number, default: 0 },
      textSimilarityScore: { type: Number, default: 0 },
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    matchExplanation: {
      type: String,
      default: '',
    },
    currentAssignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: [noteSubSchema],
    offerDetails: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      startDate: { type: Date },
      status: { type: String, enum: ['NONE', 'PENDING', 'ACCEPTED', 'DECLINED'], default: 'NONE' },
      sentAt: { type: Date },
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a candidate cannot apply to the same job twice
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, stage: 1 });

export const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
