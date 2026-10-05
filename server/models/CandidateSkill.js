import mongoose from 'mongoose';

export const SKILL_CATEGORIES = {
  FRONTEND: 'FRONTEND',
  BACKEND: 'BACKEND',
  DATABASE: 'DATABASE',
  CLOUD_DEVOPS: 'CLOUD_DEVOPS',
  AI_ML: 'AI_ML',
  TESTING: 'TESTING',
  SOFT_SKILL: 'SOFT_SKILL',
  OTHER: 'OTHER',
};

export const PROFICIENCY_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
};

export const SKILL_SOURCES = {
  PARSED_RESUME: 'PARSED_RESUME',
  MANUAL_ENTRY: 'MANUAL_ENTRY',
  INTERVIEW_ASSESSED: 'INTERVIEW_ASSESSED',
};

const candidateSkillSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate reference is required'],
      index: true,
    },
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: {
        values: Object.values(SKILL_CATEGORIES),
        message: '{VALUE} is not a valid skill category',
      },
      default: SKILL_CATEGORIES.OTHER,
    },
    proficiencyLevel: {
      type: String,
      enum: {
        values: Object.values(PROFICIENCY_LEVELS),
        message: '{VALUE} is not a valid proficiency level',
      },
      default: PROFICIENCY_LEVELS.INTERMEDIATE,
    },
    yearsOfExperience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: {
        values: Object.values(SKILL_SOURCES),
        message: '{VALUE} is not a valid skill source',
      },
      default: SKILL_SOURCES.PARSED_RESUME,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate skill records for the same candidate
candidateSkillSchema.index({ candidateId: 1, skillName: 1 }, { unique: true });

export const CandidateSkill = mongoose.model('CandidateSkill', candidateSkillSchema);
