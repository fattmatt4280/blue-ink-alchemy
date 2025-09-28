import { ArrowDown } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useState } from "react";
import EmailSignupPopup from "./EmailSignupPopup";
import HeroHeader from "./HeroHeader";
import HeroContent from "./HeroContent";

const Hero = () => {
  // Temporarily bypass database dependency
  const content = {
    hero_image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1920&h=1080&fit=crop&crop=center"
  };
  const loading = false;
  
  console.log('Hero rendering with content:', content);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDiscountClick = () => {
    setShowEmailPopup(true);
  };

  const handleEmailPopupClose = () => {
    setShowEmailPopup(false);
  };

  if (loading) {
    console.log('Hero is in loading state');
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white overflow-hidden">
        <div className="text-lg cyber-text">Loading...</div>
      </section>
    );
  }

  console.log('Hero rendering with content:', content);

  return (
    <>
      <section 
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${content.hero_image || "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1920&h=1080&fit=crop&crop=center"})`
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        
        <HeroHeader />
        
        
        <HeroContent 
          onShopNowClick={scrollToProducts}
          onDiscountClick={handleDiscountClick}
        />
        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-white/70" />
        </div>
      </section>

      <EmailSignupPopup 
        isOpen={showEmailPopup} 
        onClose={handleEmailPopupClose} 
      />
    </>
  );
};

export default Hero;