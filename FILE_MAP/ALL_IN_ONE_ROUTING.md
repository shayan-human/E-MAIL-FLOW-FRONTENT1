# ALL_IN_ONE_ROUTING.md

Use this file to instantly find where to fix a specific problem without researching the whole codebase.

| Problem Area | Primary File to Edit / Check | Secondary / Related Files |
|:---|:---|:---|
| **Database Connections** | `campaign-backend/lib/insforge.js` | `.env` (Admin keys) |
| **Email Not Sending** | `campaign-backend/lib/email-service.js` | `campaign-backend/server.js` (Cron) |
| **Google Auth / Token Expiry**| `campaign-backend/lib/email-service.js` | `campaign-scheduler/src/app/api/auth/google/route.ts` |
| **Campaign Scheduling** | `campaign-backend/server.js` | `campaign-backend/server.log` (Debug) |
| **Reply Tracking** | `campaign-backend/lib/reply-service.js` | `campaign-backend/server.js` |
| **Dashboard Stats** | `campaign-scheduler/src/app/(app)/dashboard/page.tsx` | `campaign-scheduler/src/lib/insforge-server.ts` |
| **Connected Accounts UI** | `campaign-scheduler/src/app/(app)/accounts/page.tsx` | `campaign-scheduler/src/app/api/auth/callback/google/route.ts` |
| **Leads / Campaign Management**| `campaign-scheduler/src/app/(app)/campaigns/page.tsx` | `campaign-scheduler/src/app/api/campaign/sync-replies/route.ts` |
| **Encryption / Decryption** | `campaign-backend/lib/encryption.js` | `campaign-scheduler/src/lib/encryption.ts` (Keep in Sync!) |

## Quick Troubleshooting Logic:
1. **"Database error"** -> Start with `insforge.js` (Backend) or `insforge-server.ts` (Frontend).
2. **"Email delivery failed"** -> Check `email-service.js` -> `sendEmail` function.
3. **"Token/Auth error"** -> Check `email-service.js` -> `refreshAccessToken` function.
4. **"UI not updating"** -> Check if the frontend API routes are actually updating the DB tables correctly.
