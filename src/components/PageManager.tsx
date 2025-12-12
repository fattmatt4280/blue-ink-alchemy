import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import ImageUpload from './ImageUpload';

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
  show_in_nav: boolean;
  created_at: string;
  updated_at: string;
}

interface PageFormData {
  title: string;
  slug: string;
  parent_id: string | null;
  content_markdown: string;
  excerpt: string;
  featured_image: string;
  featured_image_alt: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  publish_status: string;
  display_order: number;
  show_in_nav: boolean;
}

const initialFormData: PageFormData = {
  title: '',
  slug: '',
  parent_id: null,
  content_markdown: '',
  excerpt: '',
  featured_image: '',
  featured_image_alt: '',
  meta_title: '',
  meta_description: '',
  canonical_url: '',
  publish_status: 'draft',
  display_order: 0,
  show_in_nav: false,
};

export const PageManager = () => {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<PageFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Failed to fetch pages');
      console.error(error);
    } else {
      setPages(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const generateCanonicalUrl = (slug: string, parentId: string | null) => {
    const baseUrl = window.location.origin;
    if (parentId) {
      const parent = pages.find(p => p.id === parentId);
      if (parent) {
        return `${baseUrl}/${parent.slug}/${slug}`;
      }
    }
    return `${baseUrl}/${slug}`;
  };

  const handleTitleChange = (title: string) => {
    const slug = generateSlug(title);
    const canonicalUrl = generateCanonicalUrl(slug, formData.parent_id);
    setFormData({
      ...formData,
      title,
      slug,
      canonical_url: canonicalUrl,
      meta_title: formData.meta_title || title,
    });
  };

  const handleParentChange = (parentId: string) => {
    const actualParentId = parentId === 'none' ? null : parentId;
    const canonicalUrl = generateCanonicalUrl(formData.slug, actualParentId);
    setFormData({
      ...formData,
      parent_id: actualParentId,
      canonical_url: canonicalUrl,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const pageData = {
      title: formData.title,
      slug: formData.slug,
      parent_id: formData.parent_id,
      content_markdown: formData.content_markdown,
      excerpt: formData.excerpt || null,
      featured_image: formData.featured_image || null,
      featured_image_alt: formData.featured_image_alt || null,
      meta_title: formData.meta_title || formData.title,
      meta_description: formData.meta_description,
      canonical_url: formData.canonical_url,
      publish_status: formData.publish_status,
      display_order: formData.display_order,
      show_in_nav: formData.show_in_nav,
    };

    if (editing) {
      const { error } = await supabase
        .from('cms_pages')
        .update(pageData)
        .eq('id', editing);

      if (error) {
        toast.error('Failed to update page');
        console.error(error);
      } else {
        toast.success('Page updated successfully');
        setEditing(null);
        setShowForm(false);
        setFormData(initialFormData);
        fetchPages();
      }
    } else {
      const { error } = await supabase
        .from('cms_pages')
        .insert([pageData]);

      if (error) {
        toast.error('Failed to create page');
        console.error(error);
      } else {
        toast.success('Page created successfully');
        setShowForm(false);
        setFormData(initialFormData);
        fetchPages();
      }
    }
    setSaving(false);
  };

  const handleEdit = (page: CmsPage) => {
    setFormData({
      title: page.title,
      slug: page.slug,
      parent_id: page.parent_id,
      content_markdown: page.content_markdown,
      excerpt: page.excerpt || '',
      featured_image: page.featured_image || '',
      featured_image_alt: page.featured_image_alt || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description,
      canonical_url: page.canonical_url,
      publish_status: page.publish_status,
      display_order: page.display_order,
      show_in_nav: page.show_in_nav,
    });
    setEditing(page.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page? Child pages will become orphaned.')) return;

    const { error } = await supabase
      .from('cms_pages')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete page');
      console.error(error);
    } else {
      toast.success('Page deleted successfully');
      fetchPages();
    }
  };

  const getParentPages = () => {
    return pages.filter(p => !p.parent_id && p.id !== editing);
  };

  const getChildPages = (parentId: string) => {
    return pages.filter(p => p.parent_id === parentId);
  };

  const getPageUrl = (page: CmsPage) => {
    if (page.parent_id) {
      const parent = pages.find(p => p.id === page.parent_id);
      return parent ? `/${parent.slug}/${page.slug}` : `/${page.slug}`;
    }
    return `/${page.slug}`;
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditing(null);
    setFormData(initialFormData);
  };

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading pages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Page Manager</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Page
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Page' : 'Create New Page'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Tattoo Aftercare Guide"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., tattoo-aftercare-guide"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Page</Label>
                  <Select
                    value={formData.parent_id || 'none'}
                    onValueChange={handleParentChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (Top Level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {getParentPages().map((page) => (
                        <SelectItem key={page.id} value={page.id}>
                          {page.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Publish Status</Label>
                  <Select
                    value={formData.publish_status}
                    onValueChange={(v) => setFormData({ ...formData, publish_status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief description of the page"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content (Markdown) *</Label>
                <Textarea
                  id="content"
                  value={formData.content_markdown}
                  onChange={(e) => setFormData({ ...formData, content_markdown: e.target.value })}
                  placeholder="Write your page content in Markdown..."
                  rows={12}
                  className="font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Featured Image</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <ImageUpload
                      title="Featured Image"
                      description="Upload a featured image for this page"
                      currentImage={formData.featured_image}
                      onImageUploaded={(url) => setFormData({ ...formData, featured_image: url })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="featured_image_alt">Image Alt Text</Label>
                    <Input
                      id="featured_image_alt"
                      value={formData.featured_image_alt}
                      onChange={(e) => setFormData({ ...formData, featured_image_alt: e.target.value })}
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">SEO Settings</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meta_title">Meta Title</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="SEO title (defaults to page title)"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">{formData.meta_title.length}/60 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description *</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Description for search engines"
                      rows={2}
                      maxLength={160}
                      required
                    />
                    <p className="text-xs text-muted-foreground">{formData.meta_description.length}/160 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canonical_url">Canonical URL</Label>
                    <Input
                      id="canonical_url"
                      value={formData.canonical_url}
                      onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                      placeholder="Full URL of the page"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="show_in_nav"
                    checked={formData.show_in_nav}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_in_nav: checked })}
                  />
                  <Label htmlFor="show_in_nav">Show in Navigation</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Page' : 'Create Page'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <div className="space-y-4">
          {pages.filter(p => !p.parent_id).map((page) => (
            <Card key={page.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{page.title}</span>
                        <Badge variant={page.publish_status === 'published' ? 'default' : 'secondary'}>
                          {page.publish_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{getPageUrl(page)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(getPageUrl(page), '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(page.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {getChildPages(page.id).length > 0 && (
                  <div className="mt-4 ml-8 space-y-2">
                    {getChildPages(page.id).map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{child.title}</span>
                              <Badge variant={child.publish_status === 'published' ? 'default' : 'secondary'} className="text-xs">
                                {child.publish_status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{getPageUrl(child)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(getPageUrl(child), '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(child)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(child.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {pages.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No pages yet</h3>
                <p className="text-muted-foreground mb-4">Create your first page to get started</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Page
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
