import { ArrowDown } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useState } from "react";
import EmailSignupPopup from "./EmailSignupPopup";
import HeroHeader from "./HeroHeader";
import HeroContent from "./HeroContent";
import HeroDebugDialog from "./HeroDebugDialog";

const Hero = () => {
  const { content, loading } = useSiteContent();
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [showDebugDialog, setShowDebugDialog] = useState(false);

  const addDebugMessage = (message: string) => {
    const timestampedMessage = `${new Date().toLocaleTimeString()}: ${message}`;
    setDebugMessages(prev => [...prev, timestampedMessage]);
    console.log(timestampedMessage);
  };

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDiscountClick = () => {
    setDebugMessages([]); // Clear previous messages
    setShowDebugDialog(true); // Show the debug dialog immediately
    addDebugMessage('🎯 Get 10% Off button clicked');
    addDebugMessage('📝 Setting showEmailPopup to true');
    setShowEmailPopup(true);
    addDebugMessage('✅ EmailSignupPopup should now be visible');
  };

  const handleEmailPopupClose = () => {
    addDebugMessage('❌ EmailSignupPopup close requested');
    setShowEmailPopup(false);
    addDebugMessage('✅ EmailSignupPopup closed');
    // Keep debug dialog open for a few more seconds
    setTimeout(() => {
      setShowDebugDialog(false);
    }, 3000);
  };

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white overflow-hidden">
        <div className="text-lg cyber-text">Loading...</div>
      </section>
    );
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden gradient-shift-bg">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Futuristic grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <HeroHeader />
        
        {/* Mobile title positioned under header buttons */}
        <div className="absolute top-16 left-4 right-4 z-10 lg:hidden">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight cyber-text text-center leading-tight">
            {content.hero_title || 'Blue Dream Budder'}
          </h1>
        </div>
        
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

      <HeroDebugDialog 
        isOpen={showDebugDialog}
        onClose={() => setShowDebugDialog(false)}
        debugMessages={debugMessages}
      />
    </>
  );
};

export default Hero;
