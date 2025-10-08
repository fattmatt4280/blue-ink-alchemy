import crypto from 'crypto';

interface HealingAnalysisResponse {
  greeting?: string;
  tattooDescription?: string;
  healingStage: string;
  healingStageDescription?: string;
  visualAssessment?: {
    description: string;
    positiveIndicators?: string[];
    concerningIndicators?: string[];
  };
  progressScore?: number;
  recommendations?: string[];
  riskFactors?: string[];
  productRecommendations?: Array<{
    name: string;
    purpose: string;
    amazonLink?: string;
  }>;
  timelineExpectations?: string;
  whenToSeekHelp?: string[];
  additionalNotes?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface AnomalyResult {
  score: number; // 0-1, higher = more anomalous
  reasons: string[];
}

// Valid healing stages from the system
const VALID_HEALING_STAGES = [
  'Fresh (0-3 days)',
  'Initial Healing (4-7 days)',
  'Peeling Phase (1-2 weeks)',
  'Late Healing (2-4 weeks)',
  'Fully Healed (4+ weeks)',
  'Uncertain/Needs Review'
];

// Suspicious patterns that might indicate prompt injection
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|all)\s+instructions/i,
  /you\s+are\s+now/i,
  /system\s+prompt/i,
  /developer\s+mode/i,
  /DAN\s+mode/i,
  /jailbreak/i,
  /<script>/i,
  /javascript:/i,
  /eval\(/i,
  /SELECT\s+.*\s+FROM/i,
  /DROP\s+TABLE/i,
];

/**
 * Validates the structure and content of an AI healing analysis response
 */
