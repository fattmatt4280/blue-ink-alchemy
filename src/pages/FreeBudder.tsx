import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Star, Shield, Leaf, Sparkles, Droplets, Wind, ChevronDown, ChevronUp, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const DEFAULT_IMAGE = "https://vozstxchkgpxzetwdzow.supabase.co/storage/v1/object/public/product-images/products/1751239126214-cpzvrwo41ga.jpeg";

const DEFAULT_FAQS = [
  { q: "What am I getting?", a: "A full-size 10g Baby Blue Dream Budder — our premium tattoo aftercare balm made with organic ingredients. It's the same product we sell for $6.99, yours FREE." },
  { q: "Why is it free?", a: "We're confident you'll love it. Once you try Blue Dream Budder, you'll never go back to petroleum-based aftercare. This is our way of letting you experience the difference." },
  { q: "How long does shipping take?", a: "Orders ship within 1-2 business days. Standard delivery is typically 3-7 business days depending on your location." },
  { q: "Is there a subscription?", a: "No. This is a one-time offer. No subscription, no auto-ship, no recurring charges. Just a free jar of Budder." },
  { q: "Is there a catch?", a: "No catch, no subscription, no hidden fees. You just pay $10.20 flat rate shipping and handling. One per customer." },
];

const DEFAULT_BULLETS = [
  "Speeds up healing time with organic botanicals",
  "Keeps colors vibrant during the healing process",
  "Soothes irritation and reduces peeling",
];

const DEFAULTS: Record<string, string> = {
  free_budder_headline: "Your Tattoo Is Fresh. It Shouldn't Smell Like Chemicals.",
  free_budder_subheading: "Premium organic tattoo aftercare that absorbs fast and smells clean, smooth, and addictive.",
  free_budder_cta_text: "Claim My Free Budder",
  free_budder_badge_text: "Limited Time Offer",
  free_budder_product_image: DEFAULT_IMAGE,
  free_budder_shipping_price: "10.20",
  free_budder_testimonial_quote: "Best aftercare I've ever used. My tattoos heal faster and the colors stay brighter. I recommend it to all my clients.",
  free_budder_testimonial_author: "Professional Tattoo Artist",
};

const CORE_BENEFITS = [
  { icon: Droplets, title: "Smells Clean & Luxurious", description: "No medicinal odor. Just smooth, fresh scent." },
  { icon: Wind, title: "Absorbs Fast", description: "No greasy residue. No heavy shine." },
  { icon: Leaf, title: "Organic Ingredients", description: "No petroleum. No parabens. Just clean botanicals." },
];

