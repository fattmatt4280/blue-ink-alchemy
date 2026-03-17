

## Update Free Budder Landing Page Copy

Replace the current body copy in `src/pages/FreeBudder.tsx` with the new advertorial content while preserving all existing functionality (cart logic, CTA buttons, sticky mobile CTA, FAQ accordion, dark theme, data fetching from Supabase).

### Changes to `src/pages/FreeBudder.tsx`

**Defaults updated:**
- Headline (H1): "The Tattoo Aftercare Nobody Talks About... The Way It Smells"
- Subheadline: "Most people expect a tattoo to hurt. What they don't expect? Opening their aftercare jar and getting hit with a sharp, overly perfumed, artificial scent."
- Final CTA headline: "Your tattoo deserves better than synthetic fragrance and artificial color."

**Section-by-section body copy replacement:**

1. **Opening Story** -- Rewritten around the smell/color frustration (artificial scent, bright white creams, synthetic-looking products)
2. **Problem Agitation ("The Hidden Problem...")** -- Artificial fragrance blends, synthetic perfume compounds, added dyes, heavy fillers. "Strong doesn't mean better. Bright white doesn't mean clean."
3. **Discovery / Turning Point ("We Took a Different Approach")** -- Botanicals over lab-built scent. Natural tone from real butters/oils. Soft, creamy tan color positioning.
4. **Product Breakdown ("What It Actually Feels Like")** -- Simplified to: melts into skin, absorbs quickly, no greasy shine, no heavy residue, no synthetic fragrance cloud
5. **Ingredient Transparency ("Why Ingredient Integrity Matters")** -- Specific ingredients listed: shea butter, mango butter, avocado butter, jojoba oil, hempseed oil, blended essential oils. No artificial dyes/perfume/fillers.
6. **Testimonials ("What People Notice First")** -- Updated defaults to the 4 new quotes focused on smell:
   - "Finally something that doesn't smell fake."
   - "It's subtle but addictive."
   - "My tattoo feels moisturized without that heavy perfumey scent."
   - "It actually smells natural."
7. **Offer Section ("And Right Now...")** -- Simplified: free jars, just cover shipping. No gimmicks, no subscriptions, no inflated pricing.
8. **FAQ** -- Updated to 5 new questions: artificial fragrance, why not bright white, scent strength, fresh tattoo use, shipping time.
9. **Final CTA** -- "Your tattoo deserves better than synthetic fragrance and artificial color. Try it free. Just cover shipping."

**What stays the same:**
- All functional code (cart, navigation, Supabase fetch, sticky mobile CTA)
- Visual design system (dark theme, amber accents, rounded cards, typography scale)
- CTA button component and placement pattern (5 CTAs throughout)
- FAQ accordion behavior
- Data fetching from `site_content` table (admin overrides still work)
- Page structure and layout

### Technical Details

- Single file edit: `src/pages/FreeBudder.tsx`
- Default constants (`DEFAULT_FAQS`, `DEFAULT_TESTIMONIALS`, `DEFAULTS`) updated with new copy
- `DEFAULT_BULLETS` removed since the new "What It Actually Feels Like" section uses inline items instead of the dynamic bullets array
- Product breakdown section simplified from checklist cards to clean text lines matching the new minimal copy style
- No new dependencies needed

