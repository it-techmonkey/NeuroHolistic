/**
 * Assessment form types and interfaces
 */

export interface AssessmentFormData {
  basicInfo: BasicInfoData;
  presentingCondition: PresentingConditionData;
  nervousSystem: NervousSystemData;
  emotionalPatterns: EmotionalPatternsData;
  motherHistory: MotherHistoryData;
  fatherHistory: FatherHistoryData;
  parentsDynamic: ParentsDynamicData;
  siblings: SiblingsData;
  incidents: IncidentsData;
  bodySymptoms: BodySymptomsData;
  stress: StressData;
  goals: GoalsData;
  acknowledgment: boolean;
}

// Step 1: Basic Info
export interface BasicInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  location: string;
}

// Step 2: Presenting Condition
export interface PresentingConditionData {
  primaryReason: string;
  otherReason: string;
  duration: string;
  currentImpact: string;
}

// Step 3: Nervous System
export interface NervousSystemData {
  tonia_level: number;
  activation_pattern: number;
  recovery_speed: number;
  freeze_response: number;
  fight_flight: number;
}

// Step 4: Emotional Patterns
export interface EmotionalPatternsData {
  primaryEmotions: string[];
  triggers: string[];
  otherTriggers: string;
  copingStrategies: string[];
  otherCopingStrategies: string;
  copingEffectiveness: number;
}

// Step 5: Mother's History
export interface MotherHistoryData {
  emotionalChallenges: string[];
  otherEmotionalChallenges: string;
  physicalHealth: string[];
  otherPhysicalHealth: string;
  relationshipPatterns: string;
}

// Step 6: Father's History
export interface FatherHistoryData {
  emotionalChallenges: string[];
  otherEmotionalChallenges: string;
  physicalHealth: string[];
  otherPhysicalHealth: string;
  relationshipPatterns: string;
}

// Step 7: Parents' Dynamic
export interface ParentsDynamicData {
  emotionalCloseness: number;
  conflictLevel: number;
  emotionalAvailability: number;
}

// Step 8: Siblings
export interface SiblingsData {
  numberOfSiblings: number;
  birthOrder: string;
  siblingRelationships: string;
  familyRole: string;
}

// Step 9: Incidents
export interface IncidentsData {
  majorLifeEvent: string;
  traumaExperience: string;
  relationshipChallenges: string;
  otherIncidents: string;
}

// Step 10: Body Symptoms
export interface BodySymptomsData {
  symptoms: string[];
  otherSymptoms: string;
  painDiscomfort: string;
  sleepQuality: number;
  energyLevel: number;
}

// Step 11: Stress
export interface StressData {
  responsePatterns: string[];
  otherResponses: string;
  substanceUse: string[];
  otherSubstances: string;
  supportStrength: number;
  workLifeBalance: number;
}

// Step 12: Goals
export interface GoalsData {
  primaryGoals: string;
  desiredOutcomes: string;
  previousTherapy: string;
  therapyDetails: string;
  expectations: string;
  commitmentLevel: string;
}

// Form step definition
export interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
}

// Form submission
export interface AssessmentSubmission {
  user_id: string;
  raw_responses_json: AssessmentFormData;
  submitted_at: string;
  status: string;
}