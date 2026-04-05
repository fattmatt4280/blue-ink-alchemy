import { Helmet } from "react-helmet-async";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import AppHeader from "@/components/AppHeader";
import AnimatedBackground from "@/components/AnimatedBackground";

const Shop = () => {
  return (
    <div className="min-h-screen futuristic-bg">
      <Helmet>
        <title>Shop Tattoo Aftercare | Blue Dream Budder</title>
        <meta name="description" content="Shop Blue Dream Budder's premium all-natural tattoo aftercare products. Natural butters, botanical oils, and zero harsh chemicals. Free shipping on orders over $50." />
        <link rel="canonical" href="https://bluedreambudder.com/shop" />
        <meta property="og:title" content="Shop Tattoo Aftercare | Blue Dream Budder" />
        <meta property="og:description" content="Premium all-natural tattoo aftercare. Natural butters, botanical oils, zero harsh chemicals. Free shipping on orders over $50." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bluedreambudder.com/shop" />
        <meta property="og:image" content="https://bluedreambudder.com/images/invoice-logo-bw.jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shop Tattoo Aftercare | Blue Dream Budder" />
        <meta name="twitter:description" content="Premium all-natural tattoo aftercare. Free shipping on orders over $50." />
        <meta name="twitter:image" content="https://bluedreambudder.com/images/invoice-logo-bw.jpeg" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Blue Dream Budder Tattoo Aftercare Products",
            "description": "Premium all-natural tattoo aftercare products including healing balms and moisturizers.",
            "url": "https://bluedreambudder.com/shop",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "Product",
                  "name": "Blue Dream Budder Tattoo Aftercare Balm",
                  "description": "Premium natural tattoo aftercare balm made with natural butters and botanical oils for optimal healing.",
                  "brand": { "@type": "Brand", "name": "Blue Dream Budder" },
                  "url": "https://bluedreambudder.com/shop",
                  "offers": {
                    "@type": "AggregateOffer",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/InStock"
                  }
                }
              }
            ]
          })}
        </script>
      </Helmet>
      <AnimatedBackground />
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">Shop All Products</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Discover our complete range of premium all-natural Blue Dream Budder aftercare products.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
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

        <ProductGrid />
      </div>
      
      <Footer />
    </div>
  );
};

export default Shop;
