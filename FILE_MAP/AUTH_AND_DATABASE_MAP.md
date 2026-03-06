# AUTH_AND_DATABASE_MAP.md

### 1. Database Client
- **File:** `campaign-backend/lib/insforge.js`
- **Context:** Initialized with Admin API keys. Handles all raw SQL and ORM-like operations.

### 2. Google OAuth (The Link)
- **Frontend Entry:** `campaign-scheduler/src/app/api/auth/google/route.ts`
- **Backend Token Handling:** `campaign-backend/lib/email-service.js` -> `refreshAccessToken()`
- **Exchange:** Logic for exchanging codes for Refresh Tokens happens in `campaign-scheduler/src/app/api/auth/callback/google/route.ts`.

### 3. Encryption (Security)
- **Files:** 
  - `campaign-backend/lib/encryption.js`
  - `campaign-scheduler/src/lib/encryption.ts`
- **Rule:** These two must remain identical in logic so that tokens encrypted by the frontend can be decrypted by the backend.
