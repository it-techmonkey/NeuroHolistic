import type { EventItem, EventJourneyRow } from '@/components/events/types';
import { personalEventEmailLayout, fawziaSignatureHtml } from './event-emails';

/**
 * The exact onboarding email sequence provided by the client for
 * NeuroHolistic Consciousness Quantum Leap™:
 *
 *   Email 1 — sent immediately on registration
 *   Email 2 — sent a fixed calendar date before the first live session
 *   Email 3 — sent the day before
 *   Email 4 — sent one hour before
 *
 * These are deliberately literal renderers of client-approved copy, not a
 * generic templating system — if another event needs a similar sequence
 * later, copy this file rather than trying to parameterize this one further.
 */

type Locale = 'en' | 'ar';

const T = {
  en: {
    dear: (name: string) => `Dear ${name},`,
    stage: 'Stage',
    location: 'Location',
    date: 'Date',
    time: 'Time',
  },
  ar: {
    dear: (name: string) => `عزيزي/عزيزتي ${name}،`,
    stage: 'المرحلة',
    location: 'المكان',
    date: 'التاريخ',
    time: 'الوقت',
  },
} as const;

function journeyTableHtml(rows: EventJourneyRow[], locale: Locale): string {
  const l = T[locale];
  const cell = 'padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;';
  const head = 'padding:10px 12px;border-bottom:2px solid #e2e8f0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.03em;text-align:left;';

  const body = rows
    .map(
      (r) => `<tr>
  <td style="${cell}font-weight:600;color:#0f172a;">${r.stage[locale]}</td>
  <td style="${cell}">${r.location[locale]}</td>
  <td style="${cell}">${r.date[locale]}</td>
  <td style="${cell}">${r.time[locale]}</td>
</tr>`
    )
    .join('');

  return `<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  <thead><tr>
    <th style="${head}">${l.stage}</th>
    <th style="${head}">${l.location}</th>
    <th style="${head}">${l.date}</th>
    <th style="${head}">${l.time}</th>
  </tr></thead>
  <tbody>${body}</tbody>
</table>`;
}

function sessionAccessBlock(label: string, meetLink: string | null): string {
  if (!meetLink) {
    return `<p style="margin:16px 0;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;color:#92400e;font-size:14px;">
      Your joining link is being prepared and will be sent to you shortly, well ahead of the session.
    </p>`;
  }
  return `<div style="margin:20px 0;padding:18px 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
    <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.06em;color:#64748b;text-transform:uppercase;">${label}</p>
    <a href="${meetLink}" style="display:inline-block;padding:12px 28px;background:#2B2F55;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">Join the Live Session</a>
    <p style="margin:10px 0 0;color:#94a3b8;font-size:12px;">${meetLink}</p>
  </div>`;
}

function firstName(fullName: string): string {
  return fullName.trim().split(' ')[0] || 'there';
}

export interface QuantumLeapEmailInput {
  event: EventItem;
  registrantName: string;
  locale: Locale;
  /** The Meet link for the very first live session (Part I, Session 1), if provisioned yet. */
  firstSessionMeetLink: string | null;
}

// ---------------------------------------------------------------------------
// Email 1 — Registration confirmed
// ---------------------------------------------------------------------------
export function registrationConfirmedEmail(input: QuantumLeapEmailInput): { subject: string; html: string } {
  const { event, registrantName, locale, firstSessionMeetLink } = input;
  const title = event.locales[locale].title;
  const l = T[locale];

  const body = `
    <p style="margin:0 0 4px;color:#334155;">${l.dear(firstName(registrantName))}</p>
    <p style="margin:16px 0 4px;color:#334155;">Welcome to the ${title}.</p>
    <p style="margin:0 0 20px;color:#334155;">Your registration is confirmed, and your place is officially reserved.</p>

    ${event.journeyTable ? journeyTableHtml(event.journeyTable, locale) : ''}

    <h3 style="margin:24px 0 8px;color:#0F172A;font-size:16px;">Your Journey</h3>
    <p style="margin:0 0 12px;color:#334155;"><strong>Location:</strong> Live Online</p>
    <p style="margin:0 0 12px;color:#334155;">Your private participant community details, and preparation guidance will be shared with you on October 4th, 2026.</p>
    <p style="margin:0 0 12px;color:#334155;">For now, simply reserve the dates and allow yourself to arrive with openness and curiosity.</p>
    <p style="margin:0 0 4px;color:#334155;">We are looking forward to welcoming you into this experience.</p>

    ${sessionAccessBlock('Session Access', firstSessionMeetLink)}

    ${fawziaSignatureHtml()}
  `;

  return {
    subject: `Your Registration Is Confirmed | ${title}`,
    html: personalEventEmailLayout(body),
  };
}

