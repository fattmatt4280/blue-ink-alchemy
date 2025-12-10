-- Create referral_profiles table to track user referral stats and tier
CREATE TABLE public.referral_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  current_tier TEXT NOT NULL DEFAULT 'sprout',
  store_credit_balance NUMERIC NOT NULL DEFAULT 0,
  permanent_discount_percent NUMERIC NOT NULL DEFAULT 0,
  free_shipping_until TIMESTAMP WITH TIME ZONE,
  free_budder_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create referrals table to track individual referral events
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  credit_amount NUMERIC DEFAULT 0,
  discount_given NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.referral_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_profiles
CREATE POLICY "Users can view their own referral profile"
ON public.referral_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral profile"
ON public.referral_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service can manage referral profiles"
ON public.referral_profiles FOR ALL
USING (true);

CREATE POLICY "Admins can view all referral profiles"
ON public.referral_profiles FOR SELECT
USING (is_admin());

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals"
ON public.referrals FOR SELECT
USING (auth.uid() = referrer_id);

CREATE POLICY "Service can manage referrals"
ON public.referrals FOR ALL
USING (true);

CREATE POLICY "Admins can view all referrals"
ON public.referrals FOR SELECT
USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referral_profiles_code ON public.referral_profiles(referral_code);

-- Function to update referral_profiles updated_at
CREATE OR REPLACE FUNCTION public.update_referral_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for updated_at
CREATE TRIGGER update_referral_profiles_updated_at
BEFORE UPDATE ON public.referral_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_referral_profile_updated_at();