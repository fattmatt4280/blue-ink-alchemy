import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Star, ChevronDown, ChevronUp, Package, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const DEFAULT_IMAGE = "https://vozstxchkgpxzetwdzow.supabase.co/storage/v1/object/public/product-images/products/1751239126214-cpzvrwo41ga.jpeg";

const DEFAULT_FAQS = [
  { q: "What does it smell like?", a: "Blue Dream Budder has a clean, luxurious scent — think fresh botanicals with a hint of sweetness. Nothing medicinal, nothing chemical. People genuinely compliment the smell." },
  { q: "Is it safe for fresh tattoos?", a: "Absolutely. It's made with organic, skin-safe ingredients — no petroleum, no parabens, no synthetic fragrances. Designed specifically for healing tattoos." },
  { q: "Will it irritate sensitive skin?", a: "Our formula is gentle enough for sensitive skin. No harsh chemicals, no artificial dyes. Just clean, organic botanicals that soothe rather than irritate." },
  { q: "How long does shipping take?", a: "Orders ship within 1–2 business days. Standard delivery is typically 3–7 business days depending on your location." },
  { q: "Is there a subscription or hidden fees?", a: "No. This is a one-time offer. No subscription, no auto-ship, no recurring charges. You just cover the $10.20 flat-rate shipping." },
  { q: "Why are you giving it away for free?", a: "Because once you try it, you'll never go back. We're that confident. This is our way of letting you experience the difference firsthand." },
];

const DEFAULT_BULLETS = [
  "Speeds up healing time with organic botanicals",
  "Keeps colors vibrant during the healing process",
  "Soothes irritation and reduces peeling",
];

const DEFAULT_TESTIMONIALS = [
  { quote: "I've tried every aftercare product out there. This is the first one that doesn't smell like a hospital. My clients love it.", author: "Jake M., Tattoo Artist", image: "" },
  { quote: "Used it on my sleeve and the healing was noticeably faster. Plus it smells incredible — my girlfriend kept asking what it was.", author: "Chris R.", image: "" },
  { quote: "Finally an aftercare balm that absorbs quickly and doesn't leave that gross greasy shine. This stuff is legit.", author: "Samantha T.", image: "" },
  { quote: "I was skeptical about 'free' anything but this is genuinely the best tattoo balm I've used. Already ordered 3 more jars.", author: "Devon L.", image: "" },
];

