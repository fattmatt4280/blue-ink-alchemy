

## Fix: Blank Screen After Login

### Root Cause
A race condition in `AuthContext.tsx` where the `loading` state is set to `false` before the admin/artist role check finishes. This causes the app to briefly render with `isAdmin = false`, which triggers a redirect away from the admin dashboard (or shows a blank/access-denied screen). On refresh, everything loads in the correct order, so it works fine.

### The Fix
Consolidate the auth initialization so that `loading` is only set to `false` after **both** the session and the role check have completed. The admin/artist check will be moved inline rather than running in a separate `useEffect`.

### Changes: `src/contexts/AuthContext.tsx`

1. **Create a shared `checkRoles(userId)` function** that queries `is_admin` and `is_artist` RPCs and sets the corresponding state.

2. **Initial load (`initializeAuth`):**
   - Call `getSession()`
   - If a user exists, `await checkRoles(user.id)` before setting `loading = false`
   - If no user, set `loading = false` immediately

3. **Ongoing auth changes (`onAuthStateChange`):**
   - Update `session` and `user` state
   - If user exists, fire `checkRoles(user.id)` (fire-and-forget, no need to block)
   - If signed out, reset `isAdmin` and `isArtist` to `false`
   - Do NOT touch the `loading` state here

4. **Remove the separate `useEffect` for admin checking** -- it's now handled inline during init and auth changes.

5. **Remove the `setTimeout` hack** that was setting `loading = false` after 100ms.

### What This Fixes
- No more brief flash of "Access Denied" or blank screen after login
- No more reliance on `setTimeout` for timing
- Admin status is guaranteed to be resolved before the app renders protected routes
- Refresh behavior stays the same (already works correctly)

### Files Modified
- `src/contexts/AuthContext.tsx` -- single file change

