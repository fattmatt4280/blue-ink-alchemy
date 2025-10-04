import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AffiliateProduct {
  id: string;
  product_name: string;
  category: string;
  amazon_asin: string;
  affiliate_link: string;
  recommended_for: string[];
  description: string | null;
  active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface FormData {
  product_name: string;
  category: string;
  amazon_asin: string;
  recommended_for: string[];
  description: string;
  active: boolean;
  priority: number;
}

export const useAffiliateProductManager = () => {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [associateTag, setAssociateTag] = useState('');
  const { toast } = useToast();

  const initialFormData: FormData = {
    product_name: '',
    category: 'ointment',
    amazon_asin: '',
    recommended_for: [],
    description: '',
    active: true,
    priority: 0
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_products')
        .select('*')
        .order('priority', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching affiliate products:', error);
      toast({
        title: "Error",
        description: "Failed to load affiliate products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociateTag = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('value')
        .eq('key', 'amazon_associate_tag')
        .single();

      if (error) throw error;
      setAssociateTag(data?.value || '');
    } catch (error) {
      console.error('Error fetching associate tag:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAssociateTag();
  }, []);

  const generateAffiliateLink = (asin: string, tag: string): string => {
    return `https://www.amazon.com/dp/${asin}?tag=${tag}`;
  };

  const handleEdit = (product: AffiliateProduct) => {
    setEditingProduct(product.id);
    setFormData({
      product_name: product.product_name,
      category: product.category,
      amazon_asin: product.amazon_asin,
      recommended_for: product.recommended_for || [],
      description: product.description || '',
      active: product.active,
      priority: product.priority
    });
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!formData.product_name || !formData.amazon_asin || !associateTag) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and set your Amazon Associate Tag",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      const affiliateLink = generateAffiliateLink(formData.amazon_asin, associateTag);
      
      const productData = {
        ...formData,
        affiliate_link: affiliateLink
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('affiliate_products')
          .update(productData)
          .eq('id', editingProduct);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Affiliate product updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('affiliate_products')
          .insert([productData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Affiliate product added successfully"
        });
      }

      handleCancel();
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving affiliate product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save affiliate product",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this affiliate product?')) return;

    try {
      const { error } = await supabase
        .from('affiliate_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Affiliate product deleted successfully"
      });

      fetchProducts();
    } catch (error) {
      console.error('Error deleting affiliate product:', error);
      toast({
        title: "Error",
        description: "Failed to delete affiliate product",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('affiliate_products')
        .update({ active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Product ${!currentActive ? 'activated' : 'deactivated'} successfully`
      });

      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowAddForm(false);
    setFormData(initialFormData);
  };

  const saveAssociateTag = async (tag: string) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .update({ value: tag })
        .eq('key', 'amazon_associate_tag');

      if (error) throw error;

      setAssociateTag(tag);
      toast({
        title: "Success",
        description: "Amazon Associate Tag saved successfully"
      });
    } catch (error) {
      console.error('Error saving associate tag:', error);
      toast({
        title: "Error",
        description: "Failed to save Associate Tag",
        variant: "destructive"
      });
    }
  };

  return {
    products,
    editingProduct,
    showAddForm,
    loading,
    saving,
    formData,
    associateTag,
    setShowAddForm,
    setFormData,
    handleEdit,
    handleSave,
    handleDelete,
    handleToggleActive,
    handleCancel,
    saveAssociateTag
  };
};
