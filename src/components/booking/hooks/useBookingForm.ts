"use client";

/**
 * useBookingForm Hook
 * Manages booking form state including data, validation, and submission
 * Follows React hooks patterns used elsewhere in the codebase
 */

import { useState, useCallback } from "react";
import type { BookingFormData, BookingFormErrors } from "../types";
import { validateBookingForm, hasErrors } from "../validation";

type UseBookingFormReturn = {
  formData: BookingFormData;
  errors: BookingFormErrors;
  isValidating: boolean;
  isSubmitted: boolean;
  setField: (field: keyof BookingFormData, value: BookingFormData[keyof BookingFormData]) => void;
  setDate: (date: Date | null) => void;
  validate: () => boolean;
  submit: (onSubmit?: (data: BookingFormData) => void | Promise<void>) => Promise<void>;
  reset: () => void;
};

const initialFormData: BookingFormData = {
  name: "",
  email: "",
  date: null,
  time: "",
  therapist: "",
};

const initialErrors: BookingFormErrors = {};

/**
 * Hook for managing booking form state
 * Provides form data, field setters, validation, and submission handling
 *
 * @returns Object with form state and handler functions
 *
 * @example
 * const {
 *   formData,
 *   errors,
 *   setField,
 *   setDate,
 *   validate,
 *   submit,
 *   reset,
 * } = useBookingForm();
 */
export function useBookingForm(): UseBookingFormReturn {
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [errors, setErrors] = useState<BookingFormErrors>(initialErrors);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Update a single form field
   * For simple string/number fields like name, email, time, therapist
   */
  const setField = useCallback((field: keyof BookingFormData, value: BookingFormData[keyof BookingFormData]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts editing
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  }, []);

  /**
   * Update the date field specifically
   * Handles Date object type
   */
  const setDate = useCallback((date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      date,
    }));
    // Clear date error when user selects a date
    setErrors((prev) => ({
      ...prev,
      date: undefined,
    }));
  }, []);

  /**
   * Validate the entire form
   * Returns true if validation passes, false otherwise
   */
  const validate = useCallback(() => {
    setIsValidating(true);
    const validationErrors = validateBookingForm(formData);
    setErrors(validationErrors);
    setIsValidating(false);
    return !hasErrors(validationErrors);
  }, [formData]);

  /**
   * Submit the form
   * Validates first, then calls optional onSubmit callback
   * Marks form as submitted after successful validation
   */
  const submit = useCallback(
    async (onSubmit?: (data: BookingFormData) => void | Promise<void>) => {
      const isValid = validate();
      if (!isValid) {
        setIsSubmitted(false);
        return;
      }

      setIsSubmitted(true);
      if (onSubmit) {
        await onSubmit(formData);
      }
    },
    [formData, validate]
  );

  /**
   * Reset form to initial state
   * Clears all fields and errors
   */
  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors(initialErrors);
    setIsSubmitted(false);
  }, []);

  return {
    formData,
    errors,
    isValidating,
    isSubmitted,
    setField,
    setDate,
    validate,
    submit,
    reset,
  };
}
