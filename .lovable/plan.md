

## Problem

The current `/tiktok-connect` page only shows a "Connect TikTok" button that tries to do a real OAuth redirect (which fails without approved credentials). TikTok's app review requires a demo showing the full end-to-end flow. We need a **demo/mockup mode** that simulates the entire integration visually.

## Plan

**Rebuild `src/pages/TikTokConnect.tsx`** as a polished, multi-step demo page that walks through the entire flow with simulated data. The page will have a **demo mode** (default, always active) that shows each step with mock data and realistic UI, plus the real integration code ready to go once credentials are approved.

### Demo Flow (Step-by-Step)

1. **Landing / Connect Screen** — App branding, description of what the integration does, "Connect TikTok" button with TikTok logo styling
2. **Simulated OAuth** — Clicking "Connect TikTok" shows a brief loading state, then transitions to a mock "connected" state with a fake user profile (avatar placeholder, display name "DreamTattoo")
3. **Connected Dashboard** — Shows:
   - Connected user card (avatar, username, green "Connected" badge)
   - Video upload area (drag-and-drop styled zone, accepts mp4/mov, shows file name/size when selected)
   - Caption/description textarea
   - Privacy level selector (Public, Friends Only, Self Only)
   - "Publish to TikTok" button
4. **Publishing Simulation** — Clicking publish shows a progress animation, then a success card with a mock publish ID and "View on TikTok" link
5. **Technical Info Section** — At the bottom, a collapsible section showing:
   - Scopes used: `user.info.profile`, `video.upload`, `video.publish`
   - OAuth redirect URI
   - API endpoints called
   - Edge functions architecture diagram (text)

### Styling

- Clean, modern card-based layout with TikTok's brand colors (black, #ee1d52 red, #69C9D0 teal)
- Use existing Tailwind classes and shadcn/ui components (Card, Button, Badge, Progress)
- Responsive — works on the 390px viewport the reviewer might use

### Technical Details

- **Single file change**: `src/pages/TikTokConnect.tsx`
- Add a `demoMode` state (defaulting to `true`) with a small toggle at the top so the real flow can be activated later
- In demo mode, all API calls are replaced with `setTimeout` simulations
- The real OAuth/edge function code stays intact, just gated behind `!demoMode`
- No database or edge function changes needed