const DEFAULTS: Record<string, string> = {
  free_budder_headline: "Why Tattoo Artists Are Ditching Petroleum-Based Aftercare for This Clean, Addictive-Smelling Balm",
  free_budder_subheading: "A new organic tattoo aftercare balm is changing how people heal their ink — and it starts with what you smell.",
  free_budder_cta_text: "Claim My Free Jar",
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
  const [bullets, setBullets] = useState(DEFAULT_BULLETS);
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
          if (row.key === 'free_budder_bullet_points') {
            try { setBullets(JSON.parse(row.value).map((b: any) => b.text || b)); } catch {}
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

        {/* 1. Soft News-Style Headline */}
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
            You just sat for three hours. The tattoo looks incredible. You're proud of it. Then your artist hands you a tiny packet of something that smells like a mechanic's garage.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            You slather it on, and instantly your fresh ink is coated in a shiny, greasy layer that sticks to your clothes, smells medicinal, and makes you wonder — <em>is this really the best option?</em>
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            For most people, it is. Because nobody told them there was something better.
          </p>
        </section>

        {/* CTA #1 */}
        <div className="mb-14">
          <CtaButton />
          <p className="text-xs text-white/30 text-center mt-3">Just cover ${content.free_budder_shipping_price} shipping · Limit 1 per customer</p>
        </div>

        {/* 5. Problem Agitation */}
        <section className="space-y-5 mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-4">Here's What Nobody Talks About</h2>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Most tattoo aftercare products are built on <strong className="text-white/90">petroleum jelly</strong>. That thick, suffocating layer that traps heat and moisture against your healing skin.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            The <strong className="text-white/90">smell is the first red flag</strong>. If your aftercare smells like chemicals, it's because it <em>is</em> chemicals. Synthetic fragrances. Parabens. Preservatives your skin doesn't need while it's trying to heal.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Then there's the <strong className="text-white/90">greasy residue</strong>. It ruins your sheets. It transfers to your clothes. And it sits on top of your skin instead of absorbing into it.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Your tattoo deserves better. <em>You</em> deserve better.
          </p>
        </section>

        {/* 6. Discovery / Turning Point */}
        <section className="space-y-5 mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-4">Then We Made Something Different</h2>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Blue Dream Budder started with a simple question: <em>why does tattoo aftercare have to smell bad and feel worse?</em>
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            We developed an organic balm with a clean, addictive scent profile — not perfumey, not medicinal. Just fresh. The kind of scent people actually compliment you on.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            It absorbs in seconds. No greasy layer. No shine. Just soft, hydrated skin that lets your tattoo breathe and heal the way it's supposed to.
          </p>
        </section>

        {/* CTA #2 */}
        <div className="mb-14">
          <CtaButton />
          <p className="text-xs text-white/30 text-center mt-3">Free jar — just cover shipping</p>
        </div>

        {/* 7. Product Breakdown */}
        <section className="mb-12">
          <h2 className="text-xl font-bold tracking-tight mb-6">What Makes It Different</h2>
          <div className="space-y-3">
            {[
              { label: "Absorbs in seconds", desc: "No greasy residue, no transfer to clothes or sheets" },
              { label: "Luxury scent profile", desc: "Clean, fresh, and genuinely addictive — not medicinal" },
              { label: "100% organic ingredients", desc: "No petroleum, no parabens, no synthetic fragrances" },
              { label: "Non-greasy formula", desc: "Lightweight texture that lets your skin breathe" },
              { label: "Skin-safe for healing tattoos", desc: "Gentle enough for fresh ink and sensitive skin" },
            ].map(({ label, desc }) => (
              <div key={label} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <Check className="w-5 h-5 text-amber-400/80 mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-white/90">{label}</span>
                  <p className="text-[13px] text-white/45 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}

            {bullets.map((point) => (
              <div key={point} className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <Check className="w-5 h-5 text-amber-400/80 mt-0.5 shrink-0" />
                <span className="text-sm text-white/70">{point}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Ingredient Transparency */}
        <section className="mb-12 space-y-4">
          <h2 className="text-xl font-bold tracking-tight mb-4">Clean Ingredients. Full Stop.</h2>
          <p className="text-[15px] leading-[1.85] text-white/70">
            Every jar of Blue Dream Budder is made with organic botanicals — nothing synthetic, nothing harsh. We don't hide behind "proprietary blends." What goes on your healing skin matters, and we treat it that way.
          </p>
          <p className="text-[15px] leading-[1.85] text-white/70">
            No petroleum. No parabens. No artificial fragrances. Just clean, effective ingredients that work <em>with</em> your skin, not against it.
          </p>
        </section>

        {/* CTA #3 */}
        <div className="mb-14">
          <CtaButton />
          <p className="text-xs text-white/30 text-center mt-3">While supplies last</p>
        </div>

        {/* 9. Social Proof */}
        <section className="mb-14">
          <h2 className="text-xl font-bold tracking-tight text-center mb-2">What People Are Saying</h2>
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-white/40 ml-2">4.9/5 average rating</span>
          </div>
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
            <h2 className="text-2xl font-bold tracking-tight mb-2">Try It Free. Seriously.</h2>
            <p className="text-[15px] text-white/50 mb-2 leading-relaxed">
              Get a full-size jar of Baby Blue Dream Budder (10g) — the same product we sell for $6.99 — completely free.
            </p>
            <p className="text-[15px] text-white/50 mb-6 leading-relaxed">
              Just cover <strong className="text-white/80">${content.free_budder_shipping_price} flat-rate shipping</strong>. No subscription. No hidden fees. One per customer.
            </p>
            <CtaButton />
            <p className="text-xs text-white/30 mt-3">⏳ Limited quantities — this offer won't last forever</p>
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
          <h2 className="text-2xl font-bold tracking-tight mb-3">Your Tattoo Deserves Better Than Petroleum.</h2>
          <p className="text-[15px] text-white/50 mb-6">
            Try Blue Dream Budder free — just cover shipping.
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
