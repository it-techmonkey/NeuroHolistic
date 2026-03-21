# NeuroHolistic Assessment Scoring Engine

## Overview

The Assessment Scoring Engine is a pure, deterministic function that transforms raw assessment form responses into:
- **Scores**: Seven quantified dysregulation measurements (0-100 scale)
- **Classification**: Nervous system type, core wounds, parental influence, origin period
- **Recommendations**: Recommended treatment phases based on profile

## Core Principles

- **Pure Function**: No side effects, no API calls, no UI logic
- **Deterministic**: Same input always produces same output
- **Testable**: Simple inputs, predictable outputs
- **Evidence-Based**: Scores align with polyvagal theory and trauma-informed practice
- **Modular**: Separate scoring functions for each domain

## Main Function

```typescript
import { calculateAssessmentScore } from '@/lib/assessment/scoring';

const result = calculateAssessmentScore(assessmentFormData);
```

### Input
- `AssessmentFormData`: Full assessment form responses

### Output
```typescript
{
  scores: {
    nervous_system_score: number;        // 0-100
    emotional_pattern_score: number;     // 0-100
    family_imprint_score: number;        // 0-100
    incident_load_score: number;         // 0-100
    body_symptom_score: number;          // 0-100
    current_stress_score: number;        // 0-100
    overall_dysregulation_score: number; // 0-100 (weighted)
    overall_severity_band: string;       // "Mild" | "Moderate" | "Significant" | "High" | "Very High"
  },
  classification: {
    nervous_system_type: string;         // "hyper" | "hypo" | "mixed" | "regulated"
    primary_core_wound: string;          // abandonment, worth_rejection, control_safety, suppression_expression
    secondary_core_wound: string;        // Same as primary
    dominant_parental_influence: string; // "mother" | "father" | "both" | "unknown"
    possible_origin_period: string;      // "early_childhood" | "adolescence" | "adulthood" | "unknown"
  },
  recommendation: {
    recommended_phase_primary: string;   // "Phase 1", "Phase 1-2", "Phase 2", "Phase 3", or "Phase 4"
    recommended_phase_secondary: string; // Same as above
  }
}
```

## Scoring Domains

### 1. Nervous System Score (Weight: 25%)

**What it measures**: Baseline dysregulation of the autonomic nervous system

**Calculation basis**:
- Tonia level (low = dysregulated)
- Activation pattern (high = hyperactive)
- Recovery speed (low = poor recovery)
- Freeze response (high = dysregulated)
- Fight/flight response (high = hyperactive)

**Range**: 0 (well-regulated) → 100 (severely dysregulated)

**Interpretation**:
- 0-20: Flexible, responsive nervous system
- 21-40: Generally stable with some reactivity
- 41-60: Moderate dysregulation, noticeable responses
- 61-80: Significant reactivity, struggle with recovery
- 81-100: Severe dysregulation, overwhelmed responses

### 2. Emotional Pattern Score (Weight: 20%)

**What it measures**: Emotional dysregulation and coping capacity

**Calculation basis**:
- Number of primary emotions
- Trigger sensitivity (number of triggers)
- Coping strategy diversity
- Coping effectiveness rating

**Range**: 0 (excellent regulation) → 100 (severe overwhelm)

**Interpretation**:
- 0-20: Excellent emotional management
- 21-40: Good resilience, minor struggles
- 41-60: Moderate dysregulation, some overwhelm
- 61-80: Significant difficulty, frequent triggers
- 81-100: Severe emotional overwhelm

### 3. Family Imprint Score (Weight: 20%)

**What it measures**: Intergenerational trauma and family dysfunction burden

**Calculation basis**:
- Mother's emotional challenges count
- Mother's physical health issues count
- Father's emotional challenges count
- Father's physical health issues count
- Parent emotional closeness (lower = higher imprint)
- Parent conflict level (higher = higher imprint)
- Parent emotional availability (lower = higher imprint)

**Range**: 0 (healthy family) → 100 (severe dysfunction)

### 4. Incident Load Score (Weight: 10%)

**What it measures**: Accumulated personal trauma and significant life events

