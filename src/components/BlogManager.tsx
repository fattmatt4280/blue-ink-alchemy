import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Save, FileText, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import yaml from 'js-yaml';

interface BlogPost {
  id?: string;
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
  publish_status: 'draft' | 'published';
  publish_date: string;
  cta_text?: string;
  cta_url?: string;
  video_embed_url?: string;
  related_post_ids: string[];
  content_markdown: string;
  backlink_sources: string[];
  created_at?: string;
  updated_at?: string;
}

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manualUploadContent, setManualUploadContent] = useState('');
  const [showManualUpload, setShowManualUpload] = useState(false);

  const initialFormData: BlogPost = {
    title: '',
    slug: '',
    author: '',
    excerpt: '',
    categories: [],
    tags: [],
    featured_image: '',
    featured_image_alt: '',
    meta_description: '',
    canonical_url: '',
    publish_status: 'draft',
    publish_date: new Date().toISOString().slice(0, 16),
    related_post_ids: [],
    content_markdown: '',
    backlink_sources: []
  };

  const [formData, setFormData] = useState<BlogPost>(initialFormData);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data || []) as BlogPost[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      canonical_url: prev.canonical_url || `https://bluedreambudder.com/blog/${generateSlug(title)}`
    }));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setSaving(true);
    try {
      const postData = {
        ...formData,
        publish_status: status,
        categories: formData.categories.filter(Boolean),
        tags: formData.tags.filter(Boolean),
        backlink_sources: formData.backlink_sources.filter(Boolean)
      };

      if (editingPost?.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
        toast.success('Post updated successfully');
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);
        if (error) throw error;
        toast.success('Post created successfully');
      }

      setFormData(initialFormData);
      setEditingPost(null);
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      ...post,
      backlink_sources: Array.isArray(post.backlink_sources) ? post.backlink_sources : []
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const parseManualUpload = () => {
    try {
      let parsedData: any = {};
      
      // Try YAML front matter first
      if (manualUploadContent.includes('---')) {
        const parts = manualUploadContent.split('---');
        if (parts.length >= 3) {
          const frontMatter = yaml.load(parts[1]) as any;
          const content = parts.slice(2).join('---').trim();
          parsedData = { ...frontMatter, content_markdown: content };
        }
      } else {
        // Try JSON fallback
        parsedData = JSON.parse(manualUploadContent);
      }

      // Validate required fields
      const required = ['title', 'slug', 'author', 'excerpt', 'meta_description', 'canonical_url', 'publish_status', 'publish_date', 'featured_image'];
      const missing = required.filter(field => !parsedData[field]);
      
      if (missing.length > 0) {
        toast.error(`Missing required fields: ${missing.join(', ')}`);
        return;
      }

      setFormData({
        ...initialFormData,
        ...parsedData,
        categories: parsedData.categories || [],
        tags: parsedData.tags || [],
        related_post_ids: parsedData.related_post_ids || [],
        backlink_sources: parsedData.backlink_sources || []
      });
      
      setShowManualUpload(false);
      setShowForm(true);
      toast.success('Content parsed successfully');
    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Failed to parse content. Check format.');
    }
  };

  if (loading) {
    return <div className="p-8">Loading blog posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">Manage your blog posts and content</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showManualUpload} onOpenChange={setShowManualUpload}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Manual Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Manual Upload</DialogTitle>
                <DialogDescription>
                  Paste YAML front matter + Markdown, or JSON content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={manualUploadContent}
                  onChange={(e) => setManualUploadContent(e.target.value)}
                  placeholder="---&#10;title: 'Your Post Title'&#10;slug: 'your-post-slug'&#10;author: 'Author Name'&#10;excerpt: 'Brief description...'&#10;meta_description: 'SEO description between 120-160 characters...'&#10;canonical_url: 'https://bluedreambudder.com/blog/your-post-slug'&#10;publish_status: 'draft'&#10;publish_date: '2024-01-01T10:00:00Z'&#10;featured_image: 'https://example.com/image.jpg'&#10;featured_image_alt: 'Alt text'&#10;categories: ['tattoo-care']&#10;tags: ['healing', 'aftercare']&#10;---&#10;&#10;Your markdown content here..."
                  className="min-h-[400px] font-mono text-sm"
                />
                <div className="flex gap-2">
                  <Button onClick={parseManualUpload}>Parse & Preview</Button>
                  <Button variant="outline" onClick={() => setShowManualUpload(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => { setShowForm(true); setEditingPost(null); setFormData(initialFormData); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</CardTitle>
            <CardDescription>Fill in the post details below</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    maxLength={65}
                    placeholder="Post title (max 65 chars)"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    pattern="^[a-z0-9-]+$"
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Author name"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    maxLength={220}
                    placeholder="Brief description (max 220 chars)"
                  />
                </div>

                <div>
                  <Label htmlFor="featured_image">Featured Image URL *</Label>
                  <Input
                    id="featured_image"
                    value={formData.featured_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="featured_image_alt">Featured Image Alt Text *</Label>
                  <Input
                    id="featured_image_alt"
                    value={formData.featured_image_alt}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image_alt: e.target.value }))}
                    placeholder="Descriptive alt text"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="meta_description">Meta Description *</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="SEO description (120-160 chars)"
                    maxLength={160}
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {formData.meta_description.length}/160 characters
                  </div>
                </div>

                <div>
                  <Label htmlFor="canonical_url">Canonical URL *</Label>
                  <Input
                    id="canonical_url"
                    value={formData.canonical_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, canonical_url: e.target.value }))}
                    placeholder="https://bluedreambudder.com/blog/post-slug"
                  />
                </div>

                <div>
                  <Label htmlFor="publish_date">Publish Date *</Label>
                  <Input
                    id="publish_date"
                    type="datetime-local"
                    value={formData.publish_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, publish_date: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="categories">Categories (comma-separated)</Label>
                  <Input
                    id="categories"
                    value={formData.categories.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      categories: e.target.value.split(',').map(c => c.trim()).filter(Boolean) 
                    }))}
                    placeholder="tattoo-care, healing, aftercare"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                    }))}
                    placeholder="healing, skin-care, natural"
                  />
                </div>

                <div>
                  <Label htmlFor="cta_text">CTA Text</Label>
                  <Input
                    id="cta_text"
                    value={formData.cta_text || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                    placeholder="Shop Now"
                  />
                </div>

                <div>
                  <Label htmlFor="cta_url">CTA URL</Label>
                  <Input
                    id="cta_url"
                    value={formData.cta_url || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cta_url: e.target.value }))}
                    placeholder="https://bluedreambudder.com/shop"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="content_markdown">Content (Markdown) *</Label>
                <Textarea
                  id="content_markdown"
                  value={formData.content_markdown}
                  onChange={(e) => setFormData(prev => ({ ...prev, content_markdown: e.target.value }))}
                  className="min-h-[300px] font-mono"
                  placeholder="# Your Content Here&#10;&#10;Write your blog post content in Markdown format..."
                />
              </div>

              <div>
                <Label htmlFor="backlink_sources">Backlink Sources (comma-separated URLs)</Label>
                <Textarea
                  id="backlink_sources"
                  value={Array.isArray(formData.backlink_sources) ? formData.backlink_sources.join(', ') : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    backlink_sources: e.target.value.split(',').map(url => url.trim()).filter(Boolean) 
                  }))}
                  placeholder="https://example.com/article1, https://example.com/article2"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={() => handleSubmit('draft')} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button onClick={() => handleSubmit('published')} disabled={saving}>
                <FileText className="w-4 h-4 mr-2" />
                {saving ? 'Publishing...' : 'Publish'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>Manage your published and draft posts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Publish Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={post.publish_status === 'published' ? 'default' : 'secondary'}>
                      {post.publish_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>{new Date(post.publish_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(post.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManager;