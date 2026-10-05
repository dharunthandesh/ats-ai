import nodemailer from 'nodemailer';

let transporter = null;

export const initMailer = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`[Mailer] Initialized SMTP Transporter (${process.env.SMTP_HOST})`);
  } else {
    // Development fallback mock transporter
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(`\n================= [SIMULATED EMAIL NOTIFICATION] =================`);
        console.log(`To:      ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Text:    ${mailOptions.text || '(HTML Content)'}`);
        console.log(`===================================================================\n`);
        return { messageId: `mock-${Date.now()}` };
      },
    };
    console.log(`[Mailer] Running in Mock/Simulated Mode (Console logging for invitations & alerts)`);
  }
  return transporter;
};

export const getMailer = () => transporter;
