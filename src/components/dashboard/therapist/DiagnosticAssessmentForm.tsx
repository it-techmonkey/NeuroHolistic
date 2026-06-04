'use client';

import { useState, useEffect } from 'react';

interface DiagnosticAssessmentFormProps {
  clientId: string | null;
  therapistId: string;
  sessionId?: string;
  archivedClientId?: string;
  submitMode?: 'normal' | 'archive';
  existingAssessment?: any;
  baselineExists?: boolean;
  clientData?: {
    full_name?: string;
    email?: string;
    phone?: string;
    country?: string;
  };
  onClose: () => void;
  onSave: (assessment: any) => void;
  isSessionCompleted?: boolean;
  previewMode?: boolean;
}

const NERVOUS_SYSTEM_PATTERNS = [
  { value: 'regulated', label: 'Regulated' },
  { value: 'hyper', label: 'Hyper (anxious / tense)' },
  { value: 'hypo', label: 'Hypo (shutdown / low energy)' },
  { value: 'mixed', label: 'Mixed' },
];

const CURRENT_SYMPTOM_OPTIONS = [
  'Anxiety',
  'Panic attacks',
  'Emotional overwhelm',
  'Emotional numbness',
  'Sadness / low mood',
  'Irritability',
  'Anger outbursts',
  'Fearfulness',
  'Excessive worry',
  'Feeling stuck',
  'Relationship difficulty',
  'Physical symptoms',
  'Sleep difficulty',
  'Fatigue',
  'Stress overload',
  'Lack of direction',
  'Other',
];

const EMOTIONAL_PATTERNS = [
  'Anxiety',
  'Panic attacks',
  'Emotional overwhelm',
  'Emotional numbness',
  'Sadness / low mood',
  'Irritability',
  'Anger outbursts',
  'Fearfulness',
  'Excessive worry',
  'Feeling emotionally disconnected',
  'Feeling empty inside',
  'Hopelessness',
  'Loss of joy',
  'Shame',
  'Guilt',
  'Loneliness',
  'Sensitivity to criticism',
  'Emotional suppression',
  'Feeling stuck',
  'Other',
];

const NERVOUS_SYSTEM_SYMPTOMS = [
  'Hypervigilance',
  'Constant tension',
  'Restlessness',
  'Easily startled',
  'Racing thoughts',
  'Overthinking',
  'Dissociation',
  'Feeling detached from reality',
  'Brain fog',
  'Mental exhaustion',
  'Feeling unsafe',
  'Freeze / shutdown',
  'Difficulty relaxing',
  'Chronic stress state',
  'Burnout',
  'Emotional reactivity',
  'Difficulty regulating emotions',
  'Feeling constantly on edge',
  'Other',
];

const COGNITIVE_PATTERNS = [
  'Negative thinking',
  'Self-criticism',
  'Obsessive thoughts',
  'Intrusive thoughts',
  'Difficulty concentrating',
  'Forgetfulness',
  'Lack of clarity',
  'Decision paralysis',
  'Catastrophic thinking',
  'Fear of failure',
  'Fear of rejection',
  'Constant self-doubt',
  'Perfectionism',
  'Low confidence',
  'Other',
];

const BODY_SYMPTOMS = [
  'Chronic fatigue',
  'Low energy',
  'Body pain',
  'Muscle tension',
  'Headaches',
  'Migraines',
  'Digestive problems',
  'IBS symptoms',
  'Chest tightness',
  'Shortness of breath',
  'Heart palpitations',
  'Hormonal imbalance',
  'Sleep issues',
  'Chronic inflammation',
  'Autoimmune symptoms',
  'Dizziness',
  'Appetite changes',
  'Frequent illness',
  'Skin issues',
  'Weight fluctuations',
  'Other',
];

const BEHAVIORAL_PATTERNS = [
  'People pleasing',
  'Avoidance',
  'Isolation',
  'Emotional withdrawal',
  'Overworking',
  'Procrastination',
  'Difficulty setting boundaries',
  'Conflict avoidance',
  'Overeating',
  'Undereating',
  'Emotional eating',
  'Impulsive behavior',
  'Need for control',
  'Difficulty resting',
  'Relationship sabotage',
  'Social withdrawal',
  'Addiction tendencies',
  'Other',
];

const SLEEP_SYMPTOMS = [
  'Difficulty falling asleep',
  'Interrupted sleep',
  'Light sleep',
  'Nightmares',
  'Waking exhausted',
  'Oversleeping',
  'Insomnia',
  'Racing thoughts at night',
  'Early waking',
  'Non-restorative sleep',
  'Other',
];

const LIFE_AREAS = [
  'Emotional wellbeing',
  'Relationships',
  'Marriage',
  'Parenting',
  'Work / Career',
  'Financial wellbeing',
  'Social life',
  'Physical health',
  'Self-esteem',
  'Motivation',
  'Productivity',
  'Sense of purpose',
  'Daily functioning',
  'Spiritual connection',
  'Other',
];

const LIFE_FUNCTIONING = [
  'Relationships',
  'Work / career',
  'Daily functioning',
  'Decision-making',
  'Self-worth',
  'Financial wellbeing',
  'Social life',
  'Physical health',
  'Motivation',
  'Productivity',
  'Sense of purpose',
  'Spiritual connection',
  'Other',
];

const TRIED_PREVIOUSLY = [
  'Therapy',
  'Medication',
  'Coaching',
  'Self-help',
  'Meditation',
  'Holistic treatments',
  'Lifestyle changes',
  'Spiritual practices',
  'Nothing yet',
  'Other',
];

const RELATIONSHIP_STATUSES = [
  'Single',
  'Married',
  'Engaged',
  'Divorced',
  'Widowed',
  'In a Relationship',
];

const DURATION_OPTIONS = [
  { value: 'less_than_6_months', label: 'Less than 6 months' },
  { value: '6_12_months', label: '6-12 months' },
  { value: '1_3_years', label: '1-3 years' },
  { value: '3_5_years', label: '3-5 years' },
  { value: 'more_than_5_years', label: 'More than 5 years' },
];

const FREQUENCY_OPTIONS = ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'];

const RELATIONSHIP_QUALITY = [
  'Loving',
  'Stable',
  'Emotionally Connected',
  'Passionate',
  'Distant',
  'Conflictual',
  'Toxic',
  'Emotionally Exhausting',
  'Unfulfilling',
  'Other',
];

const CHILDREN_RELATIONSHIP = [
  'Very Close',
  'Loving',
  'Healthy',
  'Emotionally Connected',
  'Overwhelming',
  'Conflictual',
  'Withdrawal',
  'Distant',
  'Guilt-Based',
  'Other',
];

const EMPLOYMENT_STATUS = [
  'Full-Time',
  'Part-Time',
  'Business Owner',
  'Freelancer',
  'Unemployed',
  'Student',
];

const WORK_STATE = [
  'Passionate',
  'Motivated',
  'Stressed',
  'Burnt Out',
  'Lost',
  'Financially Pressured',
  'Successful but Empty',
  'Unfulfilled',
  'Inspired',
  'Other',
];

const SOCIAL_LIFE_OPTIONS = [
  'Very Active',
  'Healthy & Balanced',
  'Limited',
  'Isolated',
  'Superficial',
  'Draining',
  'Supportive',
  'Lonely',
  'Other',
];

const SLEEP_STATUS_OPTIONS = [
  'Deep & Restful',
  'Light Sleep',
  'Difficulty Falling Asleep',
  'Interrupted Sleep',
  'Nightmares',
  'Waking Exhausted',
  'Oversleeping',
  'Insomnia',
  'Other',
];

const SLEEP_HOURS_OPTIONS = ['Less than 4', '4-6', '6-8', 'More than 8'];

const PRESENCE_OPTIONS = ['Very Present', 'Mostly Present', 'Inconsistent', 'Emotionally Distant', 'Mostly Absent'];
const PHYSICAL_PRESENCE_OPTIONS = ['Always Present', 'Frequently Present', 'Sometimes Absent', 'Frequently Absent', 'Mostly Absent'];
const FAMILY_SAFETY_OPTIONS = ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'];

const MOTHER_EMOTIONAL_STATE = [
  'Calm',
  'Loving',
  'Anxious',
  'Angry',
  'Depressed',
  'Overwhelmed',
  'Emotionally Unstable',
  'Cold',
  'Highly Protective',
  'Critical',
  'Controlling',
  'Supportive',
  'Emotionally Dependent',
  'Other',
];

