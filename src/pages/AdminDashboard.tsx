
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
import AffiliateProductManager from '@/components/AffiliateProductManager';
import IngredientsEditor from '@/components/IngredientsEditor';
import TestimonialsEditor from '@/components/TestimonialsEditor';
import FooterLinksEditor from '@/components/FooterLinksEditor';
import SocialLinksEditor from '@/components/SocialLinksEditor';
import CustomerReviewsManager from '@/components/CustomerReviewsManager';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { AdminAnalyticsManager } from '@/components/AdminAnalyticsManager';
import { PushNotificationManager } from '@/components/PushNotificationManager';
import BlogManager from '@/components/BlogManager';
import AccessDenied from '@/components/AccessDenied';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { HealingAssessmentReviewer } from '@/components/HealingAssessmentReviewer';
import { ExpertKnowledgeEditor } from '@/components/ExpertKnowledgeEditor';
import { AITrainingAnalytics } from '@/components/AITrainingAnalytics';
import { AIInstructionsEditor } from '@/components/AIInstructionsEditor';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto overflow-x-hidden">
        <AdminHeader onSignOut={handleSignOut} />

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">Content Management</span>
              <span className="sm:hidden">Content</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">Product Management</span>
              <span className="sm:hidden">Products</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">Blog</span>
              <span className="sm:hidden">Blog</span>
            </TabsTrigger>
            <TabsTrigger value="ai-training" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">AI Training</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="mb-4">
              <Button 
                onClick={() => window.location.href = '/admin/activation-codes'}
                variant="outline"
              >
                Manage Healyn Activation Codes
              </Button>
            </div>
            <PushNotificationManager />
            <AnalyticsDashboard />
            <AdminAnalyticsManager />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
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

            {/* Social Links Editor */}
            <SocialLinksEditor />

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
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {/* Product Management Section */}
            <ProductManager />

            {/* Product Reorder Tool */}
            <ProductReorderTool />

            {/* Affiliate Products Management */}
            <AffiliateProductManager />
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <BlogManager />
          </TabsContent>

              <TabsContent value="ai-training" className="space-y-6">
                <AITrainingAnalytics />
                <AIInstructionsEditor />
                <HealingAssessmentReviewer />
                <ExpertKnowledgeEditor />
              </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
