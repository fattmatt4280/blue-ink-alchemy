import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Copy, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  parent_id: string | null;
  canonical_url: string;
  publish_status: string;
  meta_description: string;
}

interface SEOCheckItem {
  label: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  action?: () => void;
  actionLabel?: string;
}

export const SEOChecklist = () => {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const EXPECTED_CANONICALS = [
    { slug: 'tattoo-aftercare-guide', canonical: 'https://bluedreambudder.com/tattoo-aftercare-guide', title: 'Tattoo Aftercare Guide (parent)' },
    { slug: 'healing-timeline', canonical: 'https://bluedreambudder.com/tattoo-aftercare-guide/healing-timeline', title: 'Healing Timeline', parent: 'tattoo-aftercare-guide' },
    { slug: 'itching-peeling-scabbing', canonical: 'https://bluedreambudder.com/tattoo-aftercare-guide/itching-peeling-scabbing', title: 'Itching, Peeling & Scabbing', parent: 'tattoo-aftercare-guide' },
    { slug: 'first-30-days', canonical: 'https://bluedreambudder.com/tattoo-aftercare-guide/first-30-days', title: 'First 30 Days', parent: 'tattoo-aftercare-guide' },
    { slug: 'what-not-to-put-on-tattoos', canonical: 'https://bluedreambudder.com/tattoo-aftercare-guide/what-not-to-put-on-tattoos', title: 'What Not to Put on Tattoos', parent: 'tattoo-aftercare-guide' },
    { slug: 'why-some-tattoos-heal-badly', canonical: 'https://bluedreambudder.com/tattoo-aftercare-guide/why-some-tattoos-heal-badly', title: 'Why Some Tattoos Heal Badly', parent: 'tattoo-aftercare-guide' },
  ];

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cms_pages')
      .select('id, title, slug, parent_id, canonical_url, publish_status, meta_description')
      .eq('publish_status', 'published');

    if (error) {
      console.error('Error fetching pages:', error);
    } else {
      setPages(data || []);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const normalizeUrl = (url: string) => {
    // Remove trailing slash for comparison
    return url?.replace(/\/$/, '') || '';
  };

  const getPageChecks = (): SEOCheckItem[] => {
    const checks: SEOCheckItem[] = [];

    // Check each expected canonical
    EXPECTED_CANONICALS.forEach(expected => {
      const page = pages.find(p => p.slug === expected.slug);
      
      if (!page) {
        checks.push({
          label: expected.title,
          status: 'fail',
          details: `Page not found in CMS with slug: ${expected.slug}`,
        });
        return;
      }

      const normalizedActual = normalizeUrl(page.canonical_url);
      const normalizedExpected = normalizeUrl(expected.canonical);

      if (normalizedActual === normalizedExpected) {
        checks.push({
          label: expected.title,
          status: 'pass',
          details: `Canonical: ${expected.canonical}`,
          action: () => copyToClipboard(expected.canonical),
          actionLabel: 'Copy URL',
        });
      } else if (page.canonical_url?.includes(expected.slug)) {
        checks.push({
          label: expected.title,
          status: 'warning',
          details: `Current: ${page.canonical_url} | Expected: ${expected.canonical}`,
          action: () => updateCanonical(page.id, expected.canonical),
          actionLabel: 'Fix Canonical',
        });
      } else {
        checks.push({
          label: expected.title,
          status: 'fail',
          details: `Canonical mismatch. Current: ${page.canonical_url || 'not set'}`,
          action: () => updateCanonical(page.id, expected.canonical),
          actionLabel: 'Fix Canonical',
        });
      }
    });

    return checks;
  };

  const updateCanonical = async (pageId: string, canonical: string) => {
    const { error } = await supabase
      .from('cms_pages')
      .update({ canonical_url: canonical })
      .eq('id', pageId);

    if (error) {
      toast.error('Failed to update canonical URL');
      console.error(error);
    } else {
      toast.success('Canonical URL updated');
      fetchPages();
    }
  };

  const fixAllCanonicals = async () => {
    setChecking(true);
    let fixed = 0;
    
    for (const expected of EXPECTED_CANONICALS) {
      const page = pages.find(p => p.slug === expected.slug);
      if (page && normalizeUrl(page.canonical_url) !== normalizeUrl(expected.canonical)) {
        const { error } = await supabase
          .from('cms_pages')
          .update({ canonical_url: expected.canonical })
          .eq('id', page.id);
        
        if (!error) fixed++;
      }
    }

    if (fixed > 0) {
      toast.success(`Fixed ${fixed} canonical URLs`);
      fetchPages();
    } else {
      toast.info('All canonicals are already correct');
    }
    setChecking(false);
  };

  const checks = getPageChecks();
  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading SEO data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                SEO Checklist
                <Badge variant={failCount > 0 ? 'destructive' : warningCount > 0 ? 'secondary' : 'default'}>
                  {passCount}/{checks.length} Passing
                </Badge>
              </CardTitle>
              <CardDescription>
                Verify canonical URLs and SEO settings for aftercare guide pages
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchPages}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {(failCount > 0 || warningCount > 0) && (
                <Button size="sm" onClick={fixAllCanonicals} disabled={checking}>
                  Fix All Canonicals
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checks.map((check, idx) => (
              <div 
                key={idx} 
                className={`flex items-start justify-between p-3 rounded-lg border ${
                  check.status === 'pass' ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' :
                  check.status === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900' :
                  'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {check.status === 'pass' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : check.status === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-medium">{check.label}</div>
                    <div className="text-sm text-muted-foreground break-all">{check.details}</div>
                  </div>
                </div>
                {check.action && (
                  <Button variant="ghost" size="sm" onClick={check.action} className="flex-shrink-0">
                    {check.actionLabel === 'Copy URL' ? <Copy className="w-4 h-4" /> : check.actionLabel}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Search Console Workflow</CardTitle>
          <CardDescription>Steps to resolve indexing issues</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</span>
              <div>
                <strong>Verify all canonicals above are passing</strong>
                <p className="text-muted-foreground">Each page should have the exact canonical URL shown (no trailing slash)</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">2</span>
              <div>
                <strong>Request indexing in Search Console</strong>
                <p className="text-muted-foreground">Start with the parent page, then request 1 child page</p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                    Open Search Console <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">3</span>
              <div>
                <strong>Monitor Page Indexing report</strong>
                <p className="text-muted-foreground">Check for "Duplicate without user-selected canonical" issues over 1-2 weeks</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">4</span>
              <div>
                <strong>Verify sitemap is submitted</strong>
                <p className="text-muted-foreground">Sitemap should be at: https://bluedreambudder.com/sitemap.xml</p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="https://bluedreambudder.com/sitemap.xml" target="_blank" rel="noopener noreferrer">
                    View Sitemap <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Canonical URLs Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Canonical URL Reference</CardTitle>
          <CardDescription>Copy these URLs for Search Console or internal linking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {EXPECTED_CANONICALS.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div>
                  <div className="text-sm font-medium">{item.title}</div>
                  <code className="text-xs text-muted-foreground">{item.canonical}</code>
                </div>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.canonical)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOChecklist;
