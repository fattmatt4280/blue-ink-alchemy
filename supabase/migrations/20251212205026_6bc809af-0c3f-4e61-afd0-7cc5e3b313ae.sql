-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create CMS pages table for dynamic page management
CREATE TABLE public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  parent_id uuid REFERENCES public.cms_pages(id) ON DELETE SET NULL,
  content_markdown text NOT NULL DEFAULT '',
  excerpt text,
  featured_image text,
  featured_image_alt text,
  meta_title text,
  meta_description text NOT NULL DEFAULT '',
  canonical_url text NOT NULL,
  publish_status text NOT NULL DEFAULT 'draft',
  publish_date timestamptz NOT NULL DEFAULT now(),
  display_order integer DEFAULT 0,
  show_in_nav boolean DEFAULT false,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slug, parent_id)
);

-- Create index for faster lookups
CREATE INDEX idx_cms_pages_slug ON public.cms_pages(slug);
CREATE INDEX idx_cms_pages_parent_id ON public.cms_pages(parent_id);
CREATE INDEX idx_cms_pages_publish_status ON public.cms_pages(publish_status);

-- Enable RLS
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published pages"
ON public.cms_pages FOR SELECT
USING (publish_status = 'published');

CREATE POLICY "Admins can manage all pages"
ON public.cms_pages FOR ALL
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_cms_pages_updated_at
BEFORE UPDATE ON public.cms_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();