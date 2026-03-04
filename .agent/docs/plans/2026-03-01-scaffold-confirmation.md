# Campaign Scheduler - Setup Confirmation

Before dispatching subagents for the implementation, please confirm the following foundational approaches:

## 1. Final Folder Structure
```text
campaign-scheduler/
├── app/
│   ├── api/campaign/
│   │   └── route.ts         # Secure backend Route Handler
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Main page importing the scheduler
├── components/
│   ├── campaign/
│   │   └── CampaignScheduler.tsx  # Main interactive client component
│   └── ui/                  # shadcn/ui generic primitive components
├── lib/
│   ├── calculations.ts      # Pure math functions for time estimation
│   ├── n8n/
│   │   └── base-workflow.ts # Hardcoded or imported base n8n JSON template
│   ├── rate-limit.ts        # In-memory IP rate limiter
│   └── validations/
│       └── campaign.ts      # Zod schemas used by both frontend and backend
├── .env.local               # Secrets (not committed)
└── ... (standard Next.js configs: package.json, tailwind.config.ts)
```

## 2. Environment Variable Setup Strategy
We will use Next.js's built-in support for `.env.local` for server-side secrets.
`N8N_API_KEY` and `N8N_BASE_URL` will be accessed securely inside `app/api/campaign/route.ts` using `process.env`. None of these variables will have the `NEXT_PUBLIC_` prefix, meaning Next.js will completely strip them from the browser bundle.

## 3. Base n8n Workflow JSON Storage Approach
We will store the baseline workflow structure directly inside the codebase as a TypeScript constant (e.g., `lib/n8n/base-workflow.ts`). This allows us to statically type the structure and easily mutate specific JSON nodes (like injecting the target Accounts, Delays, etc.) before we `POST` the cloned version to n8n's API during the workflow creation phase.

## 4. Timezone Handling Approach
We will handle timezones explicitly using `date-fns-tz`. By default, the system will assume standard explicit dates based on the configured user timezone when doing all calculations related to the sending window start/end times and the projected end date (excluding weekends). Date strings passed to the Next.js API and to n8n will be absolute ISO 8601 strings.

---

**Do you approve of these approaches so I can begin dispatching the Subagents to implement the functionality?**