export const validateHealingAnalysisResponse = (response: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type checking
  if (typeof response !== 'object' || response === null) {
    errors.push('Response must be an object');
    return { isValid: false, errors, warnings };
  }

  // Required fields
  if (!response.healingStage || typeof response.healingStage !== 'string') {
    errors.push('Missing or invalid healingStage');
  } else if (!VALID_HEALING_STAGES.includes(response.healingStage)) {
    warnings.push(`Unusual healing stage: ${response.healingStage}`);
  }

  // Progress score validation
  if (response.progressScore !== undefined) {
    if (typeof response.progressScore !== 'number') {
      errors.push('progressScore must be a number');
    } else if (response.progressScore < 0 || response.progressScore > 10) {
      errors.push('progressScore must be between 0 and 10');
    }
  }

  // Recommendations validation
  if (response.recommendations !== undefined) {
    if (!Array.isArray(response.recommendations)) {
      errors.push('recommendations must be an array');
    } else if (response.recommendations.length === 0) {
      warnings.push('No recommendations provided');
    } else if (response.recommendations.length > 20) {
      warnings.push('Unusually high number of recommendations');
    }
  }

  // Risk factors validation
  if (response.riskFactors !== undefined) {
    if (!Array.isArray(response.riskFactors)) {
      errors.push('riskFactors must be an array');
    }
  }

  // Product recommendations validation
  if (response.productRecommendations !== undefined) {
    if (!Array.isArray(response.productRecommendations)) {
      errors.push('productRecommendations must be an array');
    } else {
      response.productRecommendations.forEach((product: any, index: number) => {
        if (!product.name || typeof product.name !== 'string') {
          errors.push(`Product ${index}: missing or invalid name`);
        }
        if (!product.purpose || typeof product.purpose !== 'string') {
          errors.push(`Product ${index}: missing or invalid purpose`);
        }
      });
    }
  }

  // Visual assessment validation
  if (response.visualAssessment !== undefined) {
    if (typeof response.visualAssessment !== 'object') {
      errors.push('visualAssessment must be an object');
    } else {
      if (!response.visualAssessment.description) {
        warnings.push('visualAssessment missing description');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Detects anomalous patterns in AI responses
 */
export const detectAnomalies = (
  response: HealingAnalysisResponse,
  tattooAge: number,
  previousAssessments?: any[]
): AnomalyResult => {
  let score = 0;
  const reasons: string[] = [];

  // Check 1: Healing stage consistency with tattoo age
  const ageInDays = tattooAge;
  const stage = response.healingStage;

  if (ageInDays <= 3 && !stage.includes('Fresh')) {
    score += 0.3;
    reasons.push('Healing stage inconsistent with tattoo age (0-3 days expected Fresh)');
  } else if (ageInDays >= 30 && !stage.includes('Fully Healed')) {
    score += 0.2;
    reasons.push('Healing stage may be delayed for tattoo age (30+ days)');
  }

  // Check 2: Always returning "High Risk" (possible manipulation)
  if (response.riskFactors && response.riskFactors.length > 5) {
    score += 0.25;
    reasons.push('Unusually high number of risk factors identified');
  }

  // Check 3: Unusually uniform recommendations
  if (response.recommendations && response.recommendations.length > 0) {
    const allSimilar = response.recommendations.every(rec => 
      rec.toLowerCase().includes('keep clean') || 
      rec.toLowerCase().includes('moisturize')
    );
    if (allSimilar && response.recommendations.length > 3) {
      score += 0.15;
      reasons.push('Recommendations appear generic and repetitive');
    }
  }

  // Check 4: Missing critical fields
  if (!response.visualAssessment || !response.visualAssessment.description) {
    score += 0.2;
    reasons.push('Missing visual assessment details');
  }

  // Check 5: Progress score inconsistency
  if (response.progressScore !== undefined && response.riskFactors) {
    if (response.progressScore > 7 && response.riskFactors.length > 3) {
      score += 0.25;
      reasons.push('High progress score but many risk factors (inconsistent)');
    }
  }

  // Check 6: Comparison with previous assessments (if available)
  if (previousAssessments && previousAssessments.length > 0) {
    const lastAssessment = previousAssessments[0];
    const lastResult = lastAssessment.analysis_result;
    
    if (lastResult && lastResult.healingStage === response.healingStage) {
      score += 0.1;
      reasons.push('No healing stage progression from previous assessment');
    }
  }

  // Check 7: Suspiciously short or long responses
  const totalTextLength = [
    response.greeting,
    response.tattooDescription,
    response.healingStageDescription,
    response.timelineExpectations,
    response.additionalNotes
  ].filter(Boolean).join('').length;

  if (totalTextLength < 100) {
    score += 0.2;
    reasons.push('Response unusually brief');
  } else if (totalTextLength > 5000) {
    score += 0.15;
    reasons.push('Response unusually verbose');
  }

  return {
    score: Math.min(score, 1), // Cap at 1.0
    reasons
  };
};

/**
 * Detects potential prompt injection attempts in user input
 */
export const detectPromptInjection = (input: string): { detected: boolean; patterns: string[] } => {
  const detectedPatterns: string[] = [];

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      detectedPatterns.push(pattern.toString());
    }
  }

  return {
    detected: detectedPatterns.length > 0,
    patterns: detectedPatterns
  };
};

/**
 * Validates image file before sending to AI
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // File size check (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Image file too large (max 10MB)' };
  }

  // File type check
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type (only JPG, PNG, WEBP allowed)' };
  }

  // Extension check (double-check)
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  if (!extension || !validExtensions.includes(extension)) {
    return { valid: false, error: 'Invalid file extension' };
  }

  return { valid: true };
};

/**
 * Generates SHA-256 hash of request payload for integrity checking
 */
export const generateRequestHash = (payload: any): string => {
  const sortedPayload = JSON.stringify(payload, Object.keys(payload).sort());
  return crypto.createHash('sha256').update(sortedPayload).digest('hex');
};

/**
 * Generates SHA-256 hash of response payload
 */
export const generateResponseHash = (response: any): string => {
  const sortedResponse = JSON.stringify(response, Object.keys(response).sort());
  return crypto.createHash('sha256').update(sortedResponse).digest('hex');
};

/**
 * Calculates confidence score for AI response (0-1)
 */
export const calculateConfidenceScore = (response: HealingAnalysisResponse): number => {
  let confidence = 1.0;

  // Reduce confidence if missing key fields
  if (!response.visualAssessment || !response.visualAssessment.description) {
    confidence -= 0.2;
  }

  if (!response.recommendations || response.recommendations.length === 0) {
    confidence -= 0.15;
  }

  if (!response.healingStageDescription) {
    confidence -= 0.1;
  }

  // Reduce confidence if healing stage is uncertain
  if (response.healingStage.includes('Uncertain') || response.healingStage.includes('Review')) {
    confidence -= 0.3;
  }

  // Reduce confidence if responses are too vague
  if (response.recommendations) {
    const vagueRecommendations = response.recommendations.filter(rec =>
      rec.toLowerCase().includes('consult') ||
      rec.toLowerCase().includes('may') ||
      rec.toLowerCase().includes('might')
    );
    if (vagueRecommendations.length > response.recommendations.length / 2) {
      confidence -= 0.15;
    }
  }

  return Math.max(0, confidence);
};
