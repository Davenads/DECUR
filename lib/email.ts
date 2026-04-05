/**
 * lib/email.ts
 *
 * Unified email sender:
 * - Development: routes through Mailpit's SMTP server (localhost:54325)
 *   so all emails are visible in the Mailpit UI at http://localhost:54324
 * - Production: sends via Resend
 *
 * Usage:
 *   import { sendEmail } from '../lib/email';
 *   await sendEmail({ to: 'user@example.com', subject: '...', text: '...', html: '...' });
 */

import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}

const FROM_DEFAULT = 'DECUR <noreply@decur.org>';

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { to, subject, text, html, from = FROM_DEFAULT } = payload;

  if (process.env.NODE_ENV === 'development') {
    // Route through Mailpit SMTP so emails show up in the local test inbox.
    // Mailpit listens on port 54325 when smtp_port is enabled in supabase/config.toml.
    const transporter = nodemailer.createTransport({
      host: '127.0.0.1',
      port: 54325,
      secure: false,
      ignoreTLS: true,
    });

    await transporter.sendMail({ from, to, subject, text, html });
    return;
  }

  // Production: use Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from, to: [to], subject, text, html });
  if (error) throw new Error(error.message);
}
