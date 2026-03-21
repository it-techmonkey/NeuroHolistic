'use client';

import { useAssessmentForm } from './hooks/useAssessmentForm';
import { AssessmentStepRenderer } from './AssessmentStepRenderer';
import { ASSESSMENT_STEPS } from './constants';

export function AssessmentForm() {
  const {
    formData,
    errors,
    currentStep,
    isLoading,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
  } = useAssessmentForm();

  const currentStepData = ASSESSMENT_STEPS[currentStep];
  const isLastStep = currentStep === ASSESSMENT_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleFieldChange = (fieldName: string, value: any) => {
    updateField(currentStepData.id, fieldName, value);
  };

  const handleNext = () => {
    nextStep(currentStepData.id);
  };

  const handleSubmit = async () => {
    if (!formData.acknowledgment) {
      alert('Please confirm that your information is accurate before submitting.');
      return;
    }

    try {
      console.log('[Assessment] Starting submission with form data...');
      const response = await submitForm();
      if (response.success) {
        console.log('[Assessment] Form submitted successfully:', response);
        // Clear localStorage draft
        localStorage.removeItem('assessmentDraft');
        // Redirect to results page or confirmation
        window.location.href = '/assessment/completed';
      } else {
        console.error('[Assessment] Form submission failed:', response.error);
        alert(`Failed to submit assessment: ${response.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[Assessment] Submission error:', error);
      alert(`Error submitting assessment: ${error.message || 'Please check the console for details'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">NeuroHolistic Assessment</h1>
          <p className="text-slate-600">
            Take your time to answer thoughtfully. Your responses help us create a personalized
            support plan for your journey.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Step {currentStep + 1} of {ASSESSMENT_STEPS.length}
            </span>
            <span className="text-sm text-slate-600">
              {Math.round(((currentStep + 1) / ASSESSMENT_STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / ASSESSMENT_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Step Cards Navigation */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {ASSESSMENT_STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => goToStep(idx)}
              disabled={isLoading}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                idx === currentStep
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : idx < currentStep
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Step Title and Description */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentStepData.title}</h2>
            <p className="text-slate-600">{currentStepData.description}</p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <AssessmentStepRenderer
              stepId={currentStepData.id}
              formData={formData}
              errors={errors}
              onFieldChange={handleFieldChange}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={isFirstStep || isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isFirstStep || isLoading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              ← Back
            </button>

            <button
              onClick={handleNext}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isLoading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
              style={{
                display: !isLastStep ? 'block' : 'none',
              }}
            >
              Next →
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-all ml-auto ${
                isLoading
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              style={{
                display: isLastStep ? 'block' : 'none',
              }}
            >
              {isLoading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </div>

        {/* Draft Info */}
        <div className="text-center text-sm text-slate-500">
          Your progress is automatically saved as you go. You can close and return to continue
          where you left off.
        </div>
      </div>
    </div>
  );
}
