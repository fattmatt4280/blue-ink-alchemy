import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/ProductGrid";
import Testimonials from "@/components/Testimonials";
import Ingredients from "@/components/Ingredients";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";

const TattooAftercare = () => {
  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen futuristic-bg overflow-x-hidden relative">
      <Helmet>
        <title>Tattoo Aftercare | Blue Dream Budder - Premium Healing Products</title>
        <meta name="description" content="Premium tattoo aftercare products for optimal healing. Blue Dream Budder uses natural, plant-based ingredients to soothe, protect, and heal new tattoos. Shop now!" />
        <meta name="keywords" content="tattoo aftercare, tattoo healing, tattoo care products, best tattoo aftercare, natural tattoo care, tattoo moisturizer, new tattoo care, tattoo healing cream" />
        <link rel="canonical" href="https://bluedreambudder.com/tattoo-aftercare" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="Tattoo Aftercare | Blue Dream Budder - Premium Healing Products" />
        <meta property="og:description" content="Premium tattoo aftercare products for optimal healing. Blue Dream Budder uses natural ingredients to soothe, protect, and heal new tattoos." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bluedreambudder.com/tattoo-aftercare" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Blue Dream Budder Tattoo Aftercare",
            "description": "Premium tattoo aftercare products for optimal healing",
            "brand": {
              "@type": "Brand",
              "name": "Blue Dream Budder"
            },
            "category": "Tattoo Aftercare"
          })}
        </script>
      </Helmet>

      <AnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative z-10 min-h-[70vh] flex items-center justify-center px-4 pt-20 pb-12">
        <div className="absolute top-8 left-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-light mb-6 text-white leading-tight">
            Premium Tattoo Aftercare
            <br />
            <span className="font-normal bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              For Optimal Healing
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Blue Dream Budder provides professional-grade tattoo aftercare using natural, plant-based ingredients. 
            Soothe inflammation, lock in moisture, and protect your new ink for vibrant, long-lasting results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={scrollToProducts}
              className="bg-white text-primary hover:bg-gray-100 font-medium px-8"
            >
              Shop Tattoo Aftercare
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                const element = document.getElementById('benefits');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <div id="products" className="relative z-10">
        <ProductGrid />
      </div>

      {/* Why Blue Dream Budder for Tattoos */}
      <section id="benefits" className="relative z-10 py-20 px-4 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4 text-white">
              Why Choose Blue Dream Budder for Tattoo Aftercare?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional tattoo artists and enthusiasts trust our natural formula for superior healing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-light mb-4 text-white">The Healing Process</h3>
              <div className="space-y-4 text-gray-200">
                <div>
                  <strong className="text-white">Days 1-3:</strong> Apply thin layer 3-4 times daily to reduce inflammation and protect from infection
                </div>
                <div>
                  <strong className="text-white">Days 4-14:</strong> Continue application 2-3 times daily as skin begins to heal and peel
                </div>
                <div>
                  <strong className="text-white">Days 15-30:</strong> Maintain moisture with 1-2 daily applications for optimal color retention
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
              <h3 className="text-2xl font-light mb-4 text-white">Best Practices</h3>
              <div className="space-y-4">
                <div>
                  <strong className="text-emerald-300">Do:</strong>
                  <ul className="list-disc list-inside text-gray-200 mt-2 space-y-1">
                    <li>Wash hands before application</li>
                    <li>Apply thin, even layers</li>
                    <li>Keep tattoo clean and moisturized</li>
                    <li>Wear loose, breathable clothing</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-rose-300">Don't:</strong>
                  <ul className="list-disc list-inside text-gray-200 mt-2 space-y-1">
                    <li>Over-apply product</li>
                    <li>Scratch or pick at healing skin</li>
                    <li>Expose to direct sunlight</li>
                    <li>Submerge in water (pools, baths)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-8 border border-white/20">
            <h3 className="text-2xl font-light mb-4 text-white text-center">What Makes Our Formula Special</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">🌿</div>
                <h4 className="text-lg font-medium text-white mb-2">100% Natural</h4>
                <p className="text-gray-200 text-sm">Plant-based ingredients free from harsh chemicals and synthetic additives</p>
              </div>
              <div>
                <div className="text-3xl mb-2">💧</div>
                <h4 className="text-lg font-medium text-white mb-2">Deep Moisture</h4>
                <p className="text-gray-200 text-sm">Locks in hydration without clogging pores or feeling greasy</p>
              </div>
              <div>
                <div className="text-3xl mb-2">🛡️</div>
                <h4 className="text-lg font-medium text-white mb-2">Anti-Inflammatory</h4>
                <p className="text-gray-200 text-sm">Soothes irritation and reduces redness for comfortable healing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients Section */}
      <div id="ingredients" className="relative z-10">
        <Ingredients />
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="relative z-10">
        <Testimonials />
      </div>

      {/* FAQ Section */}
      <div id="faq" className="relative z-10">
        <FAQ />
      </div>

      {/* Newsletter Section */}
      <div id="newsletter" className="relative z-10">
        <Newsletter />
      </div>

      <Footer />
    </div>
  );
};

export default TattooAftercare;
