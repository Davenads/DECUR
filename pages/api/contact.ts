import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type ResponseData = { success: true } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message, _trap } = req.body;

  // Honeypot — bots fill hidden fields, real users don't
  if (_trap) {
    return res.status(200).json({ success: true });
  }

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (message.trim().length < 10) {
    return res.status(400).json({ error: 'Message is too short.' });
  }

  try {
    await resend.emails.send({
      // Use onboarding@resend.dev until decur.org is verified in Resend dashboard
      // After domain verification: update to 'DECUR <noreply@decur.org>'
      from: 'DECUR Contact Form <onboarding@resend.dev>',
      to: ['decur-dave@proton.me'],
      replyTo: email,
      subject: subject?.trim()
        ? `[DECUR] ${subject.trim()}`
        : `[DECUR] Message from ${name.trim()}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || '(none)'}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || '(none)'}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
        <p style="white-space:pre-wrap">${message}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form send error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}
