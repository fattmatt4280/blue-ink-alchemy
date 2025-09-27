import { useState } from 'react';
import { type CarouselApi } from '@/components/ui/carousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useScrollCarousel } from '@/hooks/useScrollCarousel';
import ProductCard from './ProductCard';

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

interface ProductCarouselProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductView: (product: Product) => void;
}

const ProductCarousel = ({ products, onAddToCart, onProductView }: ProductCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const { isScrolling } = useScrollCarousel(api, {
    throttleMs: 150,
    scrollThreshold: 80,
  });

  return (
    <div className="relative">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
          dragFree: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem 
              key={product.id} 
              className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <div className="h-full">
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onProductView={onProductView}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious 
          className="hidden md:flex -left-6 h-10 w-10 border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/10" 
        />
        <CarouselNext 
          className="hidden md:flex -right-6 h-10 w-10 border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/10" 
        />
      </Carousel>
      
      {/* Scroll indicator */}
      {isScrolling && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-primary/10 backdrop-blur-sm text-sm text-primary animate-fade-in">
          Scroll to navigate
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;