**Calculation basis**:
- Presence and detail of major life events
- Presence and detail of trauma experience
- Presence and detail of relationship challenges
- Presence and detail of other incidents

**Range**: 0 (no significant incidents) → 100 (multiple severe traumas)

### 5. Body Symptom Score (Weight: 15%)

**What it measures**: Somatic dysregulation and physical symptoms

**Calculation basis**:
- Number of reported physical symptoms
- Sleep quality (lower = higher dysregulation)
- Energy level (lower = higher dysregulation)
- Pain/discomfort presence and detail

**Range**: 0 (no symptoms) → 100 (severe somatic dysregulation)

### 6. Current Stress Score (Weight: 10%)

**What it measures**: Ongoing stress load and coping capacity

**Calculation basis**:
- Number of stress response patterns
- Substance use (each substance adds load)
- Support system strength (inverse scale)
- Work-life balance (lower = higher stress)

**Range**: 0 (low stress, strong support) → 100 (high stress, poor support)

### 7. Overall Dysregulation Score

**Calculation**: Weighted average of all six domains

```
Overall = 
  (NS × 0.25) + 
  (EP × 0.20) + 
  (FI × 0.20) + 
  (IL × 0.10) + 
  (BS × 0.15) + 
  (CS × 0.10)
```

**Severity Bands**:
- 0-20: **Mild** - Minimal dysregulation, good resilience
- 21-40: **Moderate** - Some challenges, generally functional
- 41-60: **Significant** - Noticeable dysregulation, impacts functioning
- 61-80: **High** - Substantial dysfunction, needs intervention
- 81-100: **Very High** - Severe dysregulation, crisis level

## Classification System

### Nervous System Type

Determined by combining:
- Baseline activation level
- Stress response patterns
- Recovery capabilities

**Types**:
- **Hyper**: High activation, fight/flight dominant, poor recovery
- **Hypo**: Low activation, shutdown/collapse, dissociation
- **Mixed**: Freeze responses combined with hyperactivation or hypoactivation
- **Regulated**: Flexible responses, good recovery, appropriate baseline

**Example**:
```
Activation: High (4/5)
Recovery:   Low (2/5)
Freeze:     Moderate (2/5)
→ Type: "hyper" (hyperactive with poor recovery)
```

### Core Wounds

**Abandonment**:
- Triggers: rejection, intimacy, abandonment themes
- Emotions: loneliness, fear, anxious attachment
- Pattern: Hypervigilance to rejection cues

**Worth/Rejection**:
- Triggers: performance pressure, criticism, failure
- Emotions: shame, inadequacy, unworthiness
- Pattern: Perfectionism, people-pleasing

**Control/Safety**:
- Triggers: uncertainty, authority, loss of control
- Emotions: anxiety, panic, need for control
- Pattern: Hypervigilance, rigid coping

**Suppression/Expression**:
- Triggers: emotional expression, authenticity, conflict
- Emotions: anger, emptiness, numbness
- Pattern: Over-work, avoidance, emotional shutdown

**Detection Logic**:
- Scan emotional patterns and triggers
- Compare against family patterns (parental modeling)
- Count indicators for each wound type
- Primary = highest count, Secondary = second highest

### Parental Influence

**Determined by comparing**:
- Mother's emotional challenges count
- Mother's physical health issues count
- Father's emotional challenges count
- Father's physical health issues count

**Result**:
- **Mother**: Mother's burden > Father's by 2+
- **Father**: Father's burden > Mother's by 2+
- **Both**: Similar burden or both high
- **Unknown**: No significant issues reported

### Origin Period

**Based on**:
- Presenting condition duration
- Family dysfunction patterns
- Incident timing

**Classification**:
- **Early Childhood**: Family trauma/dysfunction present
- **Adolescence**: Moderate incidents in middle duration
- **Adulthood**: Recent incidents with less family history
- **Unknown**: Insufficient data or very recent onset

## Phase Recommendations

Phases are NeuroHolistic treatment stages based on readiness and dysregulation level.

### Phase 1: Nervous System Stabilization
**When to recommend**:
- Nervous system score > 60, OR
- Nervous system type is "hyper" or "mixed"

