
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Testimonials from "@/components/Testimonials";
import Ingredients from "@/components/Ingredients";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";

const Index = () => {
  return (
    <div className="min-h-screen futuristic-bg">
      <div id="hero">
        <Hero />
      </div>
      <div id="products">
        <ProductGrid />
      </div>
      <div id="testimonials">
        <Testimonials />
      </div>
      <div id="ingredients">
        <Ingredients />
      </div>
      <div id="faq">
        <FAQ />
      </div>
      <div id="newsletter">
        <Newsletter />
      </div>
      <Footer />
      <AIAssistant />
    </div>
  );
};

export default Index;
