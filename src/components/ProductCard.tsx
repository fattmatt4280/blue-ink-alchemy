import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trackEvent } from '@/components/AnalyticsTracker';
import { useFreeTrialEligibility } from '@/hooks/useFreeTrialEligibility';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const isFreeTrialProduct = product.name.includes('3-Day Free Trial');
  const { isEligible, loading } = useFreeTrialEligibility();

  const isDisabled = isFreeTrialProduct && !isEligible;

  return (
    <div 
      id={isFreeTrialProduct ? 'free-trial-product' : undefined}
      className={`group neon-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative cursor-pointer ${isDisabled ? 'opacity-60' : ''}`}
      onClick={() => onProductView(product)}
    >
      {isDisabled && (
        <Badge className="absolute top-4 left-4 z-10 bg-gray-500 text-white">
          Previously Used
        </Badge>
      )}
      {!isDisabled && product.most_popular && (
        <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
          Most Popular
        </Badge>
      )}
      {!isDisabled && product.popular && !product.most_popular && (
        <Badge className="absolute top-4 left-4 z-10 bg-blue-600 hover:bg-blue-700">
          Popular
        </Badge>
      )}
      
      <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="neon-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded"
            onError={(e) => {
              e.currentTarget.src = '/images/healaid-shield-logo.jpeg';
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">
            🍯
          </div>
        )}
      </div>

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <h3 className="cyber-text text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
            {isFreeTrialProduct && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Limited to one standalone free trial per customer. Automatically included FREE with every budder purchase!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
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

        {isFreeTrialProduct && (
          <p className="text-xs text-muted-foreground mb-4">
            💡 One per customer · Auto-included with budder purchases
          </p>
        )}

        {isDisabled && (
          <p className="text-xs text-gray-600 mb-4 bg-gray-50 p-2 rounded border border-gray-200">
            Purchase any budder product to receive another 3-day trial!
          </p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="cyber-text text-2xl font-bold text-white">
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
            disabled={isDisabled || loading}
            className="neon-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDisabled ? 'Add Budder for Free Trial' : loading ? 'Checking...' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
