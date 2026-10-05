import mongoose from 'mongoose';

const experienceSubSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  title: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: 'Present' },
  durationYears: { type: Number, default: 0 },
  description: { type: String, default: '' },
});

const educationSubSchema = new mongoose.Schema({
  institution: { type: String, default: '' },
  degree: { type: String, default: '' },
  fieldOfStudy: { type: String, default: '' },
  gradYear: { type: String, default: '' },
});

const candidateSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Candidate email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    summary: {
      type: String,
      default: '',
    },
    extractedSkills: {
      type: [String],
      default: [],
      index: true,
    },
    experience: [experienceSubSchema],
    education: [educationSubSchema],
    calculatedTotalExperienceYears: {
      type: Number,
      default: 0,
    },
    highestDegree: {
      type: String,
      default: 'Bachelor',
    },
    resumeOriginalName: {
      type: String,
      default: '',
    },
    resumeFilePath: {
      type: String,
      default: '',
    },
    resumeMimeType: {
      type: String,
      default: '',
    },
    resumeRawText: {
      type: String,
      default: '',
    },
    portfolioUrl: {
      type: String,
      default: '',
    },
    linkedinUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Candidate = mongoose.model('Candidate', candidateSchema);
