

## Add Free Budder Landing Page Editor to Admin Dashboard

### Overview
Add a new admin section that lets you edit all the content on the `/free-budder` landing page without touching code. The editable fields will be stored in the `site_content` table (already exists) and the FreeBudder page will read from it dynamically.

### What You'll Be Able to Edit
- Main headline text
- Subheading / shipping price text
- CTA button text
- Product image URL
- "Why Artists Love It" bullet points
- FAQ questions and answers
- Testimonial quote and author
- Badge text ("Limited Time Offer", etc.)

### Changes

#### 1. New Component: `src/components/FreeBudderEditor.tsx`
An admin editor card with form fields for each editable section of the landing page. On save, it writes to the `site_content` table using keys like `free_budder_headline`, `free_budder_subheading`, `free_budder_cta_text`, `free_budder_faqs` (stored as JSON), etc. Includes a "Preview" button that opens `/free-budder` in a new tab.

#### 2. Admin Dashboard: `src/pages/AdminDashboard.tsx`
- Add a new "Landing Pages" tab (or add the editor under the existing "Pages" tab)
- Include the `FreeBudderEditor` component there

#### 3. Update Landing Page: `src/pages/FreeBudder.tsx`
- On load, fetch the relevant `site_content` rows (keys starting with `free_budder_`)
- Use the database values if they exist, fall back to the current hardcoded defaults if not
- This means the page works immediately with current content, and any admin edits override it

### Editable Fields (stored in `site_content`)

| Key | Type | Default |
|-----|------|---------|
| `free_budder_headline` | text | "Get Your FREE Baby Blue Dream Budder" |
| `free_budder_subheading` | text | "Premium tattoo aftercare -- just pay $10.20 shipping" |
| `free_budder_cta_text` | text | "Claim Your Free Budder" |
| `free_budder_badge_text` | text | "Limited Time Offer" |
| `free_budder_product_image` | image | current product image URL |
| `free_budder_shipping_price` | text | "10.20" |
| `free_budder_bullet_points` | text (JSON) | current 4 bullet points |
| `free_budder_faqs` | text (JSON) | current FAQ array |
| `free_budder_testimonial_quote` | text | current quote |
| `free_budder_testimonial_author` | text | "Professional Tattoo Artist" |

### How It Works
- Admin opens the "Pages" tab and sees the Free Budder Landing Page editor
- Edits any field and clicks Save
- The landing page immediately reflects the changes (no code deploy needed)
- Hardcoded defaults serve as fallback so nothing breaks if content hasn't been saved yet