const FreeBudder = () => {
  const { clearCart, addToCart } = useCart();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [content, setContent] = useState(DEFAULTS);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [bullets, setBullets] = useState(DEFAULT_BULLETS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('site_content')
        .select('key, value')
        .like('key', 'free_budder_%');
      if (data) {
        const merged = { ...DEFAULTS };
        data.forEach((row) => {
          if (row.key in merged) merged[row.key] = row.value;
          if (row.key === 'free_budder_faqs') {
            try { setFaqs(JSON.parse(row.value)); } catch {}
          }
          if (row.key === 'free_budder_bullet_points') {
            try { setBullets(JSON.parse(row.value).map((b: any) => b.text || b)); } catch {}
          }
        });
        setContent(merged);
      }
      setLoaded(true);
    };
    fetchContent();
  }, []);

  const handleClaim = () => {
    clearCart();
    addToCart({
      id: "2fc22365-b590-47a6-87a0-0fd8914e6e9d",
      name: "Baby Blue Dream Budder (10g)",
      price: 0,
      image_url: content.free_budder_product_image,
      promoType: "free-budder",
    } as any);
    navigate("/checkout");
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0d1321] to-[#0a0e1a] text-white">
      {/* Logo */}
      <div className="flex justify-center pt-8 pb-4">
        <img
          src="/images/budder-buddy-icon.jpeg"
          alt="Blue Dream Budder"
          className="w-12 h-12 rounded-full border border-white/20"
        />
      </div>

      {/* Hero */}
      <section className="container mx-auto px-5 pt-4 pb-10 text-center max-w-2xl">
        <span className="inline-block text-amber-400/90 text-xs font-semibold uppercase tracking-[0.2em] mb-6">
          {content.free_budder_badge_text}
        </span>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 tracking-tight">
          {content.free_budder_headline}
        </h1>

        <p className="text-base sm:text-lg text-white/60 mb-3 max-w-lg mx-auto leading-relaxed">
          {content.free_budder_subheading}
        </p>

        <p className="text-sm text-amber-400/80 font-medium mb-8">
          Get Your FREE Baby Blue Dream Budder — Just Cover ${content.free_budder_shipping_price} Shipping
        </p>

        {/* Product Image */}
        <div className="relative mx-auto w-56 h-56 sm:w-64 sm:h-64 mb-8">
          <div className="absolute inset-0 rounded-2xl bg-amber-500/5 blur-3xl scale-125" />
          <img
            src={content.free_budder_product_image}
            alt="Baby Blue Dream Budder"
            className="relative w-full h-full object-cover rounded-2xl shadow-2xl shadow-black/50"
          />
          <div className="absolute -top-2 -right-2 bg-amber-500 text-black font-bold text-xs px-3 py-1 rounded-full">
            FREE
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleClaim}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg px-10 py-7 rounded-xl w-full sm:w-auto shadow-lg shadow-amber-500/20 transition-all duration-200"
        >
          {content.free_budder_cta_text}
        </Button>
        <p className="text-xs text-white/40 mt-3">Limit 1 per customer · While supplies last</p>
      </section>

      {/* Core Benefits */}
      <section className="container mx-auto px-5 pb-14 max-w-xl">
        <div className="grid grid-cols-3 gap-3 text-center">
          {CORE_BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Icon className="w-6 h-6 text-amber-400/80" />
              <span className="text-xs font-semibold text-white/90 leading-tight">{title}</span>
              <span className="text-[11px] text-white/40 leading-snug">{description}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-5 pb-12 max-w-xl">
        <div className="flex justify-center gap-6 text-center">
          {[
            { icon: Shield, label: "Lab Tested" },
            { icon: Leaf, label: "Organic" },
            { icon: Sparkles, label: "Artist Recommended" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="w-4 h-4 text-white/30" />
              <span className="text-xs text-white/40 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Why Artists Love It */}
      <section className="container mx-auto px-5 pb-14 max-w-xl">
        <h2 className="text-xl font-bold text-center mb-5 tracking-tight">Why Artists Love It</h2>
        <div className="space-y-2.5">
          {bullets.map((point) => (
            <div key={point} className="flex items-start gap-3 bg-white/[0.03] rounded-lg p-4 border border-white/[0.06]">
              <Star className="w-4 h-4 text-amber-400/70 mt-0.5 shrink-0" />
              <span className="text-sm text-white/70">{point}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-5 pb-14 max-w-xl text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="text-xs text-white/50 mb-4">Rated 4.9/5 by tattoo artists & collectors</p>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <p className="text-sm text-white/70 italic leading-relaxed">
            "{content.free_budder_testimonial_quote}"
          </p>
          <p className="text-xs text-white/30 mt-3">— {content.free_budder_testimonial_author}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-5 pb-14 max-w-xl">
        <h2 className="text-xl font-bold text-center mb-5 tracking-tight">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-medium text-white/80">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-white/30 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-white/50 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-5 pb-20 max-w-xl text-center">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-2 tracking-tight">Try Premium Tattoo Aftercare — Free</h3>
          <p className="text-sm text-white/50 mb-6">
            Just cover ${content.free_budder_shipping_price} shipping.
          </p>
          <Button
            onClick={handleClaim}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg px-8 py-6 rounded-xl w-full shadow-lg shadow-amber-500/20 transition-all duration-200"
          >
            <Package className="w-5 h-5 mr-2" />
            Get My Free Budder
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-white/30">
        <div className="container mx-auto px-5 space-y-1">
          <p>© {new Date().getFullYear()} Blue Dream Budder. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <a href="/terms" className="hover:text-white/50 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-white/50 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-sm border-t border-white/[0.06] p-3">
          <Button
            onClick={handleClaim}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-base py-5 rounded-xl w-full shadow-lg shadow-amber-500/20"
          >
            {content.free_budder_cta_text}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FreeBudder;
