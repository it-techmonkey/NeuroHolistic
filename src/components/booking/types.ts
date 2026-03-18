/**
 * Booking Domain Types
 * Follows the same pattern as events/retreats type definitions
 */

export type TimeSlot = {
  id: string;
  display: string;
  value: string;
};

export type Therapist = {
  id: string;
  name: string;
  role: string;
  description?: string;
};

export type BookingFormData = {
  name: string;
  email: string;
  date: Date | null;
  time: string;
  therapist: string;
};

export type BookingFormErrors = {
  name?: string;
  email?: string;
  date?: string;
  time?: string;
  therapist?: string;
};

export type BookingFormState = {
  data: BookingFormData;
  errors: BookingFormErrors;
  isValidating: boolean;
  isSubmitted: boolean;
};
