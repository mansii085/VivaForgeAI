import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import config from '../config/env.js';

let resendClient: Resend | null = null;
let transporter: nodemailer.Transporter | null = null;

if (config.emailService === 'smtp' && config.emailUser && config.emailPass) {
  transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: config.emailPort === 465, // true for 465, false for other ports
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });
  console.log('✅ Email service (Nodemailer SMTP) initialized');
} else if (config.emailApiKey) {
  resendClient = new Resend(config.emailApiKey);
  console.log('✅ Email service (Resend) initialized');
} else {
  console.log('⚠️  No EMAIL_SERVICE fully configured — emails will be logged to the console instead of sent');
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email via Resend. If no API key is configured (local dev),
 * falls back to logging the email to the console instead of throwing.
 */
export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<void> => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: config.emailFrom,
        to,
        subject,
        html,
      });
      return;
    } catch (error) {
      console.error('❌ Nodemailer failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  if (resendClient) {
    const { error } = await resendClient.emails.send({
      from: config.emailFrom,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend failed to send email:', error);
      throw new Error('Failed to send email');
    }
    return;
  }

  // Fallback dev mock
  console.log('📧 [DEV EMAIL — not actually sent]');
  console.log(`   To:      ${to}`);
  console.log(`   Subject: ${subject}`);
};

/**
 * Sends the "forgot password" email containing the reset link.
 */
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetUrl: string
): Promise<void> => {
  const html = `
  <!doctype html>
  <html>
    <body style="margin:0;padding:0;background-color:#0b0d12;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0d12;padding:32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#151822;border-radius:12px;padding:32px;">
              <tr>
                <td style="color:#ffffff;font-size:20px;font-weight:bold;padding-bottom:16px;">
                  VivaForge AI
                </td>
              </tr>
              <tr>
                <td style="color:#c9ccd6;font-size:15px;line-height:22px;padding-bottom:16px;">
                  Hi ${name || 'there'},<br /><br />
                  We received a request to reset the password for your VivaForge AI account.
                  Click the button below to choose a new password. This link expires in
                  <strong>30 minutes</strong>.
                </td>
              </tr>
              <tr>
                <td align="center" style="padding:16px 0;">
                  <a
                    href="${resetUrl}"
                    style="background-color:#7c5cff;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:bold;display:inline-block;"
                  >
                    Reset Password
                  </a>
                </td>
              </tr>
              <tr>
                <td style="color:#8a8f9c;font-size:13px;line-height:20px;padding-top:16px;">
                  If you didn't request this, you can safely ignore this email — your password
                  will remain unchanged. If the button above doesn't work, copy and paste this
                  link into your browser:<br />
                  <a href="${resetUrl}" style="color:#7c5cff;word-break:break-all;">${resetUrl}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  await sendEmail({
    to,
    subject: 'Reset Your VivaForge AI Password',
    html,
  });
};
