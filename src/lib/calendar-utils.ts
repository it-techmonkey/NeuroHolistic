/**
 * Generate Google Calendar event URL for adding events
 * This creates a URL that opens Google Calendar with pre-filled event details
 */
export function generateGoogleCalendarUrl({
  title,
  description,
  startDate,
  endDate,
  location,
}: {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: description,
  });

  if (location) {
    params.set('location', location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate ICS file content for downloading calendar event
 */
export function generateICSFile({
  title,
  description,
  startDate,
  endDate,
  location,
}: {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}): string {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d+/g, '').split('Z')[0] + 'Z';
  };

  const uid = `${Date.now()}@neuroholistic.com`;
  const now = formatDate(new Date());

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NeuroHolistic//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
${location ? `LOCATION:${location}` : ''}
END:VEVENT
END:VCALENDAR`;
}

/**
 * Download ICS file for calendar event
 */
export function downloadICSFile({
  title,
  description,
  startDate,
  endDate,
  location,
  filename,
}: {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  filename?: string;
}): void {
  const content = generateICSFile({ title, description, startDate, endDate, location });
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
