import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Star, ChevronDown, ChevronUp, Package, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const DEFAULT_IMAGE = "https://vozstxchkgpxzetwdzow.supabase.co/storage/v1/object/public/product-images/products/1751239126214-cpzvrwo41ga.jpeg";

const DEFAULT_FAQS = [
  { q: "Does it contain artificial fragrance?", a: "No. The scent profile comes from blended botanical essential oils." },
  { q: "Why isn't it bright white?", a: "Because we don't use artificial dyes. The natural butters give it its tan tone." },
  { q: "Is the scent strong?", a: "It's noticeable but not overpowering. Clean and balanced." },
  { q: "Can I use it on fresh tattoos?", a: "Yes. It's formulated specifically for tattoo aftercare." },
  { q: "How long does shipping take?", a: "Standard U.S. shipping times apply after order confirmation." },
];

const DEFAULT_TESTIMONIALS = [
  { quote: "Finally something that doesn't smell fake.", author: "Verified Buyer", image: "" },
  { quote: "It's subtle but addictive.", author: "Verified Buyer", image: "" },
  { quote: "My tattoo feels moisturized without that heavy perfumey scent.", author: "Verified Buyer", image: "" },
  { quote: "It actually smells natural.", author: "Verified Buyer", image: "" },
];

const DEFAULTS: Record<string, string> = {
  free_budder_headline: "The Tattoo Aftercare Nobody Talks About… The Way It Smells",
  free_budder_subheading: "Most people expect a tattoo to hurt. What they don't expect? Opening their aftercare jar and getting hit with a sharp, overly perfumed, artificial scent.",
  free_budder_cta_text: "Claim Your Free Jar",
  free_budder_badge_text: "Limited Time Offer",
  free_budder_product_image: DEFAULT_IMAGE,
  free_budder_shipping_price: "10.20",
};

