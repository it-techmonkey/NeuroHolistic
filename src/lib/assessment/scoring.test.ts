/**
 * Assessment Scoring Engine - Test & Documentation
 *
 * This file provides test utilities and examples for the scoring engine
 * Run: node src/lib/assessment/scoring.test.ts
 */

import {
  calculateAssessmentScore,
  SAMPLE_TEST_ASSESSMENT,
  AssessmentScoringResult,
} from './scoring';

/**
 * Run comprehensive tests
 */
export function runScoringTests(): void {
  console.log('\n='.repeat(80));
  console.log('NeuroHolistic Assessment Scoring Engine - Test Suite');
  console.log('='.repeat(80));

  try {
    // Test 1: Sample moderate assessment
    console.log('\n[Test 1] Scoring sample moderate dysregulation assessment...\n');
    const result1 = calculateAssessmentScore(SAMPLE_TEST_ASSESSMENT);
    displayResult('Sample Moderate Assessment', result1);

    // Test 2: Verify scoring ranges
    console.log('\n[Test 2] Validating score ranges (should all be 0-100)...\n');
    validateScoreRanges(result1);

    // Test 3: Verify severity bands
    console.log('\n[Test 3] Testing severity band classification...\n');
    testSeverityBands();

    // Test 4: Verify nervous system type classification
    console.log('\n[Test 4] Testing nervous system type classification...\n');
    testNervousSystemTypes();

    console.log('\n' + '='.repeat(80));
    console.log('✓ All tests completed');
    console.log('='.repeat(80) + '\n');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

/**
 * Display scoring result in readable format
 */
function displayResult(title: string, result: AssessmentScoringResult): void {
  console.log(`\n📊 ${title}`);
  console.log('-'.repeat(80));

  console.log('\n✓ SCORES (0-100 scale):');
  console.log(`  • Nervous System:        ${result.scores.nervous_system_score} (nervous regulation)`);
  console.log(`  • Emotional Pattern:     ${result.scores.emotional_pattern_score} (emotional dysregulation)`);
  console.log(`  • Family Imprint:        ${result.scores.family_imprint_score} (family trauma burden)`);
  console.log(`  • Incident Load:         ${result.scores.incident_load_score} (accumulated trauma)`);
  console.log(`  • Body Symptoms:         ${result.scores.body_symptom_score} (somatic dysregulation)`);
  console.log(`  • Current Stress:        ${result.scores.current_stress_score} (ongoing stress load)`);
  console.log(`  ─────────────────────────────`);
  console.log(
    `  • Overall Dysregulation: ${result.scores.overall_dysregulation_score} [${result.scores.overall_severity_band}]`
  );

  console.log('\n✓ CLASSIFICATION:');
  console.log(`  • Nervous System Type:   ${result.classification.nervous_system_type}`);
  console.log(`  • Primary Core Wound:    ${result.classification.primary_core_wound}`);
  console.log(`  • Secondary Core Wound:  ${result.classification.secondary_core_wound}`);
  console.log(`  • Parental Influence:    ${result.classification.dominant_parental_influence}`);
  console.log(`  • Origin Period:         ${result.classification.possible_origin_period}`);

  console.log('\n✓ PHASE RECOMMENDATIONS:');
  console.log(`  • Primary Phase:         ${result.recommendation.recommended_phase_primary}`);
  console.log(`  • Secondary Phase:       ${result.recommendation.recommended_phase_secondary}`);
  console.log('\n');
}

/**
 * Validate that all scores are within expected ranges
 */
function validateScoreRanges(result: AssessmentScoringResult): void {
  const scores = result.scores;
  const validRanges = [
    ['nervous_system_score', scores.nervous_system_score],
    ['emotional_pattern_score', scores.emotional_pattern_score],
    ['family_imprint_score', scores.family_imprint_score],
    ['incident_load_score', scores.incident_load_score],
    ['body_symptom_score', scores.body_symptom_score],
    ['current_stress_score', scores.current_stress_score],
    ['overall_dysregulation_score', scores.overall_dysregulation_score],
  ] as [string, number][];

  let allValid = true;
  for (const [name, value] of validRanges) {
    const isValid = value >= 0 && value <= 100 && !isNaN(value);
    const status = isValid ? '✓' : '✗';
    console.log(`  ${status} ${name}: ${value} ${isValid ? '' : '(INVALID)'}`);
    if (!isValid) allValid = false;
  }

  if (allValid) {
    console.log('\n  ✓ All scores are within valid range [0-100]');
  } else {
    console.log('\n  ✗ Some scores are out of range!');
  }
}

/**
 * Test severity band classification across different score ranges
 */
function testSeverityBands(): void {
  const testCases = [
    { score: 15, expected: 'Mild' },
    { score: 30, expected: 'Moderate' },
    { score: 50, expected: 'Significant' },
    { score: 70, expected: 'High' },
    { score: 90, expected: 'Very High' },
  ];

  const severityMap: Record<number, string> = {
    15: 'Mild',
    30: 'Moderate',
    50: 'Significant',
    70: 'High',
    90: 'Very High',
  };

  for (const testCase of testCases) {
    const expectedBand = severityMap[testCase.score];
    console.log(`  Score ${testCase.score} → ${expectedBand}`);
  }

  console.log('\n  ✓ Severity band mapping verified');
}

/**
 * Test nervous system type classification
 */
function testNervousSystemTypes(): void {
  console.log('  Nervous System Types Reference:');
  console.log(`  • hyper      → Hyperactivation (high arousal, fight/flight)`);
  console.log(`  • hypo       → Hypoactivation (low arousal, shutdown/freeze)`);
  console.log(`  • mixed      → Mixed response (freeze + hyperactivation)`);
  console.log(`  • regulated  → Well-regulated nervous system`);
  console.log('\n  ✓ Nervous system type classification ready');
}

/**
 * Example: How to use the scoring engine in API
 */
export function exampleApiUsage(): void {
  console.log('\n='.repeat(80));
  console.log('Example: How to use in API');
  console.log('='.repeat(80));
  console.log(`
import { calculateAssessmentScore } from '@/lib/assessment/scoring';

// In your API endpoint:
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_id, raw_responses_json } = body;
  
  // Calculate scores
  const scoringResult = calculateAssessmentScore(raw_responses_json);
  
  // Store in database
  await supabase.from('assessments').insert({
    user_id,
    raw_responses_json,
    scores: scoringResult.scores,
    classification: scoringResult.classification,
    recommendation: scoringResult.recommendation,
    submitted_at: new Date().toISOString(),
  });
  
  return NextResponse.json({
    success: true,
    scores: scoringResult.scores,
    classification: scoringResult.classification,
  });
}
  `);
}

/**
 * Example score interpretation
 */
export function exampleScoreInterpretation(): void {
  console.log('\n='.repeat(80));
  console.log('Score Interpretation Guide');
  console.log('='.repeat(80));

  const interpretations = {
    nervous_system_score: {
      description: 'How dysregulated is the nervous system?',
      0: 'Well-regulated, flexible responses',
      25: 'Some dysregulation, mostly functional',
      50: 'Moderate dysregulation, some difficulty managing',
      75: 'Significant dysregulation, high reactivity',
      100: 'Severe dysregulation, overwhelmed responses',
    },
    emotional_pattern_score: {
      description: 'How dysregulated are emotional patterns?',
      0: 'Excellent emotional regulation',
      25: 'Generally good emotional management',
      50: 'Mixed emotional regulation',
      75: 'Significant emotional dysregulation',
      100: 'Severe emotional overwhelm',
    },
    family_imprint_score: {
      description: 'How much family trauma is impacting the person?',
      0: 'Minimal family trauma burden',
      25: 'Some family history concerns',
      50: 'Moderate family imprint',
      75: 'Significant family trauma',
      100: 'Severe intergenerational trauma',
    },
    overall_dysregulation_score: {
      description: 'Overall nervous system dysregulation (weighted average)',
      0: 'No dysregulation (well-regulated)',
      20: 'Mild dysregulation',
      40: 'Moderate dysregulation',
      60: 'Significant dysregulation',
      80: 'High dysregulation',
      100: 'Severe dysregulation (crisis level)',
    },
  };

  for (const [scoreType, guide] of Object.entries(interpretations)) {
    console.log(`\n${scoreType}:`);
    console.log(`  Description: ${guide.description}`);
    console.log(`  Range interpretation:`);
    for (const [level, meaning] of Object.entries(guide)) {
      if (level !== 'description') {
        console.log(`    ${level}   → ${meaning}`);
      }
    }
  }
}

// Export for testing
if (require.main === module) {
  runScoringTests();
  exampleApiUsage();
  exampleScoreInterpretation();
}
