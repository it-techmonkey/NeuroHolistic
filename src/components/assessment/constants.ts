import { FormStep } from './types';

/**
 * Form steps definition
 * Each step defines the fields it contains
 */
export const ASSESSMENT_STEPS: FormStep[] = [
  {
    id: 'basicInfo',
    title: 'Basic Information',
    description: 'Let\'s start with your basic information',
    fields: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'location'],
  },
  {
    id: 'presentingCondition',
    title: 'Presenting Condition',
    description: 'What brings you here today?',
    fields: ['primaryConcern', 'duration', 'previousTherapy', 'currentMedication'],
  },
  {
    id: 'nervousSystem',
    title: 'Nervous System Response',
    description: 'How does your nervous system typically respond?',
    fields: ['startle', 'emotionalResponse', 'sleepQuality', 'relaxation', 'energyLevel'],
  },
  {
    id: 'emotionalPatterns',
    title: 'Emotional Patterns',
    description: 'Understanding your emotional landscape',
    fields: ['emotionalRegulation', 'triggers', 'copingStrategies'],
  },
  {
    id: 'motherHistory',
    title: 'Mother\'s History',
    description: 'Family background - maternal side',
    fields: ['healthHistory', 'emotionalHealth', 'relatedToYou'],
  },
  {
    id: 'fatherHistory',
    title: 'Father\'s History',
    description: 'Family background - paternal side',
    fields: ['healthHistory', 'emotionalHealth', 'relatedToYou'],
  },
  {
    id: 'parentsDynamic',
    title: 'Parents\' Dynamic',
    description: 'Your parents\' relationship and home environment',
    fields: ['parentsRelationship', 'parentalCommunication', 'emotionalEnvironment'],
  },
  {
    id: 'siblings',
    title: 'Siblings',
    description: 'Your sibling relationships',
    fields: ['siblingCount', 'siblingRelationships', 'siblingDynamics'],
  },
  {
    id: 'incidents',
    title: 'Significant Life Events',
    description: 'Important incidents and life events',
    fields: ['significantIncidents', 'accidentsIllness', 'losses', 'otherTrauma'],
  },
  {
    id: 'bodySymptoms',
    title: 'Body Symptoms',
    description: 'Physical sensations and symptoms',
    fields: ['physicalSymptoms', 'painAreas', 'energySensation'],
  },
  {
    id: 'stress',
    title: 'Stress & Recovery',
    description: 'How you experience and recover from stress',
    fields: ['currentStressors', 'stressResponse', 'recoveryTime'],
  },
  {
    id: 'goals',
    title: 'Your Goals',
    description: 'What do you hope to achieve?',
    fields: ['whyNow', 'desiredOutcomes', 'expectations', 'commitment'],
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review your responses before submitting',
    fields: [],
  },
];

/**
 * Required fields for validation
 */
export const REQUIRED_FIELDS: Record<string, string[]> = {
  basicInfo: ['firstName', 'lastName', 'email', 'dateOfBirth', 'gender'],
  presentingCondition: ['primaryConcern', 'duration'],
  nervousSystem: ['startle', 'emotionalResponse', 'sleepQuality'],
  emotionalPatterns: ['emotionalRegulation', 'triggers'],
  motherHistory: ['healthHistory', 'emotionalHealth'],
  fatherHistory: ['healthHistory', 'emotionalHealth'],
  parentsDynamic: ['parentsRelationship', 'parentalCommunication'],
  siblings: ['siblingCount'],
  incidents: [],
  bodySymptoms: [],
  stress: ['stressResponse'],
  goals: ['whyNow', 'desiredOutcomes'],
};

/**
 * Options for select/radio fields
 */
