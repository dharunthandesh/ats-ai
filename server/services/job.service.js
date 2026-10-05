import { Job } from '../models/Job.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Creates a new job requisition
 * @param {object} jobData
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const createJob = async (jobData, userId) => {
  const job = await Job.create({
    ...jobData,
    createdBy: userId,
  });

  return await Job.findById(job._id).populate('createdBy', 'name email role');
};

/**
 * Retrieves a paginated and filtered list of job requisitions
 * @param {object} queryOptions
 * @returns {Promise<{ jobs: Array, pagination: object }>}
 */
export const getJobs = async ({
  search,
  status,
  department,
  location,
  employmentType,
  page = 1,
  limit = 10,
  sort = '-createdAt',
}) => {
  const query = {};

  // Exact match filters
  if (status) query.status = status;
  if (department) query.department = new RegExp(`^${department.trim()}$`, 'i');
  if (location) query.location = new RegExp(location.trim(), 'i');
  if (employmentType) query.employmentType = employmentType;

  // Search filter across title, description, department, and requiredSkills
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { department: searchRegex },
      { requiredSkills: { $in: [searchRegex] } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [jobs, totalRecords] = await Promise.all([
    Job.find(query)
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Job.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalRecords / limitNum) || 1;

  return {
    jobs,
    pagination: {
      total: totalRecords,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
};

/**
 * Retrieves a single job requisition by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getJobById = async (id) => {
  const job = await Job.findById(id).populate('createdBy', 'name email role');
  if (!job) {
    throw ApiError.notFound(`Job requisition with ID '${id}' not found`);
  }
  return job;
};

/**
 * Updates a job requisition by ID
 * @param {string} id
 * @param {object} updateData
 * @returns {Promise<object>}
 */
export const updateJob = async (id, updateData) => {
  // Prevent updating immutable fields
  const safeUpdates = { ...updateData };
  delete safeUpdates._id;
  delete safeUpdates.createdBy;
  delete safeUpdates.createdAt;

  const job = await Job.findByIdAndUpdate(id, safeUpdates, {
    new: true,
    runValidators: true,
  }).populate('createdBy', 'name email role');

  if (!job) {
    throw ApiError.notFound(`Job requisition with ID '${id}' not found`);
  }

  return job;
};

/**
 * Deletes a job requisition by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteJob = async (id) => {
  const job = await Job.findByIdAndDelete(id);
  if (!job) {
    throw ApiError.notFound(`Job requisition with ID '${id}' not found`);
  }
  return { id: job._id, title: job.title };
};
