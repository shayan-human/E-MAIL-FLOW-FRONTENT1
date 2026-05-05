# Supabase Migration & Removal of InsForge

This document outlines the transition from InsForge BaaS to a standalone Supabase implementation.

## 1. Why we migrated
The previous `@insforge/nextjs` library had hard-coded dependencies on specific domains and custom cookie handling that conflicted with the new custom domain `email-flow.demqrow.space`. Switching to standard `@supabase/ssr` ensures maximum stability and compatibility.

## 2. Changes Made
- **Auth System**: Switched from `insforge.auth` to a custom `auth-helper.ts` using `@supabase/ssr`.
- **Providers**: Removed `InsforgeBrowserProvider`. The session is now handled natively by Next.js middleware and cookies.
- **Client Library**: All references to `@insforge/sdk` and `@insforge/nextjs` have been replaced with standard `@supabase/supabase-js`.
- **Environment Variables**:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY`

## 3. Database "Connections" (Foreign Keys)
If you see your tables as disconnected in the Supabase Dashboard, it is because the Foreign Keys were not defined in the SQL. Run the following SQL in your **Supabase SQL Editor** to "connect" your tables:

```sql
-- Connect Leads to Campaigns
ALTER TABLE leads 
ADD CONSTRAINT fk_campaign 
FOREIGN KEY (campaign_id) 
REFERENCES campaigns(id) 
ON DELETE CASCADE;

-- Connect Notes to Leads (if deal_id is lead_id)
ALTER TABLE notes 
ADD CONSTRAINT fk_lead 
FOREIGN KEY (deal_id) 
REFERENCES leads(id) 
ON DELETE CASCADE;

-- Connect Campaigns to Users
-- (Assumes your user_id column matches Supabase auth.users)
ALTER TABLE campaigns 
ADD CONSTRAINT fk_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
```

## 4. Final Verification
- **Login**: Use the "Continue with Google" button. It now uses the direct Supabase OAuth flow.
- **Session**: The session is stored in cookies prefixed with `sb-`.
- **API**: All API routes in `src/app/api` have been updated to use the new auth helper.
