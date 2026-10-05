import * as jobService from '../services/job.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Create a new job requisition
 * @route POST /api/v1/jobs
 */
export const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.body, req.user._id);
    return ApiResponse.created(res, job, 'Job requisition created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated list of job requisitions with filters and search
 * @route GET /api/v1/jobs
 */
export const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      status,
      department,
      location,
      employmentType,
      page,
      limit,
      sort,
    } = req.query;

    const { jobs, pagination } = await jobService.getJobs({
      search,
      status,
      department,
      location,
      employmentType,
      page,
      limit,
      sort,
    });

    return ApiResponse.success(res, jobs, 'Job requisitions retrieved successfully', 200, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single job requisition by ID
 * @route GET /api/v1/jobs/:id
 */
export const getJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    return ApiResponse.success(res, job, 'Job requisition retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update a job requisition by ID
 * @route PUT /api/v1/jobs/:id
 */
export const updateJob = async (req, res, next) => {
  try {
    const job = await jobService.updateJob(req.params.id, req.body);
    return ApiResponse.success(res, job, 'Job requisition updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a job requisition by ID
 * @route DELETE /api/v1/jobs/:id
 */
export const deleteJob = async (req, res, next) => {
  try {
    const result = await jobService.deleteJob(req.params.id);
    return ApiResponse.success(res, result, 'Job requisition deleted successfully');
  } catch (error) {
    next(error);
  }
};
