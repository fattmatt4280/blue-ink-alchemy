-- Clean up database: Delete all users except admin and reset activation codes
-- Admin user: matt@dreamtattoocompany.com (ID: eb4f8e70-599d-4494-98a6-1b3ec6e4427c)

DO $$ 
DECLARE
  admin_user_id uuid := 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';
BEGIN
  -- Delete healing Q&A interactions first (references healing_progress)
  DELETE FROM healing_qa_interactions 
  WHERE user_id IS NOT NULL AND user_id != admin_user_id;

  -- Delete AI assessment ratings (references healing_progress)
  DELETE FROM ai_assessment_ratings
  WHERE expert_user_id IS NOT NULL AND expert_user_id != admin_user_id;

  -- Delete AI response logs for non-admin users
  DELETE FROM ai_response_logs 
  WHERE user_id IS NOT NULL AND user_id != admin_user_id;

  -- Now delete healing progress
  DELETE FROM healing_progress 
  WHERE user_id != admin_user_id OR user_id IS NULL;

  -- Delete healaid subscriptions for non-admin users
  DELETE FROM healaid_subscriptions 
  WHERE user_id != admin_user_id;

  -- Delete healaid upgrade history for non-admin users
  DELETE FROM healaid_upgrade_history 
  WHERE user_id != admin_user_id;

  -- Delete activation codes activated by non-admin users
  DELETE FROM healaid_activation_codes 
  WHERE activated_by IS NOT NULL AND activated_by != admin_user_id;

  -- Delete orders for non-admin users
  DELETE FROM orders 
  WHERE user_id IS NOT NULL AND user_id != admin_user_id;

  -- Delete analytics events for non-admin users
  DELETE FROM analytics_events 
  WHERE user_id IS NOT NULL AND user_id != admin_user_id;

  -- Delete abandoned carts for non-admin users
  DELETE FROM abandoned_carts 
  WHERE user_id IS NOT NULL AND user_id != admin_user_id;

  -- Delete usage tracking for non-admin users
  DELETE FROM healaid_usage_tracking 
  WHERE user_id != admin_user_id;

  -- Delete MFA sessions for non-admin users
  DELETE FROM mfa_sessions 
  WHERE user_id != admin_user_id;

  -- Delete user roles for non-admin users
  DELETE FROM user_roles 
  WHERE user_id != admin_user_id;

  -- Delete profiles for non-admin users
  DELETE FROM profiles 
  WHERE id != admin_user_id;

  -- Finally, delete auth.users entries (this will cascade to remaining data)
  DELETE FROM auth.users 
  WHERE id != admin_user_id;

  -- Reset all activation codes so they can be used again
  UPDATE healaid_activation_codes
  SET 
    redeemed = false,
    activated_by = NULL,
    activation_date = NULL,
    expiration_date = NULL,
    email = NULL,
    upgraded = false
  WHERE redeemed = true;

END $$;