export const FIELD_OPTIONS = {
  gender: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],

  duration: [
    { value: 'less-than-3-months', label: 'Less than 3 months' },
    { value: '3-6-months', label: '3-6 months' },
    { value: '6-12-months', label: '6-12 months' },
    { value: '1-2-years', label: '1-2 years' },
    { value: 'more-than-2-years', label: 'More than 2 years' },
  ],

  yesNo: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ],

  responseScale: [
    { value: '5-always', label: 'Always - 5' },
    { value: '4-often', label: 'Often - 4' },
    { value: '3-sometimes', label: 'Sometimes - 3' },
    { value: '2-rarely', label: 'Rarely - 2' },
    { value: '1-never', label: 'Never - 1' },
  ],

  emotionalRegulation: [
    { value: 'very-difficult', label: 'Very difficult' },
    { value: 'difficult', label: 'Difficult' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'good', label: 'Good' },
    { value: 'excellent', label: 'Excellent' },
  ],

  triggers: [
    { value: 'conflict', label: 'Conflict/criticism' },
    { value: 'rejection', label: 'Rejection/abandonment' },
    { value: 'uncertainty', label: 'Uncertainty/change' },
    { value: 'crowds', label: 'Crowds/social situations' },
    { value: 'authority', label: 'Authority figures' },
    { value: 'intimacy', label: 'Intimacy/closeness' },
    { value: 'performance', label: 'Performance pressure' },
    { value: 'other', label: 'Other' },
  ],

  copingStrategies: [
    { value: 'exercise', label: 'Exercise' },
    { value: 'meditation', label: 'Meditation/mindfulness' },
    { value: 'talking', label: 'Talking to friends/family' },
    { value: 'creative', label: 'Creative activities' },
    { value: 'nature', label: 'Time in nature' },
    { value: 'work', label: 'Throwing myself into work' },
    { value: 'avoidance', label: 'Avoidance' },
    { value: 'other', label: 'Other' },
  ],

  healthHistory: [
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'heart-disease', label: 'Heart disease' },
    { value: 'autoimmune', label: 'Autoimmune disorders' },
    { value: 'mental-health', label: 'Mental health issues' },
    { value: 'addiction', label: 'Addiction' },
    { value: 'cancer', label: 'Cancer' },
    { value: 'other', label: 'Other' },
  ],

  emotionalHealth: [
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'anger-issues', label: 'Anger issues' },
    { value: 'trauma', label: 'Trauma' },
    { value: 'addiction', label: 'Addiction' },
    { value: 'stable', label: 'Emotionally stable' },
    { value: 'unknown', label: 'Unknown' },
  ],

  physicalSymptoms: [
    { value: 'headaches', label: 'Headaches' },
    { value: 'tension', label: 'Muscle tension' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'insomnia', label: 'Insomnia' },
    { value: 'gi-issues', label: 'GI issues' },
    { value: 'breathing', label: 'Breathing difficulties' },
    { value: 'heart-palpitations', label: 'Heart palpitations' },
    { value: 'other', label: 'Other' },
  ],

  bodySymptoms: [
    { value: 'headaches', label: 'Headaches' },
    { value: 'tension', label: 'Muscle tension' },
    { value: 'fatigue', label: 'Fatigue' },
    { value: 'insomnia', label: 'Insomnia' },
    { value: 'gi-issues', label: 'GI issues' },
    { value: 'breathing', label: 'Breathing difficulties' },
    { value: 'heart-palpitations', label: 'Heart palpitations' },
    { value: 'numbness', label: 'Numbness/tingling' },
    { value: 'dizziness', label: 'Dizziness' },
    { value: 'sweating', label: 'Excessive sweating' },
    { value: 'other', label: 'Other' },
  ],

  emotions: [
    { value: 'anxiety', label: 'Anxiety' },
    { value: 'depression', label: 'Depression' },
    { value: 'anger', label: 'Anger' },
    { value: 'sadness', label: 'Sadness' },
    { value: 'frustration', label: 'Frustration' },
    { value: 'shame', label: 'Shame/guilt' },
    { value: 'loneliness', label: 'Loneliness' },
    { value: 'emptiness', label: 'Emptiness' },
    { value: 'overwhelm', label: 'Overwhelm' },
    { value: 'fear', label: 'Fear' },
  ],

  emotionalTriggers: [
    { value: 'conflict', label: 'Conflict/criticism' },
    { value: 'rejection', label: 'Rejection/abandonment' },
    { value: 'uncertainty', label: 'Uncertainty/change' },
    { value: 'loss-of-control', label: 'Loss of control' },
    { value: 'injustice', label: 'Injustice/unfairness' },
    { value: 'perfectionism', label: 'Perfectionism/failure' },
    { value: 'crowds', label: 'Crowds/social situations' },
    { value: 'authority', label: 'Authority figures' },
    { value: 'intimacy', label: 'Intimacy/closeness' },
    { value: 'performance', label: 'Performance pressure' },
    { value: 'other', label: 'Other' },
  ],

  stressors: [
    { value: 'work', label: 'Work pressure' },
    { value: 'relationships', label: 'Relationship issues' },
    { value: 'finances', label: 'Financial stress' },
    { value: 'health', label: 'Health concerns' },
    { value: 'family', label: 'Family matters' },
    { value: 'transitions', label: 'Major life transitions' },
    { value: 'other', label: 'Other' },
  ],

  stressResponse: [
    { value: 'freeze', label: 'Freeze/shutdown' },
    { value: 'fight', label: 'Fight/aggression' },
    { value: 'flight', label: 'Flight/avoidance' },
    { value: 'fawn', label: 'Fawn/people-please' },
    { value: 'mixed', label: 'Mix of responses' },
  ],

  stressResponses: [
    { value: 'freeze', label: 'Freeze/shutdown' },
    { value: 'fight', label: 'Fight/aggression' },
    { value: 'flight', label: 'Flight/avoidance' },
    { value: 'fawn', label: 'Fawn/people-please' },
    { value: 'numb', label: 'Numb/dissociate' },
    { value: 'other', label: 'Other' },
  ],

  substanceUse: [
    { value: 'none', label: 'None' },
    { value: 'alcohol', label: 'Alcohol' },
    { value: 'cannabis', label: 'Cannabis' },
    { value: 'caffeine', label: 'Caffeine (excessive)' },
    { value: 'prescription', label: 'Prescription medications' },
    { value: 'over-counter', label: 'Over-the-counter medications' },
    { value: 'other', label: 'Other' },
  ],

  physicalHealth: [
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'heart-disease', label: 'Heart disease' },
    { value: 'autoimmune', label: 'Autoimmune disorders' },
    { value: 'chronic-pain', label: 'Chronic pain' },
    { value: 'thyroid', label: 'Thyroid issues' },
    { value: 'digestive', label: 'Digestive issues' },
    { value: 'other', label: 'Other' },
  ],

  recoveryTime: [
    { value: 'quick', label: 'Quick (minutes)' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'lingering', label: 'Lingering/ongoing' },
  ],

  parentsRelationship: [
    { value: 'conflict', label: 'Conflictual' },
    { value: 'distant', label: 'Distant' },
    { value: 'cold', label: 'Cold/detached' },
    { value: 'warm', label: 'Warm/close' },
    { value: 'unstable', label: 'Unstable/unpredictable' },
  ],

  commitment: [
    { value: 'high', label: 'Very committed' },
    { value: 'moderate', label: 'Moderately committed' },
    { value: 'exploring', label: 'Still exploring' },
  ],
};

/**
 * Draft save key for localStorage
 */
export const DRAFT_STORAGE_KEY = 'neuroholistic_assessment_draft';
export const DRAFT_TIMESTAMP_KEY = 'neuroholistic_assessment_draft_timestamp';
