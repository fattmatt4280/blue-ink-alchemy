

## FB Ads Landing Page: Free Baby Blue Dream Budder + $10.20 Shipping

### Overview
A high-conversion landing page at `/free-budder` for a "Free + Shipping" offer on the Baby Blue Dream Budder (10g). The product shows as FREE ($0.00), customer just pays flat rate $10.20 shipping. Limited to 1 per customer. Clicking "Claim Now" adds the item to cart and redirects to the normal checkout page with flat shipping pre-applied.

### What's Needed

#### 1. New Stripe Product + Price
A new Stripe product/price for the free budder at $0.00 won't work with Stripe Checkout (Stripe doesn't allow $0 line items in payment mode). Instead, we'll handle this by:
- Creating a single Stripe checkout session with just the $10.20 shipping charge as a line item (labeled "Baby Blue Dream Budder - Free + Shipping")
- No new Stripe product needed -- the `create-payment` edge function will handle the special promo flow

#### 2. New Landing Page: `src/pages/FreeBudder.tsx`
A focused, conversion-optimized page with:
- Hero section with product image and bold "FREE" messaging
- Clear value proposition: "Just pay $10.20 shipping"
- Product image (using the existing Baby Blue Dream Budder image)
- "Claim Your Free Budder" CTA button
- Social proof section (star rating, review count)
- Urgency elements ("Limited time offer", "While supplies last")
- Simple FAQ section (What's included? How long to ship? etc.)
- Dark futuristic theme matching the rest of the site
- No site navigation header (standard for FB ad landing pages -- reduces bounce)
- Minimal footer

#### 3. Route Addition: `src/App.tsx`
Add `/free-budder` route pointing to the new page.

#### 4. Modified Checkout Flow: `src/pages/Checkout.tsx`
- Detect when the cart contains a "free-budder" promo item (via a flag or special price of $0)
- When detected, skip the ShippingRateSelector and show flat $10.20 shipping instead
- Limit quantity to 1 for this item

#### 5. Edge Function Update: `supabase/functions/create-payment/index.ts`
- Detect the free-budder promo item in the cart
- Instead of looking up a stripe_price_id, create a single `price_data` line item for $10.20 labeled "Baby Blue Dream Budder (10g) - Free + Shipping"
- Check if email has already claimed (query orders table for previous free-budder orders)

#### 6. Email Duplicate Check
- Before checkout, check the `orders` table to see if that email already claimed a free budder
- If yes, show a message: "You've already claimed your free budder!"

---

### Technical Details

**New file:** `src/pages/FreeBudder.tsx`
- Standalone landing page component
- Uses `useCart` to add a special cart item with `price: 0` and a `promoType: 'free-budder'` flag
- On CTA click: clears cart, adds the free budder item, navigates to `/checkout`

**Modified:** `src/App.tsx`
- Add route: `<Route path="/free-budder" element={<FreeBudder />} />`

**Modified:** `src/pages/Checkout.tsx`
- Detect `promoType === 'free-budder'` in cart items
- Hide ShippingRateSelector, set flat $10.20 shipping
- Lock quantity to 1, hide quantity controls for promo items
- Hide discount code section for free promo orders

**Modified:** `src/contexts/CartContext.tsx`
- Add optional `promoType` field to cart item interface

**Modified:** `supabase/functions/create-payment/index.ts`
- Detect free-budder promo items
- Use `price_data` with $10.20 (1020 cents) instead of looking up stripe_price_id
- Query orders table to enforce 1-per-customer limit by email
- Create order record with metadata indicating it's a free-budder promo

### Page Layout (top to bottom)

1. Logo (small, centered)
2. Hero: Product image + "Get Your FREE Baby Blue Dream Budder" headline
3. Subheading: "Premium tattoo aftercare -- just pay $10.20 shipping"
4. CTA Button: "Claim Your Free Budder"
5. Trust badges: "Lab Tested", "Organic Ingredients", "Artist Recommended"
6. Brief product description
7. Customer reviews snippet
8. FAQ accordion
9. Final CTA
10. Minimal footer with links

