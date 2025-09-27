
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";

interface HeroContentProps {
  onShopNowClick: () => void;
  onDiscountClick: () => void;
}

const HeroContent = ({ onShopNowClick, onDiscountClick }: HeroContentProps) => {
  const { content } = useSiteContent();

  return (
    <div className="container mx-auto px-6 relative z-10 pt-24">
      <div className="flex items-center justify-between min-h-[80vh]">
        {/* Left side - Text content */}
        <div className="flex-1 max-w-2xl">
          {/* Main Headline - Multi-line with cyan highlights */}
          <div className="space-y-1 mb-8">
            <h1 className="font-orbitron text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-none">
              <span className="text-cyan-400">Heal</span>
            </h1>
            <h1 className="font-orbitron text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-none">
              <span className="text-cyan-400">Smarter.</span>
            </h1>
            <h1 className="font-orbitron text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-none">
              <span className="text-cyan-400">Ink</span> <span className="text-white">Brighter</span>
            </h1>
            <h1 className="font-orbitron text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-none text-white">
              Last Longer
            </h1>
          </div>
          
          <p className="font-inter text-xl lg:text-2xl text-gray-300 max-w-xl leading-relaxed mb-10">
            Scientifically formulated tattoo aftercare trusted by artists worldwide.
          </p>
          
          <div className="flex gap-6">
            <button 
              className="bg-cyan-400 text-black font-semibold px-8 py-4 rounded-lg text-lg hover:bg-cyan-300 transition-all duration-300 shadow-lg hover:shadow-cyan-400/25"
              onClick={onShopNowClick}
            >
              Shop Now
            </button>
            <button 
              className="border-2 border-gray-400 text-gray-300 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-gray-800 hover:border-gray-300 hover:text-white transition-all duration-300 bg-transparent"
              onClick={onDiscountClick}
            >
              View Benefits
            </button>
          </div>
        </div>
        
        {/* Right side - Product image */}
        <div className="flex-1 flex justify-end items-center pl-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-400/30 to-transparent rounded-full blur-3xl transform scale-110"></div>
            <img 
              src={content.hero_image || "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=500&h=500&fit=crop&crop=center"}
              alt="Blue Dream Budder Jar"
              className="relative w-96 h-96 lg:w-[500px] lg:h-[500px] object-cover rounded-3xl shadow-2xl shadow-cyan-400/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
