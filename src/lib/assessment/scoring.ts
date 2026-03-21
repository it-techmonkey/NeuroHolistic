import { AssessmentFormData } from '@/components/assessment/types';

/**
 * NeuroHolistic Assessment Scoring Engine
 *
 * Pure function for calculating assessment scores and classifications
 * No external dependencies, no UI logic, no API calls
 * Deterministic and fully testable
 */

// ============================================================================
// TYPES
// ============================================================================

export interface AssessmentScores {
  nervous_system_score: number;
  emotional_pattern_score: number;
  family_imprint_score: number;
  incident_load_score: number;
  body_symptom_score: number;
  current_stress_score: number;
  overall_dysregulation_score: number;
  overall_severity_band: SeverityBand;
}

export interface AssessmentClassification {
  nervous_system_type: NervousSystemType;
  primary_core_wound: CoreWound;
  secondary_core_wound: CoreWound;
  dominant_parental_influence: ParentalInfluence;
  possible_origin_period: OriginPeriod;
}

export interface AssessmentRecommendation {
  recommended_phase_primary: Phase;
  recommended_phase_secondary: Phase;
}

export interface AssessmentScoringResult {
  scores: AssessmentScores;
  classification: AssessmentClassification;
  recommendation: AssessmentRecommendation;
}

export type SeverityBand = 'Mild' | 'Moderate' | 'Significant' | 'High' | 'Very High';
export type NervousSystemType = 'hyper' | 'hypo' | 'mixed' | 'regulated';
export type CoreWound =
  | 'abandonment'
  | 'worth_rejection'
  | 'control_safety'
  | 'suppression_expression'
  | 'unknown';
export type ParentalInfluence = 'mother' | 'father' | 'both' | 'unknown';
export type OriginPeriod = 'early_childhood' | 'adolescence' | 'adulthood' | 'unknown';
export type Phase = 'Phase 1' | 'Phase 2' | 'Phase 3' | 'Phase 4' | 'Phase 1-2';

// ============================================================================
// MAIN SCORING FUNCTION
// ============================================================================

export function calculateAssessmentScore(
  data: AssessmentFormData
): AssessmentScoringResult {
  console.log('[Scoring] Starting assessment calculation');

  try {
    // Calculate individual domain scores
    const nervousSystemScore = calculateNervousSystemScore(data);
    const emotionalPatternScore = calculateEmotionalPatternScore(data);
    const familyImprintScore = calculateFamilyImprintScore(data);
    const incidentLoadScore = calculateIncidentLoadScore(data);
    const bodySymptomScore = calculateBodySymptomScore(data);
    const currentStressScore = calculateCurrentStressScore(data);

    // Calculate weighted overall dysregulation score
    const overallDysregulationScore = calculateOverallScore(
      nervousSystemScore,
      emotionalPatternScore,
      familyImprintScore,
      incidentLoadScore,
      bodySymptomScore,
      currentStressScore
    );

    // Determine severity band
    const severityBand = determineSeverityBand(overallDysregulationScore);

    // Classification
    const nervousSystemType = classifyNervousSystemType(data);
    const { primary, secondary } = detectCoreWounds(data);
    const parentalInfluence = determineDominantParentalInfluence(data);
    const originPeriod = determineOriginPeriod(data);

    // Phase recommendations
    const { primary: recommendedPhasePrimary, secondary: recommendedPhaseSecondary } =
      recommendPhases(
        nervousSystemScore,
        emotionalPatternScore,
        familyImprintScore,
        incidentLoadScore,
        overallDysregulationScore,
        nervousSystemType
      );

    console.log('[Scoring] Assessment calculation complete', {
      overallScore: overallDysregulationScore,
      severityBand,
      nervousSystemType,
    });

    return {
      scores: {
        nervous_system_score: Math.round(nervousSystemScore),
        emotional_pattern_score: Math.round(emotionalPatternScore),
        family_imprint_score: Math.round(familyImprintScore),
        incident_load_score: Math.round(incidentLoadScore),
        body_symptom_score: Math.round(bodySymptomScore),
        current_stress_score: Math.round(currentStressScore),
        overall_dysregulation_score: Math.round(overallDysregulationScore),
        overall_severity_band: severityBand,
      },
      classification: {
        nervous_system_type: nervousSystemType,
        primary_core_wound: primary,
        secondary_core_wound: secondary,
        dominant_parental_influence: parentalInfluence,
        possible_origin_period: originPeriod,
      },
      recommendation: {
        recommended_phase_primary: recommendedPhasePrimary,
        recommended_phase_secondary: recommendedPhaseSecondary,
      },
    };
  } catch (error) {
    console.error('[Scoring] Error during assessment calculation:', error);
    return getDefaultScoringResult();
  }
}

