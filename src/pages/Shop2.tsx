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
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Featured Products</h2>
            <p className="text-gray-300 mb-4">
              Our signature Blue Dream Budder is crafted with the finest natural ingredients 
              and premium botanical oils for superior healing and comfort.
            </p>
            <ul className="space-y-2 text-gray-400">
              <li>• Premium natural butters for anti-inflammatory benefits</li>
              <li>• Essential oils for natural aromatherapy</li>
              <li>• All-natural moisturizing ingredients</li>
              <li>• Perfect for tattoo aftercare and daily skincare</li>
            </ul>
          </div>
          
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
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

          <div className="bg-gradient-to-br from-green-900/40 to-blue-900/40 backdrop-blur-md rounded-lg p-6 border border-green-400/30">
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
