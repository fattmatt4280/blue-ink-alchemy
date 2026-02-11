
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Star, Shield, Leaf, Sparkles, Clock, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

const BABY_BLUE_PRODUCT = {
  id: "2fc22365-b590-47a6-87a0-0fd8914e6e9d",
  name: "Baby Blue Dream Budder (10g)",
  price: 0,
  image_url: "https://vozstxchkgpxzetwdzow.supabase.co/storage/v1/object/public/product-images/products/1751239126214-cpzvrwo41ga.jpeg",
};

const faqs = [
  { q: "What am I getting?", a: "A full-size 10g Baby Blue Dream Budder — our premium tattoo aftercare balm made with organic ingredients. It's the same product we sell for $6.99, yours FREE." },
  { q: "Why is it free?", a: "We're confident you'll love it. Once you try Blue Dream Budder, you'll never go back to petroleum-based aftercare. This is our way of letting you experience the difference." },
  { q: "How long does shipping take?", a: "Orders ship within 1-2 business days. Standard delivery is typically 3-7 business days depending on your location." },
  { q: "Is there a catch?", a: "No catch, no subscription, no hidden fees. You just pay $10.20 flat rate shipping and handling. One per customer." },
];

const FreeBudder = () => {
  const { clearCart, addToCart } = useCart();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleClaim = () => {
    clearCart();
    addToCart({ ...BABY_BLUE_PRODUCT, promoType: "free-budder" } as any);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen futuristic-bg relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Logo */}
        <div className="flex justify-center pt-6 pb-2">
          <img
            src="/images/budder-buddy-icon.jpeg"
            alt="Blue Dream Budder"
            className="w-14 h-14 rounded-full border-2 border-blue-400/40"
          />
        </div>

        {/* Hero */}
        <section className="container mx-auto px-4 pt-4 pb-8 text-center max-w-2xl">
          <span className="inline-block bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-4 border border-green-500/30">
            Limited Time Offer
          </span>

          <h1 className="font-rajdhani text-4xl sm:text-5xl md:text-6xl font-bold cyber-text mb-3 leading-tight">
            Get Your <span className="text-blue-400">FREE</span> Baby Blue Dream Budder
          </h1>

          <p className="text-lg sm:text-xl text-blue-200/80 mb-6">
            Premium tattoo aftercare — just pay <span className="font-bold text-white">$10.20 shipping</span>
          </p>

          {/* Product Image */}
          <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 mb-6">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-2xl" />
            <img
              src={BABY_BLUE_PRODUCT.image_url}
              alt="Baby Blue Dream Budder"
              className="relative w-full h-full object-cover rounded-2xl neon-image"
            />
            <div className="absolute -top-3 -right-3 bg-red-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg animate-pulse">
              FREE
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handleClaim}
            className="neon-button text-lg sm:text-xl px-10 py-7 rounded-xl w-full sm:w-auto"
          >
            🔥 Claim Your Free Budder
          </Button>
          <p className="text-xs text-blue-300/50 mt-2">Limit 1 per customer · While supplies last</p>
        </section>

        {/* Trust Badges */}
        <section className="container mx-auto px-4 pb-10 max-w-xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Shield, label: "Lab Tested" },
              { icon: Leaf, label: "Organic Ingredients" },
              { icon: Sparkles, label: "Artist Recommended" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
                <Icon className="w-6 h-6 text-blue-400" />
                <span className="text-xs text-blue-200/70 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Why Blue Dream Budder */}
        <section className="container mx-auto px-4 pb-12 max-w-xl text-center">
          <h2 className="font-rajdhani text-2xl font-bold cyber-text mb-4">Why Artists Love It</h2>
          <div className="space-y-3 text-left">
            {[
              "Speeds up healing time with organic botanicals",
              "No petroleum, no parabens — just clean ingredients",
              "Keeps colors vibrant during the healing process",
              "Soothes irritation and reduces peeling",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
                <Star className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                <span className="text-sm text-blue-100/80">{point}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 pb-12 max-w-xl text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm text-blue-200/70">Rated 4.9/5 by tattoo artists & collectors</p>
          <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-sm text-blue-100/80 italic">
              "Best aftercare I've ever used. My tattoos heal faster and the colors stay brighter. I recommend it to all my clients."
            </p>
            <p className="text-xs text-blue-300/50 mt-2">— Professional Tattoo Artist</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 pb-12 max-w-xl">
          <h2 className="font-rajdhani text-2xl font-bold cyber-text text-center mb-4">FAQ</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium text-blue-100">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-blue-200/70">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 pb-16 max-w-xl text-center">
          <div className="bg-white/5 border border-blue-400/20 rounded-2xl p-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">While Supplies Last</span>
            </div>
            <h3 className="font-rajdhani text-2xl font-bold cyber-text mb-2">Don't Miss Out</h3>
            <p className="text-sm text-blue-200/60 mb-4">
              Try the #1 rated tattoo aftercare — completely free. Just cover shipping.
            </p>
            <Button
              onClick={handleClaim}
              className="neon-button text-lg px-8 py-6 rounded-xl w-full"
            >
              <Package className="w-5 h-5 mr-2" />
              Get My Free Budder — $10.20 Shipping
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 text-center text-xs text-blue-300/40">
          <div className="container mx-auto px-4 space-y-1">
            <p>© {new Date().getFullYear()} Blue Dream Budder. All rights reserved.</p>
            <div className="flex justify-center gap-4">
              <a href="/terms" className="hover:text-blue-300/70">Terms</a>
              <a href="/privacy" className="hover:text-blue-300/70">Privacy</a>
              <a href="/contact" className="hover:text-blue-300/70">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FreeBudder;
