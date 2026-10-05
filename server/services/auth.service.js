import jwt from 'jsonwebtoken';
import { User, USER_ROLES } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Generates signed JWT authentication token
 * @param {object} user - User document
 * @param {string} [expiresIn] - Custom token expiration
 * @returns {string} Signed JWT
 */
export const generateToken = (user, expiresIn = env.JWT_EXPIRES_IN) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Verifies JWT token and decodes payload
 * @param {string} token
 * @returns {object} Decoded JWT payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Registers a new user account
 * @param {object} userData
 * @returns {Promise<{ user: object, token: string }>}
 */
export const registerUser = async ({ name, email, password, role }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists.');
  }

  const assignedRole = role || USER_ROLES.RECRUITER;

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: assignedRole,
    isActive: true,
  });

  const token = generateToken(newUser);

  const safeUser = {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    isActive: newUser.isActive,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };

  return { user: safeUser, token };
};

/**
 * Authenticates user credentials and issues token
 * @param {object} credentials
 * @returns {Promise<{ user: object, token: string }>}
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Find user and explicitly select password which is excluded by default
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password credentials.');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact an administrator.');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password credentials.');
  }

  const token = generateToken(user);

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { user: safeUser, token };
};

/**
 * Fetches user profile by ID without password
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw ApiError.notFound('User profile not found.');
  }
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
