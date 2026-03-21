# DemGrow — Email Warmup System
## Complete Technical Specification

> **Stack:** Next.js · InsForge (PostgreSQL) · Gmail API · Ollama (LLM)
> **Feature URL:** emailflow.demgrow.space/warmup
> **Backend:** Express.js (Render) · node-cron
> **Status:** Fully built and deployed

---

## 1. What the Warmup System Does

Gmail accounts have a sender reputation score. Cold accounts (new or unused) get flagged as spam. Warmup fixes this by simulating organic email activity — sending, receiving, and replying to emails between a pool of trusted accounts — gradually training Gmail's algorithm to trust the sender.

---

## 2. Warmup Modes

| Mode | How it works |
|------|-------------|
| **Own Accounts** | Warmup only between the user's own added Gmail accounts |
| **DemGrow Network** | Warmup across all users' accounts in the shared platform pool |

---

## 3. Sending Architecture

### 3.1 Ramp-Up Schedules

Daily email counts are pre-defined per plan. All plans cap at **35 emails/day** max.

| Day | 5-Day | 10-Day | 20-Day | 30-Day | 40-Day |
|-----|-------|--------|--------|--------|--------|
| 1 | 5 | 3 | 2 | 2 | 2 |
| 2 | 8 | 5 | 3 | 3 | 2 |
| 3 | 12 | 8 | 5 | 4 | 3 |
| 4 | 18 | 12 | 7 | 5 | 3 |
| 5 | 22 | 16 | 9 | 6 | 4 |
| 6 | — | 20 | 12 | 7 | 5 |
| 7 | — | 25 | 14 | 8 | 6 |
| 8 | — | 28 | 16 | 9 | 7 |
| 9 | — | 32 | 18 | 10 | 8 |
| 10 | — | 35 | 20 | 11 | 9 |
| 11–20 | — | 35 | 20–35 | 12–30 | 10–29 |
| 21–40 | — | — | — | 30–33 | 29–34 |
| **Total** | **~65** | **~184** | **~386** | **~702** | **~902** |

Stored in `DAILY_TARGETS` constant (`warmup-service.js`).

### 3.2 Daily Scheduling Logic

