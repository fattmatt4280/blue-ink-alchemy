/**
 * Security Score Calculator
 * Calculates overall security posture score (0-100)
 */

export interface SecurityMetrics {
  adminMfaEnabled: number; // % of admins with MFA
  recentSecurityIncidents: number; // Count in last 30 days
  aiAnomalyRate: number; // % of AI responses with high anomaly score
  piiAccessLogged: boolean; // Is PII access being logged?
  auditLogComplete: boolean; // Are admin actions being logged?
  rateLimitViolations: number; // Count in last 24h
  failedLoginAttempts: number; // Count in last 24h
}

export interface SecurityScore {
  overall: number; // 0-100
  breakdown: {
    authentication: number;
    dataProtection: number;
    aiIntegrity: number;
    monitoring: number;
  };
  recommendations: string[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * Calculate security score
 */
export const calculateSecurityScore = (metrics: SecurityMetrics): SecurityScore => {
  const recommendations: string[] = [];
  
  // Authentication Score (0-30 points)
  let authScore = 0;
  if (metrics.adminMfaEnabled >= 100) {
    authScore = 30;
  } else if (metrics.adminMfaEnabled >= 75) {
    authScore = 25;
    recommendations.push('Enable MFA for remaining admin accounts');
  } else if (metrics.adminMfaEnabled >= 50) {
    authScore = 20;
    recommendations.push('URGENT: Enable MFA for all admin accounts');
  } else if (metrics.adminMfaEnabled > 0) {
    authScore = 10;
    recommendations.push('CRITICAL: Most admins lack MFA protection');
  } else {
    authScore = 0;
    recommendations.push('CRITICAL: No admins have MFA enabled!');
  }

  // Reduce score for failed logins
  if (metrics.failedLoginAttempts > 50) {
    authScore -= 10;
    recommendations.push('High number of failed login attempts detected');
  } else if (metrics.failedLoginAttempts > 20) {
    authScore -= 5;
  }

  // Data Protection Score (0-30 points)
  let dataScore = 0;
  if (metrics.piiAccessLogged) {
    dataScore += 15;
  } else {
    recommendations.push('Enable PII access logging for compliance');
  }

  if (metrics.auditLogComplete) {
    dataScore += 15;
  } else {
    recommendations.push('Enable comprehensive audit logging');
  }

  // AI Integrity Score (0-25 points)
  let aiScore = 0;
  if (metrics.aiAnomalyRate <= 1) {
    aiScore = 25;
  } else if (metrics.aiAnomalyRate <= 5) {
    aiScore = 20;
    recommendations.push('Monitor AI anomaly rate');
  } else if (metrics.aiAnomalyRate <= 10) {
    aiScore = 15;
    recommendations.push('Investigate elevated AI anomaly rate');
  } else {
    aiScore = 5;
    recommendations.push('URGENT: High AI anomaly rate detected');
  }

  // Monitoring & Response Score (0-15 points)
  let monitorScore = 15;
  if (metrics.rateLimitViolations > 100) {
    monitorScore = 5;
    recommendations.push('High rate limit violations - potential attack');
  } else if (metrics.rateLimitViolations > 50) {
    monitorScore = 10;
    recommendations.push('Monitor rate limit violations');
  }

  // Deduct points for security incidents
  const incidentPenalty = Math.min(metrics.recentSecurityIncidents * 5, 20);
  
  const overall = Math.max(0, Math.min(100, 
    authScore + dataScore + aiScore + monitorScore - incidentPenalty
  ));

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (overall >= 90) grade = 'A';
  else if (overall >= 80) grade = 'B';
  else if (overall >= 70) grade = 'C';
  else if (overall >= 60) grade = 'D';
  else grade = 'F';

  return {
    overall: Math.round(overall),
    breakdown: {
      authentication: Math.max(0, Math.round(authScore)),
      dataProtection: Math.round(dataScore),
      aiIntegrity: Math.round(aiScore),
      monitoring: Math.round(monitorScore)
    },
    recommendations,
    grade
  };
};

/**
 * Get security grade color
 */
export const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A': return 'text-green-600';
    case 'B': return 'text-blue-600';
    case 'C': return 'text-yellow-600';
    case 'D': return 'text-orange-600';
    case 'F': return 'text-red-600';
    default: return 'text-gray-600';
  }
};
