# PROJECT_BRAIN.md

## Project Overview
**DemGrow** is an automated email outreach platform. 
- **Stack:** Next.js (Frontend), Node.js/Express (Backend), InsForge (Database/Auth).
- **Hosting:** Render (Backend), Vercel (Frontend).
- **Core Function:** Automated mass-emailing via Google API with scheduled cron cycles.

## Current Architecture
- `campaign-backend/server.js`: Express server & Cron scheduler (`node-cron`).
- `campaign-backend/lib/email-service.js`: Gmail REST API integration (not SMTP).
- `campaign-backend/lib/insforge.js`: Database client & state management.
- `campaign-backend/lib/encryption.js`: Encrypts/Decrypts Google tokens.
- `campaign-scheduler/src/app/api/auth/google`: Frontend OAuth flow entry point.

## Database Schema
- `leads`: Targeted emails. Columns: `email`, `status` (PENDING/SENT/FAILED), `campaign_id`.
- `sender_accounts`: Linked Gmail accounts. Columns: `google_access_token`, `google_refresh_token`, `email`, `is_active`.
- `campaigns`: Grouped outreach tasks. Columns: `subject`, `body`, `status` (RUNNING/COMPLETED).
- `email_logs`: Detailed audit trail of every send attempt.

## Environment Variables
- `INSFORGE_BASE_URL` / `INSFORGE_ANON_KEY`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `INSFORGE_ADMIN_API_KEY`
- `PORT` / `CRON_SCHEDULE`

## What Is Working ✅
- Gmail REST API sending (bypasses ISP port blocking).
- Automatic Token Refreshing via Refresh Tokens.
- Automated Campaign Cycles (checking leads -> sending -> waiting -> repeating).
- Google App "In Production" status (prevents token expiry).
- **Frontend Sync:** UI accurately reflects database state for Sent emails and Reply tracking.

## Known Fragile Areas ⚠️
- **Google OAuth:** Scopes must include `https://www.googleapis.com/auth/gmail.send`. If changed, all users must reconnect.
- **Render Hosting:** SMTP ports are blocked; **never** switch to SMTP/Nodemailer. Stay with REST API.
- **Token Security:** Tokens are encrypted in the DB. Modifying `encryption.js` without a migration will break all existing accounts.

## Decisions Made
- **Using Render:** Backend must live on Render for consistent Cron performance.
- **REST over SMTP:** Use `gmail.googleapis.com` only.
- **InsForge over Supabase:** Native MCP integration for rapid updates.

## Do Not Touch 🚫
- **`email-service.js` Sending Logic:** The RFC 2822 base64 encoding (`buildRawEmail`) is highly specific. Any change to whitespace or headers will cause Gmail to reject the payload.
- **Encryption Key logic:** Do not change how `google_refresh_token` is handled.
- **Cron Timing:** The randomized delay logic in `server.js` is critical to prevent Gmail spam detection.
- **Frontend Data Flow:** The real-time reflection of `email_logs` and `leads` status in the UI is highly tuned; do not modify the sync logic or table mappings.

## Problems Solved 🛠️
- **Dashboard Stats Visibility (March 6, 2026):**
  - **Problem:** Dashboard stats and campaign lists were showing 0 even when data existed in the DB. This was caused by an authentication mismatch where the server-side InsForge client was incorrectly overwriting the project `anonKey` with the user's JWT, and the client-side instance was using a hardcoded placeholder JWT.
  - **Solution:** 
    1. Updated `getInsforgeClient` in `insforge-server.ts` to use `edgeFunctionToken` for user JWTs while preserving the `anonKey`.
    2. Corrected client-side `insforge.ts` to use `NEXT_PUBLIC_INSFORGE_ANON_KEY`.
    3. Ensured `DashboardClient` correctly integrates with the `InsforgeBrowserProvider` session state.
