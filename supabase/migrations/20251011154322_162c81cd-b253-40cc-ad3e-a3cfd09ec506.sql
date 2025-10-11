-- Create healing_reminders table
CREATE TABLE healing_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  healing_progress_id UUID REFERENCES healing_progress(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  delivery_method TEXT NOT NULL DEFAULT 'email',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT reminder_type_check CHECK (reminder_type IN ('clean', 'moisturize', 'upload_photo', 'check_symptoms', 'avoid_activity', 'medication')),
  CONSTRAINT status_check CHECK (status IN ('pending', 'sent', 'failed', 'cancelled', 'snoozed')),
  CONSTRAINT delivery_method_check CHECK (delivery_method IN ('email', 'push', 'both'))
);

-- Indexes for performance
CREATE INDEX idx_healing_reminders_user ON healing_reminders(user_id);
CREATE INDEX idx_healing_reminders_status ON healing_reminders(status);
CREATE INDEX idx_healing_reminders_scheduled ON healing_reminders(scheduled_for);
CREATE INDEX idx_healing_reminders_type ON healing_reminders(reminder_type);

-- Enable RLS
ALTER TABLE healing_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reminders"
  ON healing_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON healing_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert reminders"
  ON healing_reminders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all reminders"
  ON healing_reminders FOR ALL
  USING (is_admin());

-- Create reminder_templates table
CREATE TABLE reminder_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT UNIQUE NOT NULL,
  reminder_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message_template TEXT NOT NULL,
  hours_after_tattoo INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  requires_conditions JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reminder_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates"
  ON reminder_templates FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage templates"
  ON reminder_templates FOR ALL
  USING (is_admin());

-- Insert default templates
INSERT INTO reminder_templates (template_name, reminder_type, title, message_template, hours_after_tattoo, priority) VALUES
  ('first_clean', 'clean', '🧼 Time to Clean Your Tattoo', 'Hi {{user_name}}! It''s been {{hours}} hours since you got your tattoo. Time for your first gentle cleaning with antibacterial soap. Pat dry with a clean paper towel.', 3, 10),
  ('second_clean', 'clean', '🧼 Second Cleaning', 'Hi {{user_name}}! Keep your tattoo clean - gentle wash and pat dry. No scrubbing!', 8, 9),
  ('first_moisturize', 'moisturize', '💧 First Moisturize', 'Time to moisturize {{user_name}}! Apply a thin layer of aftercare ointment. Less is more!', 12, 8),
  ('daily_clean', 'clean', '🧼 Daily Cleaning', 'Good morning {{user_name}}! Clean your tattoo 2-3 times today with gentle soap.', 24, 7),
  ('moisturize_regular', 'moisturize', '💧 Keep It Moisturized', 'Hi {{user_name}}! Moisturize 3-4 times today. Your skin should feel comfortable, not tight.', 36, 6),
  ('avoid_sun', 'avoid_activity', '☀️ Protect from Sun', 'Hey {{user_name}}, keep your tattoo covered from direct sunlight. No tanning!', 48, 5),
  ('no_swimming', 'avoid_activity', '🏊‍♀️ No Swimming', 'Remember {{user_name}}: No swimming, hot tubs, or soaking for 2+ weeks. Showers are fine!', 72, 5),
  ('peeling_normal', 'check_symptoms', '✨ Peeling is Normal', 'Hi {{user_name}}! Your tattoo may start to peel. This is normal - don''t pick or scratch!', 192, 4),
  ('upload_progress', 'upload_photo', '📸 Progress Photo Time', 'Hey {{user_name}}! Upload a progress photo to track your healing journey!', 168, 8),
  ('two_week_check', 'upload_photo', '📸 Two Week Check-In', 'Hi {{user_name}}! Time for your 2-week progress photo!', 336, 7),
  ('final_check', 'upload_photo', '🎉 Final Check - You''re Healed!', 'Congrats {{user_name}}! Upload your final healed tattoo photo!', 720, 10),
  ('infection_check', 'check_symptoms', '⚕️ Check for Signs', 'Hi {{user_name}}, check for infection signs: excessive redness, pus, or fever. Seek medical attention if concerned!', 120, 10);

-- Create user_reminder_preferences table
CREATE TABLE user_reminder_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'America/New_York',
  snooze_duration_hours INTEGER DEFAULT 2,
  reminder_types JSONB DEFAULT '{"clean": true, "moisturize": true, "upload_photo": true, "check_symptoms": true, "avoid_activity": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_reminder_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON user_reminder_preferences FOR ALL
  USING (auth.uid() = user_id);