// ============================================================================
// HELPER: DOMAIN SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate nervous system dysregulation score (0-100)
 * Based on: baseline tone, activation pattern, recovery speed, freeze response
 */
function calculateNervousSystemScore(data: AssessmentFormData): number {
  const ns = data?.nervousSystem;
  if (!ns) return 0;

  // Raw score out of 37.5 (5 scales × 7.5 max each)
  let rawScore = 0;

  // Tonia level: lower = more dysregulated (1–5 scale)
  rawScore += Math.abs(3 - (ns.tonia_level ?? 3)) * 1.5;

  // Activation pattern: higher = more dysregulated
  rawScore += (ns.activation_pattern ?? 1) * 1.5;

  // Recovery speed: lower = more dysregulated
  rawScore += Math.abs(3 - (ns.recovery_speed ?? 3)) * 1.5;

  // Freeze response: higher = more dysregulated
  rawScore += (ns.freeze_response ?? 1) * 1.5;

  // Fight/flight: higher = more dysregulated
  rawScore += (ns.fight_flight ?? 1) * 1.5;

  return normalize(rawScore, 37.5);
}

/**
 * Calculate emotional pattern dysregulation score (0-100)
 * Based on: emotional overwhelm, trigger sensitivity, coping effectiveness
 */
function calculateEmotionalPatternScore(data: AssessmentFormData): number {
  const ep = data?.emotionalPatterns;
  if (!ep) return 0;

  let rawScore = 0;

  // Number of primary emotions (more = more dysregulation)
  rawScore += Math.min((ep.primaryEmotions?.length ?? 0) * 8, 40);

  // Number of triggers (more = more sensitivity)
  rawScore += Math.min((ep.triggers?.length ?? 0) * 6, 30);

  // Coping effectiveness: lower score = higher dysregulation (1–5 scale)
  rawScore += (5 - Math.min(ep.copingEffectiveness ?? 3, 5)) * 6; // 0-24

  // Max = 40 + 30 + 24 = 94
  return normalize(rawScore, 94);
}

/**
 * Calculate family imprint score (0-100)
 * Based on: parental health issues, family dynamics, parent relationship
 */
function calculateFamilyImprintScore(data: AssessmentFormData): number {
  const mother = data?.motherHistory;
  const father = data?.fatherHistory;
  const dynamics = data?.parentsDynamic;
  if (!mother || !father || !dynamics) return 0;

  let rawScore = 0;

  rawScore += (mother.emotionalChallenges?.length ?? 0) * 6;
  rawScore += (mother.physicalHealth?.length ?? 0) * 4;
  rawScore += (father.emotionalChallenges?.length ?? 0) * 6;
  rawScore += (father.physicalHealth?.length ?? 0) * 4;
  rawScore += Math.abs(3 - (dynamics.emotionalCloseness ?? 3)) * 8;
  rawScore += (dynamics.conflictLevel ?? 0) * 8;
  rawScore += Math.abs(3 - (dynamics.emotionalAvailability ?? 3)) * 8;

  // Max = 6*5 + 4*5 + 6*5 + 4*5 + 16 + 32 + 16 = 114 → cap to 96
  return normalize(rawScore, 96);
}

/**
 * Calculate incident load score (0-100)
 * Based on: trauma experiences, significant life events, relationship challenges
 */
