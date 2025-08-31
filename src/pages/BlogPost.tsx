import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft, ExternalLink, Share2, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  excerpt: string;
  categories: string[];
  tags: string[];
  featured_image: string;
  featured_image_alt: string;
  meta_title?: string;
  meta_description: string;
  canonical_url: string;
  publish_date: string;
  cta_text?: string;
  cta_url?: string;
  video_embed_url?: string;
  content_markdown: string;
  backlink_sources: string[];
  created_at: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  featured_image_alt: string;
  publish_date: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('publish_status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        }
        throw error;
      }

      const blogPost = data as BlogPost;
      setPost(blogPost);
      
      // Fetch related posts
      await fetchRelatedPosts(blogPost);
    } catch (error) {
      console.error('Error fetching post:', error);
      if (!notFound) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (currentPost: BlogPost) => {
    try {
      // Get posts with similar categories or tags
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, featured_image, featured_image_alt, publish_date')
        .eq('publish_status', 'published')
        .neq('id', currentPost.id)
        .limit(3);

      if (error) throw error;
      
      // For now, just return the first 3 posts as related
      const related = (data || []).slice(0, 3);

      setRelatedPosts(related as RelatedPost[]);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const processContent = (content: string) => {
    // Process internal links
    return content.replace(
      /\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\)/g,
      '[$1](https://bluedreambudder.com/$2)'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/404" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.meta_description,
    "image": [post.featured_image],
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "datePublished": post.publish_date,
    "dateModified": post.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": post.canonical_url
    },
    "publisher": {
      "@type": "Organization",
      "name": "Blue Dream Budder",
      "logo": {
        "@type": "ImageObject",
        "url": "https://bluedreambudder.com/logo.png"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.title}</title>
        <meta name="description" content={post.meta_description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={post.canonical_url} />
        <meta property="og:title" content={post.meta_title || post.title} />
        <meta property="og:description" content={post.meta_description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={post.canonical_url} />
        <meta property="og:image" content={post.featured_image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.meta_title || post.title} />
        <meta name="twitter:description" content={post.meta_description} />
        <meta name="twitter:image" content={post.featured_image} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <article className="container max-w-4xl mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/blog"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
            <Link
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map(category => (
                <Badge key={category} variant="secondary">
                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {post.title}
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center text-muted-foreground">
                <User className="w-4 h-4 mr-2" />
                <span className="mr-4">{post.author}</span>
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(post.publish_date).toLocaleDateString()}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="w-fit"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Featured Image */}
            <div className="aspect-video overflow-hidden rounded-lg mb-8 bg-muted flex items-center justify-center">
              <img
                src={post.featured_image}
                alt={post.featured_image_alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                      <div class="text-center text-muted-foreground">
                        <div class="w-20 h-20 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <p class="text-sm">Featured image unavailable</p>
                      </div>
                    </div>
                  `;
                }}
              />
            </div>
          </header>

          {/* Video Embed */}
          {post.video_embed_url && (
            <div className="mb-8">
              <div className="aspect-video">
                <iframe
                  src={post.video_embed_url}
                  title="Video content"
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-medium mt-4 mb-2">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                a: ({ href, children }) => {
                  const isExternal = href?.startsWith('http');
                  return (
                    <a
                      href={href}
                      className="text-primary hover:text-primary/80 underline"
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer nofollow" : undefined}
                    >
                      {children}
                      {isExternal && <ExternalLink className="inline w-4 h-4 ml-1" />}
                    </a>
                  );
                },
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
                ),
              }}
            >
              {processContent(post.content_markdown)}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          {post.cta_text && post.cta_url && (
            <Card className="mb-8 bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-3">Ready to get started?</h3>
                <p className="text-muted-foreground mb-4">
                  {post.excerpt}
                </p>
                <Button asChild size="lg">
                  <a href={post.cta_url} target="_blank" rel="noopener noreferrer">
                    {post.cta_text}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Backlinks "As Seen On" */}
          {post.backlink_sources.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">As Seen On</h3>
                <div className="flex flex-wrap gap-2">
                  {post.backlink_sources.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="nofollow noopener noreferrer sponsored"
                      className="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-muted/30 py-16">
            <div className="container max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-center mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="group hover:shadow-lg transition-shadow">
                    <div className="aspect-video overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.featured_image_alt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                              <div class="text-center text-muted-foreground">
                                <div class="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                  </svg>
                                </div>
                                <p class="text-xs">Image unavailable</p>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        <Link to={`/blog/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(relatedPost.publish_date).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default BlogPost;