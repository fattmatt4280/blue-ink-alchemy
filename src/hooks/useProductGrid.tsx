
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/components/AnalyticsTracker';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  image_url?: string;
  size?: string;
  popular?: boolean;
  most_popular?: boolean;
  display_order: number;
  stripe_price_id?: string;
}

export const useProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('display_order');

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error loading products",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || null,
    });
    
    toast({
      title: "Added to cart!",
      description: product.name,
    });

    // Track add to cart event
    await trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      currency: 'USD',
    });

    // Show the cart dialog
    setSelectedProductName(product.name);
    setCartDialogOpen(true);
  };

  const handleProductView = async (product: Product) => {
    // Track product view event
    await trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      currency: 'USD',
    });
  };

  return {
    products,
    loading,
    cartDialogOpen,
    selectedProductName,
    setCartDialogOpen,
    handleAddToCart,
    handleProductView,
  };
};
