-- Create shipping_rates table to store real-time shipping rates
CREATE TABLE public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  service_level TEXT NOT NULL,
  rate_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  estimated_days INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create shipments table to track shipping labels and packages
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  shippo_transaction_id TEXT UNIQUE,
  shippo_tracking_number TEXT,
  carrier TEXT,
  service_level TEXT,
  tracking_status TEXT DEFAULT 'UNKNOWN',
  tracking_url TEXT,
  label_url TEXT,
  shipping_cost DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create shipping_addresses table for standardized addresses
CREATE TABLE public.shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  street1 TEXT NOT NULL,
  street2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  phone TEXT,
  email TEXT,
  is_validated BOOLEAN DEFAULT false,
  shippo_address_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all shipping tables
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

-- RLS policies for shipping_rates
CREATE POLICY "Users can view their own shipping rates" 
ON public.shipping_rates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = shipping_rates.order_id 
    AND (orders.user_id = auth.uid() OR orders.email = auth.email())
  )
);

CREATE POLICY "Service can manage shipping rates" 
ON public.shipping_rates 
FOR ALL 
USING (true);

-- RLS policies for shipments
CREATE POLICY "Users can view their own shipments" 
ON public.shipments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = shipments.order_id 
    AND (orders.user_id = auth.uid() OR orders.email = auth.email())
  )
);

CREATE POLICY "Service can manage shipments" 
ON public.shipments 
FOR ALL 
USING (true);

-- RLS policies for shipping_addresses
CREATE POLICY "Users can view their own shipping addresses" 
ON public.shipping_addresses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = shipping_addresses.order_id 
    AND (orders.user_id = auth.uid() OR orders.email = auth.email())
  )
);

CREATE POLICY "Service can manage shipping addresses" 
ON public.shipping_addresses 
FOR ALL 
USING (true);

-- Create function to update shipment timestamps
CREATE OR REPLACE FUNCTION public.update_shipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shipment_updated_at();