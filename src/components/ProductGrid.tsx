
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string | null;
  description: string | null;
  size: string | null;
  popular: boolean;
}

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <section id="products" className="py-20 futuristic-bg min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-pulse">
              <div className="w-8 h-8 bg-blue-400 rounded-full animate-bounce mx-1 inline-block"></div>
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-bounce mx-1 inline-block" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-bounce mx-1 inline-block" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="mt-4 text-blue-300 cyber-text">Loading futuristic products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 futuristic-bg min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4 cyber-text">
            Choose Your Size
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Premium CBD-infused aftercare balm available in four convenient sizes 
            to meet your healing needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="neon-card group hover:shadow-2xl transition-all duration-500 relative overflow-hidden backdrop-blur-sm">
              {product.popular && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded-full text-sm font-medium z-20 shadow-lg animate-pulse">
                  Most Popular
                </div>
              )}
              
              <CardContent className="p-0 relative z-10">
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image_url || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center"}
                    alt={product.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-all duration-500 neon-image rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Futuristic overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <div className="p-6 space-y-4 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-sm">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-1 cyber-text">
                      {product.name}
                    </h3>
                    {product.size && (
                      <p className="text-sm text-blue-600 mb-2 font-medium">{product.size}</p>
                    )}
                    {product.description && (
                      <p className="text-gray-700">{product.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-blue-400 text-blue-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">(127 reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-gray-900 cyber-text">
                      ${product.price}
                    </span>
                    {product.original_price && (
                      <span className="text-lg text-gray-500 line-through">
                        ${product.original_price}
                      </span>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full neon-button text-blue-700 hover:text-white transition-all duration-300 group/btn"
                    size="lg"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:animate-bounce transition-transform" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