const MOTHER_CHARACTERISTICS = [
  'Nurturing',
  'Strong',
  'Soft',
  'Strict',
  'Controlling',
  'Independent',
  'Passive',
  'Affectionate',
  'Sacrificing',
  'Judgmental',
  'Emotionally Sensitive',
  'Distant',
  'Unpredictable',
  'Other',
];

const FATHER_EMOTIONAL_STATE = [
  'Calm',
  'Loving',
  'Angry',
  'Strict',
  'Emotionally Distant',
  'Emotionally Unstable',
  'Aggressive',
  'Passive',
  'Protective',
  'Critical',
  'Supportive',
  'Anxious',
  'Other',
];

const FATHER_CHARACTERISTICS = [
  'Strong',
  'Provider',
  'Strict',
  'Loving',
  'Dominant',
  'Passive',
  'Unpredictable',
  'Emotionally Cold',
  'Wise',
  'Supportive',
  'Critical',
  'Abusive',
  'Other',
];

const PARENT_RELATIONSHIP_OPTIONS = [
  'Loving',
  'Respectful',
  'Distant',
  'Cold',
  'Conflictual',
  'Toxic',
  'Unstable',
  'Emotionally Disconnected',
  'Violent',
  'Supportive Partnership',
  'Separated / Divorced',
  'Other',
];

const FAMILY_RELATIONSHIP_OPTIONS = [
  'Very Close',
  'Healthy',
  'Loving but Complicated',
  'Distant',
  'Conflictual',
  'Fear-Based',
  'Emotionally Dependent',
  'Detached',
  'No Relationship',
  'Other',
];

const SIBLING_RELATIONSHIP_OPTIONS = [
  'Very Close',
  'Supportive',
  'Competitive',
  'Conflictual',
  'Distant',
  'Protective',
  'Emotionally Disconnected',
  'Other',
];

const BIRTH_ORDER_OPTIONS = ['First Born', 'Middle Child', 'Youngest', 'Only Child', 'Twin'];
const SIBLING_GAP_OPTIONS = ['1 year', '2-3 years', '4-6 years', 'More than 6 years'];

const FAMILY_ROLE_OPTIONS = [
  'Responsible One',
  'Peacemaker',
  'Achiever',
  'Invisible One',
  'Caregiver',
  'Rebel',
  'Sensitive One',
  'Problem Solver',
  'Entertainer',
  'Other',
];

const SUBCONSCIOUS_PATTERNS = [
  'Fear of rejection',
  'Fear of abandonment',
  'Fear of failure',
  'Fear of judgment',
  'Fear of intimacy',
  'Hyper-responsibility',
  'Perfectionism',
  'Self-sacrifice',
  'Self-sabotage',
  'People pleasing',
  'Emotional suppression',
  'Need for validation',
  'Chronic guilt',
  'Shame-based identity',
  'Scarcity mindset',
  'Hyper-independence',
  'Emotional dependency',
  'Low self-worth',
  'Survival identity',
  'Difficulty receiving',
  'Chronic insecurity',
  'Inner child wounds',
  'Other',
];

const ATTACHMENT_STYLE_OPTIONS = [
  'Secure',
  'Anxious Attachment',
  'Avoidant Attachment',
  'Fearful Avoidant',
  'Disorganized Attachment',
  'Emotionally Dependent',
  'Detached',
  'Mixed Presentation',
  'Unable to Determine Yet',
];

const ROOT_MECHANISMS = [
  'Childhood emotional neglect',
  'Emotional invalidation',
  'Parentification',
  'Attachment trauma',
  'Chronic criticism',
  'Conditional love',
  'Family conflict exposure',
  'Emotional inconsistency',
  'Abandonment experiences',
  'Loss / grief',
  'Nervous system dysregulation',
  'Chronic stress exposure',
  'Identity suppression',
  'Survival adaptation',
  'Relationship trauma',
  'Emotional enmeshment',
  'Shame conditioning',
  'Fear-based upbringing',
  'Other',
];

const DEFENSE_MECHANISMS = [
  'Dissociation',
  'Emotional suppression',
  'Avoidance',
  'Intellectualization',
  'Hyper-independence',
  'People pleasing',
  'Emotional withdrawal',
  'Perfectionism',
  'Overachievement',
  'Control behaviors',
  'Anger / Reactivity',
  'Denial',
  'Minimization',
  'Numbing',
  'Hyper-productivity',
  'Caretaking tendencies',
  'Passive compliance',
  'Other',
];

const EMOTIONAL_CONGRUENCE_OPTIONS = [
  'Congruent',
  'Partially Congruent',
  'Emotionally Disconnected',
  'Masking / High Functioning',
  'Difficult to Assess',
];

const BODY_LANGUAGE_OPTIONS = [
  'Shallow breathing',
  'Rapid speech',
  'Slow speech',
  'Tearfulness',
  'Flat affect',
  'Avoiding eye contact',
  'Intense eye contact',
  'Fidgeting / restlessness',
  'Muscle tension',
  'Frozen posture',
  'Collapsed posture',
  'Hyper-alert body language',
  'Nervous laughter',
  'Emotional shutdown',
  'Difficulty grounding',
  'Dissociated presentation',
  'Frequent sighing',
  'Agitation',
  'Fatigue / exhaustion visible',
  'Somatic discomfort',
  'Difficulty relaxing',
  'Calm & regulated presentation',
  'Other',
];

const RESISTANCE_PATTERNS = [
  'Intellectualization',
  'Avoidance',
  'Minimizing emotions',
  'Excessive joking / humor',
  'Difficulty accessing emotions',
  'Over-explaining',
  'Defensiveness',
  'Emotional detachment',
  'Fear of vulnerability',
  'Need for control',
  'People pleasing',
  'Perfectionistic presentation',
  'Distrust',
  'Hyper-independence',
  'Resistance to receiving support',
  'Inconsistent engagement',
  'Self-sabotaging tendencies',
  'Shame response',
  'Difficulty slowing down',
  'Dissociation during discussion',
  'No significant resistance observed',
  'Other',
];

const KEY_THEMES = [
  'Fear of abandonment',
  'Fear of rejection',
  'Fear of failure',
  'Fear of judgment',
  'Lack of emotional safety',
  'Suppressed emotions',
  'Chronic stress / survival state',
  'Identity loss',
  'Low self-worth',
  'Perfectionism',
  'Over-responsibility',
  'Emotional neglect history',
  'Need for validation',
  'Difficulty receiving love / support',
  'Hyper-independence',
  'Burnout',
  'Relationship wounds',
  'Childhood trauma',
  'Control patterns',
  'Emotional disconnection',
  'Nervous system dysregulation',
  'Shame patterns',
  'People pleasing',
  'Attachment wounds',
  'Difficulty trusting',
  'Lack of fulfillment / purpose',
  'Inner child wounds',
  'Other',
];

const THERAPEUTIC_PRIORITIES = [
  'Nervous System Stabilization',
  'Emotional Release',
  'Trauma Processing',
  'Identity Reconstruction',
  'Self-Worth Restoration',
  'Attachment Healing',
  'Emotional Regulation',
  'Subconscious Repatterning',
  'Behavioral Transformation',
  'Integration & Stabilization',
  'Other',
];

const SESSION_FREQUENCY_OPTIONS = ['1x Weekly', '2x Weekly', 'Intensive Program', 'Flexible As Needed'];

const PATTERN_TIMELINE_OPTIONS = [
  { value: 'recent_activation', label: 'Recent activation' },
  { value: 'long_standing', label: 'Long-standing pattern' },
  { value: 'lifelong', label: 'Lifelong / early imprint expression' },
  { value: 'unclear', label: 'Unclear' },
];

const PARENTAL_INFLUENCE_OPTIONS = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'both', label: 'Both' },
  { value: 'none', label: 'None / no clear influence' },
  { value: 'other', label: 'Other (specify)' },
];

const CORE_PATTERN_OPTIONS = [
  'Abandonment',
  'Rejection / Not enough',
  'Control / Safety',
  'Suppression / Expression',
  'Other',
];