function calculateIncidentLoadScore(data: AssessmentFormData): number {
  const incidents = data.incidents;

  let rawScore = 0;

  // Major life event presence and detail
  if (incidents.majorLifeEvent.trim().length > 0) {
    rawScore += Math.min(incidents.majorLifeEvent.length / 10, 20);
  }

  // Trauma experience presence and detail
  if (incidents.traumaExperience.trim().length > 0) {
    rawScore += Math.min(incidents.traumaExperience.length / 10, 30);
  }

  // Relationship challenges presence and detail
  if (incidents.relationshipChallenges.trim().length > 0) {
    rawScore += Math.min(incidents.relationshipChallenges.length / 10, 20);
  }

  // Other incidents
  if (incidents.otherIncidents.trim().length > 0) {
    rawScore += Math.min(incidents.otherIncidents.length / 10, 15);
  }

  return normalize(rawScore, 85);
}

/**
 * Calculate body symptom dysregulation score (0-100)
 * Based on: symptom count, sleep quality, energy levels
 */
function calculateBodySymptomScore(data: AssessmentFormData): number {
  const bs = data?.bodySymptoms;
  if (!bs) return 0;

  let rawScore = 0;

  rawScore += Math.min((bs.symptoms?.length ?? 0) * 12, 50);
  rawScore += Math.abs(3 - (bs.sleepQuality ?? 3)) * 8;
  rawScore += Math.abs(3 - (bs.energyLevel ?? 3)) * 8;

  if (bs.painDiscomfort?.trim().length > 0) {
    rawScore += Math.min(bs.painDiscomfort.length / 5, 10);
  }

  // Max = 50 + 16 + 16 + 10 = 92
  return normalize(rawScore, 92);
}

/**
 * Calculate current stress dysregulation score (0-100)
 * Based on: stress response patterns, substance use, support system, work-life balance
 */
function calculateCurrentStressScore(data: AssessmentFormData): number {
  const stress = data?.stress;
  if (!stress) return 0;

  let rawScore = 0;

  // Number of stress response patterns (more = higher dysregulation)
  rawScore += Math.min((stress.responsePatterns?.length ?? 0) * 10, 40);

  // Substance use (each substance adds dysregulation)
  rawScore += Math.min((stress.substanceUse?.length ?? 0) * 8, 24);

  // Support system strength (lower = higher dysregulation)
  rawScore += Math.abs(3 - (stress.supportStrength ?? 3)) * 8; // 0-16

  // Work-life balance (lower = higher dysregulation)
  rawScore += Math.abs(3 - (stress.workLifeBalance ?? 3)) * 8; // 0-16

  // Correct max: 40 + 24 + 16 + 16 = 96
  // (was incorrectly 104, causing artificial clamping)
  return normalize(rawScore, 96);
}

/**
 * Calculate weighted overall dysregulation score (0-100)
 * Weights: NS 25%, EP 20%, FI 20%, IL 10%, BS 15%, CS 10%
 */
function calculateOverallScore(
  nervousSystemScore: number,
  emotionalPatternScore: number,
  familyImprintScore: number,
  incidentLoadScore: number,
  bodySymptomScore: number,
  currentStressScore: number
): number {
  const weighted =
    nervousSystemScore * 0.25 +
    emotionalPatternScore * 0.2 +
    familyImprintScore * 0.2 +
    incidentLoadScore * 0.1 +
    bodySymptomScore * 0.15 +
    currentStressScore * 0.1;

  return Math.min(100, Math.max(0, weighted));
}

// ============================================================================
// HELPER: NORMALIZATION & SEVERITY
// ============================================================================

/**
 * Normalize raw score to 0-100 scale
 */
function normalize(rawScore: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  const normalized = (rawScore / maxScore) * 100;
  return Math.min(100, Math.max(0, normalized));
}

/**
 * Determine severity band based on overall score
 */
function determineSeverityBand(score: number): SeverityBand {
  if (score <= 20) return 'Mild';
  if (score <= 40) return 'Moderate';
  if (score <= 60) return 'Significant';
  if (score <= 80) return 'High';
  return 'Very High';
}

// ============================================================================
// HELPER: NERVOUS SYSTEM TYPE CLASSIFICATION
// ============================================================================

/**
 * Classify nervous system type based on observed patterns
 * Returns: hyper, hypo, mixed, or regulated
 */
