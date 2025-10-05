-- Create activation codes table
CREATE TABLE public.healyn_activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  email TEXT,
  redeemed BOOLEAN DEFAULT false,
  activated_by UUID REFERENCES auth.users(id),
  activation_date TIMESTAMP WITH TIME ZONE,
  expiration_date TIMESTAMP WITH TIME ZONE,
  tier TEXT DEFAULT 'free_trial',
  upgraded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.healyn_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free_trial',
  activation_code TEXT REFERENCES healyn_activation_codes(code),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create upgrade history table
CREATE TABLE public.healyn_upgrade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES healyn_subscriptions(id) ON DELETE CASCADE,
  old_tier TEXT,
  new_tier TEXT NOT NULL,
  amount DECIMAL(10,2),
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.healyn_activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healyn_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healyn_upgrade_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activation codes
CREATE POLICY "Anyone can view unredeemed codes for activation"
ON public.healyn_activation_codes
FOR SELECT
USING (NOT redeemed OR activated_by = auth.uid());

CREATE POLICY "Service can manage activation codes"
ON public.healyn_activation_codes
FOR ALL
USING (true);

CREATE POLICY "Admins can manage activation codes"
ON public.healyn_activation_codes
FOR ALL
USING (is_admin());

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.healyn_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service can manage subscriptions"
ON public.healyn_subscriptions
FOR ALL
USING (true);

CREATE POLICY "Admins can view all subscriptions"
ON public.healyn_subscriptions
FOR SELECT
USING (is_admin());

-- RLS Policies for upgrade history
CREATE POLICY "Users can view their own upgrade history"
ON public.healyn_upgrade_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert upgrade history"
ON public.healyn_upgrade_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all upgrade history"
ON public.healyn_upgrade_history
FOR SELECT
USING (is_admin());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_healyn_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_healyn_activation_codes_updated_at
BEFORE UPDATE ON public.healyn_activation_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_healyn_updated_at();

CREATE TRIGGER update_healyn_subscriptions_updated_at
BEFORE UPDATE ON public.healyn_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_healyn_updated_at();

-- Function to check if user has active Healyn subscription
CREATE OR REPLACE FUNCTION public.has_active_healyn_subscription(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.healyn_subscriptions
    WHERE user_id = user_id_param
    AND is_active = true
    AND expiration_date > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;