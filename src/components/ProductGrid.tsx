
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Blue Dream Budder 1oz",
    price: 29.99,
    originalPrice: 34.99,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center",
    description: "Perfect for touch-ups and travel",
    size: "1oz (30ml)",
    popular: false
  },
  {
    id: 2,
    name: "Blue Dream Budder 2oz",
    price: 49.99,
    originalPrice: 59.99,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center",
    description: "Ideal for new tattoos",
    size: "2oz (60ml)",
    popular: true
  },
  {
    id: 3,
    name: "Blue Dream Budder 4oz",
    price: 79.99,
    originalPrice: 94.99,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center",
    description: "Best value for regular use",
    size: "4oz (120ml)",
    popular: false
  },
  {
    id: 4,
    name: "Blue Dream Budder 8oz",
    price: 129.99,
    originalPrice: 159.99,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=300&fit=crop&crop=center",
    description: "Professional size for artists",
    size: "8oz (240ml)",
    popular: false
  }
];

const ProductGrid = () => {
  return (
    <section id="products" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Choose Your Size
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Premium CBD-infused aftercare balm available in four convenient sizes 
            to meet your healing needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg relative overflow-hidden">
              {product.popular && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                  Most Popular
                </div>
              )}
              
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{product.size}</p>
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">(127 reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-colors group"
                    size="lg"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
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
