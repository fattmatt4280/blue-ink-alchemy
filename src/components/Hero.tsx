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
      <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        
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

      <HeroDebugDialog 
        isOpen={showDebugDialog}
        onClose={() => setShowDebugDialog(false)}
        debugMessages={debugMessages}
      />
    </>
  );
};

export default Hero;
