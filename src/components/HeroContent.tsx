
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
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left space-y-8 mt-16 lg:mt-0">
          {/* Desktop title - hidden on mobile */}
          <h1 className="hidden lg:block text-7xl xl:text-8xl 2xl:text-9xl font-light tracking-tight cyber-text leading-tight">
            {content.hero_title || 'Blue Dream Budder'}
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-light opacity-90 leading-relaxed cyber-text md:mt-16 lg:mt-20">
            {content.hero_subtitle || 'For Ink. For Skin. For Life.'}
          </p>
          
          <p className="text-sm sm:text-base lg:text-lg opacity-80 max-w-md mx-auto lg:mx-0 leading-relaxed">
            {content.hero_description || 'Premium CBD-infused tattoo aftercare balm crafted with all-natural ingredients for optimal healing and skin restoration.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              className="bg-blue-50 text-black hover:bg-blue-100 transition-all duration-300 px-8 py-6 text-lg font-black shadow-lg hover:shadow-xl border-2 border-blue-200 shadow-[0_0_10px_rgba(30,58,138,0.6)] hover:shadow-[0_0_15px_rgba(30,58,138,0.8)]"
              onClick={onShopNowClick}
            >
              Shop Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-red-500 border-2 border-red-500 text-white hover:bg-red-600 hover:border-red-600 transition-all duration-300 px-8 py-6 text-lg"
              onClick={onDiscountClick}
            >
              Get 10% Off
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full neon-card backdrop-blur-md flex items-center justify-center">
              <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center neon-card">
                <img 
                  src={content.hero_image || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop&crop=center"}
                  alt="Blue Dream Budder Jar"
                  className="w-48 h-48 lg:w-60 lg:h-60 object-cover rounded-full shadow-2xl neon-image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
