import mongoose from 'mongoose';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const resumeSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      index: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, 'Storage file path is required'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      enum: {
        values: ALLOWED_MIME_TYPES,
        message: 'Unsupported resume document MIME type: {VALUE}',
      },
    },
    fileSize: {
      type: Number,
      required: [true, 'File size in bytes is required'],
      min: [1, 'File size must be greater than 0 bytes'],
    },
    rawText: {
      type: String,
      default: '',
    },
    parsedData: {
      contact: {
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
      },
      skills: [{ type: String }],
      totalExperienceYears: { type: Number, default: 0 },
      highestDegree: { type: String, default: '' },
      summary: { type: String, default: '' },
    },
    parsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model('Resume', resumeSchema);
