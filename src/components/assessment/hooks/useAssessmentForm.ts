'use client';

import { useState, useCallback, useEffect } from 'react';
import { AssessmentFormData } from '../types';
import { REQUIRED_FIELDS, DRAFT_STORAGE_KEY, DRAFT_TIMESTAMP_KEY } from '../constants';

type FormErrors = Record<string, string>;

/**
 * Initial form data structure
 */
const initialFormData: AssessmentFormData = {
  basicInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    location: '',
  },
  presentingCondition: {
    primaryReason: '',
    otherReason: '',
    duration: '',
    currentImpact: '',
  },
  nervousSystem: {
    tonia_level: 0,
    activation_pattern: 0,
    recovery_speed: 0,
    freeze_response: 0,
    fight_flight: 0,
  },
  emotionalPatterns: {
    primaryEmotions: [],
    triggers: [],
    otherTriggers: '',
    copingStrategies: [],
    otherCopingStrategies: '',
    copingEffectiveness: 0,
  },
  motherHistory: {
    emotionalChallenges: [],
    otherEmotionalChallenges: '',
    physicalHealth: [],
    otherPhysicalHealth: '',
    relationshipPatterns: '',
  },
  fatherHistory: {
    emotionalChallenges: [],
    otherEmotionalChallenges: '',
    physicalHealth: [],
    otherPhysicalHealth: '',
    relationshipPatterns: '',
  },
  parentsDynamic: {
    emotionalCloseness: 0,
    conflictLevel: 0,
    emotionalAvailability: 0,
  },
  siblings: {
    numberOfSiblings: 0,
    birthOrder: '',
    siblingRelationships: '',
    familyRole: '',
  },
  incidents: {
    majorLifeEvent: '',
    traumaExperience: '',
    relationshipChallenges: '',
    otherIncidents: '',
  },
  bodySymptoms: {
    symptoms: [],
    otherSymptoms: '',
    painDiscomfort: '',
    sleepQuality: 0,
    energyLevel: 0,
  },
  stress: {
    responsePatterns: [],
    otherResponses: '',
    substanceUse: [],
    otherSubstances: '',
    supportStrength: 0,
    workLifeBalance: 0,
  },
  goals: {
    primaryGoals: '',
    desiredOutcomes: '',
    previousTherapy: '',
    therapyDetails: '',
    expectations: '',
    commitmentLevel: '',
  },
  acknowledgment: false,
};

/**
 * Custom hook for managing assessment form state
 */
export function useAssessmentForm() {
  const [formData, setFormData] = useState<AssessmentFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        console.log('[Assessment] Restored draft from localStorage');
      } catch (error) {
        console.error('[Assessment] Error loading draft:', error);
      }
    }
  }, []);

  // Save draft to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    localStorage.setItem(DRAFT_TIMESTAMP_KEY, new Date().toISOString());
    console.log('[Assessment] Draft auto-saved');
  }, [formData]);

  /**
   * Update a field in the current step
   */
  const updateField = useCallback(
    (stepId: string, fieldName: string, value: any) => {
      // Special case for root-level fields like acknowledgment on review screen
      if (fieldName === 'acknowledgment') {
        setFormData((prev) => ({
          ...prev,
          acknowledgment: value,
        }));
        console.log('[Assessment] Updated acknowledgment:', value);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [stepId]: {
          ...(prev[stepId as keyof AssessmentFormData] as any),
          [fieldName]: value,
        },
      }));
      
      // Clear error for this field when user starts editing
      const errorKey = `${stepId}.${fieldName}`;
      if (errors[errorKey]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    },
    [errors]
  );

  /**
   * Validate current step
   */
  const validateStep = useCallback((stepId: string): boolean => {
    const requiredFields = REQUIRED_FIELDS[stepId] || [];
    const stepData = formData[stepId as keyof AssessmentFormData] as any;
    const newErrors: FormErrors = {};

    requiredFields.forEach((fieldName) => {
      const value = stepData[fieldName];
      
      if (Array.isArray(value)) {
        if (value.length === 0) {
          newErrors[`${stepId}.${fieldName}`] = 'Please select at least one option';
        }
      } else if (typeof value === 'string') {
        if (!value.trim()) {
          newErrors[`${stepId}.${fieldName}`] = 'This field is required';
        }
      } else if (typeof value === 'number') {
        if (value === null || value === undefined) {
          newErrors[`${stepId}.${fieldName}`] = 'This field is required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Move to next step
   */
  const nextStep = useCallback((stepId: string) => {
    if (validateStep(stepId)) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [validateStep]);

  /**
   * Move to previous step
   */
  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((stepNumber: number) => {
    setCurrentStep(stepNumber);
  }, []);

  /**
   * Submit form
   * user_id is resolved server-side from the auth session cookie — not passed from the client.
   */
  const submitForm = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('[Assessment] Submitting form...');

      const payload = {
        raw_responses_json: formData,
        submitted_at: new Date().toISOString(),
        status: 'submitted' as const,
      };

      console.log('[Assessment] Payload ready, sending to API...');

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let result: any = {};
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('[Assessment] Failed to parse API response:', parseError);
        result = { error: 'Failed to parse response' };
      }

      if (!response.ok) {
        console.error('[Assessment] API error response:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error,
          details: result.details,
          fullResponse: result,
        });
        throw new Error(`API error: ${response.status} - ${result.error || 'Unknown error'}`);
      }

      console.log('[Assessment] Form submitted successfully:', result);
      
      // Clear draft after successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_TIMESTAMP_KEY);

      return result;
    } catch (error) {
      console.error('[Assessment] Error submitting form:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  /**
   * Clear form and start over
   */
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setErrors({});
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
    console.log('[Assessment] Form reset');
  }, []);

  /**
   * Clear draft without resetting current session
   */
  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
    console.log('[Assessment] Draft cleared');
  }, []);

  /**
   * Get saved draft info
   */
  const getDraftInfo = useCallback(() => {
    const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  }, []);

  return {
    formData,
    errors,
    currentStep,
    isLoading,
    updateField,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    resetForm,
    clearDraft,
    getDraftInfo,
  };
}
