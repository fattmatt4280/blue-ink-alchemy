-- Phase 2: Add indexes for AI response monitoring and rate limiting performance

-- Speed up anomaly detection queries
CREATE INDEX IF NOT EXISTS idx_ai_response_logs_anomaly 
ON public.ai_response_logs(anomaly_score DESC, created_at DESC) 
WHERE anomaly_score > 0.7;

-- Speed up rate limit checks (without time-based filter)
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_identifier 
ON public.rate_limit_violations(identifier, action_type, last_violation_at DESC);

-- Speed up AI response time analysis
CREATE INDEX IF NOT EXISTS idx_ai_response_logs_performance
ON public.ai_response_logs(model_used, response_time_ms, created_at DESC);

-- Speed up healing stage analysis
CREATE INDEX IF NOT EXISTS idx_ai_response_logs_healing_stage
ON public.ai_response_logs(healing_stage, created_at DESC);