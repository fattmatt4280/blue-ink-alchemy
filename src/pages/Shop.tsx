import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import AppHeader from "@/components/AppHeader";

const Shop = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop All Products</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our complete range of premium all-natural Blue Dream Budder aftercare products.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
            <p className="text-muted-foreground mb-4">
              Our signature Blue Dream Budder is crafted with the finest natural ingredients 
              and premium botanical oils for superior healing and comfort.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Premium natural butters for anti-inflammatory benefits</li>
              <li>• Essential oils for natural aromatherapy</li>
              <li>• All-natural moisturizing ingredients</li>
              <li>• Perfect for tattoo aftercare and daily skincare</li>
            </ul>
          </div>
          
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Why Choose Us?</h2>
            <p className="text-muted-foreground mb-4">
              We're committed to providing the highest quality aftercare products 
              that promote healing and maintain the vibrancy of your artwork.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Lab-tested for purity and potency</li>
              <li>• Made with organic, sustainably sourced ingredients</li>
              <li>• Recommended by professional tattoo artists</li>
              <li>• Fast, discreet shipping</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              🎁 Free Heal-AId Trial Benefit
            </h2>
            <p className="text-muted-foreground mb-4">
              Every budder purchase includes a <strong>FREE 3-day Heal-AId trial</strong>! 
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Our AI-powered tattoo healing tracker analyzes your photos and 
              provides personalized aftercare recommendations.
            </p>
            <p className="text-xs text-muted-foreground italic">
              Note: Standalone free trials are limited to one per customer.
            </p>
          </div>
        </div>

        <ProductGrid />
      </div>
      
      <Footer />
    </div>
  );
};

export default Shop;
