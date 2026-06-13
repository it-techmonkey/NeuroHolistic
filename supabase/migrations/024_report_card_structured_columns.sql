-- Migration 024: Add structured columns for Report Card
-- Adds individual columns for report card data that was previously serialized into text fields.

-- ============================================================
-- 1. Basic Information additions
-- ============================================================
ALTER TABLE diagnostic_assessments
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS nationality text;

-- ============================================================
-- 2. Main Concerns & Desired Outcomes
-- ============================================================
ALTER TABLE diagnostic_assessments
  ADD COLUMN IF NOT EXISTS affected_life_areas text[],
  ADD COLUMN IF NOT EXISTS affected_life_areas_other text,
  ADD COLUMN IF NOT EXISTS symptom_duration text,
  ADD COLUMN IF NOT EXISTS life_impact text,
  ADD COLUMN IF NOT EXISTS current_experience_words text,
  ADD COLUMN IF NOT EXISTS biggest_goal text,
  ADD COLUMN IF NOT EXISTS transformation_vision text;

-- ============================================================
-- 3. Symptoms & Presenting Patterns (additional detail)
-- ============================================================
ALTER TABLE diagnostic_assessments
  ADD COLUMN IF NOT EXISTS nervous_system_symptoms text[],
  ADD COLUMN IF NOT EXISTS nervous_system_symptoms_other text,
  ADD COLUMN IF NOT EXISTS sleep_symptoms text[],
  ADD COLUMN IF NOT EXISTS sleep_symptoms_other text,
  ADD COLUMN IF NOT EXISTS sleep_symptoms_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tried_previously text[],
  ADD COLUMN IF NOT EXISTS tried_previously_other text;

-- ============================================================
-- 4. Life Status & Functional Assessment
-- ============================================================
ALTER TABLE diagnostic_assessments
  ADD COLUMN IF NOT EXISTS relationship_quality text,
  ADD COLUMN IF NOT EXISTS relationship_emotional_safety text,
  ADD COLUMN IF NOT EXISTS relationship_challenges text,
  ADD COLUMN IF NOT EXISTS relationship_fulfillment_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_children text,
  ADD COLUMN IF NOT EXISTS children_relationship text,
  ADD COLUMN IF NOT EXISTS children_relationship_other text,
  ADD COLUMN IF NOT EXISTS parenting_fulfillment_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employment_status text,
  ADD COLUMN IF NOT EXISTS work_fulfillment_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS work_state text,
  ADD COLUMN IF NOT EXISTS work_state_other text,
  ADD COLUMN IF NOT EXISTS social_life text,
  ADD COLUMN IF NOT EXISTS social_life_other text,
  ADD COLUMN IF NOT EXISTS feel_understood text,
  ADD COLUMN IF NOT EXISTS sleep_description text,
  ADD COLUMN IF NOT EXISTS sleep_description_other text,
  ADD COLUMN IF NOT EXISTS average_sleep_hours text;

-- ============================================================
-- 5. Root Cause & Family System Assessment
-- ============================================================
-- Mother
ALTER TABLE diagnostic_assessments
  ADD COLUMN IF NOT EXISTS mother_emotional_presence text,
  ADD COLUMN IF NOT EXISTS mother_physical_presence text,
  ADD COLUMN IF NOT EXISTS mother_emotional_state text[],
  ADD COLUMN IF NOT EXISTS mother_characteristics text[],
  ADD COLUMN IF NOT EXISTS mother_relationship text,
  ADD COLUMN IF NOT EXISTS mother_emotional_safety text,
  ADD COLUMN IF NOT EXISTS mother_longing text;

-- Father
ALTER TABLE diagnostic_assessments
  ADD COLUMN IF NOT EXISTS father_emotional_presence text,
  ADD COLUMN IF NOT EXISTS father_physical_presence text,
  ADD COLUMN IF NOT EXISTS father_emotional_state text[],
  ADD COLUMN IF NOT EXISTS father_characteristics text[],
  ADD COLUMN IF NOT EXISTS father_relationship text,
  ADD COLUMN IF NOT EXISTS father_emotional_safety text,
  ADD COLUMN IF NOT EXISTS father_longing text;

-- Parents relationship
ALTER TABLE diagnostic_assessments
  ADD COLUMN IF NOT EXISTS parents_relationship text,
  ADD COLUMN IF NOT EXISTS parents_relationship_impact text;

-- Siblings
ALTER TABLE diagnostic_assessments
  ADD COLUMN IF NOT EXISTS birth_order text,
  ADD COLUMN IF NOT EXISTS number_of_siblings text,
  ADD COLUMN IF NOT EXISTS sibling_age_gap text,
  ADD COLUMN IF NOT EXISTS sibling_relationship text,
  ADD COLUMN IF NOT EXISTS family_role text;

-- ============================================================
-- 6. Clinical Summary / Therapist Observation
-- ============================================================
ALTER TABLE diagnostic_assessments
  ADD COLUMN IF NOT EXISTS predominant_nervous_system_state text,
  ADD COLUMN IF NOT EXISTS predominant_emotional_state text,
  ADD COLUMN IF NOT EXISTS subconscious_patterns text[],
  ADD COLUMN IF NOT EXISTS attachment_style_indicators text,
  ADD COLUMN IF NOT EXISTS possible_root_mechanisms text[],
  ADD COLUMN IF NOT EXISTS defense_mechanisms text[],
  ADD COLUMN IF NOT EXISTS general_presentation_notes text,
  ADD COLUMN IF NOT EXISTS emotional_congruence text,
  ADD COLUMN IF NOT EXISTS body_language text[],
  ADD COLUMN IF NOT EXISTS body_language_notes text,
  ADD COLUMN IF NOT EXISTS resistance_patterns text[],
  ADD COLUMN IF NOT EXISTS resistance_notes text,
  ADD COLUMN IF NOT EXISTS key_themes text[],
  ADD COLUMN IF NOT EXISTS clinical_insights text;

-- ============================================================
-- 7. Therapeutic Priority & Recommendations
-- ============================================================
ALTER TABLE diagnostic_assessments
  ADD COLUMN IF NOT EXISTS therapeutic_priority text[],
  ADD COLUMN IF NOT EXISTS recommended_session_frequency text,
  ADD COLUMN IF NOT EXISTS additional_recommendations text;
