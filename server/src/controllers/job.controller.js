import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      department,
      location,
      employmentType,
      experienceLevel,
      minExperienceYears,
      requiredSkills,
      preferredSkills,
      description,
      responsibilities,
      salaryRange,
      status,
      applicationDeadline,
    } = req.body;

    if (!title || !department || !description) {
      throw ApiError.badRequest('Job title, department, and description are required.');
    }

    if (!requiredSkills || requiredSkills.length === 0) {
      throw ApiError.badRequest('At least one required skill must be specified.');
    }

    const job = await Job.create({
      title,
      department,
      location: location || 'Remote',
      employmentType: employmentType || 'FULL_TIME',
      experienceLevel: experienceLevel || 'MID',
      minExperienceYears: Number(minExperienceYears) || 2,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map((s) => s.trim()),
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(',').map((s) => s.trim()) : []),
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : (responsibilities ? responsibilities.split('\n').map((s) => s.trim()).filter(Boolean) : []),
      salaryRange: salaryRange || { min: 0, max: 0, currency: 'USD' },
      status: status || 'ACTIVE',
      applicationDeadline,
      createdBy: req.user._id,
    });

    return ApiResponse.created(res, job, 'Job requisition created successfully');
  } catch (error) {
    next(error);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (department) {
      filter.department = department;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, totalRecords] = await Promise.all([
      Job.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(filter),
    ]);

    // Attach application counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ jobId: job._id });
        return {
          ...job.toObject(),
          totalApplications: count,
        };
      })
    );

    return ApiResponse.success(
      res,
      jobsWithCounts,
      'Jobs retrieved successfully',
      200,
      {
        page: Number(page),
        limit: Number(limit),
        totalRecords,
        totalPages: Math.ceil(totalRecords / Number(limit)),
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate('createdBy', 'name email');

    if (!job) {
      throw ApiError.notFound('Job requisition not found.');
    }

    const applicationCount = await Application.countDocuments({ jobId: job._id });

    return ApiResponse.success(
      res,
      { ...job.toObject(), totalApplications: applicationCount },
      'Job retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      throw ApiError.notFound('Job requisition not found.');
    }

    return ApiResponse.success(res, job, 'Job updated successfully');
  } catch (error) {
    next(error);
  }
};

export const toggleJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'].includes(status)) {
      throw ApiError.badRequest('Invalid job status provided.');
    }

    const job = await Job.findByIdAndUpdate(id, { status }, { new: true });
    if (!job) {
      throw ApiError.notFound('Job requisition not found.');
    }

    return ApiResponse.success(res, job, `Job status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      throw ApiError.notFound('Job requisition not found.');
    }

    // Cascade delete associated applications
    await Application.deleteMany({ jobId: id });

    return ApiResponse.success(res, null, 'Job requisition deleted successfully');
  } catch (error) {
    next(error);
  }
};
