import { ApiError } from '../utils/apiError.js';
import { JOB_STATUSES, EMPLOYMENT_TYPES } from '../models/Job.js';

/**
 * Validates job creation payload (all core fields required)
 */
export const validateCreateJob = (req, res, next) => {
  const {
    title,
    description,
    department,
    location,
    employmentType,
    requiredSkills,
    preferredSkills,
    minimumExperience,
    maximumExperience,
    status,
  } = req.body;

  const errors = [];

  // Title validation
  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    errors.push({ field: 'title', message: 'Job title is required and must be at least 2 characters long' });
  } else if (title.trim().length > 150) {
    errors.push({ field: 'title', message: 'Job title cannot exceed 150 characters' });
  }

  // Description validation
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.push({ field: 'description', message: 'Job description is required and must be at least 10 characters long' });
  }

  // Department validation
  if (!department || typeof department !== 'string' || department.trim().length < 2) {
    errors.push({ field: 'department', message: 'Department is required' });
  }

  // Employment Type validation
  if (employmentType) {
    const validTypes = Object.values(EMPLOYMENT_TYPES);
    if (!validTypes.includes(employmentType)) {
      errors.push({
        field: 'employmentType',
        message: `Employment type must be one of: ${validTypes.join(', ')}`,
      });
    }
  }

  // Required Skills validation
  let normalizedRequired = requiredSkills;
  if (typeof requiredSkills === 'string') {
    normalizedRequired = requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
    req.body.requiredSkills = normalizedRequired;
  }

  if (!normalizedRequired || !Array.isArray(normalizedRequired) || normalizedRequired.length === 0) {
    errors.push({ field: 'requiredSkills', message: 'At least one required skill must be specified' });
  }

  // Preferred Skills normalization
  if (typeof preferredSkills === 'string') {
    req.body.preferredSkills = preferredSkills.split(',').map((s) => s.trim()).filter(Boolean);
  }

  // Minimum Experience validation
  if (minimumExperience === undefined || minimumExperience === null || isNaN(Number(minimumExperience))) {
    errors.push({ field: 'minimumExperience', message: 'Minimum experience (in years) is required' });
  } else if (Number(minimumExperience) < 0) {
    errors.push({ field: 'minimumExperience', message: 'Minimum experience cannot be negative' });
  }

  // Maximum Experience validation
  if (maximumExperience !== undefined && maximumExperience !== null && maximumExperience !== '') {
    if (isNaN(Number(maximumExperience))) {
      errors.push({ field: 'maximumExperience', message: 'Maximum experience must be a number' });
    } else if (Number(maximumExperience) < Number(minimumExperience || 0)) {
      errors.push({
        field: 'maximumExperience',
        message: 'Maximum experience must be greater than or equal to minimum experience',
      });
    }
  }

  // Status validation
  if (status) {
    const validStatuses = Object.values(JOB_STATUSES);
    if (!validStatuses.includes(status)) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Validation failed for job requisition creation', errors));
  }

  next();
};

/**
 * Validates job update payload (validates fields if provided)
 */
export const validateUpdateJob = (req, res, next) => {
  const {
    title,
    description,
    department,
    employmentType,
    requiredSkills,
    preferredSkills,
    minimumExperience,
    maximumExperience,
    status,
  } = req.body;

  const errors = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 2) {
      errors.push({ field: 'title', message: 'Job title must be at least 2 characters long' });
    } else if (title.trim().length > 150) {
      errors.push({ field: 'title', message: 'Job title cannot exceed 150 characters' });
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 10) {
      errors.push({ field: 'description', message: 'Job description must be at least 10 characters long' });
    }
  }

  if (department !== undefined) {
    if (typeof department !== 'string' || department.trim().length < 2) {
      errors.push({ field: 'department', message: 'Department must be at least 2 characters long' });
    }
  }

  if (employmentType !== undefined) {
    const validTypes = Object.values(EMPLOYMENT_TYPES);
    if (!validTypes.includes(employmentType)) {
      errors.push({
        field: 'employmentType',
        message: `Employment type must be one of: ${validTypes.join(', ')}`,
      });
    }
  }

  if (requiredSkills !== undefined) {
    let normalized = requiredSkills;
    if (typeof requiredSkills === 'string') {
      normalized = requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
      req.body.requiredSkills = normalized;
    }
    if (!Array.isArray(normalized) || normalized.length === 0) {
      errors.push({ field: 'requiredSkills', message: 'At least one required skill must be specified' });
    }
  }

  if (typeof preferredSkills === 'string') {
    req.body.preferredSkills = preferredSkills.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (minimumExperience !== undefined && minimumExperience !== null) {
    if (isNaN(Number(minimumExperience)) || Number(minimumExperience) < 0) {
      errors.push({ field: 'minimumExperience', message: 'Minimum experience must be a non-negative number' });
    }
  }

  if (maximumExperience !== undefined && maximumExperience !== null && maximumExperience !== '') {
    if (isNaN(Number(maximumExperience))) {
      errors.push({ field: 'maximumExperience', message: 'Maximum experience must be a number' });
    } else if (
      minimumExperience !== undefined &&
      Number(maximumExperience) < Number(minimumExperience)
    ) {
      errors.push({
        field: 'maximumExperience',
        message: 'Maximum experience must be greater than or equal to minimum experience',
      });
    }
  }

  if (status !== undefined) {
    const validStatuses = Object.values(JOB_STATUSES);
    if (!validStatuses.includes(status)) {
      errors.push({
        field: 'status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Validation failed for job requisition update', errors));
  }

  next();
};
