
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trackEvent } from '@/components/AnalyticsTracker';

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
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductView: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onProductView }: ProductCardProps) => {
  return (
    <div 
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 relative"
      onClick={() => onProductView(product)}
    >
      {product.most_popular && (
        <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
          Most Popular
        </Badge>
      )}
      {product.popular && !product.most_popular && (
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
              onAddToCart(product);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
