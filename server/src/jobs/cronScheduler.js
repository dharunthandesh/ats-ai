import cron from 'node-cron';
import { checkInterviewReminders } from './interviewReminders.cron.js';

/**
 * Initializes background scheduled jobs
 */
export const initCronJobs = () => {
  // Check interview reminders every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Cron] Running scheduled interview reminder checks...');
    await checkInterviewReminders();
  });

  console.log('[Cron] Background schedulers registered (Interview Reminders: */30 * * * *)');
};
