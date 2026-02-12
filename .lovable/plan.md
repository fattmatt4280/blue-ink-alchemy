

## Fix Blank Screen After Login + Make FreeBudder Text Legible

### Two Issues to Fix

---

### Issue 1: Blank Screen After Sign-In

**Root Cause Found:** Two problems working together:

1. **Non-existent route:** In `Auth.tsx` (line 122), non-admin users are redirected to `/dashboard` after login -- but there is no `/dashboard` route in `App.tsx`. This hits the `DynamicPageHandler` catch-all, which shows a blank or "not found" page.

2. **Race condition for admins:** In `AuthContext.tsx`, the `onAuthStateChange` handler calls `checkRoles()` without `await`. So when `Auth.tsx`'s redirect logic runs, `isAdmin` is still `false`, sending admins to `/dashboard` (blank page) instead of `/admin`. On refresh, `initializeAuth` correctly `await`s role checks, so it works fine.

**Fix:**
- **`src/pages/Auth.tsx`**: Change the non-admin redirect from `/dashboard` to `/` (the homepage, which exists). Change admin redirect to stay as `/admin`.
- **`src/contexts/AuthContext.tsx`**: Make `onAuthStateChange` await `checkRoles()` so that `isAdmin` is resolved before any redirect logic can fire.

---

### Issue 2: Grey/Illegible Text on FreeBudder Page

The landing page uses many low-opacity blue text colors that appear grey and hard to read on the dark background:

| Current Class | Visibility | Replacement |
|---|---|---|
| `text-blue-200/80` | Dim | `text-blue-100` |
| `text-blue-300/50` | Very dim | `text-blue-200/70` |
| `text-blue-200/70` | Dim | `text-blue-100` |
| `text-blue-100/80` | Slightly dim | `text-white/90` |
| `text-blue-200/60` | Dim | `text-blue-100` |
| `text-blue-300/40` | Nearly invisible | `text-blue-200/70` |

**Fix in `src/pages/FreeBudder.tsx`:** Bump all text opacity/brightness values up so every piece of text is clearly legible white or near-white against the dark futuristic background.

---

### Files Modified

1. **`src/contexts/AuthContext.tsx`** -- `await` the `checkRoles` call inside `onAuthStateChange` for `SIGNED_IN` events
2. **`src/pages/Auth.tsx`** -- Change redirect target from `/dashboard` to `/`
3. **`src/pages/FreeBudder.tsx`** -- Replace all dim grey/blue text classes with brighter, more legible alternatives

