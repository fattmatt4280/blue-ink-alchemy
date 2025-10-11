-- Delete old Heal-AId products that are no longer used
-- These were replaced by the new subscription tier system
DELETE FROM products 
WHERE id IN (
  'fa8c7591-9773-4c6d-8923-52abc49cf5ca', -- Heal-AId 3-Day Free Trial
  '8c6b1a2e-95ed-40c6-8999-0d37a885363e', -- Heal-AId 7-Day Upgrade
  '4abbe889-f6f3-4071-8f7c-ab263dbdc0d9'  -- Heal-AId 30-Day Upgrade
);