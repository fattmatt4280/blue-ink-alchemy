
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/components/AnalyticsTracker';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  description?: string;
  image_url?: string;
  size?: string;
  popular?: boolean;
  display_order: number;
}

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
      image: product.image_url || '',
      quantity: 1,
    });

    // Track add to cart event
    await trackEvent('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      currency: 'USD',
    });

    toast({
      title: "Added to cart!",
      description: `${product.name} has been added to your cart.`,
    });
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

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4 text-gray-900">Loading Products...</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4" id="products">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light mb-4 text-gray-900">Premium Blue Dream Budder</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the finest quality cannabis concentrates, carefully crafted for the ultimate experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              onClick={() => handleProductView(product)}
            >
              {product.popular && (
                <Badge className="absolute top-4 left-4 z-10 bg-blue-600 hover:bg-blue-700">
                  Popular
                </Badge>
              )}
              
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-6xl">
                    🍯
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  {product.size && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.size}
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-lg text-gray-500 line-through">
                        ${product.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
