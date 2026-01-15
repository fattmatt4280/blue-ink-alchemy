import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DynamicPage } from './DynamicPage';
import AppHeader from './AppHeader';
import Footer from './Footer';

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  parent_id: string | null;
  content_markdown: string;
  excerpt: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  meta_title: string | null;
  meta_description: string;
  canonical_url: string;
  publish_status: string;
  publish_date: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// List of static routes that should not be handled by the CMS
const STATIC_ROUTES = [
  'shop', 'auth', 'admin', 'checkout', 'contact', 'reviews',
  'blog', 'tracking', 'referrals', 'privacy-policy', 'terms-of-service',
  'how-to-use', 'size-guide', 'tattoo-aftercare', 'wholesale', 'unsubscribe',
  'product', 'admin-security'
];

export const DynamicPageHandler = () => {
  const { parentSlug, childSlug } = useParams<{ parentSlug?: string; childSlug?: string }>();
  const [page, setPage] = useState<CmsPage | null>(null);
  const [parentPage, setParentPage] = useState<CmsPage | null>(null);
  const [childPages, setChildPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setNotFound(false);

      // If this is a static route, mark as not found to let React Router handle it
      if (parentSlug && STATIC_ROUTES.includes(parentSlug.toLowerCase())) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        if (childSlug && parentSlug) {
          // Fetch child page with parent
          const { data: parent, error: parentError } = await supabase
            .from('cms_pages')
            .select('*')
            .eq('slug', parentSlug)
            .is('parent_id', null)
            .eq('publish_status', 'published')
            .single();

          if (parentError || !parent) {
            setNotFound(true);
            setLoading(false);
            return;
          }

          const { data: child, error: childError } = await supabase
            .from('cms_pages')
            .select('*')
            .eq('slug', childSlug)
            .eq('parent_id', parent.id)
            .eq('publish_status', 'published')
            .single();

          if (childError || !child) {
            setNotFound(true);
            setLoading(false);
            return;
          }

          setParentPage(parent);
          setPage(child);
          setChildPages([]);
        } else if (parentSlug) {
          // Fetch parent page and its children
          const { data: pageData, error: pageError } = await supabase
            .from('cms_pages')
            .select('*')
            .eq('slug', parentSlug)
            .is('parent_id', null)
            .eq('publish_status', 'published')
            .single();

          if (pageError || !pageData) {
            setNotFound(true);
            setLoading(false);
            return;
          }

          // Fetch child pages
          const { data: children } = await supabase
            .from('cms_pages')
            .select('*')
            .eq('parent_id', pageData.id)
            .eq('publish_status', 'published')
            .order('display_order', { ascending: true });

          setPage(pageData);
          setParentPage(null);
          setChildPages(children || []);
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setNotFound(true);
      }

      setLoading(false);
    };

    if (parentSlug) {
      fetchPage();
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [parentSlug, childSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (notFound || !page) {
    return <Navigate to="/404" replace />;
  }

  return (
    <>
      <AppHeader />
      <DynamicPage 
        page={page} 
        parentPage={parentPage} 
        childPages={childPages} 
      />
      <Footer />
    </>
  );
};
