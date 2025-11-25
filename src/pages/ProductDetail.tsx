import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/AnimatedBackground';
import healaidShield from '@/assets/healaid-shield-logo.jpeg';

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
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || '',
    });
    toast.success(`${product.name} added to cart!`);
  };

  const nameLower = product?.name.toLowerCase() || '';
  const isHealAidProduct = nameLower.includes('heal-aid') || nameLower.includes('healaid');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
        <AnimatedBackground />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
      <AnimatedBackground />
      
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm hover:bg-background/90"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </Button>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="neon-card rounded-2xl p-8 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={isHealAidProduct ? healaidShield : product.image_url}
                      alt={product.name}
                      className="neon-image w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        if (!e.currentTarget.dataset.fallbackApplied) {
                          e.currentTarget.src = healaidShield;
                          e.currentTarget.dataset.fallbackApplied = 'true';
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-8xl">
                      🍯
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex flex-col">
                <div className="mb-4">
                  {product.most_popular && (
                    <Badge className="mb-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  {product.popular && !product.most_popular && (
                    <Badge className="mb-3 bg-blue-600 hover:bg-blue-700">
                      Popular
                    </Badge>
                  )}
                  
                  <h1 className="cyber-text text-3xl md:text-4xl font-bold text-white mb-2">
                    {product.name}
                  </h1>
                  
                  {product.size && (
                    <p className="text-sm text-muted-foreground">
                      Size: {product.size}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="cyber-text text-4xl font-bold text-white">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-2xl text-gray-500 line-through">
                      ${product.original_price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
                    <p className="text-gray-300 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="neon-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full"
                >
                  {isHealAidProduct ? 'Subscribe' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
