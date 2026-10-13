import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'],
      default: 'FULL_TIME',
    },
    experienceLevel: {
      type: String,
      enum: ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'],
      default: 'MID',
    },
    minExperienceYears: {
      type: Number,
      required: [true, 'Minimum experience years is required'],
      default: 2,
      min: 0,
    },
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill must be defined'],
      index: true,
    },
    preferredSkills: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'],
      default: 'ACTIVE',
      index: true,
    },
    applicationDeadline: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for search and filtering
jobSchema.index({ status: 1, department: 1, createdAt: -1 });

export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
