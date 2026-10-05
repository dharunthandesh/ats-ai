import { getMailer } from '../config/mailer.js';

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = getMailer();
    if (!transporter) {
      console.warn('[EmailService] Transporter not ready, skipping email dispatch.');
      return;
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"TalentPulse ATS" <no-reply@talentpulse.ai>',
      to,
      subject,
      text,
      html,
    });

    console.log(`[EmailService] Dispatched email '${subject}' to <${to}> [ID: ${info.messageId}]`);
    return info;
  } catch (error) {
    console.error(`[EmailService Error] Failed to send email to <${to}>:`, error.message);
  }
};

/**
 * Dispatch Interview Invitation to Candidate
 */
export const sendInterviewInviteEmail = async ({ candidateName, candidateEmail, jobTitle, roundType, startTime, meetingLink }) => {
  const formattedDate = new Date(startTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `Interview Invitation: ${roundType} Round for ${jobTitle} at TalentPulse`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5; margin-top: 0;">TalentPulse Recruitment</h2>
      <p>Dear <strong>${candidateName}</strong>,</p>
      <p>We are impressed by your qualifications and would like to invite you for the <strong>${roundType} Round</strong> for the <strong>${jobTitle}</strong> position.</p>
      
      <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
        <p style="margin: 0 0 8px 0;"><strong>Round:</strong> ${roundType}</p>
        <p style="margin: 0;"><strong>Meeting Link:</strong> <a href="${meetingLink || '#'}" style="color: #4f46e5; font-weight: bold;">${meetingLink || 'Link provided in calendar invite'}</a></p>
      </div>

      <p>Please test your audio and video setup in advance. If you need to reschedule, please let our recruitment team know as soon as possible.</p>
      <br/>
      <p style="color: #64748b; font-size: 13px;">Best regards,<br/>The Talent Acquisition Team</p>
    </div>
  `;

  return sendEmail({ to: candidateEmail, subject, html, text: `Interview scheduled on ${formattedDate}. Link: ${meetingLink}` });
};

/**
 * Dispatch Offer Notification to Candidate
 */
export const sendOfferLetterEmail = async ({ candidateName, candidateEmail, jobTitle, salaryAmount, currency, startDate }) => {
  const subject = `Official Job Offer: ${jobTitle} at TalentPulse`;
  const formattedStart = startDate ? new Date(startDate).toLocaleDateString() : 'To be confirmed';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #10b981; margin-top: 0;">Congratulations!</h2>
      <p>Dear <strong>${candidateName}</strong>,</p>
      <p>We are thrilled to offer you the position of <strong>${jobTitle}</strong>!</p>
      
      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0;"><strong>Position:</strong> ${jobTitle}</p>
        <p style="margin: 0 0 8px 0;"><strong>Compensation:</strong> ${currency} ${Number(salaryAmount).toLocaleString()} / year</p>
        <p style="margin: 0;"><strong>Proposed Start Date:</strong> ${formattedStart}</p>
      </div>

      <p>Please review your offer details on your candidate portal or reply to this email to confirm your acceptance.</p>
      <br/>
      <p style="color: #64748b; font-size: 13px;">Warm regards,<br/>Talent & People Team</p>
    </div>
  `;

  return sendEmail({ to: candidateEmail, subject, html, text: `Congratulations! We are offering you the role of ${jobTitle}.` });
};

/**
 * Dispatch Status Update / Rejection
 */
export const sendRejectionEmail = async ({ candidateName, candidateEmail, jobTitle }) => {
  const subject = `Update regarding your application for ${jobTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #475569; margin-top: 0;">TalentPulse Careers</h2>
      <p>Dear <strong>${candidateName}</strong>,</p>
      <p>Thank you for taking the time to consider TalentPulse and interviewing with our team for the <strong>${jobTitle}</strong> role.</p>
      <p>While your background is commendable, we have decided to move forward with other candidates whose experience more closely matches our immediate operational requirements.</p>
      <p>We will keep your profile in our candidate pool for future openings that match your skill set.</p>
      <br/>
      <p style="color: #64748b; font-size: 13px;">Sincerely,<br/>The Talent Acquisition Team</p>
    </div>
  `;

  return sendEmail({ to: candidateEmail, subject, html, text: `Thank you for interviewing for ${jobTitle}.` });
};
