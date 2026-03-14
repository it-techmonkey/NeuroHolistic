export type EventType = "Workshop" | "Retreat" | "Online Session";

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
