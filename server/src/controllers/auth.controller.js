import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../constants/roles.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, title } = req.body;

    if (!name || !email || !password) {
      throw ApiError.badRequest('Name, email, and password are required.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    // Security: Prevent unauthenticated privilege escalation.
    // Public registration always defaults to RECRUITER role.
    // Privileged role assignment is only permitted when requested by an authenticated HR_ADMIN.
    let assignedRole = ROLES.RECRUITER;
    if (req.user && req.user.role === ROLES.HR_ADMIN && role && Object.values(ROLES).includes(role)) {
      assignedRole = role;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || 'Engineering',
      title: title || 'Talent Specialist',
    });

    const token = user.generateAuthToken();

    return ApiResponse.created(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          title: user.title,
        },
      },
      'User registered successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest('Please provide both email and password.');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account is deactivated. Please contact an administrator.');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = user.generateAuthToken();

    return ApiResponse.success(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          title: user.title,
        },
      },
      'Signed in successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return ApiResponse.success(res, req.user, 'Current user profile');
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return ApiResponse.success(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive, department, title } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (department) user.department = department;
    if (title) user.title = title;

    await user.save();

    return ApiResponse.success(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    return ApiResponse.success(res, null, 'User logged out successfully');
  } catch (error) {
    next(error);
  }
};