The send window starts at **12:00 PM IST** (6:30 AM UTC) + **0–30 minute random offset** per account (so accounts don't all fire simultaneously).

Each email is then scheduled with a **cascading gap of random(8, 20) minutes** between sends:

```
Account A window start: 12:00 PM IST + 15 min = 12:15 PM IST
Email 1:  12:15 PM
Email 2:  12:15 + 12 min = 12:27 PM
Email 3:  12:27 + 9 min  = 12:36 PM
Email 4:  12:36 + 18 min = 12:54 PM
...continues until all emails for the day are scheduled
```

The window **expands dynamically** based on email count — no hardcoded end time. At 22 emails/day with 8–20 min gaps, the window naturally stretches to ~3 hours.

### 3.3 Per-Account Recipient Assignment

Each account picks **one recipient per day**. All emails that day go to the same recipient. This mimics natural email behavior (focused conversation) and avoids scattering emails across too many accounts.

Recipient selection:
- Fetch all warming accounts in the same mode (own_only or network)
- Sort by received count (ascending — least-received first)
- Pick from top 3 with random selection
- No filtering by "has reached target" (this caused pairing imbalance bug)

### 3.4 Day 1 Immediate Sends

When warmup starts, day 1 jobs are created **immediately** (not waiting for next cron):
- Window start: `now + random(30, 60) minutes` (spread from start time)
- Same cascading gap: `random(8, 20)` between each email
- Same recipient logic

### 3.5 Job Persistence

Jobs are stored in `warmup_jobs` table with exact `scheduled_at` timestamps. The cron only **gap-fills** on subsequent runs — it does NOT recalculate existing schedules:

```
1. Delete pending jobs from previous days
2. Count today's completed jobs
3. remaining = daily_target - completed
4. Insert only the remaining jobs with new cascading timestamps
```

This prevents timing drift if the cron fires late or restarts.

---

## 4. Reply Architecture (Independent Loop)

### 4.1 Key Principle

Replies are **completely decoupled** from sends. There is no "send window" check before scheduling replies. The reply loop runs independently and reacts to what is in the inbox.

### 4.2 Reply Polling Loop

Runs every **5 minutes** via `/trigger` on Render.

For each active warming account:
1. Query `warmup_emails` for emails received today where `reply_scheduled_at IS NULL`
2. Cap at **30 per account per poll** to prevent spam
3. Apply **75% reply rate** (random roll)
4. Mark `reply_scheduled_at = now` **immediately** in DB (prevents double-scheduling)
5. Insert into `pending_replies` with `scheduled_at = now + random(10, 25) minutes`

### 4.3 Reply Sending

`processPendingReplies()` runs every 5 minutes:
1. Fetch `pending_replies` where `scheduled_at <= now`
2. Send reply using pre-generated `reply_content` from the warmup email
3. Update `warmup_emails` status to `replied`
4. Check off-hours (8–21 UTC) — if outside, defer to next active window

### 4.4 Reply Content

Pre-generated at send time by Ollama (stored in `warmup_emails.reply_content`). **No regeneration at reply time.** This ensures consistency and reduces API calls.

### 4.5 Double-Schedule Prevention

The `reply_scheduled_at` column on `warmup_emails` is set **before** inserting into `pending_replies`. The poll query filters on `IS NULL`, so even if the cron fires mid-poll, the same email won't be scheduled twice.

---

## 5. Cron Schedule

| Schedule | Function | Purpose |
|---------|----------|---------|
| Every 5 min (Render cron → `/trigger`) | `runCampaignAutomation()` | Campaign emails |
| Every 5 min (Render cron → `/trigger`) | `processWarmupJobs()` | Send warmup emails from job queue |
| Every 5 min (Render cron → `/trigger`) | `pollInboxForReplies()` | Detect unreplied emails, schedule replies |
| Every 5 min (Render cron → `/trigger`) | `processPendingReplies()` | Send scheduled replies |
| Every 5 min (Render cron → `/trigger`) | `processSpamRescue()` | Rescue warmup emails from spam |
| Every 5 min (Render cron → `/trigger`) | `checkReplies()` | Campaign reply detection |
| Daily at 6:00 AM UTC | `runDailyWarmupCycle()` | Create daily jobs for all warming accounts |

---

## 6. Design Rules (Non-Negotiable)

These rules must NEVER be violated when modifying the warmup engine:

### Rule 1 — Per-Account Staggered Start
Each account must have its own random start offset. Never fire all accounts at the same time from a single cron fire. Use `random(0, 30)` minute offset per account.

### Rule 2 — Dynamic Window (No Hardcoded End)
Never hardcode a send window end time (e.g. 4:30 PM IST). The window must expand dynamically based on `daily_target × avg_gap`. At 22 emails/day with 8–20 min gaps, the window naturally runs ~3–5 hours.

### Rule 3 — Replies Decoupled from Sends
Replies must run on their own independent polling loop. Never check "is it within the send window before replying." Replies can and should happen outside the send window at any time.

### Rule 4 — Mark Before Schedule
Always mark `reply_scheduled_at = now` in the DB **before** inserting into `pending_replies`. If you mark it only after the reply sends, the next poll cycle will detect the same email again and double-schedule.

### Rule 5 — No Recalculation on Cron
Once daily jobs are computed and stored with exact timestamps, do not regenerate them. Only gap-fill by counting completed jobs and inserting remaining. Recalculating causes timing drift and inconsistent behavior.

### Rule 6 — Always Random Gaps
Always use `random(8, 20)` minutes between emails. Never use a fixed gap. Fixed gaps are a spam signal.

### Rule 7 — DB as Source of Truth, Not Gmail API
Reply detection queries the `warmup_emails` table, not the Gmail API. The table is populated when emails are sent. This avoids reliance on Gmail API ordering or polling reliability.

---

## 7. Database Schema

### Table: `warmup_accounts`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner |
| gmail_account_id | UUID | FK to sender_accounts |
| status | TEXT | `warming` \| `paused` \| `warmed` \| `stopped` |
| mode | TEXT | `own_only` \| `network` |
| warmup_duration | INTEGER | Target days (5/10/20/30/40) |
| day_number | INTEGER | Current day in warmup |
| daily_target | INTEGER | Emails to send today |
| started_at | TIMESTAMPTZ | When warmup began |
| persona | TEXT | `formal` \| `casual` \| `friendly` |

### Table: `warmup_emails`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| from_account_id | UUID | FK to warmup_accounts (sender) |
| to_account_id | UUID | FK to warmup_accounts (recipient) |
| gmail_message_id | TEXT | Gmail API message ID |
| thread_id | TEXT | Gmail API thread ID |
| subject | TEXT | Email subject |
| status | TEXT | `sent` \| `replied` \| `failed` |
| rfc_message_id | TEXT | RFC 2822 Message-ID header |
| reply_content | TEXT | Pre-generated reply content |
| landed_in_spam | BOOLEAN | Whether email landed in spam |
| spam_detected_at | TIMESTAMPTZ | When spam was detected |
| spam_rescued_at | TIMESTAMPTZ | When rescued from spam |
| marked_important_at | TIMESTAMPTZ | When marked important |
| reply_detected_at | TIMESTAMPTZ | When reply was detected |
| reply_scheduled_at | TIMESTAMPTZ | When reply was scheduled (prevents double-schedule) |
| created_at | TIMESTAMPTZ | Auto (≈ receive time) |

### Table: `warmup_jobs`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| warmup_account_id | UUID | FK to warmup_accounts |
| type | TEXT | `warmup` \| `engagement` |
| to_account_id | UUID | FK to warmup_accounts (recipient) |
| scheduled_at | TIMESTAMPTZ | Exact fire time |
| status | TEXT | `pending` \| `completed` \| `failed` |
| executed_at | TIMESTAMPTZ | When job ran |
| day_number | INTEGER | Day number |
| gmail_message_id | TEXT | Resulting message ID |
| retry_count | INTEGER | Retry attempts |
| last_attempted_at | TIMESTAMPTZ | Last attempt |

**Indexes:** `(scheduled_at, status)` for cron queries

### Table: `pending_replies`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| warmup_account_id | UUID | FK to warmup_accounts (reply sender) |
| to_email | TEXT | Email address to reply to |
| original_subject | TEXT | Subject of original email |
| reply_content | TEXT | Pre-generated reply content |
| status | TEXT | `pending` \| `sent` \| `failed` |
| scheduled_at | TIMESTAMPTZ | When to send |
| email_record_id | UUID | FK to warmup_emails |
| gmail_thread_id | TEXT | Thread ID for threading |
| rfc_message_id | TEXT | RFC Message-ID for In-Reply-To |
| message_id | TEXT | Alias for rfc_message_id |
| retry_count | INTEGER | Retry attempts |
| last_attempted_at | TIMESTAMPTZ | Last attempt |

**Indexes:** `(scheduled_at, status)` for cron queries

### Table: `warmup_stats`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| account_id | UUID | FK to warmup_accounts |
| date | DATE | Stats date |
| sent | INTEGER | Emails sent today |
| received | INTEGER | Emails received today |
| replies | INTEGER | Replies sent today |
| spam_rescues | INTEGER | Spam rescues today |

**Unique index:** `(account_id, date)` — upserted daily

---

## 8. Key Files Reference

| File | Purpose |
|------|---------|
| `lib/warmup-service.js` | Core engine — scheduling, jobs, replies, stats |
| `lib/gmail-warmup.js` | Gmail API — send, reply, threading, labels |
| `lib/ollama-client.js` | LLM — email generation, personas |
| `lib/spam-rescue-service.js` | Spam rescue — polling, label manipulation |
| `lib/encryption.js` | Token encryption/decryption |
| `server.js` | Express routes, cron schedules |

---

*Last updated: March 2026*
