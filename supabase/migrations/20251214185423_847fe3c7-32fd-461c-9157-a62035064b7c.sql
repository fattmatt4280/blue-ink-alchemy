-- Create shipping_queue table for admin review workflow
CREATE TABLE public.shipping_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_rates' CHECK (status IN ('pending_rates', 'fetching_rates', 'ready_for_review', 'approved', 'failed', 'skipped', 'manual')),
  fetched_rates JSONB DEFAULT '[]'::jsonb,
  shippo_shipment_id TEXT,
  selected_rate_id TEXT,
  selected_carrier TEXT,
  selected_service TEXT,
  selected_amount NUMERIC,
  label_url TEXT,
  tracking_number TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

-- Enable RLS
ALTER TABLE public.shipping_queue ENABLE ROW LEVEL SECURITY;

-- Admins can manage shipping queue
CREATE POLICY "Admins can manage shipping queue"
ON public.shipping_queue
FOR ALL
USING (is_admin());

-- Service can manage shipping queue
CREATE POLICY "Service can manage shipping queue"
ON public.shipping_queue
FOR ALL
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_shipping_queue_updated_at
BEFORE UPDATE ON public.shipping_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_shipping_queue_status ON public.shipping_queue(status);
CREATE INDEX idx_shipping_queue_order_id ON public.shipping_queue(order_id);