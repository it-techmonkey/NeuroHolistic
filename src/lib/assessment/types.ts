/**
 * Assessment API Payload Types
 */

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
  nervous_system_type: 'hyper' | 'hypo' | 'mixed' | 'regulated';
  primary_core_wound: string;
  secondary_core_wound: string;
  dominant_parental_influence: string;
  possible_origin_period: string;
}

export interface AssessmentRecommendation {
  recommended_phase_primary: string;
  recommended_phase_secondary: string;
}

export interface AssessmentResponse {
  success: boolean;
  assessment_id?: string;
  overall_score?: number;
  error?: string;
  message?: string;
}
