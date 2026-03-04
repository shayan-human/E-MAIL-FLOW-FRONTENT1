# Campaign Scheduler & Time Estimation Design

## 1. Architecture
- **Framework:** Next.js 14+ (App Router).
- **Frontend / Forms:** Client Components (`"use client"`) using React state for live calculations and real-time UI updates.
- **Backend / Integration:** Server-side Route Handler (`app/api/campaign/route.ts`) handles API requests securely without exposing tokens.
- **Validation:** Zod library for data validation on both frontend (actionable UI errors) and backend (security).
- **Styling & UI:** Tailwind CSS, shadcn/ui components, Lucide React (based on `brand-identity` guidelines).

## 2. Core Components
- **`app/page.tsx`**: The main Server Component layout that imports the scheduler.
- **`components/campaign/CampaignScheduler.tsx`**: The primary Client Component. Contains:
  - Input form for the 8 specified fields.
  - Live calculation logic layer.
  - Output display sections (statistics, completion estimates, and warnings).
- **`lib/calculations.ts`**: Pure functions extracting the calculation logic (Days Required, Capacity, Estimate Dates) to keep the component clean and testable. Ensure that all date manipulations default to the configured system timezone (see below).

## 3. Data Flow & Integration (The Secure Path)
1. **Input:** User fills out the scheduler form; live calculations update statistics instantly.
2. **Submit:** User clicks "Launch Campaign".
3. **Idempotency Check:** The submit button is immediately disabled and a generated `idempotencyKey` (UUID) is attached to the payload to prevent duplicate execution from double clicks.
4. **Network:** Frontend POSTs a JSON payload (the 8 fields + `idempotencyKey` + `timezone`) to our internal `/api/campaign` route.
5. **Backend Processing:**
   - **Auth & Rate Limiting:** The backend verifies a pre-shared secret or Basic Auth header. Redis or an in-memory store blocks excessive requests within a 1-minute window per IP/User.
   - The Route Handler validates the JSON via Zod and extracts the `idempotencyKey`. If this key was recently processed, it returns safe 200 OK early.
   - It reads the `N8N_API_KEY` and `N8N_BASE_URL` securely from the `.env.local` server environment.
   - **Workflow Cloning:** Instead of spamming templates, the backend clones a designated "Base Campaign Template" workflow (via `POST /api/v1/workflows`) and renames it dynamically (e.g., `Campaign-[UUID]`).
   - It **injects the submitted configuration values** continuously into the relevant nodes of the newly cloned workflow JSON configuration.
6. **N8n Execution:**
   - Server activates the cloned workflow via `POST /api/v1/workflows/{id}/activate` using the token.
7. **Response:** Route Handler returns a success response (and the new workflow ID) to the frontend, which displays a success toast to the user.

## 4. Calculations & Validation Logic
Implementation of the requested formulas:
- **Total Capacity:** `accounts * limitPerAccount`
- **Required Days:** `Math.ceil(totalLeads / totalCapacity)`
- **Avg Delay:** `(minDelay + maxDelay) / 2`
- **Window Warning:** Check if `(limitPerAccount * avgDelay)` > `(endTime - startTime in minutes)`.
- **Timezone:** All calculations strictly rely on explicitly defined timezones using a library like `date-fns-tz`. The user selects a specific timezone in the UI, and all timestamp/date objects strictly inherit this explicit timezone rather than relying on the client's local runtime offset.

## 5. Security & Error Handling
- Zod schemas prevent malformed API requests from reaching n8n.
- If delay exceeds window, a bright visual warning banner is drawn above the submit button (per requirements, it warns but does not strictly prevent submission unless desired).
- API Key never included in client bundles.
- Auth middleware protects all `/api/campaign` endpoints.
- `try/catch` in the Route Handler returns structured `400` or `500` HTTP status codes, parsed by the frontend into elegant Toast error notifications.

## 6. Campaign Completion & Lifecycle Logic
To prevent cluttering the n8n backend:
- The base n8n template will be designed with a dedicated logic node at the end of the campaign flow.
- Once the final email is sent/processed based on the total leads count, this node triggers a local HTTP request (within n8n) targeting its own `DELETE /api/v1/workflows/{id}` endpoint.
- This creates an ephemeral, "self-destructing" workflow that lives only as long as the campaign is actively executing and automatically cleans up upon successful completion. Alternatively, the n8n workflow can simply deactivate itself via `POST /api/v1/workflows/{id}/deactivate` if historical run logs are temporarily required.
