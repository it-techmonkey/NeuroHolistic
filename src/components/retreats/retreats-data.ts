import type { FeaturedRetreatData, RetreatItem } from "./types";

export const FEATURED_RETREAT: FeaturedRetreatData = {
  id: "featured-1",
  title: "Meet and Greet",
  description:
    "A welcoming gathering to connect with the NeuroHolistic community and explore what the retreat experience offers. This introductory session sets the tone for deeper immersion—whether you are new to the method or returning to continue your journey.",
  date: "12 August 2026, 4 PM GST",
  time: "4 PM GST",
  location: "Cafe Shoppe, Oxford, United Kingdom",
  capacity: 20,
  duration: "2 hours",
  image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  tags: ["Networking", "Collaboration", "Project Management", "User Experience"],
  slug: "meet-and-greet-oxford-2026",
};

export const UPCOMING_RETREATS: RetreatItem[] = [
  {
    id: "1",
    title: "Spring Restoration Retreat",
    description:
      "A three-day immersive retreat combining guided NeuroHolistic sessions with nature-based practices. Step away from daily life and engage deeply in the transformational process.",
    date: "May 22–24, 2025",
    location: "Mountain Resort, Oman",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
    slug: "spring-restoration-2025",
  },
  {
    id: "2",
    title: "Summer Integration Gathering",
    description:
      "Connect with fellow practitioners in a held container for integration, reflection, and continued growth through the NeuroHolistic Method™.",
    date: "July 10–12, 2025",
    location: "Coastal Retreat Center, UAE",
    image: "https://images.unsplash.com/photo-1470240731273-7821a6e5206f?w=600&q=80",
    slug: "summer-integration-2025",
  },
  {
    id: "3",
    title: "Autumn Deep Dive",
    description:
      "An extended retreat for those ready to go deeper—featuring extended sessions, group circles, and individual reflection time in nature.",
    date: "October 5–9, 2025",
    location: "Forest Lodge, UK",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    slug: "autumn-deep-dive-2025",
  },
];
