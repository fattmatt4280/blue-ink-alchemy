import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface DynamicPageProps {
  page: CmsPage;
  parentPage?: CmsPage | null;
  childPages?: CmsPage[];
}

export const DynamicPage = ({ page, parentPage, childPages = [] }: DynamicPageProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Normalize canonical URL - ensure no trailing slash except for homepage
  const normalizeCanonicalUrl = (url: string) => {
    if (!url) return url;
    // Remove trailing slash unless it's just the domain root
    const parsed = url.replace(/\/$/, '');
    // If it's just the domain, keep trailing slash
    if (parsed.match(/^https?:\/\/[^\/]+$/)) {
      return url.endsWith('/') ? url : url + '/';
    }
    return parsed;
  };

  const canonicalUrl = normalizeCanonicalUrl(page.canonical_url);

  // Generate URL for internal links - always without trailing slash
  const getPageUrl = (p: CmsPage) => {
    // When viewing a child page, parentPage is provided
    if (parentPage) {
      return `/${parentPage.slug}/${p.slug}`;
    }
    // When viewing a parent page, children should link to parent/child
    if (p.parent_id) {
      // We're on the parent page, so use the current page's slug as parent
      return `/${page.slug}/${p.slug}`;
    }
    // Top-level page - no trailing slash
    return `/${p.slug}`;
  };

  return (
    <>
      <Helmet>
        <title>{page.meta_title || page.title} | Blue Dream Budder</title>
        <meta name="description" content={page.meta_description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={page.meta_title || page.title} />
        <meta property="og:description" content={page.meta_description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {page.featured_image && (
          <meta property="og:image" content={page.featured_image} />
        )}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": page.title,
            "description": page.meta_description,
            "datePublished": page.publish_date,
            "dateModified": page.updated_at,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonicalUrl
            },
            ...(page.featured_image && {
              "image": page.featured_image
            })
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumbs - links without trailing slashes */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {parentPage && (
              <>
                <ChevronRight className="w-4 h-4" />
                <Link 
                  to={`/${parentPage.slug}`} 
                  className="hover:text-foreground transition-colors"
                >
                  {parentPage.title}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{page.title}</span>
          </nav>

          {/* Featured Image */}
          {page.featured_image && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={page.featured_image}
                alt={page.featured_image_alt || page.title}
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>
          )}

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{page.title}</h1>
            {page.excerpt && (
              <p className="text-xl text-muted-foreground mb-4">{page.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Published {formatDate(page.publish_date)}</span>
              </div>
              {page.updated_at !== page.created_at && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatDate(page.updated_at)}</span>
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground/90">
            <ReactMarkdown>{page.content_markdown}</ReactMarkdown>
          </article>

          {/* Child Pages (Sub-pages) - Related Articles */}
          {childPages.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {childPages.map((child) => (
                  <Link key={child.id} to={getPageUrl(child)}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      {child.featured_image && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={child.featured_image}
                            alt={child.featured_image_alt || child.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{child.title}</CardTitle>
                      </CardHeader>
                      {child.excerpt && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {child.excerpt}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to Parent - link without trailing slash */}
          {parentPage && (
            <div className="mt-12 pt-8 border-t border-border">
              <Link 
                to={`/${parentPage.slug}`}
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back to {parentPage.title}
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
};