function classifyNervousSystemType(data: AssessmentFormData): NervousSystemType {
  const ns = data.nervousSystem;

  // Indicators
  const isHyperactive = ns.activation_pattern >= 4 || ns.fight_flight >= 4;
  const isHypoactive = ns.tonia_level <= 2 || ns.activation_pattern <= 2;
  const hasFreezeResponse = ns.freeze_response >= 3;
  const isPoorRecovery = ns.recovery_speed <= 2;

  // Logic for classification
  if (hasFreezeResponse && (isHyperactive || isHypoactive)) {
    return 'mixed';
  }

  if (isHyperactive && isPoorRecovery) {
    return 'hyper';
  }

  if (isHypoactive) {
    return 'hypo';
  }

  if (isHyperactive) {
    return 'hyper';
  }

  if (hasFreezeResponse) {
    return 'mixed';
  }

  return 'regulated';
}

// ============================================================================
// HELPER: CORE WOUND DETECTION
// ============================================================================

/**
 * Detect primary and secondary core wounds based on patterns
 * Wounds: abandonment, worth_rejection, control_safety, suppression_expression
 */
function detectCoreWounds(
  data: AssessmentFormData
): { primary: CoreWound; secondary: CoreWound } {
  const scores = {
    abandonment: 0,
    worth_rejection: 0,
    control_safety: 0,
    suppression_expression: 0,
  };

  const ep = data.emotionalPatterns;
  const goals = data.goals;

  // Check for abandonment wound
  if (
    ep.triggers.includes('rejection') ||
    ep.triggers.includes('intimacy') ||
    ep.primaryEmotions.includes('loneliness') ||
    ep.primaryEmotions.includes('fear')
  ) {
    scores.abandonment += 5;
  }

  // Check for worth/rejection wound
  if (
    ep.triggers.includes('performance') ||
    ep.triggers.includes('criticism') ||
    ep.primaryEmotions.includes('shame') ||
    goals.commitmentLevel === 'unsure'
  ) {
    scores.worth_rejection += 5;
  }

  // Check for control/safety wound
  if (
    ep.triggers.includes('uncertainty') ||
    ep.triggers.includes('authority') ||
    ep.primaryEmotions.includes('anxiety') ||
    data.presentingCondition.duration.includes('more_than') ||
    data.stress.responsePatterns.includes('freeze')
  ) {
    scores.control_safety += 5;
  }

  // Check for suppression/expression wound
  if (
    ep.copingStrategies.includes('avoidance') ||
    ep.copingStrategies.includes('work') ||
    !ep.copingStrategies.includes('talking') ||
    ep.primaryEmotions.includes('anger') ||
    ep.primaryEmotions.includes('emptiness')
  ) {
    scores.suppression_expression += 5;
  }

  // Family imprints
  const motherHasAnxiety = data.motherHistory.emotionalChallenges.includes('anxiety');
  const fatherHasAnxiety = data.fatherHistory.emotionalChallenges.includes('anxiety');
  const fatherHasAnger = data.fatherHistory.emotionalChallenges.includes('anger-issues');

  if (motherHasAnxiety || fatherHasAnxiety) {
    scores.abandonment += 2;
    scores.control_safety += 2;
  }

  if (fatherHasAnger) {
    scores.suppression_expression += 3;
    scores.control_safety += 2;
  }

  // Sort to find primary and secondary
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([wound]) => wound as CoreWound);

  const primary = sorted[0] || 'unknown';
  const secondary = sorted[1] || 'unknown';

  return { primary, secondary };
}

// ============================================================================
// HELPER: PARENTAL INFLUENCE
// ============================================================================

/**
 * Determine which parent has dominant influence based on health burden
 */
function determineDominantParentalInfluence(data: AssessmentFormData): ParentalInfluence {
  const mother = data.motherHistory;
  const father = data.fatherHistory;

  const motherBurden =
    mother.emotionalChallenges.length * 2 + mother.physicalHealth.length * 1;
  const fatherBurden =
    father.emotionalChallenges.length * 2 + father.physicalHealth.length * 1;
  const parentDynamicBurden =
    data.parentsDynamic.conflictLevel + data.parentsDynamic.emotionalCloseness;

  if (motherBurden === 0 && fatherBurden === 0) {
    return 'unknown';
  }

  if (motherBurden > fatherBurden + 2) {
    return 'mother';
  }

  if (fatherBurden > motherBurden + 2) {
    return 'father';
  }

  return 'both';
}