**Focus**: Regulate the nervous system, establish safety, basic regulation tools

### Phase 2: Foundation & Family Healing
**When to recommend**:
- Family imprint score > 55, OR
- Incident load score > 50, OR
- Origin period is "early_childhood"

**Focus**: Process family patterns, heal core wounds, establish new narratives

### Phase 3: Emotional Integration
**When to recommend**:
- Emotional pattern score > 50

**Focus**: Integrate emotions, develop emotional fluency, relational skill-building

### Phase 4: Integration & Resilience
**When to recommend**:
- Overall score < 45, AND
- Nervous system score < 50

**Focus**: Resilience building, integration, sustainable wellness

### Combined Recommendations

**Phase 1-2**:
- Recommended when both nervous system (>60) AND family imprint (>55) are high
- Indicates: Need for parallel stabilization and trauma work

## API Integration

### Example: Use in Assessment Submission

```typescript
import { calculateAssessmentScore } from '@/lib/assessment/scoring';

export async function POST(request: NextRequest) {
  const { user_id, raw_responses_json } = await request.json();
  
  // Calculate scores
  const scoringResult = calculateAssessmentScore(raw_responses_json);
  
  // Store with scores
  const { data } = await supabase.from('assessments').insert({
    user_id,
    raw_responses_json,
    scores: scoringResult.scores,
    classification: scoringResult.classification,
    recommendation: scoringResult.recommendation,
    overall_dysregulation_score: scoringResult.scores.overall_dysregulation_score,
    severity_band: scoringResult.scores.overall_severity_band,
    nervous_system_type: scoringResult.classification.nervous_system_type,
  });
  
  return NextResponse.json({
    success: true,
    assessment_id: data?.id,
    scores: scoringResult.scores,
    classification: scoringResult.classification,
    recommendation: scoringResult.recommendation,
  });
}
```

## Error Handling

The scoring engine includes safety mechanisms:

1. **Safe Defaults**: If calculation fails, returns default "Mild" classification
2. **NaN Prevention**: All calculations check for invalid numbers
3. **Bounds Checking**: All scores capped to 0-100 range
4. **Graceful Degradation**: Missing fields treated as neutral/zero

## Testing

Sample test data provided in `SAMPLE_TEST_ASSESSMENT`:

```typescript
import { 
  calculateAssessmentScore, 
  SAMPLE_TEST_ASSESSMENT 
} from './scoring';

const result = calculateAssessmentScore(SAMPLE_TEST_ASSESSMENT);
console.log(result);
// Shows moderate dysregulation with Phase 1-2 recommendation
```

## Database Schema

Expected columns for assessments table:

```sql
ALTER TABLE assessments ADD COLUMN (
  scores JSONB,                    -- Full scores object
  classification JSONB,            -- Full classification object
  recommendation JSONB,            -- Full recommendation object
  overall_dysregulation_score INT, -- Quick reference (0-100)
  severity_band VARCHAR(50),       -- Quick reference ("Mild" etc)
  nervous_system_type VARCHAR(50), -- Quick reference ("hyper" etc)
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Validation & Iteration

The scoring engine is designed to be:
- **Iterable**: Easily adjust weights and thresholds
- **Testable**: Each function independently verifiable
- **Documented**: Clear logic for each calculation
- **Safe**: Graceful handling of edge cases

## Future Enhancements

1. **Machine Learning Integration**: Refine weights based on outcomes
2. **Response Pattern Recognition**: Detect inconsistent/suspicious responses
3. **Longitudinal Tracking**: Compare scores across multiple assessments
4. **Clustering Analysis**: Group similar profiles for comparative insights
5. **Outcome Prediction**: Predict likely treatment outcomes

## References & Theory

Scoring grounded in:
- **Polyvagal Theory** (Porges): Nervous system states and regulation
- **Trauma-Informed Care**: Understanding dysregulation as trauma response
- **Family Systems**: Intergenerational transmission of patterns
- **Attachment Theory**: Core wounds and relational patterns
- **Psychoneuroimmunology**: Body-mind connection in dysregulation