// ---------------------------------------------------------------------------
// Email 2 — One week before (fixed calendar date: Oct 4)
// ---------------------------------------------------------------------------
export function weekBeforeEmail(input: QuantumLeapEmailInput): { subject: string; html: string } {
  const { event, registrantName, locale, firstSessionMeetLink } = input;
  const title = event.locales[locale].title;
  const l = T[locale];

  const communityBlock = event.communityLink
    ? `<p style="margin:0 0 8px;color:#334155;">Join the private community here:</p>
       <p style="margin:0 0 16px;"><a href="${event.communityLink}" style="color:#4F46E5;font-weight:600;">${event.communityLink}</a></p>
       <p style="margin:0 0 16px;color:#334155;">Please, join before October 9.</p>`
    : `<p style="margin:0 0 16px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;">
         Your private community invite is on its way — you'll receive it separately before October 9.
       </p>`;

  const body = `
    <p style="margin:0 0 4px;color:#334155;">${l.dear(firstName(registrantName))}</p>
    <p style="margin:16px 0 4px;color:#334155;">Your ${title} journey begins in one week.</p>
    <p style="margin:0 0 4px;color:#334155;">On October 9, we begin with the first stage, Liberation, followed by Guided Integration, Elevation, and finally Integration &amp; Embodiment.</p>
    <p style="margin:0 0 20px;color:#334155;">This email contains everything you need to prepare.</p>

    <h3 style="margin:24px 0 8px;color:#0F172A;font-size:16px;">Your First Live Sessions</h3>
    <p style="margin:0 0 4px;color:#334155;"><strong>Part I, Liberation</strong></p>
    <p style="margin:0 0 4px;color:#334155;">October 9 &amp; 10, 2026</p>
    <p style="margin:0 0 4px;color:#334155;">6:00 PM to 10:00 PM, UAE time</p>
    <p style="margin:0 0 16px;color:#334155;">Live Online</p>

    ${sessionAccessBlock('Session Access', firstSessionMeetLink)}

    <p style="margin:16px 0;color:#334155;">Please keep this link accessible. You will also receive a reminder the day before each live session and again one hour before we begin.</p>

    <h3 style="margin:24px 0 8px;color:#0F172A;font-size:16px;">Your Private Participant Community</h3>
    <p style="margin:0 0 12px;color:#334155;">Your private participant community will accompany you throughout the journey, particularly during the Guided Integration period from October 11 to 22.</p>
    <p style="margin:0 0 12px;color:#334155;">This is where you will receive your daily awareness prompts, NeuroHolistic practices, guidance, and important journey updates.</p>
    ${communityBlock}

    <h3 style="margin:24px 0 8px;color:#0F172A;font-size:16px;">How to Prepare</h3>
    <p style="margin:0 0 12px;color:#334155;">There is nothing you need to study or achieve before we begin.</p>
    <p style="margin:0 0 12px;color:#334155;">Come with openness, curiosity, and a willingness to observe yourself honestly.</p>
    <p style="margin:0 0 8px;color:#334155;">For the live sessions, please:</p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#334155;">
      <li style="margin-bottom:6px;">Choose a quiet and private space where you can remain comfortable and uninterrupted.</li>
      <li style="margin-bottom:6px;">Have a notebook and pen nearby.</li>
      <li style="margin-bottom:6px;">Keep water with you.</li>
      <li style="margin-bottom:6px;">Join approximately 10 minutes before the session begins.</li>
      <li style="margin-bottom:6px;">Give yourself the full four hours without other commitments or distractions where possible.</li>
    </ul>

    <h3 style="margin:24px 0 8px;color:#0F172A;font-size:16px;">During the Journey</h3>
    <p style="margin:0 0 12px;color:#334155;">Between the two intensive parts, you will enter the Guided Integration Journey, from October 11 to 22.</p>
    <p style="margin:0 0 12px;color:#334155;">This requires approximately 15 minutes a day for simple awareness and NeuroHolistic integration practices designed to become part of your everyday life.</p>
    <p style="margin:0 0 16px;color:#334155;">Your practices and prompts will be shared through the private participant community.</p>

    <h3 style="margin:24px 0 8px;color:#0F172A;font-size:16px;">Your Complete Journey</h3>
    ${event.journeyTable ? journeyTableHtml(event.journeyTable, locale) : ''}

    <p style="margin:20px 0 4px;color:#334155;">Simply, arrive present. We begin from wherever you are.</p>
    <p style="margin:0 0 4px;color:#334155;">I look forward to sharing this journey with you.</p>

    ${fawziaSignatureHtml()}
  `;

  return {
    subject: `Your Journey Begins In One Week | ${title}`,
    html: personalEventEmailLayout(body),
  };
}

