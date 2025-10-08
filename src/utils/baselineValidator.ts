/**
 * AI Response Baseline Validator
 * Validates AI responses against expected baselines to detect anomalies
 */

interface HealingStageBaseline {
  stage: string;
  expectedRecommendations: string[];
  progressScoreRange: [number, number];
  typicalResponseLength: [number, number];
  commonRiskFactors: string[];
}

const HEALING_STAGE_BASELINES: HealingStageBaseline[] = [
  {
    stage: 'fresh',
    expectedRecommendations: ['keep clean', 'moisturize', 'avoid sun', 'no swimming'],
    progressScoreRange: [70, 100],
    typicalResponseLength: [100, 500],
    commonRiskFactors: ['redness', 'swelling', 'discharge']
  },
  {
    stage: 'peeling',
    expectedRecommendations: ['gentle washing', 'light moisturizer', 'no picking', 'avoid tight clothing'],
    progressScoreRange: [60, 90],
    typicalResponseLength: [100, 500],
    commonRiskFactors: ['itching', 'flaking', 'dryness']
  },
  {
    stage: 'healing',
    expectedRecommendations: ['continue care', 'protect from sun', 'moisturize regularly'],
    progressScoreRange: [80, 100],
    typicalResponseLength: [100, 400],
    commonRiskFactors: ['minor scabbing', 'slight color variation']
  },
  {
    stage: 'healed',
    expectedRecommendations: ['sunscreen', 'regular moisturizing', 'monitor long term'],
    progressScoreRange: [90, 100],
    typicalResponseLength: [50, 300],
    commonRiskFactors: []
  },
  {
    stage: 'infected',
    expectedRecommendations: ['see doctor', 'antibiotics', 'keep clean', 'do not cover'],
    progressScoreRange: [0, 40],
    typicalResponseLength: [150, 600],
    commonRiskFactors: ['pus', 'fever', 'severe redness', 'pain', 'swelling']
  }
];

export interface BaselineValidationResult {
  passed: boolean;
  deviationScore: number; // 0-100, higher = more deviation
  issues: string[];
  warnings: string[];
}

/**
 * Validate AI response against baseline expectations
 */
export const validateAgainstBaseline = (
  response: any,
  healingStage: string
): BaselineValidationResult => {
  const baseline = HEALING_STAGE_BASELINES.find(b => b.stage === healingStage);
  
  if (!baseline) {
    return {
      passed: false,
      deviationScore: 100,
      issues: [`Unknown healing stage: ${healingStage}`],
      warnings: []
    };
  }

  const issues: string[] = [];
  const warnings: string[] = [];
  let deviationScore = 0;

  // Check progress score range
  const progressScore = response.progressScore || response.progress_score || 0;
  if (progressScore < baseline.progressScoreRange[0] || progressScore > baseline.progressScoreRange[1]) {
    issues.push(`Progress score ${progressScore} outside expected range ${baseline.progressScoreRange[0]}-${baseline.progressScoreRange[1]}`);
    deviationScore += 30;
  }

  // Check response length
  const responseText = JSON.stringify(response);
  const responseLength = responseText.length;
  if (responseLength < baseline.typicalResponseLength[0] || responseLength > baseline.typicalResponseLength[1]) {
    warnings.push(`Response length ${responseLength} outside typical range ${baseline.typicalResponseLength[0]}-${baseline.typicalResponseLength[1]}`);
    deviationScore += 10;
  }

  // Check recommendations overlap
  const recommendations = response.recommendations || [];
  const expectedKeywords = baseline.expectedRecommendations;
  let matchCount = 0;
  
  for (const expected of expectedKeywords) {
    const found = recommendations.some((rec: string) => 
      rec.toLowerCase().includes(expected.toLowerCase())
    );
    if (found) matchCount++;
  }

  const overlapPercent = (matchCount / expectedKeywords.length) * 100;
  if (overlapPercent < 30) {
    issues.push(`Low recommendation overlap: ${overlapPercent.toFixed(0)}% (expected >30%)`);
    deviationScore += 40;
  } else if (overlapPercent < 50) {
    warnings.push(`Moderate recommendation overlap: ${overlapPercent.toFixed(0)}%`);
    deviationScore += 20;
  }

  // Check for unexpected empty responses
  if (recommendations.length === 0) {
    issues.push('No recommendations provided');
    deviationScore += 50;
  }

  const passed = issues.length === 0 && deviationScore < 50;

  return {
    passed,
    deviationScore: Math.min(deviationScore, 100),
    issues,
    warnings
  };
};

/**
 * Compare two AI responses for consistency
 */
export const compareResponses = (
  response1: any,
  response2: any
): { consistent: boolean; differences: string[] } => {
  const differences: string[] = [];

  // Compare healing stages
  if (response1.healingStage !== response2.healingStage) {
    differences.push(`Healing stage mismatch: ${response1.healingStage} vs ${response2.healingStage}`);
  }

  // Compare progress scores
  const score1 = response1.progressScore || 0;
  const score2 = response2.progressScore || 0;
  if (Math.abs(score1 - score2) > 20) {
    differences.push(`Progress score differs by ${Math.abs(score1 - score2)}: ${score1} vs ${score2}`);
  }

  // Compare risk levels
  const risk1 = response1.riskLevel || response1.risk_level || 'normal';
  const risk2 = response2.riskLevel || response2.risk_level || 'normal';
  if (risk1 !== risk2) {
    differences.push(`Risk level mismatch: ${risk1} vs ${risk2}`);
  }

  return {
    consistent: differences.length === 0,
    differences
  };
};
