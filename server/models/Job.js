import mongoose from 'mongoose';

export const JOB_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
};

export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  REMOTE: 'REMOTE',
  INTERNSHIP: 'INTERNSHIP',
};

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill must be defined'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'A job must specify at least one required skill',
      },
    },
    preferredSkills: {
      type: [String],
      default: [],
    },
    minimumExperience: {
      type: Number,
      required: [true, 'Minimum experience in years is required'],
      min: [0, 'Minimum experience cannot be negative'],
      default: 0,
    },
    maximumExperience: {
      type: Number,
      min: [0, 'Maximum experience cannot be negative'],
      validate: {
        validator: function (val) {
          if (val == null) return true;
          return val >= (this.minimumExperience || 0);
        },
        message: 'Maximum experience must be greater than or equal to minimum experience',
      },
      default: null,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
      index: true,
    },
    employmentType: {
      type: String,
      enum: {
        values: Object.values(EMPLOYMENT_TYPES),
        message: '{VALUE} is not a valid employment type',
      },
      default: EMPLOYMENT_TYPES.FULL_TIME,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(JOB_STATUSES),
        message: '{VALUE} is not a valid job status',
      },
      default: JOB_STATUSES.ACTIVE,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Job creator reference is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for query optimization
jobSchema.index({ status: 1, department: 1 });
jobSchema.index({ status: 1, createdAt: -1 });

export const Job = mongoose.model('Job', jobSchema);
