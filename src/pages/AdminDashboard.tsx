
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import ImageUpload from '@/components/ImageUpload';
import AdminHeader from '@/components/AdminHeader';
import TextContentEditor from '@/components/TextContentEditor';
import ProductManager from '@/components/ProductManager';
import ProductReorderTool from '@/components/ProductReorderTool';
import IngredientsEditor from '@/components/IngredientsEditor';
import TestimonialsEditor from '@/components/TestimonialsEditor';
import FooterLinksEditor from '@/components/FooterLinksEditor';
import CustomerReviewsManager from '@/components/CustomerReviewsManager';
import AccessDenied from '@/components/AccessDenied';

interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const [content, setContent] = useState<SiteContent[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchContent();
    }
  }, [isAdmin]);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('key');

    if (error) {
      toast({
        title: "Error loading content",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setContent(data || []);
    }
  };

  const updateContent = async (id: string, value: string) => {
    setSaving(true);
    
    const { error } = await supabase
      .from('site_content')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error updating content",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Content updated!",
        description: "Changes have been saved successfully.",
      });
      setContent(prev => 
        prev.map(item => 
          item.id === id ? { ...item, value } : item
        )
      );
    }

    setSaving(false);
  };

  const handleImageUpload = (imageUrl: string, contentId: string) => {
    updateContent(contentId, imageUrl);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <AccessDenied onSignOut={handleSignOut} />;
  }

  // Separate content types
  const textContent = content.filter(item => 
    item.type === 'text' && 
    !item.key.startsWith('ingredient_') && 
    !item.key.startsWith('testimonial_') &&
    !item.key.startsWith('quick_link') &&
    !item.key.startsWith('support_') &&
    item.key !== 'ingredients_title' &&
    item.key !== 'ingredients_subtitle'
  );
  const imageContent = content.filter(item => item.type === 'image' && !item.key.includes('testimonial_'));
  const ingredientsContent = content.filter(item => 
    item.key.startsWith('ingredient_') || 
    item.key === 'ingredients_title' || 
    item.key === 'ingredients_subtitle'
  );
  const testimonialsContent = content.filter(item => item.key.startsWith('testimonial_'));
  const footerLinksContent = content.filter(item => 
    item.key.startsWith('quick_link') || 
    item.key.startsWith('support_') ||
    item.key === 'quick_links_title'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <AdminHeader onSignOut={handleSignOut} />

        <div className="grid gap-6">
          {/* Product Management Section */}
          <ProductManager />

          {/* Product Reorder Tool */}
          <ProductReorderTool />

          {/* Customer Reviews Manager */}
          <CustomerReviewsManager />

          {/* Ingredients Editor */}
          <IngredientsEditor
            content={ingredientsContent}
            onContentUpdate={setContent}
            onSave={updateContent}
            saving={saving}
          />

          {/* Testimonials Editor */}
          <TestimonialsEditor
            content={testimonialsContent}
            onContentUpdate={setContent}
            onSave={updateContent}
            saving={saving}
          />

          {/* Footer Links Editor */}
          <FooterLinksEditor
            content={footerLinksContent}
            onContentUpdate={setContent}
            onSave={updateContent}
            saving={saving}
          />

          {/* Image Upload Section */}
          {imageContent.map((item) => (
            <ImageUpload
              key={item.id}
              title={item.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              description={`Upload a new ${item.key.replace(/_/g, ' ').toLowerCase()}`}
              currentImage={item.value}
              onImageUploaded={(url) => handleImageUpload(url, item.id)}
            />
          ))}

          {/* Text Content Section */}
          <TextContentEditor
            content={textContent}
            onContentUpdate={setContent}
            onSave={updateContent}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
