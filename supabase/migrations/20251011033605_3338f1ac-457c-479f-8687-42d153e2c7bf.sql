-- Delete all test data except for the admin account (matt@dreamtattoocompany.com)
-- Admin user ID: eb4f8e70-599d-4494-98a6-1b3ec6e4427c

-- Delete AI response logs for non-admin users
DELETE FROM public.ai_response_logs 
WHERE user_id IS NOT NULL AND user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete healing Q&A interactions for non-admin users
DELETE FROM public.healing_qa_interactions 
WHERE user_id IS NOT NULL AND user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete PII access logs for non-admin users
DELETE FROM public.pii_access_log 
WHERE accessed_user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c' 
   OR admin_user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete MFA sessions for non-admin users
DELETE FROM public.mfa_sessions 
WHERE user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete HealAid upgrade history for non-admin users
DELETE FROM public.healaid_upgrade_history 
WHERE user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete analytics events for non-admin users
DELETE FROM public.analytics_events 
WHERE user_id IS NOT NULL AND user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete abandoned carts for non-admin users
DELETE FROM public.abandoned_carts 
WHERE user_id IS NOT NULL AND user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete orders for non-admin users
DELETE FROM public.orders 
WHERE user_id IS NOT NULL AND user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete healing progress for non-admin users
DELETE FROM public.healing_progress 
WHERE user_id IS NOT NULL AND user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete HealAid subscriptions for non-admin users
DELETE FROM public.healaid_subscriptions 
WHERE user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete HealAid usage tracking for non-admin users
DELETE FROM public.healaid_usage_tracking 
WHERE user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete HealAid activation codes activated by non-admin users
DELETE FROM public.healaid_activation_codes 
WHERE activated_by IS NOT NULL AND activated_by != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete push subscriptions for non-admin users
DELETE FROM public.push_subscriptions 
WHERE user_id IS NOT NULL AND user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete profiles for non-admin users
DELETE FROM public.profiles 
WHERE id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Delete user roles for non-admin users
DELETE FROM public.user_roles 
WHERE user_id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';

-- Finally, delete auth.users (except admin)
DELETE FROM auth.users 
WHERE id != 'eb4f8e70-599d-4494-98a6-1b3ec6e4427c';