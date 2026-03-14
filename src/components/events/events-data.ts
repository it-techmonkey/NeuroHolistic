import type { EventItem } from "./types";

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "1",
    title: "Introduction to the NeuroHolistic Method™",
    description:
      "A half-day workshop exploring the foundations of nervous system regulation and the five-phase architecture. Ideal for those new to the method or considering a deeper journey.",
    date: "April 15, 2025",
    time: "9:00 AM – 1:00 PM",
    location: "NeuroHolistic Institute, Dubai",
    type: "Workshop",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    capacity: 24,
    slug: "intro-neuroholistic-workshop",
  },
  {
    id: "2",
    title: "Spring Retreat: Restore & Integrate",
    description:
      "A three-day retreat combining guided sessions, nature-based practices, and group integration. Designed to support release and developmental repatterning in a held container.",
    date: "May 22–24, 2025",
    time: "Full retreat",
    location: "Mountain Resort, Oman",
    type: "Retreat",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    capacity: 16,
    slug: "spring-retreat-2025",
  },
  {
    id: "3",
    title: "Online Session: Nervous System Basics",
    description:
      "Live online session covering the science of the autonomic nervous system and practical tools for daily regulation. Open to all; no prior experience required.",
    date: "June 8, 2025",
    time: "6:00 PM – 8:00 PM (GST)",
    location: "Online",
    type: "Online Session",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
    slug: "online-nervous-system-basics",
  },
];
