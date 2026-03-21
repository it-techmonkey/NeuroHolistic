'use client';

import { AssessmentFormData, FormStep } from '../types';
import { ASSESSMENT_STEPS } from '../constants';

interface StepReviewProps {
  data: AssessmentFormData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepReview({ data, errors, onChange }: StepReviewProps) {
  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '—';
    }
    if (typeof value === 'object') return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return String(value);
    return String(value);
  };

  const getSectionTitle = (stepId: string): string => {
    const step = ASSESSMENT_STEPS.find((s) => s.id === stepId);
    return step?.title || stepId;
  };

  return (
    <div className="space-y-8">
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <h3 className="font-semibold text-slate-900 mb-2">Review Your Assessment</h3>
        <p className="text-sm text-slate-700">
          Please review your responses below. You can click the "Back" button to edit any section
          before submitting.
        </p>
      </div>

      {/* Basic Info */}
      <section className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {getSectionTitle('basicInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">First Name</p>
            <p className="font-medium text-slate-900">{renderValue(data.basicInfo.firstName)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Last Name</p>
            <p className="font-medium text-slate-900">{renderValue(data.basicInfo.lastName)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Email</p>
            <p className="font-medium text-slate-900">{renderValue(data.basicInfo.email)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Phone</p>
            <p className="font-medium text-slate-900">{renderValue(data.basicInfo.phone)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Date of Birth</p>
            <p className="font-medium text-slate-900">{renderValue(data.basicInfo.dateOfBirth)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Gender</p>
            <p className="font-medium text-slate-900">{renderValue(data.basicInfo.gender)}</p>
          </div>
        </div>
      </section>

      {/* Presenting Condition */}
      <section className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {getSectionTitle('presentingCondition')}
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-600">Primary Reason</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.presentingCondition.primaryReason)}
            </p>
          </div>
          {data.presentingCondition.otherReason && (
            <div>
              <p className="text-sm text-slate-600">Other Reason Details</p>
              <p className="font-medium text-slate-900">{data.presentingCondition.otherReason}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-slate-600">Duration</p>
            <p className="font-medium text-slate-900">{renderValue(data.presentingCondition.duration)}</p>
          </div>
          {data.presentingCondition.currentImpact && (
            <div>
              <p className="text-sm text-slate-600">Current Impact</p>
              <p className="font-medium text-slate-900">{data.presentingCondition.currentImpact}</p>
            </div>
          )}
        </div>
      </section>

      {/* Nervous System */}
      <section className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {getSectionTitle('nervousSystem')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Tonia Level</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.nervousSystem.tonia_level)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Activation Pattern</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.nervousSystem.activation_pattern)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Recovery Speed</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.nervousSystem.recovery_speed)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Freeze Response</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.nervousSystem.freeze_response)}
            </p>
          </div>
        </div>
      </section>

      {/* Emotional Patterns */}
      <section className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {getSectionTitle('emotionalPatterns')}
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-600">Primary Emotions</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.emotionalPatterns.primaryEmotions)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Triggers</p>
            <p className="font-medium text-slate-900">{renderValue(data.emotionalPatterns.triggers)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Coping Strategies</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.emotionalPatterns.copingStrategies)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Coping Effectiveness</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.emotionalPatterns.copingEffectiveness)}/5
            </p>
          </div>
        </div>
      </section>

      {/* Family Histories */}
      <section className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Family Histories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Mother's History</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-600">Emotional Challenges</p>
                <p className="font-medium">
                  {renderValue(data.motherHistory.emotionalChallenges)}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Physical Health</p>
                <p className="font-medium">{renderValue(data.motherHistory.physicalHealth)}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Father's History</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-600">Emotional Challenges</p>
                <p className="font-medium">
                  {renderValue(data.fatherHistory.emotionalChallenges)}
                </p>
              </div>
              <div>
                <p className="text-slate-600">Physical Health</p>
                <p className="font-medium">{renderValue(data.fatherHistory.physicalHealth)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Siblings */}
      <section className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {getSectionTitle('siblings')}
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-600">Number of Siblings</p>
            <p className="font-medium text-slate-900">{renderValue(data.siblings.numberOfSiblings)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Birth Order</p>
            <p className="font-medium text-slate-900">{renderValue(data.siblings.birthOrder)}</p>
          </div>
        </div>
      </section>

      {/* Body Symptoms */}
      <section className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {getSectionTitle('bodySymptoms')}
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-600">Physical Symptoms</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.bodySymptoms.symptoms)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Sleep Quality</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.bodySymptoms.sleepQuality)}/5
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Energy Level</p>
            <p className="font-medium text-slate-900">
              {renderValue(data.bodySymptoms.energyLevel)}/5
            </p>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {getSectionTitle('goals')}
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-slate-600">Primary Goals</p>
            <p className="font-medium text-slate-900 whitespace-pre-wrap">
              {renderValue(data.goals.primaryGoals)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Desired Outcomes</p>
            <p className="font-medium text-slate-900 whitespace-pre-wrap">
              {renderValue(data.goals.desiredOutcomes)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Commitment Level</p>
            <p className="font-medium text-slate-900">{renderValue(data.goals.commitmentLevel)}</p>
          </div>
        </div>
      </section>

      {/* Submission Acknowledgment */}
      <section className="border-t pt-6 pb-6">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={data.acknowledgment}
            onChange={(e) => {
              console.log('[StepReview] Acknowledgment changed:', e.target.checked);
              onChange('acknowledgment', e.target.checked);
            }}
            className="w-4 h-4 text-emerald-600 mt-1 cursor-pointer rounded"
          />
          <span className="ml-3 text-slate-700">
            I confirm that the information provided above is accurate and complete to the best of my
            knowledge. I understand that this assessment will be used to personalize my holistic
            support plan.
          </span>
        </label>
        {errors['acknowledgment'] && (
          <p className="text-red-600 text-sm mt-2">{errors['acknowledgment']}</p>
        )}
      </section>
    </div>
  );
}
