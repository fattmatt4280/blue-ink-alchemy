
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useNavigate } from "react-router-dom";
import { ActivationDialog } from "@/components/ActivationDialog";
import { useState } from "react";
import { Activity } from "lucide-react";

interface HeroContentProps {
  onShopNowClick: () => void;
  onDiscountClick: () => void;
}

const HeroContent = ({ onShopNowClick, onDiscountClick }: HeroContentProps) => {
  const { content } = useSiteContent();
  const navigate = useNavigate();
  const [showActivationDialog, setShowActivationDialog] = useState(false);

  return (
    <>
      <ActivationDialog 
        open={showActivationDialog} 
        onOpenChange={setShowActivationDialog} 
      />
    <div className="container mx-auto px-6 relative z-10 pt-24">
      <div className="flex items-center justify-start min-h-[80vh]">
        {/* Left-aligned content */}
        <div className="text-left max-w-4xl">
          {/* Main Headline - Multi-line with cyan highlights */}
          <div className="space-y-1 mb-8">
            <h1 className="font-orbitron text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-none">
              <span className="text-cyan-400">Heal</span>
            </h1>
            <h1 className="font-orbitron text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-none">
              <span className="text-cyan-400">Smarter.</span>
            </h1>
          <h1 className="font-orbitron text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-none">
            <span className="text-white">Ink Brighter</span>
          </h1>
          <h1 className="font-orbitron text-4xl sm:text-6xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-none">
            <span className="text-cyan-400">Last Longer</span>
          </h1>
          </div>
          
          <p className="font-inter text-xl lg:text-2xl text-gray-300 max-w-xl leading-relaxed mb-10">
            Scientifically formulated tattoo aftercare trusted by artists worldwide.
          </p>
          
          <div className="flex flex-wrap gap-4">
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
            <button 
              className="border-2 border-cyan-400 text-cyan-400 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-cyan-400 hover:text-black transition-all duration-300 bg-transparent flex items-center gap-2"
              onClick={() => navigate('/heal-aid')}
            >
              <Activity className="h-5 w-5" />
              Track Healing
            </button>
            <button 
              className="border-2 border-purple-400 text-purple-400 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-purple-400 hover:text-black transition-all duration-300 bg-transparent"
              onClick={() => setShowActivationDialog(true)}
            >
              Have a Code?
            </button>
            <button 
              className="border-2 border-emerald-400 text-emerald-400 font-semibold px-8 py-4 rounded-lg text-lg hover:bg-emerald-400 hover:text-black transition-all duration-300 bg-transparent"
              onClick={() => navigate('/best-tattoo-aftercare')}
            >
              Aftercare Guide
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default HeroContent;
