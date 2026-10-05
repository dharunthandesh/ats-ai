import fs from 'fs';
import path from 'path';
import { Candidate } from '../models/Candidate.js';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { processResumeFile } from '../services/parser/index.js';
import { calculateCandidateMatch } from '../services/matching/scoringEngine.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      throw ApiError.badRequest('Please select at least one PDF or DOCX resume to upload.');
    }

    const files = req.files || [req.file];
    const { jobId } = req.body;
    const results = [];

    // Retrieve target Job if jobId is passed
    let targetJob = null;
    if (jobId) {
      targetJob = await Job.findById(jobId);
    }

    for (const file of files) {
      // 1. Process & parse resume document
      const parsedData = await processResumeFile(file);

      // 2. Find or create Candidate by email
      let candidate = await Candidate.findOne({ email: parsedData.email });
      if (candidate) {
        // Merge skills and update latest resume metadata
        const mergedSkills = Array.from(
          new Set([...candidate.extractedSkills, ...parsedData.extractedSkills])
        );
        candidate.extractedSkills = mergedSkills;
        candidate.calculatedTotalExperienceYears = Math.max(
          candidate.calculatedTotalExperienceYears,
          parsedData.calculatedTotalExperienceYears
        );
        candidate.resumeFilePath = parsedData.resumeFilePath;
        candidate.resumeOriginalName = parsedData.resumeOriginalName;
        candidate.resumeRawText = parsedData.resumeRawText;
        await candidate.save();
      } else {
        candidate = await Candidate.create(parsedData);
      }

      // 3. If targetJob specified, calculate AI Match and create/update Application
      let application = null;
      if (targetJob) {
        const matchResult = calculateCandidateMatch(candidate, targetJob);

        application = await Application.findOne({
          jobId: targetJob._id,
          candidateId: candidate._id,
        });

        if (application) {
          application.overallMatchScore = matchResult.overallMatchScore;
          application.matchBreakdown = matchResult.matchBreakdown;
          application.matchedSkills = matchResult.matchedSkills;
          application.missingSkills = matchResult.missingSkills;
          application.matchExplanation = matchResult.matchExplanation;
          await application.save();
        } else {
          application = await Application.create({
            jobId: targetJob._id,
            candidateId: candidate._id,
            stage: 'APPLIED',
            overallMatchScore: matchResult.overallMatchScore,
            matchBreakdown: matchResult.matchBreakdown,
            matchedSkills: matchResult.matchedSkills,
            missingSkills: matchResult.missingSkills,
            matchExplanation: matchResult.matchExplanation,
          });

          // Log parsing activity
          if (req.user) {
            await ActivityLog.create({
              applicationId: application._id,
              actorId: req.user._id,
              actionType: 'RESUME_PARSED',
              previousState: 'N/A',
              newState: 'APPLIED',
              notes: `Resume uploaded and parsed (${file.originalname}). Initial Match: ${matchResult.overallMatchScore}%`,
            });
          }
        }
      }

      results.push({
        candidate,
        application,
      });
    }

    return ApiResponse.created(
      res,
      results.length === 1 ? results[0] : results,
      `Successfully parsed and processed ${results.length} resume(s)`
    );
  } catch (error) {
    next(error);
  }
};

export const getCandidates = async (req, res, next) => {
  try {
    const { search, skill, minExp, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }
    if (skill) {
      filter.extractedSkills = { $in: [new RegExp(skill, 'i')] };
    }
    if (minExp) {
      filter.calculatedTotalExperienceYears = { $gte: Number(minExp) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [candidates, totalRecords] = await Promise.all([
      Candidate.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Candidate.countDocuments(filter),
    ]);

    return ApiResponse.success(res, candidates, 'Candidates retrieved successfully', 200, {
      page: Number(page),
      limit: Number(limit),
      totalRecords,
      totalPages: Math.ceil(totalRecords / Number(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findById(id);

    if (!candidate) {
      throw ApiError.notFound('Candidate not found.');
    }

    // Fetch candidate's applications across all jobs
    const applications = await Application.find({ candidateId: id })
      .populate('jobId', 'title department status minExperienceYears requiredSkills')
      .sort({ createdAt: -1 });

    return ApiResponse.success(
      res,
      { ...candidate.toObject(), applications },
      'Candidate details retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const updateCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!candidate) {
      throw ApiError.notFound('Candidate not found.');
    }

    return ApiResponse.success(res, candidate, 'Candidate profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const downloadResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findById(id);

    if (!candidate || !candidate.resumeFilePath) {
      throw ApiError.notFound('Resume file not found for this candidate.');
    }

    if (!fs.existsSync(candidate.resumeFilePath)) {
      throw ApiError.notFound('Resume file missing on storage server.');
    }

    res.download(candidate.resumeFilePath, candidate.resumeOriginalName || 'Resume.pdf');
  } catch (error) {
    next(error);
  }
};
