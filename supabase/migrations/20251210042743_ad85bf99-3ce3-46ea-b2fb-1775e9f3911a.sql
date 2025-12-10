-- Add foreign key relationship between healing_reminders and profiles
ALTER TABLE healing_reminders 
ADD CONSTRAINT fk_healing_reminders_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update all pending reminders to use email-only delivery (since push notifications don't work on web)
UPDATE healing_reminders 
SET delivery_method = 'email' 
WHERE status = 'pending' AND delivery_method IN ('both', 'push');