const CONTRIBUTING_FACTOR_OPTIONS = [
  'Emotional inconsistency',
  'Lack of safety',
  'High pressure / responsibility',
  'Trauma / shock event',
  'Emotional neglect',
  'Other',
];

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium',
  'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria', 'Cambodia',
  'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cuba',
  'Cyprus', 'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Estonia', 'Ethiopia', 'Finland', 'France',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Honduras', 'Hong Kong',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kuwait', 'Latvia', 'Lebanon', 'Libya', 'Lithuania', 'Luxembourg', 'Malaysia',
  'Mexico', 'Moldova', 'Morocco', 'Myanmar', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Nigeria', 'North Korea', 'Norway', 'Oman',
  'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Puerto Rico', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Serbia',
  'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain',
  'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tanzania', 'Thailand', 'Tunisia', 'Turkey', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zimbabwe',
];

const SCORE_LABELS: Record<number, string> = {
  0: 'Not present',
  1: 'Minimal',
  2: 'Very mild',
  3: 'Mild',
  4: 'Mild to moderate',
  5: 'Moderate',
  6: 'Moderate to significant',
  7: 'Significant',
  8: 'Severe',
  9: 'Very severe',
  10: 'Extreme',
};

export default function DiagnosticAssessmentForm({
  clientId,
  therapistId,
  sessionId,
  archivedClientId,
  submitMode = 'normal',
  existingAssessment,
  baselineExists = false,
  clientData,
  onClose,
  onSave,
  isSessionCompleted = false,
  previewMode = false,
}: DiagnosticAssessmentFormProps) {
  const parseMultiValue = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.filter((v) => typeof v === 'string') as string[];
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
    }
    return [];
  };

  const getParentalInfluenceKey = (value: unknown): string => {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!normalized) return '';
    const direct = PARENTAL_INFLUENCE_OPTIONS.find((opt) => opt.value === normalized);
    if (direct) return direct.value;
    const byLabel = PARENTAL_INFLUENCE_OPTIONS.find((opt) => opt.label.toLowerCase() === normalized);
    return byLabel?.value || 'other';
  };

  const isCompleted = existingAssessment?.status === 'completed' || isSessionCompleted;
  const isSubmitted = existingAssessment?.status === 'submitted';
  const isReadOnly = isCompleted || isSubmitted;

  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scorePromptedFields, setScorePromptedFields] = useState<Record<string, boolean>>({
    nervous_system_score: (existingAssessment?.nervous_system_score ?? 0) > 0,
    emotional_state_score: (existingAssessment?.emotional_state_score ?? 0) > 0,
    cognitive_patterns_score: (existingAssessment?.cognitive_patterns_score ?? 0) > 0,
    body_symptoms_score: (existingAssessment?.body_symptoms_score ?? 0) > 0,
    behavioral_patterns_score: (existingAssessment?.behavioral_patterns_score ?? 0) > 0,
    life_functioning_score: (existingAssessment?.life_functioning_score ?? 0) > 0,
    sleep_symptoms_score: false,
  });
  const [scorePrompt, setScorePrompt] = useState<{
    field: string;
    title: string;
    description: string;
  } | null>(null);

  const [form, setForm] = useState({
    // Basic Information
    client_name: existingAssessment?.client_name ?? clientData?.full_name ?? '',
    date_of_birth: existingAssessment?.date_of_birth ?? '',
    client_email: existingAssessment?.client_email ?? clientData?.email ?? '',
    client_phone: existingAssessment?.client_phone ?? clientData?.phone ?? '',
    client_country: existingAssessment?.client_country ?? clientData?.country ?? '',
    client_occupation: existingAssessment?.client_occupation ?? '',
    relationship_status: existingAssessment?.relationship_status ?? '',
    gender: '',
    nationality: '',
    assessment_date: new Date().toISOString().split('T')[0],
    therapist_name: '',

    // Main Concerns
    main_complaint: existingAssessment?.main_complaint ?? '',
    current_symptoms: parseMultiValue(existingAssessment?.current_symptoms),
    current_symptoms_other: existingAssessment?.current_symptoms_other ?? '',
    affected_life_areas: [] as string[],
    affected_life_areas_other: '',
    symptom_duration: '',
    life_impact: '',
    biggest_goal: '',
    transformation_vision: '',
    tried_previously: [] as string[],
    tried_previously_other: '',
    current_experience_words: '',

    // Previous Therapy
    previous_therapy: existingAssessment?.previous_therapy ?? false,
    previous_therapy_details: existingAssessment?.previous_therapy_details ?? '',

    // Symptoms - Nervous System
    nervous_system_pattern: existingAssessment?.nervous_system_pattern ?? '',
    nervous_system_symptoms: [] as string[],
    nervous_system_symptoms_other: '',
    nervous_system_score: existingAssessment?.nervous_system_score ?? 0,

    // Symptoms - Emotional State
    emotional_patterns: parseMultiValue(existingAssessment?.emotional_patterns),
    emotional_patterns_other: '',
    emotional_state_score: existingAssessment?.emotional_state_score ?? 0,

    // Symptoms - Cognitive Patterns
    cognitive_patterns: parseMultiValue(existingAssessment?.cognitive_patterns),
    cognitive_patterns_other: '',
    cognitive_patterns_score: existingAssessment?.cognitive_patterns_score ?? 0,

    // Symptoms - Body Symptoms
    body_symptoms: parseMultiValue(existingAssessment?.body_symptoms),
    health_condition_specify: existingAssessment?.health_condition_specify ?? '',
    body_symptoms_other: '',
    body_symptoms_score: existingAssessment?.body_symptoms_score ?? 0,

    // Symptoms - Behavioral Patterns
    behavioral_patterns: parseMultiValue(existingAssessment?.behavioral_patterns),
    behavioral_patterns_other: '',
    behavioral_patterns_score: existingAssessment?.behavioral_patterns_score ?? 0,

    // Symptoms - Sleep
    sleep_symptoms: [] as string[],
    sleep_symptoms_other: '',
    sleep_symptoms_score: 0,

    // Symptoms - Life Functioning
    life_functioning_patterns: parseMultiValue(existingAssessment?.life_functioning_patterns),
    life_functioning_patterns_other: '',
    life_functioning_score: existingAssessment?.life_functioning_score ?? 0,

    // Life Status & Functional Assessment
    relationship_quality: [] as string[],
    relationship_emotional_safety: '',
    relationship_challenges: '',
    relationship_fulfillment_score: 0,
    has_children: '',
    children_relationship: [] as string[],
    children_relationship_other: '',
    parenting_fulfillment_score: 0,
    employment_status: '',
    work_fulfillment_score: 0,
    work_state: [] as string[],
    work_state_other: '',
    social_life: [] as string[],
    social_life_other: '',
    feel_understood: '',
    sleep_description: [] as string[],
    sleep_description_other: '',
    average_sleep_hours: '',

    // Root Cause Analysis
    root_cause_pattern_timeline: existingAssessment?.root_cause_pattern_timeline ?? '',
    root_cause_parental_influence: getParentalInfluenceKey(existingAssessment?.root_cause_parental_influence),
    root_cause_parental_influence_other: existingAssessment?.root_cause_parental_influence_other ?? '',
    root_cause_core_patterns: parseMultiValue(existingAssessment?.root_cause_core_patterns),
    root_cause_core_patterns_other: existingAssessment?.root_cause_core_patterns_other ?? '',
    root_cause_contributing_factors: parseMultiValue(existingAssessment?.root_cause_contributing_factors),
    root_cause_contributing_factors_other: existingAssessment?.root_cause_contributing_factors_other ?? '',
    mother_emotional_presence: '',
    mother_physical_presence: '',
    mother_emotional_state: [] as string[],
    mother_characteristics: [] as string[],
    mother_relationship: '',
    mother_emotional_safety: '',
    mother_longing: '',
    father_emotional_presence: '',
    father_physical_presence: '',
    father_emotional_state: [] as string[],
    father_characteristics: [] as string[],
    father_relationship: '',
    father_emotional_safety: '',
    father_longing: '',
    parents_relationship: '',
    parents_relationship_impact: '',
    birth_order: '',
    number_of_siblings: '',
    sibling_age_gap: '',
    sibling_relationship: [] as string[],
    family_role: [] as string[],

    // Clinical Summary
    clinical_condition_brief: existingAssessment?.clinical_condition_brief ?? '',
    therapist_focus: existingAssessment?.therapist_focus ?? '',
    therapy_goal: existingAssessment?.therapy_goal ?? '',
    predominant_nervous_system_state: '',
    predominant_emotional_state: '',
    subconscious_patterns: [] as string[],
    attachment_style_indicators: [] as string[],
    possible_root_mechanisms: [] as string[],
    defense_mechanisms: [] as string[],
    general_presentation_notes: '',
    emotional_congruence: '',
    body_language: [] as string[],
    body_language_notes: '',
    resistance_patterns: [] as string[],
    resistance_notes: '',
    key_themes: [] as string[],
    clinical_insights: '',
    therapeutic_priority: [] as string[],
    recommended_session_frequency: '',
    additional_recommendations: '',
  });

  useEffect(() => {
    if (isReadOnly) return;
    if (!clientData) return;
    setForm((prev) => ({
      ...prev,
      client_name: prev.client_name || clientData.full_name || '',
      client_email: prev.client_email || clientData.email || '',
      client_phone: prev.client_phone || clientData.phone || '',
      client_country: prev.client_country || clientData.country || '',
    }));
  }, [
    isReadOnly,
    clientData?.full_name,
    clientData?.email,
    clientData?.phone,
    clientData?.country,
  ]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openScorePrompt = (field: string, title: string, description: string) => {
    if (isReadOnly) return;
    if (scorePromptedFields[field]) return;
    setScorePromptedFields((prev) => ({ ...prev, [field]: true }));
    setScorePrompt({ field, title, description });
  };

  const toggleArrayItem = (field: string, item: string) => {
    setForm(prev => {
      const arr = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item],
      };
    });
  };

  const joinList = (value: string[] | string | undefined | null): string => {
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    return value || '';
  };

  const buildLines = (entries: Array<[string, string | number | boolean | string[] | null | undefined]>): string => {
    return entries
      .map(([label, value]) => {
        const normalized = Array.isArray(value) ? joinList(value) : value;
        if (normalized === undefined || normalized === null || normalized === '' || normalized === false) return '';
        return `${label}: ${normalized}`;
      })
      .filter(Boolean)
      .join('\n');
  };

  const appendSection = (base: string, title: string, details: string): string => {
    if (!details) return base || '';
    return [base, `\n[${title}]`, details].filter(Boolean).join('\n');
  };

  const goalReadinessScore = form.nervous_system_score + form.emotional_state_score +
    form.cognitive_patterns_score + form.body_symptoms_score +
    form.behavioral_patterns_score + form.life_functioning_score;

  const handleSave = async () => {
    if (!form.main_complaint) {
      setError('Main complaint is required');
      return;
    }
    if (!form.client_name) {
      setError('Full name is required');
      return;
    }
    if (!form.date_of_birth) {
      setError('Date of birth is required');
      return;
    }
    if (!form.client_email) {
      setError('Email is required');
      return;
    }
    if (!form.client_phone) {
      setError('Phone is required');
      return;
    }
    if (form.current_symptoms.length === 0) {
      setError('At least one current symptom is required');
      return;
    }
    if (submitMode === 'archive' && !archivedClientId) {
      setError('Archived client id is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Serialize structured root cause fields as text for DB compatibility
      const rootCauseTimeline = form.symptom_duration || form.root_cause_pattern_timeline || null;
      const rootCauseParental = form.root_cause_parental_influence === 'other'
        ? (form.root_cause_parental_influence_other || 'Other')
        : (PARENTAL_INFLUENCE_OPTIONS.find(o => o.value === form.root_cause_parental_influence)?.label || form.root_cause_parental_influence || null);
      const rootCauseCore = Array.isArray(form.root_cause_core_patterns)
        ? form.root_cause_core_patterns.map(p => p === 'Other' && form.root_cause_core_patterns_other ? `Other: ${form.root_cause_core_patterns_other}` : p).join(', ')
        : form.root_cause_core_patterns || null;
      const rootCauseContributingBase = Array.isArray(form.root_cause_contributing_factors)
        ? form.root_cause_contributing_factors.map(f => f === 'Other' && form.root_cause_contributing_factors_other ? `Other: ${form.root_cause_contributing_factors_other}` : f).join(', ')
        : form.root_cause_contributing_factors || null;
      const lifeDetails = buildLines([
        ['Gender', form.gender],
        ['Nationality', form.nationality],
        ['Assessment date', form.assessment_date],
        ['Therapist name', form.therapist_name],
        ['Affected life areas', form.affected_life_areas],
        ['Affected life areas other', form.affected_life_areas_other],
        ['Duration', form.symptom_duration],
        ['Life impact', form.life_impact],
        ['Current experience in client words', form.current_experience_words],
        ['Relationship quality', form.relationship_quality],
        ['Relationship emotional safety', form.relationship_emotional_safety],
        ['Relationship challenges', form.relationship_challenges],
        ['Relationship fulfillment score', form.relationship_fulfillment_score],
        ['Has children', form.has_children],
        ['Children relationship', form.children_relationship],
        ['Children relationship other', form.children_relationship_other],
        ['Parenting fulfillment score', form.parenting_fulfillment_score],
        ['Employment status', form.employment_status],
        ['Work fulfillment score', form.work_fulfillment_score],
        ['Work state', form.work_state],
        ['Work state other', form.work_state_other],
        ['Social life', form.social_life],
        ['Social life other', form.social_life_other],
        ['Feels understood by others', form.feel_understood],
        ['Sleep description', form.sleep_description],
        ['Sleep description other', form.sleep_description_other],
        ['Average sleep hours', form.average_sleep_hours],
      ]);
      const familyDetails = buildLines([
        ['Mother emotional presence', form.mother_emotional_presence],
        ['Mother physical presence', form.mother_physical_presence],
        ['Mother emotional state', form.mother_emotional_state],
        ['Mother characteristics', form.mother_characteristics],
        ['Mother relationship', form.mother_relationship],
        ['Mother emotional safety', form.mother_emotional_safety],
        ['Longing from mother', form.mother_longing],
        ['Father emotional presence', form.father_emotional_presence],
        ['Father physical presence', form.father_physical_presence],
        ['Father emotional state', form.father_emotional_state],
        ['Father characteristics', form.father_characteristics],
        ['Father relationship', form.father_relationship],
        ['Father emotional safety', form.father_emotional_safety],
        ['Longing from father', form.father_longing],
        ['Relationship between parents', form.parents_relationship],
        ['Impact of parents relationship', form.parents_relationship_impact],
        ['Birth order', form.birth_order],
        ['Number of siblings', form.number_of_siblings],
        ['Sibling age gap', form.sibling_age_gap],
        ['Sibling relationship', form.sibling_relationship],
        ['Childhood family role', form.family_role],
      ]);
      const symptomDetails = buildLines([
        ['Nervous system symptoms', form.nervous_system_symptoms],
        ['Nervous system symptoms other', form.nervous_system_symptoms_other],
        ['Emotional symptoms other', form.emotional_patterns_other],
        ['Cognitive symptoms other', form.cognitive_patterns_other],
        ['Behavioral symptoms other', form.behavioral_patterns_other],
        ['Physical symptoms other', form.body_symptoms_other],
        ['Sleep symptoms', form.sleep_symptoms],
        ['Sleep symptoms other', form.sleep_symptoms_other],
        ['Sleep severity score', form.sleep_symptoms_score],
        ['Tried previously', form.tried_previously],
        ['Tried previously other', form.tried_previously_other],
      ]);
      const clinicalPatternDetails = buildLines([
        ['Predominant nervous system state', form.predominant_nervous_system_state],
        ['Predominant emotional state', form.predominant_emotional_state],
        ['Subconscious patterns', form.subconscious_patterns],
        ['Attachment style indicators', form.attachment_style_indicators],
        ['Possible root mechanisms', form.possible_root_mechanisms],
        ['Defense mechanisms observed', form.defense_mechanisms],
        ['General presentation notes', form.general_presentation_notes],
        ['Emotional congruence', form.emotional_congruence],
        ['Body language / somatic presentation', form.body_language],
        ['Body language notes', form.body_language_notes],
        ['Resistance patterns', form.resistance_patterns],
        ['Resistance notes', form.resistance_notes],
        ['Key themes emerging', form.key_themes],
        ['Additional themes / clinical insights', form.clinical_insights],
      ]);
      const therapyGoalDetails = buildLines([
        ['Biggest goal or desire', form.biggest_goal],
        ['Transformed life vision', form.transformation_vision],
        ['Current therapeutic priority', form.therapeutic_priority],
        ['Recommended session frequency', form.recommended_session_frequency],
        ['Additional notes / recommendations', form.additional_recommendations],
      ]);
      const rootCauseContributing = appendSection(rootCauseContributingBase || '', 'Family System Assessment', familyDetails) || null;
      const previousTherapyDetails = appendSection(
        form.previous_therapy_details,
        'Previous Attempts',
        buildLines([
          ['Tried previously', form.tried_previously],
          ['Other previous attempts', form.tried_previously_other],
        ])
      );

      const normalizedData = {
        ...form,
        previous_therapy: form.previous_therapy || form.tried_previously.includes('Therapy'),
        previous_therapy_details: previousTherapyDetails || null,
        emotional_patterns: form.emotional_patterns.map((p) => p === 'Other' && form.emotional_patterns_other ? `Other: ${form.emotional_patterns_other}` : p),
        cognitive_patterns: form.cognitive_patterns.map((p) => p === 'Other' && form.cognitive_patterns_other ? `Other: ${form.cognitive_patterns_other}` : p),
        body_symptoms: [
          ...form.body_symptoms.map((p) => p === 'Other' && form.body_symptoms_other ? `Other: ${form.body_symptoms_other}` : p),
          ...form.sleep_symptoms.map((p) => `Sleep: ${p === 'Other' && form.sleep_symptoms_other ? form.sleep_symptoms_other : p}`),
        ],
        behavioral_patterns: form.behavioral_patterns.map((p) => p === 'Other' && form.behavioral_patterns_other ? `Other: ${form.behavioral_patterns_other}` : p),
        life_functioning_patterns: [
          ...form.life_functioning_patterns.map((p) => p === 'Other' && form.life_functioning_patterns_other ? `Other: ${form.life_functioning_patterns_other}` : p),
          ...form.affected_life_areas.map((p) => `Affected: ${p === 'Other' && form.affected_life_areas_other ? form.affected_life_areas_other : p}`),
        ],
        root_cause_pattern_timeline: rootCauseTimeline,
        root_cause_parental_influence: rootCauseParental,
        root_cause_core_patterns: rootCauseCore,
        root_cause_contributing_factors: rootCauseContributing,
        clinical_condition_brief: appendSection(
          appendSection(form.clinical_condition_brief, 'Life Status & Functional Assessment', lifeDetails),
          'Symptoms & Previous Attempts',
          symptomDetails
        ),
        therapist_focus: appendSection(form.therapist_focus, 'Clinical Summary / Therapist Observation', clinicalPatternDetails),
        therapy_goal: appendSection(form.therapy_goal, 'Desired Outcomes & Recommendations', therapyGoalDetails),
        assessed_at: new Date().toISOString(),
        status: 'submitted',
      };

      if (previewMode) {
        onSave(normalizedData);
        return;
      }

      const payload = submitMode === 'archive'
        ? {
            archivedClientId,
            therapistId,
            data: {
              ...normalizedData,
              assessment_date: new Date().toISOString().split('T')[0],
            },
          }
        : {
            clientId: clientId || null,
            therapistId,
            sessionId,
            data: normalizedData,
          };

      console.log('[DiagnosticAssessmentForm] Submitting payload:', JSON.stringify(payload, null, 2));

      const endpoint = submitMode === 'archive'
        ? '/api/archive/assessments'
        : '/api/assessments/diagnostic';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned an invalid response');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save assessment');
      }

      onSave(submitMode === 'archive' ? data.assessment : data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { title: 'Basic Information', shortTitle: 'Info' },
    { title: 'Main Concerns', shortTitle: 'Concerns' },
    { title: 'Symptoms', shortTitle: 'Symptoms' },
    { title: 'Life Status', shortTitle: 'Life' },
    { title: 'Root Cause', shortTitle: 'Root Cause' },
    { title: 'Clinical Summary', shortTitle: 'Summary' },
  ];

  const ScoreSlider = ({ label, field, value, disabled = false }: { label: string; field: string; value: number; disabled?: boolean }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-bold text-indigo-600">{value}/10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => updateField(field, parseInt(e.target.value))}
        disabled={disabled}
        className={`w-full h-2 bg-slate-200 rounded-lg appearance-none accent-indigo-600 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      />
      <p className="text-xs text-slate-500">{SCORE_LABELS[value]}</p>
    </div>
  );

  const quickScoreOptions = [0, 3, 5, 7, 10];

  const PatternCheckbox = ({
    options,
    field,
    disabled = false,
    maxSelect,
    onSelectNew,
  }: {
    options: string[];
    field: string;
    disabled?: boolean;
    maxSelect?: number;
    onSelectNew?: () => void;
  }) => (
    <div className="grid grid-cols-2 gap-2">
      {options.map(option => {
        const selectedArr = form[field as keyof typeof form] as string[];
        const selected = selectedArr.includes(option);
        const atLimit = maxSelect ? selectedArr.length >= maxSelect && !selected : false;
        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (disabled || atLimit) return;
              toggleArrayItem(field, option);
              if (!selected) onSelectNew?.();
            }}
            disabled={disabled || atLimit}
            className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
              selected
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                : disabled
                ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                : atLimit
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {selected ? '✓ ' : ''}{option}
          </button>
        );
      })}
    </div>
  );

  const SingleSelect = ({
    options,
    field,
    disabled = false,
    onSelectNew,
  }: {
    options: { value: string; label: string }[];
    field: string;
    disabled?: boolean;
    onSelectNew?: () => void;
  }) => (
    <div className="grid grid-cols-2 gap-2">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            if (disabled) return;
            const current = form[field as keyof typeof form];
            updateField(field, option.value);
            if (current !== option.value) onSelectNew?.();
          }}
          disabled={disabled}
          className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
            form[field as keyof typeof form] === option.value
              ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
              : disabled
              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  const StringSingleSelect = ({
    options,
    field,
    disabled = false,
  }: {
    options: string[];
    field: string;
    disabled?: boolean;
  }) => (
    <div className="grid grid-cols-2 gap-2">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => !disabled && updateField(field, option)}
          disabled={disabled}
          className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
            form[field as keyof typeof form] === option
              ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
              : disabled
              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900">
                  {isCompleted ? 'Diagnostic Assessment (Locked)' : 'Diagnostic Assessment'}
                </h2>
                {isCompleted && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Locked
                  </span>
                )}
                {existingAssessment?.status === 'submitted' && !isCompleted && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                    Submitted
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {isCompleted
                  ? 'This assessment has been locked after session completion.'
                  : existingAssessment?.is_baseline
                  ? 'Editing baseline assessment'
                  : 'New baseline assessment'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Goal Distance</p>
              <p className="text-2xl font-bold text-indigo-600">{goalReadinessScore}/60</p>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {sections.map((section, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSection(idx)}
                className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === idx
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="hidden sm:inline">{section.title}</span>
                <span className="sm:hidden">{section.shortTitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Section 0: Basic Information */}
          {activeSection === 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => updateField('client_name', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => updateField('date_of_birth', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.client_email}
                    onChange={(e) => updateField('client_email', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={form.client_phone}
                    onChange={(e) => updateField('client_phone', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <select
                    value={form.client_country}
                    onChange={(e) => updateField('client_country', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={form.client_occupation}
                    onChange={(e) => updateField('client_occupation', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <input
                    type="text"
                    value={form.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={form.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Assessment</label>
                  <input
                    type="date"
                    value={form.assessment_date}
                    onChange={(e) => updateField('assessment_date', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Therapist Name</label>
                  <input
                    type="text"
                    value={form.therapist_name}
                    onChange={(e) => updateField('therapist_name', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship Status</label>
                <select
                  value={form.relationship_status}
                  onChange={(e) => updateField('relationship_status', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select...</option>
                  {RELATIONSHIP_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Section 1: Main Concerns */}
          {activeSection === 1 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Main Concerns</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">What is your main current concern or challenge? *</label>
                <textarea
                  value={form.main_complaint}
                  onChange={(e) => updateField('main_complaint', e.target.value)}
                  rows={4}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Describe the primary reason for seeking support..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What are the main areas of your life currently affected?</label>
                <PatternCheckbox options={LIFE_AREAS} field="affected_life_areas" disabled={isReadOnly} />
                {form.affected_life_areas.includes('Other') && (
                  <input
                    type="text"
                    value={form.affected_life_areas_other}
                    onChange={(e) => updateField('affected_life_areas_other', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Please specify other affected areas..."
                    className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">How long have you been experiencing this?</label>
                <SingleSelect options={DURATION_OPTIONS} field="symptom_duration" disabled={isReadOnly} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">What impact has this had on your life?</label>
                <textarea
                  value={form.life_impact}
                  onChange={(e) => updateField('life_impact', e.target.value)}
                  rows={3}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">What is your biggest goal or desire?</label>
                  <textarea
                    value={form.biggest_goal}
                    onChange={(e) => updateField('biggest_goal', e.target.value)}
                    rows={3}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">If your life transformed completely, what would that look like?</label>
                  <textarea
                    value={form.transformation_vision}
                    onChange={(e) => updateField('transformation_vision', e.target.value)}
                    rows={3}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Symptoms * (select all that apply)</label>
                <PatternCheckbox options={CURRENT_SYMPTOM_OPTIONS} field="current_symptoms" disabled={isReadOnly} />
                {form.current_symptoms.includes('Other') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={form.current_symptoms_other}
                      onChange={(e) => updateField('current_symptoms_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify other symptoms..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What have you tried previously to address these symptoms?</label>
                <PatternCheckbox options={TRIED_PREVIOUSLY} field="tried_previously" disabled={isReadOnly} />
                {form.tried_previously.includes('Other') && (
                  <input
                    type="text"
                    value={form.tried_previously_other}
                    onChange={(e) => updateField('tried_previously_other', e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Please specify..."
                    className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Briefly describe your current experience in your own words</label>
                <textarea
                  value={form.current_experience_words}
                  onChange={(e) => updateField('current_experience_words', e.target.value)}
                  rows={3}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-medium text-slate-900 mb-3">Previous Therapy</h4>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => !isReadOnly && updateField('previous_therapy', !form.previous_therapy)}
                    disabled={isReadOnly}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      form.previous_therapy ? 'bg-indigo-600' : 'bg-slate-200'
                    } ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        form.previous_therapy ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-700">Has previous therapy experience</span>
                </div>
                {form.previous_therapy && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Previous Therapy Details</label>
                    <textarea
                      value={form.previous_therapy_details}
                      onChange={(e) => updateField('previous_therapy_details', e.target.value)}
                      rows={4}
                      disabled={isReadOnly}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                      placeholder="Describe previous therapy experience, types, duration, outcomes..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Symptoms */}
          {activeSection === 2 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Symptoms Assessment</h3>

              {/* 1. Nervous System */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.nervous_system_pattern || form.nervous_system_symptoms.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">1. Nervous System</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Observed Pattern</label>
                  <SingleSelect
                    options={NERVOUS_SYSTEM_PATTERNS}
                    field="nervous_system_pattern"
                    disabled={isReadOnly}
                    onSelectNew={() =>
                      openScorePrompt(
                        'nervous_system_score',
                        'Nervous System Score',
                        'You selected a nervous system pattern. Set the severity now.'
                      )
                    }
                  />
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nervous System Symptoms</label>
                    <PatternCheckbox
                      options={NERVOUS_SYSTEM_SYMPTOMS}
                      field="nervous_system_symptoms"
                      disabled={isReadOnly}
                      onSelectNew={() =>
                        openScorePrompt(
                          'nervous_system_score',
                          'Nervous System Score',
                          'You selected a nervous system symptom. Set the severity now.'
                        )
                      }
                    />
                    {form.nervous_system_symptoms.includes('Other') && (
                      <input
                        type="text"
                        value={form.nervous_system_symptoms_other}
                        onChange={(e) => updateField('nervous_system_symptoms_other', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="Please specify..."
                        className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    )}
                  </div>
                </div>
                {(form.nervous_system_pattern || form.nervous_system_symptoms.length > 0) && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How dysregulated is the client most of the time?"
                      field="nervous_system_score"
                      value={form.nervous_system_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 2. Emotional State */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.emotional_patterns.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">2. Emotional Symptoms</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Emotional Symptoms</label>
                  <PatternCheckbox
                    options={EMOTIONAL_PATTERNS}
                    field="emotional_patterns"
                    disabled={isReadOnly}
                    onSelectNew={() =>
                      openScorePrompt(
                        'emotional_state_score',
                        'Emotional State Score',
                        'You selected an emotional pattern. Set the severity now.'
                      )
                    }
                  />
                  {form.emotional_patterns.includes('Other') && (
                    <input
                      type="text"
                      value={form.emotional_patterns_other}
                      onChange={(e) => updateField('emotional_patterns_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify..."
                      className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  )}
                </div>
                {form.emotional_patterns.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How much do emotions overwhelm or limit the client?"
                      field="emotional_state_score"
                      value={form.emotional_state_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 3. Cognitive Patterns */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.cognitive_patterns.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">3. Cognitive Symptoms</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cognitive Symptoms</label>
                  <PatternCheckbox
                    options={COGNITIVE_PATTERNS}
                    field="cognitive_patterns"
                    disabled={isReadOnly}
                    onSelectNew={() =>
                      openScorePrompt(
                        'cognitive_patterns_score',
                        'Cognitive Patterns Score',
                        'You selected a cognitive pattern. Set the severity now.'
                      )
                    }
                  />
                  {form.cognitive_patterns.includes('Other') && (
                    <input
                      type="text"
                      value={form.cognitive_patterns_other}
                      onChange={(e) => updateField('cognitive_patterns_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify..."
                      className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  )}
                </div>
                {form.cognitive_patterns.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How much are thoughts repetitive or uncontrollable?"
                      field="cognitive_patterns_score"
                      value={form.cognitive_patterns_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 4. Body Symptoms */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.body_symptoms.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">4. Physical Symptoms</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Physical Symptoms</label>
                  <PatternCheckbox
                    options={BODY_SYMPTOMS}
                    field="body_symptoms"
                    disabled={isReadOnly}
                    onSelectNew={() =>
                      openScorePrompt(
                        'body_symptoms_score',
                        'Body Symptoms Score',
                        'You selected a body symptom. Set the severity now.'
                      )
                    }
                  />
                  {form.body_symptoms.includes('Other') && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={form.body_symptoms_other}
                        onChange={(e) => updateField('body_symptoms_other', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="Please specify..."
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                  )}
                </div>
                {form.body_symptoms.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How much do physical symptoms affect the client?"
                      field="body_symptoms_score"
                      value={form.body_symptoms_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 5. Behavioral Patterns */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.behavioral_patterns.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">5. Behavioral Symptoms</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Behavioral Symptoms</label>
                  <PatternCheckbox
                    options={BEHAVIORAL_PATTERNS}
                    field="behavioral_patterns"
                    disabled={isReadOnly}
                    onSelectNew={() =>
                      openScorePrompt(
                        'behavioral_patterns_score',
                        'Behavioral Patterns Score',
                        'You selected a behavioral pattern. Set the severity now.'
                      )
                    }
                  />
                  {form.behavioral_patterns.includes('Other') && (
                    <input
                      type="text"
                      value={form.behavioral_patterns_other}
                      onChange={(e) => updateField('behavioral_patterns_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify..."
                      className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  )}
                </div>
                {form.behavioral_patterns.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How much are behaviors driven by these patterns?"
                      field="behavioral_patterns_score"
                      value={form.behavioral_patterns_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 6. Sleep Symptoms */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.sleep_symptoms.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">6. Sleep Symptoms</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sleep Symptoms</label>
                  <PatternCheckbox
                    options={SLEEP_SYMPTOMS}
                    field="sleep_symptoms"
                    disabled={isReadOnly}
                    onSelectNew={() =>
                      openScorePrompt(
                        'sleep_symptoms_score',
                        'Sleep Symptoms Score',
                        'You selected a sleep symptom. Set the severity now.'
                      )
                    }
                  />
                  {form.sleep_symptoms.includes('Other') && (
                    <input
                      type="text"
                      value={form.sleep_symptoms_other}
                      onChange={(e) => updateField('sleep_symptoms_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify..."
                      className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  )}
                </div>
                {form.sleep_symptoms.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity - How much do sleep symptoms affect the client?"
                      field="sleep_symptoms_score"
                      value={form.sleep_symptoms_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 7. Life Functioning */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.life_functioning_patterns.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">7. Life Functioning</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Impact Areas</label>
                  <PatternCheckbox
                    options={LIFE_FUNCTIONING}
                    field="life_functioning_patterns"
                    disabled={isReadOnly}
                    onSelectNew={() =>
                      openScorePrompt(
                        'life_functioning_score',
                        'Life Functioning Score',
                        'You selected a life-impact pattern. Set the severity now.'
                      )
                    }
                  />
                  {form.life_functioning_patterns.includes('Other') && (
                    <input
                      type="text"
                      value={form.life_functioning_patterns_other}
                      onChange={(e) => updateField('life_functioning_patterns_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify..."
                      className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  )}
                </div>
                {form.life_functioning_patterns.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How much is the client's life impacted overall?"
                      field="life_functioning_score"
                      value={form.life_functioning_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* Baseline Score Summary */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-3">Baseline Score</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>Nervous System:</span>
                    <span className="font-medium">{form.nervous_system_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emotional:</span>
                    <span className="font-medium">{form.emotional_state_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cognitive:</span>
                    <span className="font-medium">{form.cognitive_patterns_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Physical:</span>
                    <span className="font-medium">{form.body_symptoms_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Behavioral:</span>
                    <span className="font-medium">{form.behavioral_patterns_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Life Functioning:</span>
                    <span className="font-medium">{form.life_functioning_score}/10</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between font-semibold">
                  <span>Goal Distance:</span>
                  <span className="text-indigo-600">{goalReadinessScore}/60</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Life Status & Functional Assessment */}
          {activeSection === 3 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Life Status & Functional Assessment</h3>

              <div className="border border-slate-200 rounded-lg p-4 space-y-5">
                <h4 className="font-medium text-slate-900">Relationship & Attachment Status</h4>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">How would you describe your relationship with your partner?</label>
                  <PatternCheckbox options={RELATIONSHIP_QUALITY} field="relationship_quality" disabled={isReadOnly} maxSelect={1} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Do you feel emotionally safe in your relationship status?</label>
                  <StringSingleSelect options={FREQUENCY_OPTIONS} field="relationship_emotional_safety" disabled={isReadOnly} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Main challenges in the relationship</label>
                    <textarea
                      value={form.relationship_challenges}
                      onChange={(e) => updateField('relationship_challenges', e.target.value)}
                      rows={3}
                      disabled={isReadOnly}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <ScoreSlider
                    label="Relationship fulfillment"
                    field="relationship_fulfillment_score"
                    value={form.relationship_fulfillment_score}
                    disabled={isReadOnly}
                  />
                </div>

                <h4 className="font-medium text-slate-900 border-t border-slate-100 pt-4">Children & Parenting</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Do you have children?</label>
                    <StringSingleSelect options={['Yes', 'No']} field="has_children" disabled={isReadOnly} />
                  </div>
                  <ScoreSlider
                    label="Parenting fulfillment"
                    field="parenting_fulfillment_score"
                    value={form.parenting_fulfillment_score}
                    disabled={isReadOnly}
                  />
                </div>
                {form.has_children === 'Yes' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">How would you describe your relationship with your children?</label>
                    <PatternCheckbox options={CHILDREN_RELATIONSHIP} field="children_relationship" disabled={isReadOnly} />
                    {form.children_relationship.includes('Other') && (
                      <input
                        type="text"
                        value={form.children_relationship_other}
                        onChange={(e) => updateField('children_relationship_other', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="Please specify..."
                        className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    )}
                  </div>
                )}

                <h4 className="font-medium text-slate-900 border-t border-slate-100 pt-4">Work & Fulfillment</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Employment Status</label>
                    <StringSingleSelect options={EMPLOYMENT_STATUS} field="employment_status" disabled={isReadOnly} />
                  </div>
                  <ScoreSlider
                    label="Work / career fulfillment"
                    field="work_fulfillment_score"
                    value={form.work_fulfillment_score}
                    disabled={isReadOnly}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Which best describes your current work state?</label>
                  <PatternCheckbox options={WORK_STATE} field="work_state" disabled={isReadOnly} />
                  {form.work_state.includes('Other') && (
                    <input
                      type="text"
                      value={form.work_state_other}
                      onChange={(e) => updateField('work_state_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify..."
                      className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  )}
                </div>

                <h4 className="font-medium text-slate-900 border-t border-slate-100 pt-4">Social Life</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">How would you describe your social life?</label>
                  <PatternCheckbox options={SOCIAL_LIFE_OPTIONS} field="social_life" disabled={isReadOnly} />
                  {form.social_life.includes('Other') && (
                    <input
                      type="text"
                      value={form.social_life_other}
                      onChange={(e) => updateField('social_life_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify..."
                      className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Do you feel understood by others?</label>
                  <StringSingleSelect options={FREQUENCY_OPTIONS} field="feel_understood" disabled={isReadOnly} />
                </div>

                <h4 className="font-medium text-slate-900 border-t border-slate-100 pt-4">Sleep & Restoration Status</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">How would you describe your sleep?</label>
                    <PatternCheckbox options={SLEEP_STATUS_OPTIONS} field="sleep_description" disabled={isReadOnly} />
                    {form.sleep_description.includes('Other') && (
                      <input
                        type="text"
                        value={form.sleep_description_other}
                        onChange={(e) => updateField('sleep_description_other', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="Please specify..."
                        className="mt-3 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Average sleep hours</label>
                    <StringSingleSelect options={SLEEP_HOURS_OPTIONS} field="average_sleep_hours" disabled={isReadOnly} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Root Cause & Family System Assessment */}
          {activeSection === 4 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Root Cause & Family System Assessment</h3>

              <div className="border border-slate-200 rounded-lg p-4 space-y-5">
                <h4 className="font-medium text-slate-900">Family System Assessment</h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Was your mother emotionally present during childhood?</label>
                    <StringSingleSelect options={PRESENCE_OPTIONS} field="mother_emotional_presence" disabled={isReadOnly} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Was your mother physically present?</label>
                    <StringSingleSelect options={PHYSICAL_PRESENCE_OPTIONS} field="mother_physical_presence" disabled={isReadOnly} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Mother's emotional state</label>
                  <PatternCheckbox options={MOTHER_EMOTIONAL_STATE} field="mother_emotional_state" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Main characteristics of your mother</label>
                  <PatternCheckbox options={MOTHER_CHARACTERISTICS} field="mother_characteristics" disabled={isReadOnly} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Relationship with your mother</label>
                    <StringSingleSelect options={FAMILY_RELATIONSHIP_OPTIONS} field="mother_relationship" disabled={isReadOnly} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Did you feel emotionally safe with your mother?</label>
                    <StringSingleSelect options={FAMILY_SAFETY_OPTIONS} field="mother_emotional_safety" disabled={isReadOnly} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">What did you long for most from your mother?</label>
                  <textarea
                    value={form.mother_longing}
                    onChange={(e) => updateField('mother_longing', e.target.value)}
                    rows={2}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Was your father emotionally present during childhood?</label>
                    <StringSingleSelect options={PRESENCE_OPTIONS} field="father_emotional_presence" disabled={isReadOnly} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Was your father physically present?</label>
                    <StringSingleSelect options={PHYSICAL_PRESENCE_OPTIONS} field="father_physical_presence" disabled={isReadOnly} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Father's emotional state</label>
                  <PatternCheckbox options={FATHER_EMOTIONAL_STATE} field="father_emotional_state" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Main characteristics of your father</label>
                  <PatternCheckbox options={FATHER_CHARACTERISTICS} field="father_characteristics" disabled={isReadOnly} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Relationship with your father</label>
                    <StringSingleSelect options={FAMILY_RELATIONSHIP_OPTIONS} field="father_relationship" disabled={isReadOnly} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Did you feel emotionally safe with your father?</label>
                    <StringSingleSelect options={FAMILY_SAFETY_OPTIONS} field="father_emotional_safety" disabled={isReadOnly} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">What did you long for most from your father?</label>
                  <textarea
                    value={form.father_longing}
                    onChange={(e) => updateField('father_longing', e.target.value)}
                    rows={2}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Relationship between mother and father</label>
                    <StringSingleSelect options={PARENT_RELATIONSHIP_OPTIONS} field="parents_relationship" disabled={isReadOnly} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">As a child, how did their relationship affect you?</label>
                    <textarea
                      value={form.parents_relationship_impact}
                      onChange={(e) => updateField('parents_relationship_impact', e.target.value)}
                      rows={2}
                      disabled={isReadOnly}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Birth Order</label>
                      <StringSingleSelect options={BIRTH_ORDER_OPTIONS} field="birth_order" disabled={isReadOnly} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Number of Siblings</label>
                      <input
                        type="text"
                        value={form.number_of_siblings}
                        onChange={(e) => updateField('number_of_siblings', e.target.value)}
                        disabled={isReadOnly}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Closest sibling age gap</label>
                      <StringSingleSelect options={SIBLING_GAP_OPTIONS} field="sibling_age_gap" disabled={isReadOnly} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Childhood relationship with siblings</label>
                    <PatternCheckbox options={SIBLING_RELATIONSHIP_OPTIONS} field="sibling_relationship" disabled={isReadOnly} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role mostly played in the family</label>
                    <PatternCheckbox options={FAMILY_ROLE_OPTIONS} field="family_role" disabled={isReadOnly} />
                  </div>
                </div>
              </div>

              {/* 1. Pattern Expression Timeline */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  1. Pattern Expression Timeline — "How long have you been aware of this pattern or experiencing its effects?"
                </label>
                <SingleSelect options={PATTERN_TIMELINE_OPTIONS} field="root_cause_pattern_timeline" disabled={isReadOnly} />
              </div>

              {/* 2. Dominant Parental Influence */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">2. Dominant Parental Influence</label>
                <SingleSelect options={PARENTAL_INFLUENCE_OPTIONS} field="root_cause_parental_influence" disabled={isReadOnly} />
                {form.root_cause_parental_influence === 'other' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={form.root_cause_parental_influence_other}
                      onChange={(e) => updateField('root_cause_parental_influence_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                )}
              </div>

              {/* 3. Core Pattern */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">3. Core Pattern (select top 1-2)</label>
                <PatternCheckbox options={CORE_PATTERN_OPTIONS} field="root_cause_core_patterns" disabled={isReadOnly} maxSelect={2} />
                {form.root_cause_core_patterns.includes('Other') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={form.root_cause_core_patterns_other}
                      onChange={(e) => updateField('root_cause_core_patterns_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify other core pattern..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                )}
              </div>

              {/* 4. Key Contributing Factors */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">4. Key Contributing Factors</label>
                <PatternCheckbox options={CONTRIBUTING_FACTOR_OPTIONS} field="root_cause_contributing_factors" disabled={isReadOnly} />
                {form.root_cause_contributing_factors.includes('Other') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={form.root_cause_contributing_factors_other}
                      onChange={(e) => updateField('root_cause_contributing_factors_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify other contributing factors..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Clinical Summary */}
          {activeSection === 5 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Clinical Summary</h3>
              <div className="border border-slate-200 rounded-lg p-4 space-y-5">
                <h4 className="font-medium text-slate-900">Clinical Presentation</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Predominant Nervous System Presentation</label>
                    <input
                      type="text"
                      value={form.predominant_nervous_system_state}
                      onChange={(e) => updateField('predominant_nervous_system_state', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Predominant Emotional State</label>
                    <input
                      type="text"
                      value={form.predominant_emotional_state}
                      onChange={(e) => updateField('predominant_emotional_state', e.target.value)}
                      disabled={isReadOnly}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subconscious Patterns Identified</label>
                  <PatternCheckbox options={SUBCONSCIOUS_PATTERNS} field="subconscious_patterns" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Attachment Style Indicators</label>
                  <PatternCheckbox options={ATTACHMENT_STYLE_OPTIONS} field="attachment_style_indicators" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Possible Root Mechanisms</label>
                  <PatternCheckbox options={ROOT_MECHANISMS} field="possible_root_mechanisms" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Defense Mechanisms Observed</label>
                  <PatternCheckbox options={DEFENSE_MECHANISMS} field="defense_mechanisms" disabled={isReadOnly} />
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-5">
                <h4 className="font-medium text-slate-900">Therapist Observations</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">General Presentation</label>
                  <textarea
                    value={form.general_presentation_notes}
                    onChange={(e) => updateField('general_presentation_notes', e.target.value)}
                    rows={3}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Emotional Congruence</label>
                  <StringSingleSelect options={EMOTIONAL_CONGRUENCE_OPTIONS} field="emotional_congruence" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Body Language / Somatic Presentation</label>
                  <PatternCheckbox options={BODY_LANGUAGE_OPTIONS} field="body_language" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Somatic / Body Language Notes</label>
                  <textarea
                    value={form.body_language_notes}
                    onChange={(e) => updateField('body_language_notes', e.target.value)}
                    rows={3}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Resistance Patterns Observed</label>
                  <PatternCheckbox options={RESISTANCE_PATTERNS} field="resistance_patterns" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Resistance Notes</label>
                  <textarea
                    value={form.resistance_notes}
                    onChange={(e) => updateField('resistance_notes', e.target.value)}
                    rows={3}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Key Themes Emerging</label>
                  <PatternCheckbox options={KEY_THEMES} field="key_themes" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Themes / Clinical Insights</label>
                  <textarea
                    value={form.clinical_insights}
                    onChange={(e) => updateField('clinical_insights', e.target.value)}
                    rows={3}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-5">
                <h4 className="font-medium text-slate-900">Therapeutic Priority & Recommendations</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Therapeutic Priority</label>
                  <PatternCheckbox options={THERAPEUTIC_PRIORITIES} field="therapeutic_priority" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recommended Session Frequency</label>
                  <StringSingleSelect options={SESSION_FREQUENCY_OPTIONS} field="recommended_session_frequency" disabled={isReadOnly} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes / Recommendations</label>
                  <textarea
                    value={form.additional_recommendations}
                    onChange={(e) => updateField('additional_recommendations', e.target.value)}
                    rows={3}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition Brief</label>
                <textarea
                  value={form.clinical_condition_brief}
                  onChange={(e) => updateField('clinical_condition_brief', e.target.value)}
                  rows={4}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Brief clinical summary of the client's condition..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Therapist Main Focus</label>
                <textarea
                  value={form.therapist_focus}
                  onChange={(e) => updateField('therapist_focus', e.target.value)}
                  rows={3}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Areas the therapist will focus on..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Therapy Goal</label>
                <textarea
                  value={form.therapy_goal}
                  onChange={(e) => updateField('therapy_goal', e.target.value)}
                  rows={3}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Goals for therapy outcomes..."
                />
              </div>

              {/* Baseline Score */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-3">Baseline Score</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>Nervous System:</span>
                    <span className="font-medium">{form.nervous_system_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emotional:</span>
                    <span className="font-medium">{form.emotional_state_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cognitive:</span>
                    <span className="font-medium">{form.cognitive_patterns_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Physical:</span>
                    <span className="font-medium">{form.body_symptoms_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Behavioral:</span>
                    <span className="font-medium">{form.behavioral_patterns_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Life Functioning:</span>
                    <span className="font-medium">{form.life_functioning_score}/10</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between font-semibold">
                  <span>Goal Distance:</span>
                  <span className="text-indigo-600">{goalReadinessScore}/60</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>
          <div className="flex gap-3">
            {!isReadOnly && activeSection > 0 && (
              <button
                type="button"
                onClick={() => setActiveSection(activeSection - 1)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Previous
              </button>
            )}
            {!isReadOnly && activeSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveSection(activeSection + 1)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
              </button>
            ) : !isReadOnly && (
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : existingAssessment ? 'Update Assessment' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
      {scorePrompt && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 p-5">
            <h3 className="text-base font-semibold text-slate-900">{scorePrompt.title}</h3>
            <p className="text-sm text-slate-600 mt-1 mb-4">{scorePrompt.description}</p>
            <p className="text-xs text-slate-500 mb-3">
              Tip: set a rough score now; you can fine-tune it anytime before submission.
            </p>
            <ScoreSlider
              label="Severity"
              field={scorePrompt.field}
              value={(form[scorePrompt.field as keyof typeof form] as number) ?? 0}
              disabled={false}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {quickScoreOptions.map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => updateField(scorePrompt.field, score)}
                  className={`px-2.5 py-1.5 rounded text-xs border transition-colors ${
                    (form[scorePrompt.field as keyof typeof form] as number) === score
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setScorePrompt(null)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
