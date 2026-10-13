import mongoose from 'mongoose';

const educationSubSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true, default: '' },
    degree: { type: String, trim: true, default: '' },
    fieldOfStudy: { type: String, trim: true, default: '' },
    gradYear: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [120, 'Name cannot exceed 120 characters'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Candidate email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    totalExperience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    education: [educationSubSchema],
    skills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CandidateSkill',
      },
    ],
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    extractedProfile: {
      headline: { type: String, default: '' },
      summary: { type: String, default: '' },
      highestDegree: { type: String, default: 'Bachelor' },
      extractedSkillList: [{ type: String }],
      portfolioUrl: { type: String, default: '' },
      linkedinUrl: { type: String, default: '' },
      githubUrl: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

export const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);
