-- Create marketing_contacts table (unified customer list)
CREATE TABLE public.marketing_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  subscribed BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  tags TEXT[] DEFAULT '{}',
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_campaigns table
CREATE TABLE public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  filter_tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email_campaign_recipients table
CREATE TABLE public.email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.marketing_contacts(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.marketing_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketing_contacts
CREATE POLICY "Admins can manage marketing contacts"
ON public.marketing_contacts FOR ALL
USING (is_admin());

CREATE POLICY "Service can manage marketing contacts"
ON public.marketing_contacts FOR ALL
USING (true);

-- RLS policies for email_campaigns
CREATE POLICY "Admins can manage email campaigns"
ON public.email_campaigns FOR ALL
USING (is_admin());

-- RLS policies for email_campaign_recipients
CREATE POLICY "Admins can manage campaign recipients"
ON public.email_campaign_recipients FOR ALL
USING (is_admin());

CREATE POLICY "Service can manage campaign recipients"
ON public.email_campaign_recipients FOR ALL
USING (true);

-- Create indexes
CREATE INDEX idx_marketing_contacts_email ON public.marketing_contacts(email);
CREATE INDEX idx_marketing_contacts_subscribed ON public.marketing_contacts(subscribed);
CREATE INDEX idx_marketing_contacts_tags ON public.marketing_contacts USING GIN(tags);
CREATE INDEX idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX idx_email_campaign_recipients_campaign ON public.email_campaign_recipients(campaign_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_marketing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_marketing_contacts_updated_at
BEFORE UPDATE ON public.marketing_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_marketing_updated_at();

CREATE TRIGGER update_email_campaigns_updated_at
BEFORE UPDATE ON public.email_campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_marketing_updated_at();

-- Function to sync contact from order
CREATE OR REPLACE FUNCTION public.sync_order_to_marketing_contacts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    INSERT INTO public.marketing_contacts (email, source, tags, total_orders, total_spent, last_order_at)
    VALUES (LOWER(NEW.email), 'order', ARRAY['customer'], 1, NEW.amount / 100.0, NOW())
    ON CONFLICT (email) DO UPDATE SET
      total_orders = marketing_contacts.total_orders + 1,
      total_spent = marketing_contacts.total_spent + EXCLUDED.total_spent,
      last_order_at = NOW(),
      tags = CASE 
        WHEN NOT ('customer' = ANY(marketing_contacts.tags)) 
        THEN array_append(marketing_contacts.tags, 'customer')
        ELSE marketing_contacts.tags
      END,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for order sync
CREATE TRIGGER sync_paid_order_to_marketing
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.sync_order_to_marketing_contacts();

-- Function to sync newsletter signup
CREATE OR REPLACE FUNCTION public.sync_newsletter_to_marketing_contacts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.marketing_contacts (email, source, tags)
  VALUES (LOWER(NEW.email), 'newsletter', ARRAY['newsletter'])
  ON CONFLICT (email) DO UPDATE SET
    tags = CASE 
      WHEN NOT ('newsletter' = ANY(marketing_contacts.tags)) 
      THEN array_append(marketing_contacts.tags, 'newsletter')
      ELSE marketing_contacts.tags
    END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for newsletter sync
CREATE TRIGGER sync_newsletter_to_marketing
AFTER INSERT ON public.newsletter_signups
FOR EACH ROW EXECUTE FUNCTION public.sync_newsletter_to_marketing_contacts();

-- Initial sync: Import existing newsletter signups
INSERT INTO public.marketing_contacts (email, source, tags)
SELECT DISTINCT LOWER(email), 'newsletter', ARRAY['newsletter']
FROM public.newsletter_signups WHERE active = true
ON CONFLICT (email) DO UPDATE SET
  tags = CASE 
    WHEN NOT ('newsletter' = ANY(marketing_contacts.tags)) 
    THEN array_append(marketing_contacts.tags, 'newsletter')
    ELSE marketing_contacts.tags
  END;

-- Initial sync: Import existing paid orders
INSERT INTO public.marketing_contacts (email, source, tags, total_orders, total_spent, last_order_at)
SELECT 
  LOWER(email), 
  'order', 
  ARRAY['customer'], 
  COUNT(*), 
  SUM(amount) / 100.0,
  MAX(created_at)
FROM public.orders 
WHERE status = 'paid'
GROUP BY LOWER(email)
ON CONFLICT (email) DO UPDATE SET
  total_orders = EXCLUDED.total_orders,
  total_spent = EXCLUDED.total_spent,
  last_order_at = EXCLUDED.last_order_at,
  tags = CASE 
    WHEN NOT ('customer' = ANY(marketing_contacts.tags)) 
    THEN array_append(marketing_contacts.tags, 'customer')
    ELSE marketing_contacts.tags
  END;