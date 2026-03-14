import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // In development without a real key, skip verification
  if (!secret) return true;
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  });
  const data = await res.json() as { success: boolean };
  return data.success;
}

type ResponseData = { success: true } | { error: string };

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Simple in-memory rate limiter — max 3 submissions per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.socket.remoteAddress ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many submissions. Please wait a few minutes and try again.' });
  }

  const { name, email, subject, message, _trap, turnstileToken } = req.body;

  // Honeypot — bots fill hidden fields, real users don't
  if (_trap) {
    return res.status(200).json({ success: true });
  }

  // Turnstile verification
  if (!turnstileToken || !(await verifyTurnstile(turnstileToken))) {
    return res.status(400).json({ error: 'Human verification failed. Please try again.' });
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
      from: 'DECUR Contact Form <noreply@decur.org>',
      to: ['decur-dave@proton.me'],
      replyTo: email,
      subject: subject?.trim()
        ? `[DECUR] ${subject.trim()}`
        : `[DECUR] Message from ${name.trim()}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || '(none)'}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject || '(none)')}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form send error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}
