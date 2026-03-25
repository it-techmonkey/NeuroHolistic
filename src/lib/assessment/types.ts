/**
 * Assessment API Payload Types
 */

export interface AssessmentFormData {
  nervousSystem: {
    tonia_level: number;
    activation_pattern: number;
    recovery_speed: number;
    freeze_response: number;
    fight_flight: number;
  };
  emotionalPatterns: {
    primaryEmotions: string[];
    triggers: string[];
    copingEffectiveness: number;
    copingStrategies: string[];
    otherTriggers?: string[];
    otherCopingStrategies?: string[];
  };
  motherHistory: {
    health_issues: string[];
    relationship: string;
    emotional_presence: string;
    emotionalChallenges: string[];
    physicalHealth: string[];
    otherEmotionalChallenges?: string[];
    otherPhysicalHealth?: string[];
    relationshipPatterns?: string;
  };
  fatherHistory: {
    health_issues: string[];
    relationship: string;
    emotional_presence: string;
    emotionalChallenges: string[];
    physicalHealth: string[];
    otherEmotionalChallenges?: string[];
    otherPhysicalHealth?: string[];
    relationshipPatterns?: string;
  };
  parentsDynamic: {
    conflict_level: number;
    stability: string;
    support_quality: string;
    emotionalCloseness: number;
    conflictLevel: number;
    emotionalAvailability: number;
  };
  siblings?: {
    numberOfSiblings?: number;
    birthOrder?: string;
    siblingRelationships?: string;
    familyRole?: string;
  };
  incidents: {
    majorLifeEvent: string;
    traumaExperience: string;
    relationshipChallenges: string;
    otherIncidents: string;
  };
  bodySymptoms: {
    chronic_pain?: boolean;
    tension_locations?: string[];
    immune_issues?: boolean;
    fatigue_level?: number;
    symptoms: string[];
    sleepQuality: number;
    energyLevel: number;
    painDiscomfort: string;
    otherSymptoms?: string[];
  };
  stress: {
    level: number;
    sources: string[];
    coping_mechanisms: string[];
    impact_on_life: number;
    responsePatterns: string[];
    substanceUse: string[];
    supportStrength: number;
    workLifeBalance: number;
    otherResponses?: string[];
    otherSubstances?: string[];
  };
  goals: {
    commitmentLevel: string;
    primaryGoals?: string[];
    desiredOutcomes?: string;
    previousTherapy?: string;
    therapyDetails?: string;
    expectations?: string;
  };
  presentingCondition?: {
    primaryReason?: string;
    otherReason?: string;
    duration: string;
    currentImpact?: string;
  };
  acknowledgment?: boolean;
}

export interface AssessmentPayload {
  user_id: string | null;
  email: string;
  raw_responses_json: Record<string, any>;
  scores: AssessmentScores;
  classification: AssessmentClassification;
  recommendation: AssessmentRecommendation;
}

export interface AssessmentScores {
  nervous_system_score: number;
  emotional_pattern_score: number;
  family_imprint_score: number;
  incident_load_score: number;
  body_symptom_score: number;
  current_stress_score: number;
  overall_dysregulation_score: number;
  overall_severity_band: string;
}

export interface AssessmentClassification {
  nervous_system_type: string;
  primary_core_wound: string;
  secondary_core_wound: string;
  dominant_parental_influence: string;
  possible_origin_period: string;
}

export interface AssessmentRecommendation {
  recommended_phase_primary: string;
  recommended_phase_secondary: string;
}
