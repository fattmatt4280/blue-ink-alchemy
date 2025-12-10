
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Testimonials from "@/components/Testimonials";
import Ingredients from "@/components/Ingredients";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import ReviewSubmissionSection from "@/components/ReviewSubmissionSection";

const Index = () => {
  return (
    <div className="min-h-screen futuristic-bg overflow-x-hidden relative text-white">
      <AnimatedBackground />
      <div id="hero" className="relative z-10">
        <Hero />
      </div>
      <div id="reviews" className="relative z-10">
        <ReviewSubmissionSection />
      </div>
      <div id="products" className="relative z-10">
        <ProductGrid />
      </div>
      <div id="testimonials" className="relative z-10">
        <Testimonials />
      </div>
      <div id="ingredients" className="relative z-10">
        <Ingredients />
      </div>
      <div id="faq" className="relative z-10">
        <FAQ />
      </div>
      <div id="newsletter" className="relative z-10">
        <Newsletter />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
