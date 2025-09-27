
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
        <div className="text-center lg:text-left space-y-8 mt-20 lg:mt-0">
          {/* Main Headline - Multi-line with cyan highlights */}
          <div className="space-y-2">
            <h1 className="font-orbitron text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-none">
              <span className="text-cyan-400">Heal</span>
            </h1>
            <h1 className="font-orbitron text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-none">
              <span className="text-cyan-400">Smarter.</span>
            </h1>
            <h1 className="font-orbitron text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-none">
              <span className="text-cyan-400">Ink</span> <span className="text-white">Brighter</span>
            </h1>
            <h1 className="font-orbitron text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-none text-white">
              Last Longer
            </h1>
          </div>
          
          <p className="font-inter text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed mt-8">
            Scientifically formulated tattoo aftercare trusted by artists worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
            <Button 
              size="lg" 
              className="font-inter font-semibold bg-cyan-400 text-black hover:bg-cyan-300 transition-all duration-300 px-10 py-4 text-lg shadow-lg hover:shadow-cyan-400/25 border-0"
              onClick={onShopNowClick}
            >
              Shop Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="font-inter font-semibold border-2 border-gray-400 text-gray-300 hover:bg-gray-800 hover:border-gray-300 hover:text-white transition-all duration-300 px-10 py-4 text-lg bg-transparent"
              onClick={onDiscountClick}
            >
              View Benefits
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/30 to-transparent rounded-full blur-3xl"></div>
            <img 
              src={content.hero_image || "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=400&fit=crop&crop=center"}
              alt="Blue Dream Budder Jar"
              className="relative w-80 h-80 lg:w-96 lg:h-96 object-cover rounded-2xl shadow-2xl shadow-cyan-400/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
