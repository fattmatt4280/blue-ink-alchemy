
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MFAEnforcementGate } from '@/components/MFAEnforcementGate';
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
import BlogManager from '@/components/BlogManager';
import AccessDenied from '@/components/AccessDenied';
import StripeProductSync from '@/components/StripeProductSync';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserBaseManager } from '@/components/UserBaseManager';
import AbandonedCartsManager from '@/components/AbandonedCartsManager';
import { OrderBackfillManager } from '@/components/OrderBackfillManager';
import { CustomAbandonedCartManager } from '@/components/CustomAbandonedCartManager';
import { InvoicePreview } from '@/components/InvoicePreview';
import { WebhookHealthMonitor } from '@/components/WebhookHealthMonitor';
import EmailCampaignManager from '@/components/EmailCampaignManager';
import { PageManager } from '@/components/PageManager';
import { OrdersManager } from '@/components/OrdersManager';
import SEOChecklist from '@/components/SEOChecklist';
import { FreeBudderEditor } from '@/components/FreeBudderEditor';

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
    <MFAEnforcementGate requireMFA={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 overflow-x-hidden">
        <div className="max-w-6xl mx-auto overflow-x-hidden">
          <AdminHeader onSignOut={handleSignOut} />

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1 sm:grid sm:grid-cols-9">
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-3 py-2">
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm px-3 py-2">
              Orders
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs sm:text-sm px-3 py-2">
              Email
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm px-3 py-2">
              Users
            </TabsTrigger>
            <TabsTrigger value="pages" className="text-xs sm:text-sm px-3 py-2">
              Pages
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm px-3 py-2">
              Content
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm px-3 py-2">
              Products
            </TabsTrigger>
            <TabsTrigger value="blog" className="text-xs sm:text-sm px-3 py-2">
              Blog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <WebhookHealthMonitor />
            <InvoicePreview />
            <div id="order-backfill">
              <OrderBackfillManager />
            </div>
            <CustomAbandonedCartManager />
            <AbandonedCartsManager />
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersManager />
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <EmailCampaignManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserBaseManager />
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <SEOChecklist />
            <PageManager />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <IngredientsEditor
              content={ingredientsContent}
              onContentUpdate={setContent}
              onSave={updateContent}
              saving={saving}
            />
            <TestimonialsEditor
              content={testimonialsContent}
              onContentUpdate={setContent}
              onSave={updateContent}
              saving={saving}
            />
            {imageContent.map((item) => (
              <ImageUpload
                key={item.id}
                title={item.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                description={`Upload a new ${item.key.replace(/_/g, ' ').toLowerCase()}`}
                currentImage={item.value}
                onImageUploaded={(url) => handleImageUpload(url, item.id)}
              />
            ))}
            <TextContentEditor
              content={textContent}
              onContentUpdate={setContent}
              onSave={updateContent}
              saving={saving}
            />
            <FooterLinksEditor
              content={footerLinksContent}
              onContentUpdate={setContent}
              onSave={updateContent}
              saving={saving}
            />
            <SocialLinksEditor />
            <CustomerReviewsManager />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {/* Stripe Product Sync */}
            <StripeProductSync />

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
        </Tabs>
      </div>
    </div>
    </MFAEnforcementGate>
  );
};

export default AdminDashboard;
