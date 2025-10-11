-- Create shipment_reminders table
CREATE TABLE public.shipment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('stalled', 'delivery_approaching', 'custom')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  email_recipient TEXT NOT NULL,
  message_template TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.shipment_reminders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage reminders"
  ON public.shipment_reminders FOR ALL
  USING (public.is_admin());

CREATE POLICY "Service can insert reminders"
  ON public.shipment_reminders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own reminders"
  ON public.shipment_reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = shipment_reminders.order_id 
      AND (orders.user_id = auth.uid() OR orders.email = auth.email())
    )
  );

-- Indexes for performance
CREATE INDEX idx_shipment_reminders_status ON public.shipment_reminders(status);
CREATE INDEX idx_shipment_reminders_scheduled ON public.shipment_reminders(scheduled_for);
CREATE INDEX idx_shipment_reminders_shipment ON public.shipment_reminders(shipment_id);

-- Trigger for updated_at
CREATE TRIGGER update_shipment_reminders_updated_at
  BEFORE UPDATE ON public.shipment_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipment_updated_at();

-- Create reminder_settings table
CREATE TABLE public.reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Admins can manage settings"
  ON public.reminder_settings FOR ALL
  USING (public.is_admin());

-- Insert default settings
INSERT INTO public.reminder_settings (setting_key, setting_value, description) VALUES
  ('stalled_shipment_days', '{"days": 3}', 'Send reminder if shipment hasn''t updated in X days'),
  ('auto_reminders_enabled', '{"enabled": true}', 'Enable/disable automatic reminders'),
  ('reminder_email_template', '{"subject": "Update on Your Order", "template": "Your order is on the way! Track it here: {tracking_url}"}', 'Email template configuration');