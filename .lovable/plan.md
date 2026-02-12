

## Fix RLS Error on Free Budder Editor Save

### Problem
The `site_content` table has an `ALL` policy for admins, but it lacks an explicit `WITH CHECK` expression. During an upsert (INSERT ... ON CONFLICT UPDATE), PostgreSQL requires both USING and WITH CHECK to pass. The missing WITH CHECK on the ALL policy can cause RLS violations on the INSERT portion.

### Solution
Add an explicit INSERT policy for admins on the `site_content` table with a proper `WITH CHECK` clause.

### Technical Details

**Database migration:**
```sql
CREATE POLICY "Admins can insert site content"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK (is_admin());
```

Optionally, also add an explicit UPDATE policy to be safe:
```sql
CREATE POLICY "Admins can update site content"
ON public.site_content
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
```

Then drop the overly broad ALL policy and replace it with specific operation policies:
```sql
DROP POLICY IF EXISTS "Only admins can modify site content" ON public.site_content;
```

This gives clear, operation-specific policies:
- SELECT: "Anyone can view site content" (already exists)
- INSERT: "Admins can insert site content" (new)
- UPDATE: "Admins can update site content" (new)
- DELETE: covered by the admin check as well (optional, add if needed)

### Files Changed
- Database migration only (no frontend code changes needed)

