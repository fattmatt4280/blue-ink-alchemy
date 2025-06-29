
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <h1 className="text-5xl lg:text-7xl font-light tracking-tight">
              Blue Dream
              <span className="block font-medium">Budder</span>
            </h1>
            
            <p className="text-2xl lg:text-3xl font-light opacity-90 leading-relaxed">
              For Ink. For Skin. For Life.
            </p>
            
            <p className="text-lg opacity-80 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Premium CBD-infused tattoo aftercare balm crafted with all-natural ingredients 
              for optimal healing and skin restoration.
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
