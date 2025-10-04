import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";

const Shop = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop All Products</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our complete range of premium all-natural Blue Dream Budder aftercare products.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
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
        </div>

        <ProductGrid />
      </div>
      
      <Footer />
    </div>
  );
};

export default Shop;
