import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import AppHeader from "@/components/AppHeader";
import AnimatedBackground from "@/components/AnimatedBackground";

const Shop2 = () => {
  return (
    <div className="min-h-screen futuristic-bg">
      <AnimatedBackground />
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12 relative z-10">
        <ProductGrid />
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:bg-black/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
            <h2 className="text-3xl font-bold mb-3 text-white">Featured Products</h2>
            
            <h3 className="text-xl font-semibold mb-4 text-gray-200">Our Famous Blue Dream Budder</h3>
            
            <ul className="space-y-2 text-gray-400 mb-6">
              <li>• Lab tested for quality</li>
              <li>• Made with organic sustainably sourced ingredients</li>
              <li>• Recommended by professional tattoo artists</li>
              <li>• Fast shipping</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">Heal-AId™</h3>
            
            <p className="text-gray-300">
              World's first tattoo healing tracker system that can analyze and pre-diagnose complications that seem to be arising. The partner to our personal aftercare. But can be used by all.
            </p>
          </div>
          
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:bg-black/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
            <h2 className="text-2xl font-semibold mb-4 text-white">Why Choose Us?</h2>
            <p className="text-gray-300 mb-4">
              We're committed to providing the highest quality aftercare products 
              that promote healing and maintain the vibrancy of your artwork.
            </p>
            <ul className="space-y-2 text-gray-400">
              <li>• Lab-tested for purity and potency</li>
              <li>• Made with organic, sustainably sourced ingredients</li>
              <li>• Recommended by professional tattoo artists</li>
              <li>• Fast, discreet shipping</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-900/40 to-blue-900/40 backdrop-blur-md rounded-lg p-6 border border-green-400/30 transition-all duration-300 hover:scale-105 hover:from-green-900/50 hover:to-blue-900/50 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-400/20">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
              🎁 Free Heal-AId Trial Benefit
            </h2>
            <p className="text-gray-300 mb-4">
              Every budder purchase includes a <strong className="text-white">FREE 3-day Heal-AId trial</strong>! 
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Our AI-powered tattoo healing tracker analyzes your photos and 
              provides personalized aftercare recommendations.
            </p>
            <p className="text-xs text-gray-500 italic">
              Note: Standalone free trials are limited to one per customer.
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Shop2;
