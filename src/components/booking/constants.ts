/**
 * Booking Constants & Mock Data
 * Follows the same pattern as events-data.ts and retreats-data.ts
 * Therapist list is based on available practitioners from TEAM_PROFILES
 */

import type { Therapist, TimeSlot } from "./types";

/**
 * Available therapists for booking
 * Derived from TEAM_PROFILES but filtered to those actively taking bookings
 */
export const THERAPISTS: Therapist[] = [
  {
    id: "dr-fawzia-yassmina",
    name: "Dr. Fawzia Yassmina",
    role: "Founder & Creator of the NeuroHolistic Method™",
    description: "Founder with 20+ years of experience in neurological wellness and personal transformation.",
  },
  {
    id: "mariam-al-kaisi",
    name: "Mariam Al Kaisi",
    role: "NeuroHolistic Certified Practitioner",
    description: "Grounded practitioner known for calm presence and structured approach to transformation.",
  },
  {
    id: "noura-youssef",
    name: "Noura Youssef",
    role: "NeuroHolistic Certified Practitioner",
    description: "Compassionate practitioner blending scientific insight with intuition and care.",
  },
  {
    id: "reem-mobayed",
    name: "Reem Mobayed",
    role: "NeuroHolistic Certified Practitioner",
    description: "Engaging practitioner known for insight-driven transformational work.",
  },
  {
    id: "fawares-azaar",
    name: "Fawares Azaar",
    role: "NeuroHolistic Certified Practitioner",
    description: "Confident practitioner blending medical consulting experience with emotional intelligence.",
  },
  {
    id: "joud-charafeddin",
    name: "Joud Charafeddin",
    role: "NeuroHolistic Certified Practitioner",
    description: "Grounded practitioner creating safe spaces for healing, awareness, and inner harmony.",
  },
];

/**
 * Available time slots for bookings
 * Static list for now; can be made dynamic when backend is ready
 */
export const TIME_SLOTS: TimeSlot[] = [
  {
    id: "morning-early",
    display: "09:00 AM",
    value: "09:00",
  },
  {
    id: "morning-late",
    display: "11:00 AM",
    value: "11:00",
  },
  {
    id: "afternoon-early",
    display: "02:00 PM",
    value: "14:00",
  },
  {
    id: "afternoon-late",
    display: "04:00 PM",
    value: "16:00",
  },
  {
    id: "evening",
    display: "06:00 PM",
    value: "18:00",
  },
];