const FreeBudder = () => {
  const { clearCart, addToCart } = useCart();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [content, setContent] = useState(DEFAULTS);
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
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
          if (row.key === 'free_budder_testimonials') {
            try { setTestimonials(JSON.parse(row.value)); } catch {}
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

  const CtaButton = ({ className = "" }: { className?: string }) => (
    <Button
      onClick={handleClaim}
      className={`bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-lg px-8 py-7 rounded-xl w-full shadow-lg shadow-amber-500/20 transition-all duration-200 ${className}`}
    >
      <Package className="w-5 h-5 mr-2" />
      {content.free_budder_cta_text}
    </Button>
  );

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white/90">

      {/* Minimal Top Bar */}
      <div className="flex justify-center pt-6 pb-2">
        <img
          src="/images/budder-buddy-icon.jpeg"
          alt="Blue Dream Budder"
          className="w-10 h-10 rounded-full border border-white/10"
        />
      </div>

      <article className="max-w-[680px] mx-auto px-5 pb-32 sm:pb-20">

        {/* 1. Headline */}
        <header className="pt-6 pb-8 text-center">
          <span className="inline-block text-amber-400/80 text-[11px] font-semibold uppercase tracking-[0.2em] mb-5">
            {content.free_budder_badge_text}
          </span>
          <h1 className="text-[1.65rem] sm:text-3xl md:text-[2.1rem] font-bold leading-[1.3] tracking-tight">
            {content.free_budder_headline}
          </h1>
        </header>

        {/* 2. Subheadline */}
        <p className="text-base sm:text-lg text-white/50 text-center leading-relaxed mb-8 max-w-lg mx-auto">
          {content.free_budder_subheading}
        </p>

        {/* 3. Hero Image */}
        <div className="relative mx-auto mb-10 rounded-2xl overflow-hidden">
          <img
            src={content.free_budder_product_image}
            alt="Baby Blue Dream Budder — organic tattoo aftercare"
            className="w-full aspect-square sm:aspect-[4/3] object-cover"
            loading="eager"
          />
          <div className="absolute top-3 right-3 bg-amber-500 text-black font-bold text-xs px-3 py-1 rounded-full shadow-md">
            FREE
          </div>
        </div>

        {/* 4. Opening Story */}
        <section className="space-y-5 mb-12">
          <p className="text-[15px] leading-[1.85] text-white/70">
            Most people expect a tattoo to hurt.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            What they don't expect?
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Opening their aftercare jar and getting hit with a sharp, overly perfumed, artificial scent that lingers longer than the tattoo sting itself.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            And then there's the color.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Bright white. Neon tint. Synthetic-looking creams that feel more cosmetic counter than skin recovery.
          </p>
        </section>

        {/* CTA #1 */}
        <div className="mb-14">
          <CtaButton />
          <p className="text-xs text-white/30 text-center mt-3">Just cover ${content.free_budder_shipping_price} shipping · Limit 1 per customer</p>
        </div>

        {/* 5. Problem Agitation */}
        <section className="space-y-5 mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-4">The Hidden Problem With Most Tattoo Aftercare</h2>
          <p className="text-[15px] leading-[1.85] text-white/70">
            A lot of aftercare products rely on:
          </p>
          <ul className="space-y-2 pl-1">
            {["Artificial fragrance blends", "Synthetic perfume compounds", 'Added dyes for "clean" white color', "Heavy fillers to create thickness"].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] text-white/70">
                <span className="text-amber-400/80 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[15px] leading-[1.85] text-white/70">
            They smell strong on purpose. They look bright on purpose. They feel thick on purpose.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            But <strong className="text-white/90">strong doesn't mean better</strong>.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            And <strong className="text-white/90">bright white doesn't mean clean</strong>.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            When your skin is healing, the last thing it needs is harsh fragrance oils and unnecessary color additives sitting on open pores.
          </p>
        </section>

        {/* 6. Discovery / Turning Point */}
        <section className="space-y-5 mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-4">We Took a Different Approach</h2>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Instead of building scent in a lab… we built it from botanicals.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Blue Dream Budder uses naturally derived essential oils blended intentionally to create a smooth, balanced scent profile.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Not overpowering. Not artificial. Not perfume-counter aggressive.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Just clean, layered botanicals that settle into the skin instead of sitting on top of it.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            And the color? No artificial dyes. What you see is the natural tone of the butters and oils themselves.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            A soft, creamy tan — because that's what <em>real ingredients</em> look like.
          </p>
        </section>

        {/* CTA #2 */}
        <div className="mb-14">
          <CtaButton />
          <p className="text-xs text-white/30 text-center mt-3">Free jar — just cover shipping</p>
        </div>

        {/* 7. Product Breakdown */}
        <section className="mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-6">What It Actually Feels Like</h2>
          <div className="space-y-3">
            {["Melts into skin", "Absorbs quickly", "No greasy shine", "No heavy residue", "No synthetic fragrance cloud"].map((point) => (
              <div key={point} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <Check className="w-5 h-5 text-amber-400/80 mt-0.5 shrink-0" />
                <span className="text-sm text-white/70">{point}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-[15px] leading-[1.85] text-white/70">
              It's smooth. Balanced. Subtle but noticeable.
            </p>
            <p className="text-[15px] leading-[1.85] text-white/70">
              You don't smell like a department store. You smell <em>clean</em>.
            </p>
          </div>
        </section>

        {/* 8. Ingredient Transparency */}
        <section className="mb-12 space-y-4">
          <h2 className="text-xl font-bold tracking-tight mb-4">Why Ingredient Integrity Matters</h2>
          <p className="text-[15px] leading-[1.85] text-white/70">
            When skin is healing, it's vulnerable. That's why Blue Dream Budder is made with:
          </p>
          <ul className="space-y-2 pl-1">
            {["Shea butter", "Mango butter", "Avocado butter", "Jojoba oil", "Hempseed oil", "Carefully blended essential oils"].map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] text-white/70">
                <Check className="w-4 h-4 text-amber-400/80 mt-1 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[15px] leading-[1.85] text-white/70">
            No artificial dyes. No synthetic perfume blends. No harsh fillers.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Just botanicals doing what botanicals are meant to do.
          </p>
        </section>

        {/* CTA #3 */}
        <div className="mb-14">
          <CtaButton />
          <p className="text-xs text-white/30 text-center mt-3">While supplies last</p>
        </div>

        {/* 9. Social Proof */}
        <section className="mb-14">
          <h2 className="text-xl font-bold tracking-tight text-center mb-2">What People Notice First</h2>
          <p className="text-[15px] text-white/50 text-center mb-6">
            It's not just how it feels. It's how different it smells.
          </p>
          <div className="space-y-4">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[15px] text-white/70 leading-relaxed mb-3">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  {t.image && (
                    <img
                      src={t.image}
                      alt={t.author}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                  )}
                  <p className="text-xs text-white/40 font-medium">— {t.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Offer Section */}
        <section className="mb-14">
          <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-2xl p-6 sm:p-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-2">And Right Now…</h2>
            <p className="text-[15px] text-white/50 mb-2 leading-relaxed">
              We're giving away jars for <strong className="text-white/80">FREE</strong>.
            </p>
            <p className="text-[15px] text-white/50 mb-2 leading-relaxed">
              You just cover <strong className="text-white/80">${content.free_budder_shipping_price} shipping</strong>.
            </p>
            <p className="text-[15px] text-white/50 mb-6 leading-relaxed">
              No gimmicks. No subscriptions required. No inflated retail pricing.
            </p>
            <CtaButton />
            <p className="text-xs text-white/30 mt-3">Just a chance to try it for yourself</p>
          </div>
        </section>

        {/* 11. FAQ */}
        <section className="mb-14">
          <h2 className="text-xl font-bold tracking-tight text-center mb-6">Common Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-medium text-white/80">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-white/30 shrink-0 ml-3" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/30 shrink-0 ml-3" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-[15px] text-white/50 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 12. Final CTA */}
        <section className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Your tattoo deserves better than synthetic fragrance and artificial color.</h2>
          <p className="text-[15px] text-white/50 mb-6">
            Try it free. Just cover shipping.
          </p>
          <CtaButton />
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] pt-6 mt-10 text-center text-xs text-white/25 space-y-1">
          <p>© {new Date().getFullYear()} Blue Dream Budder. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <a href="/terms" className="hover:text-white/40 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-white/40 transition-colors">Privacy</a>
            <a href="/contact" className="hover:text-white/40 transition-colors">Contact</a>
          </div>
        </footer>
      </article>

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
