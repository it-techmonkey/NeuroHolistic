export const BOOKING_TIME_SLOTS = [
  '09:00',
  '11:00',
  '14:00',
  '16:00',
  '18:00',
] as const;

export function toDisplayTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = Number.parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function isValidSlot(time: string): boolean {
  return BOOKING_TIME_SLOTS.includes(time as (typeof BOOKING_TIME_SLOTS)[number]);
}