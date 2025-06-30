
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Testimonials from "@/components/Testimonials";
import Ingredients from "@/components/Ingredients";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen futuristic-bg">
      <Hero />
      <ProductGrid />
      <Testimonials />
      <Ingredients />
      <FAQ />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
