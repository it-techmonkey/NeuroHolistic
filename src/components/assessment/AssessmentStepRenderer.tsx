'use client';

import { AssessmentFormData } from './types';
import { StepBasicInfo } from './steps/StepBasicInfo';
import { StepPresentingCondition } from './steps/StepPresentingCondition';
import { StepNervousSystem } from './steps/StepNervousSystem';
import { StepEmotionalPatterns } from './steps/StepEmotionalPatterns';
import { StepMotherHistory } from './steps/StepMotherHistory';
import { StepFatherHistory } from './steps/StepFatherHistory';
import { StepParentsDynamic } from './steps/StepParentsDynamic';
import { StepSiblings } from './steps/StepSiblings';
import { StepIncidents } from './steps/StepIncidents';
import { StepBodySymptoms } from './steps/StepBodySymptoms';
import { StepStress } from './steps/StepStress';
import { StepGoals } from './steps/StepGoals';
import { StepReview } from './steps/StepReview';

interface AssessmentStepRendererProps {
  stepId: string;
  formData: AssessmentFormData;
  errors: Record<string, string>;
  onFieldChange: (fieldName: string, value: any) => void;
}

export function AssessmentStepRenderer({
  stepId,
  formData,
  errors,
  onFieldChange,
}: AssessmentStepRendererProps) {
  // Create a wrapper onChange that prefixes the field name with the step ID
  const handleStepChange = (fieldName: string, value: any) => {
    onFieldChange(fieldName, value);
  };

  switch (stepId) {
    case 'basicInfo':
      return (
        <StepBasicInfo
          data={formData.basicInfo}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'presentingCondition':
      return (
        <StepPresentingCondition
          data={formData.presentingCondition}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'nervousSystem':
      return (
        <StepNervousSystem
          data={formData.nervousSystem}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'emotionalPatterns':
      return (
        <StepEmotionalPatterns
          data={formData.emotionalPatterns}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'motherHistory':
      return (
        <StepMotherHistory
          data={formData.motherHistory}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'fatherHistory':
      return (
        <StepFatherHistory
          data={formData.fatherHistory}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'parentsDynamic':
      return (
        <StepParentsDynamic
          data={formData.parentsDynamic}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'siblings':
      return (
        <StepSiblings
          data={formData.siblings}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'incidents':
      return (
        <StepIncidents
          data={formData.incidents}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'bodySymptoms':
      return (
        <StepBodySymptoms
          data={formData.bodySymptoms}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'stress':
      return (
        <StepStress
          data={formData.stress}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'goals':
      return (
        <StepGoals
          data={formData.goals}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    case 'review':
      return (
        <StepReview
          data={formData}
          errors={errors}
          onChange={handleStepChange}
        />
      );

    default:
      return <div className="text-slate-600">Unknown step: {stepId}</div>;
  }
}
