import { Interview } from '../models/Interview.js';
import { sendInterviewInviteEmail } from '../services/emailService.js';

/**
 * Checks for interviews starting in ~24h and ~1h to dispatch reminder emails
 */
export const checkInterviewReminders = async () => {
  try {
    const now = new Date();
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);

    // 24 Hour Reminder Candidates
    const interviews24h = await Interview.find({
      status: 'SCHEDULED',
      reminderSent24h: false,
      scheduledStartTime: { $gte: in23h, $lte: in25h },
    })
      .populate('candidateId', 'fullName email')
      .populate('jobId', 'title');

    for (const interview of interviews24h) {
      if (interview.candidateId && interview.candidateId.email) {
        await sendInterviewInviteEmail({
          candidateName: interview.candidateId.fullName,
          candidateEmail: interview.candidateId.email,
          jobTitle: interview.jobId?.title || 'Open Position',
          roundType: `[REMINDER - 24H] ${interview.roundType}`,
          startTime: interview.scheduledStartTime,
          meetingLink: interview.meetingLink,
        });

        interview.reminderSent24h = true;
        await interview.save();
      }
    }

    if (interviews24h.length > 0) {
      console.log(`[Cron] Dispatched ${interviews24h.length} 24-hour interview reminder(s).`);
    }
  } catch (error) {
    console.error('[Cron Error] Failed in checkInterviewReminders:', error.message);
  }
};
