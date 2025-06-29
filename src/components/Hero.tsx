
import { Button } from "@/components/ui/button";
import { ArrowDown, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Link } from "react-router-dom";

const Hero = () => {
  const { user, isAdmin } = useAuth();
  const { content, loading } = useSiteContent();

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white overflow-hidden">
        <div className="text-lg">Loading...</div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Admin Access Button */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-20">
          <Link to="/admin">
            <Button 
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>
      )}

      {/* Login Button for non-authenticated users */}
      {!user && (
        <div className="absolute top-4 right-4 z-20">
          <Link to="/auth">
            <Button 
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              Admin Login
            </Button>
          </Link>
        </div>
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <h1 className="text-5xl lg:text-7xl font-light tracking-tight">
              {content.hero_title || 'Blue Dream'}
              <span className="block font-medium">Budder</span>
            </h1>
            
            <p className="text-2xl lg:text-3xl font-light opacity-90 leading-relaxed">
              {content.hero_subtitle || 'For Ink. For Skin. For Life.'}
            </p>
            
            <p className="text-lg opacity-80 max-w-md mx-auto lg:mx-0 leading-relaxed">
              {content.hero_description || 'Premium CBD-infused tattoo aftercare balm crafted with all-natural ingredients for optimal healing and skin restoration.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 transition-colors px-8 py-6 text-lg"
                onClick={scrollToProducts}
              >
                Shop Now
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-blue-600 transition-colors px-8 py-6 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop&crop=center"
                    alt="Blue Dream Budder Jar"
                    className="w-48 h-48 lg:w-60 lg:h-60 object-cover rounded-full shadow-2xl"
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
