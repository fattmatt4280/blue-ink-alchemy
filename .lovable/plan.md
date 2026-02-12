

## Luxury Redesign: Free Budder Landing Page

A complete visual overhaul of the `/free-budder` page, shifting from the current "neon cyber" aesthetic to a premium luxury dark-mode design optimized for Meta ad conversions.

### What Changes

**Visual Direction**
- Deep navy-to-black gradient background (no more animated orbs/particles)
- Clean, minimal layout with strong typography hierarchy
- Subtle warm gold accents instead of neon blue glow effects
- Studio-lit product image presentation with soft shadow (no pulsing "FREE" badge)
- Elegant serif/sans-serif font pairing for a high-end skincare feel

**New Section Layout (top to bottom)**
1. **Logo** -- small, centered, minimal
2. **Hero** -- New headline: "Your Tattoo Is Fresh. It Shouldn't Smell Like Chemicals." with subheadline focused on scent/absorption, offer line below, and primary CTA
3. **Core Benefits** -- 3-column icon grid: "Smells Clean & Luxurious", "Absorbs Fast", "Organic Ingredients" (with descriptions)
4. **Why Artists Love It** -- stacked benefit blocks (existing editable bullets from admin)
5. **Social Proof** -- star rating + testimonial block (existing editable from admin)
6. **FAQ** -- accordion (existing editable from admin), with updated default questions including "Is there a subscription?"
7. **Final CTA** -- "Try Premium Tattoo Aftercare -- Free" with CTA button
8. **Sticky Mobile CTA** -- fixed bottom bar on mobile with the claim button

**All existing admin-editable content is preserved** -- headline, subheading, badge, CTA text, shipping price, product image, bullets, testimonial, and FAQs all continue to load from the `site_content` table. The defaults are updated to match the new copy.

### What Stays the Same
- Cart logic (clearCart, addToCart with promoType "free-budder", navigate to /checkout)
- Data fetching from `site_content` table
- FreeBudderEditor admin component (no changes needed)
- Footer links

---

### Technical Details

**File: `src/pages/FreeBudder.tsx`** (full rewrite)
- Remove `AnimatedBackground` import and usage
- Remove `futuristic-bg`, `neon-image`, `neon-button`, `cyber-text`, `font-rajdhani` class usage
- Replace with inline Tailwind classes for the luxury dark theme:
  - Background: `bg-gradient-to-b from-[#0a0e1a] via-[#0d1321] to-[#0a0e1a]`
  - Typography: clean white/gray hierarchy, no text-shadow glow
  - CTA buttons: solid warm gradient (amber/gold tone) with hover effects, no pulsing animation
  - Product image: centered with subtle drop shadow, soft radial glow behind, elegant "FREE" pill badge (not pulsing)
- Add new "Core Benefits" 3-column section between hero and "Why Artists Love It"
- Add sticky mobile CTA bar (`fixed bottom-0` on small screens, hidden on desktop)
- Update default content strings to match the new copy spec

**File: `src/index.css`** -- No changes needed (existing styles remain for other pages that use them)

**New default content values:**
- `free_budder_headline`: "Your Tattoo Is Fresh. It Shouldn't Smell Like Chemicals."
- `free_budder_subheading`: "Premium organic tattoo aftercare that absorbs fast and smells clean, smooth, and addictive."
- `free_budder_cta_text`: "Claim My Free Budder"
- Core benefits are hardcoded (not admin-editable) since they're brand-level positioning

**No database changes or new dependencies required.**