// ============================================================================
// HELPER: ORIGIN PERIOD
// ============================================================================

/**
 * Determine probable origin period based on available data
 */
function determineOriginPeriod(data: AssessmentFormData): OriginPeriod {
  // Check duration of presenting condition
  const duration = data.presentingCondition.duration;

  if (duration.includes('less_than_3')) {
    return 'unknown'; // Recent onset, can't determine origin
  }

  // Check if early family trauma/dysfunction
  const hasEarlyFamilyTrauma =
    data.motherHistory.emotionalChallenges.length > 0 ||
    data.fatherHistory.emotionalChallenges.length > 0 ||
    data.parentsDynamic.conflictLevel >= 3;

  if (hasEarlyFamilyTrauma) {
    return 'early_childhood';
  }

  // Check for adolescent/adulthood incidents
  const hasIncidents =
    data.incidents.majorLifeEvent.length > 0 ||
    data.incidents.traumaExperience.length > 0 ||
    data.incidents.relationshipChallenges.length > 0;

  if (
    hasIncidents &&
    (duration.includes('1_to_3') || duration.includes('6_months_to_1'))
  ) {
    return 'adulthood';
  }

  if (hasIncidents && duration.includes('3_to_6')) {
    return 'adolescence';
  }

  return 'unknown';
}

// ============================================================================
// HELPER: PHASE RECOMMENDATIONS
// ============================================================================

/**
 * Recommend primary and secondary phases based on scores and patterns
 *
 * Phase 1: Nervous system stabilization (nervous_system_score > 60 OR hyper/mixed type)
 * Phase 2: Trauma/family healing (family_imprint_score > 55 OR early_childhood OR incident_load > 50)
 * Phase 3: Emotional integration (emotional_pattern_score > 50)
 * Phase 4: Integration & resilience (overall < 45 AND commitment high)
 */
function recommendPhases(
  nervousSystemScore: number,
  emotionalPatternScore: number,
  familyImprintScore: number,
  incidentLoadScore: number,
  overallScore: number,
  nervousSystemType: NervousSystemType
): { primary: Phase; secondary: Phase } {
  const candidates: Phase[] = [];

  // Phase 1: Nervous system stabilization
  if (nervousSystemScore > 60 || nervousSystemType === 'hyper' || nervousSystemType === 'mixed') {
    candidates.push('Phase 1');
  }

  // Phase 2: Foundation & family healing
  if (familyImprintScore > 55 || incidentLoadScore > 50) {
    candidates.push('Phase 2');
  }

  // Phase 3: Emotional integration
  if (emotionalPatternScore > 50) {
    candidates.push('Phase 3');
  }

  // Phase 4: Integration & resilience (only if already managing dysregulation)
  if (overallScore < 45 && nervousSystemScore < 50) {
    candidates.push('Phase 4');
  }

  // Determine sequencing
  let primary: Phase = 'Phase 1';
  let secondary: Phase = 'Phase 2';

  if (candidates.includes('Phase 1')) {
    primary = 'Phase 1';
    secondary = candidates.includes('Phase 2') ? 'Phase 2' : 'Phase 3';
  } else if (candidates.includes('Phase 2')) {
    primary = 'Phase 2';
    secondary = candidates.includes('Phase 3') ? 'Phase 3' : 'Phase 4';
  } else if (candidates.includes('Phase 3')) {
    primary = 'Phase 3';
    secondary = 'Phase 4';
  } else {
    primary = 'Phase 4';
    secondary = 'Phase 4';
  }

  // Combined recommendation if both nervous system and family work needed
  if (candidates.includes('Phase 1') && candidates.includes('Phase 2')) {
    primary = 'Phase 1-2';
    secondary = 'Phase 3';
  }

  return { primary, secondary };
}

// ============================================================================
// UTILITY: DEFAULT RESULT
// ============================================================================

/**
 * Return safe default result if calculation fails
 */
