
import { Button } from "@/components/ui/button";
import { ArrowDown, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Link } from "react-router-dom";
import CartIcon from "./CartIcon";

const Hero = () => {
  const { user, isAdmin } = useAuth();
  const { content, loading } = useSiteContent();

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white overflow-hidden">
        <div className="text-lg cyber-text">Loading...</div>
      </section>
    );
  }

  return (
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
      
      {/* Header with Admin and Cart buttons */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <CartIcon />
        
        {isAdmin && (
          <Link to="/admin">
            <Button 
              size="sm"
              className="neon-button bg-white/10 hover:bg-white/20 text-white border-white/30"
              variant="outline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
        )}

        {!user && (
          <Link to="/auth">
            <Button 
              size="sm"
              className="neon-button bg-white/10 hover:bg-white/20 text-white border-white/30"
              variant="outline"
            >
              Admin Login
            </Button>
          </Link>
        )}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <h1 className="text-5xl lg:text-7xl font-light tracking-tight cyber-text">
              {content.hero_title || 'Blue Dream'}
              <span className="block font-medium">Budder</span>
            </h1>
            
            <p className="text-2xl lg:text-3xl font-light opacity-90 leading-relaxed cyber-text">
              {content.hero_subtitle || 'For Ink. For Skin. For Life.'}
            </p>
            
            <p className="text-lg opacity-80 max-w-md mx-auto lg:mx-0 leading-relaxed">
              {content.hero_description || 'Premium CBD-infused tattoo aftercare balm crafted with all-natural ingredients for optimal healing and skin restoration.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-blue-50 text-black hover:bg-blue-100 transition-all duration-300 px-8 py-6 text-lg font-black shadow-lg hover:shadow-xl border-2 border-blue-200"
                onClick={scrollToProducts}
              >
                Shop Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="neon-button border-white/50 text-white hover:bg-white/10 hover:text-white transition-all duration-300 px-8 py-6 text-lg backdrop-blur-sm"
              >
                Learn More
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
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-6 h-6 text-white/70" />
      </div>
    </section>
  );
};

export default Hero;