// ---------------------------------------------------------------------------
// Email 3 — Day before (fixed calendar date: Oct 8)
// ---------------------------------------------------------------------------
export function dayBeforeEmail(input: QuantumLeapEmailInput): { subject: string; html: string } {
  const { event, registrantName, locale, firstSessionMeetLink } = input;
  const title = event.locales[locale].title;
  const l = T[locale];

  const body = `
    <p style="margin:0 0 4px;color:#334155;">${l.dear(firstName(registrantName))}</p>
    <p style="margin:16px 0 4px;color:#334155;">Tomorrow, we begin.</p>
    <p style="margin:0 0 16px;color:#334155;">Your ${title} journey begins with Part I, Liberation.</p>

    <p style="margin:0 0 4px;color:#334155;">October 9, 2026</p>
    <p style="margin:0 0 4px;color:#334155;">6:00 PM to 10:00 PM, UAE time</p>
    <p style="margin:0 0 16px;color:#334155;">Live Online</p>

    <p style="margin:0 0 16px;color:#334155;">Please join approximately 10 minutes early, from a quiet and comfortable space where you can be fully present.</p>

    ${sessionAccessBlock('Join the Live Session', firstSessionMeetLink)}

    <p style="margin:20px 0 4px;color:#334155;">Looking forward to having you with us.</p>

    ${fawziaSignatureHtml()}
  `;

  return {
    subject: `Tomorrow, We Begin | ${title}`,
    html: personalEventEmailLayout(body),
  };
}

// ---------------------------------------------------------------------------
// Email 4 — One hour before (fixed calendar timestamp: Oct 9, 17:00 Dubai)
// ---------------------------------------------------------------------------
export function hourBeforeEmail(input: QuantumLeapEmailInput): { subject: string; html: string } {
  const { event, registrantName, locale, firstSessionMeetLink } = input;
  const title = event.locales[locale].title;
  const l = T[locale];

  const body = `
    <p style="margin:0 0 4px;color:#334155;">${l.dear(firstName(registrantName))}</p>
    <p style="margin:16px 0 4px;color:#334155;">We begin in one hour.</p>
    <p style="margin:0 0 16px;color:#334155;">Your ${title} journey begins today with Part I, Liberation.</p>

    <p style="margin:0 0 4px;color:#334155;">Today, October 9</p>
    <p style="margin:0 0 4px;color:#334155;">6:00 PM to 10:00 PM, UAE time</p>
    <p style="margin:0 0 16px;color:#334155;">Live Online</p>

    <p style="margin:0 0 16px;color:#334155;">Please join approximately 10 minutes early, settle into a quiet and comfortable space, and have your notebook and water nearby.</p>

    ${sessionAccessBlock('Join the Live Session', firstSessionMeetLink)}

    <p style="margin:20px 0 4px;color:#334155;">See you very soon.</p>

    ${fawziaSignatureHtml()}
  `;

  return {
    subject: `We Begin In One Hour | ${title}`,
    html: personalEventEmailLayout(body),
  };
}

export function renderScheduledEmail(
  template: 'week_before' | 'day_before' | 'hour_before',
  input: QuantumLeapEmailInput
): { subject: string; html: string } {
  switch (template) {
    case 'week_before':
      return weekBeforeEmail(input);
    case 'day_before':
      return dayBeforeEmail(input);
    case 'hour_before':
      return hourBeforeEmail(input);
  }
}