function getDefaultScoringResult(): AssessmentScoringResult {
  return {
    scores: {
      nervous_system_score: 0,
      emotional_pattern_score: 0,
      family_imprint_score: 0,
      incident_load_score: 0,
      body_symptom_score: 0,
      current_stress_score: 0,
      overall_dysregulation_score: 0,
      overall_severity_band: 'Mild',
    },
    classification: {
      nervous_system_type: 'regulated',
      primary_core_wound: 'unknown',
      secondary_core_wound: 'unknown',
      dominant_parental_influence: 'unknown',
      possible_origin_period: 'unknown',
    },
    recommendation: {
      recommended_phase_primary: 'Phase 1',
      recommended_phase_secondary: 'Phase 2',
    },
  };
}

// ============================================================================
// SAMPLE TEST DATA (DEV ONLY)
// ============================================================================

/**
 * Sample moderate dysregulation assessment for testing
 */
export const SAMPLE_TEST_ASSESSMENT: AssessmentFormData = {
  basicInfo: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '+1 555-0000',
    dateOfBirth: '1990-01-15',
    gender: 'female',
    location: 'New York, USA',
  },
  presentingCondition: {
    primaryReason: 'stress',
    otherReason: '',
    duration: '1_to_3_years',
    currentImpact: 'Affecting work and relationships',
  },
  nervousSystem: {
    tonia_level: 2,
    activation_pattern: 4,
    recovery_speed: 2,
    freeze_response: 2,
    fight_flight: 3,
  },
  emotionalPatterns: {
    primaryEmotions: ['anxiety', 'frustration', 'overwhelm'],
    triggers: ['uncertainty', 'performance', 'rejection'],
    otherTriggers: '',
    copingStrategies: ['exercise', 'meditation', 'avoidance'],
    otherCopingStrategies: '',
    copingEffectiveness: 2,
  },
  motherHistory: {
    emotionalChallenges: ['anxiety', 'depression'],
    otherEmotionalChallenges: '',
    physicalHealth: ['hypertension'],
    otherPhysicalHealth: '',
    relationshipPatterns: 'Anxious and controlling',
  },
  fatherHistory: {
    emotionalChallenges: ['anger-issues'],
    otherEmotionalChallenges: '',
    physicalHealth: ['heart-disease'],
    otherPhysicalHealth: '',
    relationshipPatterns: 'Distant and withdrawn',
  },
  parentsDynamic: {
    emotionalCloseness: 2,
    conflictLevel: 4,
    emotionalAvailability: 2,
  },
  siblings: {
    numberOfSiblings: 1,
    birthOrder: 'oldest',
    siblingRelationships: 'Supportive but distant',
    familyRole: 'Achiever',
  },
  incidents: {
    majorLifeEvent: 'Job loss and relationship breakup 2 years ago',
    traumaExperience: 'Childhood neglect and emotional unavailability from father',
    relationshipChallenges: 'Current struggles with trust and commitment',
    otherIncidents: '',
  },
  bodySymptoms: {
    symptoms: ['headaches', 'tension', 'insomnia', 'gi-issues'],
    otherSymptoms: '',
    painDiscomfort: 'Chronic tension in shoulders and neck',
    sleepQuality: 2,
    energyLevel: 2,
  },
  stress: {
    responsePatterns: ['fight', 'freeze', 'fawn'],
    otherResponses: '',
    substanceUse: ['caffeine'],
    otherSubstances: '',
    supportStrength: 2,
    workLifeBalance: 2,
  },
  goals: {
    primaryGoals: 'Reduce anxiety and rebuild confidence',
    desiredOutcomes: 'Feel calm and capable in work and relationships',
    previousTherapy: 'yes',
    therapyDetails: 'Had cognitive behavioral therapy for 6 months, helped somewhat',
    expectations:
      'Want a comprehensive approach that addresses root causes, not just symptoms',
    commitmentLevel: 'very_committed',
  },
  acknowledgment: true,
};

// ============================================================================
// EXAMPLE USAGE (for verification)
// ============================================================================

/**
 * Run sample scoring for verification
 * Uncomment to test during development
 */
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  // Only run in Node.js dev environment, not in browser
  const exampleResult = calculateAssessmentScore(SAMPLE_TEST_ASSESSMENT);
  console.log(
    '[Scoring] Sample test result:',
    JSON.stringify(exampleResult, null, 2)
  );
}
