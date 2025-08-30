-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) <= 65),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  author TEXT NOT NULL,
  excerpt TEXT NOT NULL CHECK (length(excerpt) <= 220),
  categories TEXT[],
  tags TEXT[],
  featured_image TEXT NOT NULL,
  featured_image_alt TEXT NOT NULL,
  meta_title TEXT CHECK (length(meta_title) <= 65),
  meta_description TEXT NOT NULL CHECK (length(meta_description) BETWEEN 120 AND 160),
  canonical_url TEXT NOT NULL,
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK (publish_status IN ('draft', 'published')),
  publish_date TIMESTAMP WITH TIME ZONE NOT NULL,
  cta_text TEXT,
  cta_url TEXT,
  video_embed_url TEXT,
  related_post_ids UUID[],
  content_markdown TEXT NOT NULL,
  backlink_sources TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create blog categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blog tags table
CREATE TABLE public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published posts" 
ON public.blog_posts 
FOR SELECT 
USING (publish_status = 'published');

CREATE POLICY "Admins can manage all posts" 
ON public.blog_posts 
FOR ALL 
USING (is_admin());

-- RLS Policies for blog_categories
CREATE POLICY "Anyone can view categories" 
ON public.blog_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.blog_categories 
FOR ALL 
USING (is_admin());

-- RLS Policies for blog_tags
CREATE POLICY "Anyone can view tags" 
ON public.blog_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tags" 
ON public.blog_tags 
FOR ALL 
USING (is_admin());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_blog_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_post_updated_at();