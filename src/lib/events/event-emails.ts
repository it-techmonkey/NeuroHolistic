import { Resend } from 'resend';
import { formatSessionTime, type EventMeeting } from './event-meetings';

const BRAND_COLOR = '#2B2F55';
const FROM_ADDRESS =
  process.env.BOOKING_EMAIL_FROM || 'NeuroHolistic Institute <noreply@neuroholisticinstitute.com>';

export function eventEmailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
      <div style="background:${BRAND_COLOR};padding:24px 32px;">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:600;">NeuroHolistic Institute</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 20px;color:${BRAND_COLOR};font-size:18px;">${title}</h2>
        ${body}
      </div>
      <div style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">NeuroHolistic Institute &bull; Dubai, UAE</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/** Schedule block listing every live session and its joining link. */
export function sessionScheduleHtml(meetings: EventMeeting[]): string {
  if (meetings.length === 0) return '';

  const rows = meetings
    .map((m) => {
      const link = m.meet_link
        ? `<a href="${m.meet_link}" style="color:#4F46E5;font-weight:600;">Join on Google Meet</a>`
        : `<span style="color:#94a3b8;">Link will be sent before the session</span>`;
      return `<tr>
  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
    <div style="font-weight:600;color:#0f172a;font-size:14px;">${m.title}</div>
    <div style="color:#64748b;font-size:13px;margin-top:4px;">${formatSessionTime(m.starts_at, m.ends_at)}</div>
    <div style="margin-top:6px;font-size:13px;">${link}</div>
  </td>
</tr>`;
    })
    .join('');

  return `<table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:16px 0;">${rows}</table>`;
}

/** Single prominent join button for a specific session. */
export function joinButtonHtml(meetLink: string): string {
  return `<div style="text-align:center;margin:24px 0;">
  <a href="${meetLink}" style="display:inline-block;padding:14px 32px;background:${BRAND_COLOR};color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Join on Google Meet</a>
</div>
<p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">Or paste this link into your browser: ${meetLink}</p>`;
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
}

/** Send one email; returns false rather than throwing so callers can continue. */
export async function sendEventEmail({ to, subject, html }: SendArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[EventEmail] RESEND_API_KEY not set, skipping email to', to);
    return false;
  }

  try {
    await new Resend(apiKey).emails.send({ from: FROM_ADDRESS, to, subject, html });
    return true;
  } catch (error) {
    console.error('[EventEmail] Send failed:', error);
    return false;
  }
}
