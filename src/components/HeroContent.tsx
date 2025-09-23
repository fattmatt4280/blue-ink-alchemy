
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";

interface HeroContentProps {
  onShopNowClick: () => void;
  onDiscountClick: () => void;
}

const HeroContent = ({ onShopNowClick, onDiscountClick }: HeroContentProps) => {
  const { content } = useSiteContent();

  return (
    <div className="container mx-auto px-4 relative z-10">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="text-center lg:text-left space-y-6 mt-20 lg:mt-0">
          <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight cyber-text leading-tight mt-6">
            {content.hero_title || 'Blue Dream Budder'}
          </h1>
          
          <p className="font-inter text-lg sm:text-xl lg:text-2xl font-medium opacity-90 leading-relaxed cyber-text">
            {content.hero_subtitle || 'For Ink. For Skin. For Life.'}
          </p>
          
          <p className="font-inter text-sm sm:text-base lg:text-lg opacity-80 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            {content.hero_description || 'Premium all-natural tattoo aftercare balm crafted with botanical ingredients for optimal healing and skin restoration.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Button 
              size="lg" 
              className="font-inter font-semibold bg-blue-50 text-black hover:bg-blue-100 transition-all duration-300 px-8 py-4 text-base shadow-lg hover:shadow-xl neon-breathing-blue"
              onClick={onShopNowClick}
            >
              Shop Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="font-inter font-semibold bg-red-500 border-2 border-red-500 text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300 px-8 py-4 text-base"
              onClick={onDiscountClick}
            >
              Get 10% Off
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="relative">
            <img 
              src={content.hero_image || "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=400&fit=crop&crop=center"}
              alt="Blue Dream Budder Jar"
              className="w-80 h-80 lg:w-96 lg:h-96 object-cover rounded-full shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
