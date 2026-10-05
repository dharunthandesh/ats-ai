import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User, USER_ROLES } from '../models/User.js';

/**
 * Seed script creating:
 * - One Admin
 * - One Recruiter
 * - One Interviewer
 */
export const seedAuthUsers = async () => {
  console.log('\n--- Seeding RBAC Users ---');
  await connectDB();

  const testUsers = [
    {
      name: 'System Administrator',
      email: 'admin@talentpulse.ai',
      password: 'Password123!',
      role: USER_ROLES.ADMIN,
      isActive: true,
    },
    {
      name: 'Senior Recruiter',
      email: 'recruiter@talentpulse.ai',
      password: 'Password123!',
      role: USER_ROLES.RECRUITER,
      isActive: true,
    },
    {
      name: 'Lead Technical Interviewer',
      email: 'interviewer@talentpulse.ai',
      password: 'Password123!',
      role: USER_ROLES.INTERVIEWER,
      isActive: true,
    },
  ];

  for (const userData of testUsers) {
    // Remove if already exists so it gets cleanly re-hashed
    await User.deleteOne({ email: userData.email });
    const user = await User.create(userData);
    console.log(`[Created] ${user.role.padEnd(12)} -> ${user.email} (ID: ${user._id})`);
  }

  console.log('--- Seeding Completed Successfully ---\n');
  await disconnectDB();
};

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('seedAuth.js')) {
  seedAuthUsers().catch(async (err) => {
    console.error('Seeding error:', err);
    await disconnectDB();
    process.exit(1);
  });
}
