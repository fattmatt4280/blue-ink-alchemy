import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { SwipeIndicator } from '@/components/SwipeIndicator';
import AppHeader from '@/components/AppHeader';
import AnimatedBackground from '@/components/AnimatedBackground';

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
  meta_description: string;
  publish_date: string;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  
  const categoryFilter = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const postsPerPage = 12;

  // Setup swipe navigation
  useSwipeNavigation({
    targetRoute: '/',
    onSwipeStart: () => setShowSwipeIndicator(true),
    onSwipeProgress: (progress) => setSwipeProgress(progress),
    onSwipeEnd: () => {
      setShowSwipeIndicator(false);
      setSwipeProgress(0);
    },
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    }
  }, [categoryFilter]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, author, excerpt, categories, tags, featured_image, featured_image_alt, meta_description, publish_date, created_at')
        .eq('publish_status', 'published')
        .order('publish_date', { ascending: false });

      if (error) throw error;
      
      const blogPosts = (data || []) as BlogPost[];
      setPosts(blogPosts);
      
      // Extract unique categories
      const allCategories = blogPosts.flatMap(post => post.categories || []);
      const uniqueCategories = [...new Set(allCategories)].sort();
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      post.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newSearchParams = new URLSearchParams(searchParams);
    if (category) {
      newSearchParams.set('category', category);
    } else {
      newSearchParams.delete('category');
    }
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen futuristic-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-300">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog - Blue Dream Budder | Tattoo Aftercare Tips & Guides</title>
        <meta name="description" content="Discover expert tattoo aftercare tips, healing guides, and product recommendations from Blue Dream Budder. Your ultimate resource for tattoo care." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://bluedreambudder.com/blog" />
        <meta property="og:title" content="Blog - Blue Dream Budder | Tattoo Aftercare Tips & Guides" />
        <meta property="og:description" content="Discover expert tattoo aftercare tips, healing guides, and product recommendations from Blue Dream Budder. Your ultimate resource for tattoo care." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bluedreambudder.com/blog" />
        <meta property="og:image" content="https://bluedreambudder.com/og-blog.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog - Blue Dream Budder | Tattoo Aftercare Tips & Guides" />
        <meta name="twitter:description" content="Discover expert tattoo aftercare tips, healing guides, and product recommendations from Blue Dream Budder. Your ultimate resource for tattoo care." />
        <meta name="twitter:image" content="https://bluedreambudder.com/og-blog.jpg" />
      </Helmet>

      <SwipeIndicator progress={swipeProgress} isVisible={showSwipeIndicator} />

      <div className="min-h-screen futuristic-bg">
        <AnimatedBackground />
        <AppHeader />
        <div className="pt-16 relative z-10">
        {/* Hero Section */}
        <section className="bg-black/40 backdrop-blur-md py-16">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Tattoo Care Blog
              </h1>
              <p className="text-lg text-gray-300 mb-8">
                Expert advice, tips, and guides for optimal tattoo healing and aftercare
              </p>
              
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-4 py-2 rounded-md border border-white/10 bg-black/40 text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold text-white mb-4">No posts found</h2>
                <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {paginatedPosts.map((post) => (
                    <article key={post.id} className="group">
                      <Card className="h-full transition-all duration-300 hover:shadow-lg border-white/10 bg-black/40 backdrop-blur-md">
                        <div className="aspect-video overflow-hidden rounded-t-lg bg-muted flex items-center justify-center">
                          <img
                            src={post.featured_image}
                            alt={post.featured_image_alt}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1590736969955-71cc94901144?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                              target.alt = 'Default blog image placeholder';
                              target.style.display = 'block';
                            }}
                          />
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {post.categories.slice(0, 2).map(category => (
                              <Badge
                                key={category}
                                variant="secondary"
                                className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => handleCategoryChange(category)}
                              >
                                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            ))}
                          </div>
                          <CardTitle className="text-xl line-clamp-2 text-white group-hover:text-blue-400 transition-colors">
                            <Link to={`/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-sm text-gray-400 line-clamp-3 mb-4">
                            {post.excerpt}
                          </CardDescription>
                          <div className="flex items-center text-sm text-gray-400 mb-4">
                            <User className="w-4 h-4 mr-2" />
                            <span className="mr-4">{post.author}</span>
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{new Date(post.publish_date).toLocaleDateString()}</span>
                          </div>
                          <Link
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Read more
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </CardContent>
                      </Card>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
        </div>
      </div>
    </>
  );
};

export default Blog;