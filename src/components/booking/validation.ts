/**
 * Booking Form Validation
 * Validates booking form data before submission
 */

import type { BookingFormData, BookingFormErrors } from "./types";

/**
 * Validates email format using a simple regex
 * Matches common email patterns
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a single name field
 * Rules: non-empty, minimum 2 characters
 */
function validateName(name: string): string | undefined {
  if (!name || name.trim().length === 0) {
    return "Full name is required";
  }
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters";
  }
  return undefined;
}

/**
 * Validates email field
 * Rules: non-empty, valid email format
 */
function validateEmail(email: string): string | undefined {
  if (!email || email.trim().length === 0) {
    return "Email is required";
  }
  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }
  return undefined;
}

/**
 * Validates date selection
 * Rules: date must be selected and in the future
 */
function validateDate(date: Date | null): string | undefined {
  if (!date) {
    return "Please select a date";
  }
  // Allow bookings from today onwards
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return "Please select a future date";
  }
  return undefined;
}

/**
 * Validates time slot selection
 * Rules: time must be selected (non-empty string)
 */
function validateTime(time: string): string | undefined {
  if (!time || time.trim().length === 0) {
    return "Please select a preferred time";
  }
  return undefined;
}

/**
 * Validates therapist selection
 * Rules: therapist must be selected (non-empty string)
 */
function validateTherapist(therapist: string): string | undefined {
  if (!therapist || therapist.trim().length === 0) {
    return "Please select a therapist";
  }
  return undefined;
}

/**
 * Main validation function
 * Validates all fields and returns a map of errors
 * Returns empty object if all validations pass
 */
export function validateBookingForm(data: BookingFormData): BookingFormErrors {
  const errors: BookingFormErrors = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const dateError = validateDate(data.date);
  if (dateError) errors.date = dateError;

  const timeError = validateTime(data.time);
  if (timeError) errors.time = timeError;

  const therapistError = validateTherapist(data.therapist);
  if (therapistError) errors.therapist = therapistError;

  return errors;
}

/**
 * Check if form has any errors
 * Utility function for quick validation check
 */
export function hasErrors(errors: BookingFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
