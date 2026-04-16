export type EventType = string;

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  type: EventType;
  image: string;
  capacity?: number;
  slug?: string;
}
