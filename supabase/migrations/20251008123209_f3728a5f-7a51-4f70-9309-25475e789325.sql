-- Create abandoned carts table
CREATE TABLE public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cart_items JSONB NOT NULL,
  cart_value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_sent_at TIMESTAMPTZ,
  email_opened BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  discount_code_used TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_abandoned_carts_email ON public.abandoned_carts(email);
CREATE INDEX idx_abandoned_carts_created_at ON public.abandoned_carts(created_at);
CREATE INDEX idx_abandoned_carts_email_sent ON public.abandoned_carts(email_sent_at);
CREATE INDEX idx_abandoned_carts_converted ON public.abandoned_carts(converted);

-- Enable RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all abandoned carts"
ON public.abandoned_carts
FOR SELECT
USING (is_admin());

CREATE POLICY "Users can view their own abandoned carts"
ON public.abandoned_carts
FOR SELECT
USING (auth.email() = email);

CREATE POLICY "Service can manage abandoned carts"
ON public.abandoned_carts
FOR ALL
USING (true);