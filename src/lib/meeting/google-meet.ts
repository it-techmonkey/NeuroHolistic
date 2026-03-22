export function generateGoogleMeetLink(): string {
  const staticLink = process.env.GOOGLE_MEET_STATIC_LINK;
  if (staticLink) return staticLink;

  // Fallback for environments where calendar-event conference creation
  // is not yet configured. This still routes users into Google Meet.
  return 'https://meet.google.com/new';
}