# DemGrow — Email Warmup System
## Complete Planning Document: Findings, Problems, Solutions & Database Design

> **Stack:** Next.js · Insforge (PostgreSQL) · Gmail API · Ollama (LLM)
> **Feature URL:** emailflow.demgrow.space/warmup
> **Status:** UI complete · Backend logic, architecture, and DB — to be built

---

## 1. What the Warmup System Does

Gmail accounts have a "sender reputation" score. Cold accounts (new or unused) get flagged as spam. Warmup fixes this by simulating organic email activity — sending, receiving, and replying to emails between a pool of trusted accounts — gradually training Gmail's algorithm to trust the sender.

**The warmup loop:**
```
Account A (sender)
  → LLM generates a human-like email
  → Sends to Account B (from warmup pool)
  → Account B receives it
  → Waits a random calculated delay
  → LLM generates a contextual reply
  → Account B replies using correct thread headers
  → Account A receives the reply
  → Both accounts' stats update
  → If email landed in spam → rescue it (move to inbox, mark important)
```

---

## 2. Current State of the UI

The frontend shell at `/warmup` is fully built. Each account card displays:
- Email address + status badge (`WARMING` / `NOT STARTED` / `PAUSED`)
- Day progress (e.g. Day 2/5)
- Progress bar
- Counters: **Sent · Received · Replies · Spam Rescues**
- Warmup duration selector: 5 / 10 / 20 / 30 / 40 days
- Mode toggle: **Own Accounts** vs **DemGrow Network**
- Pause / Start Warmup button

**Everything behind the UI is yet to be built.**

---

## 3. Two Warmup Modes

| Mode | How it works |
|---|---|
| **Own Accounts** | Warmup only between the user's own added Gmail accounts |
| **DemGrow Network** | Warmup across all users' accounts in the shared platform pool — stronger reputation signal |

DemGrow Network mode requires consent tracking and cross-user coordination logic.

---

## 4. Pain Points & Findings

### 🔴 P1 — Reply API Bug (Most Immediate Blocker)

**Current behaviour:** Emails send successfully. LLM generates the mail, subject is set, everything looks right. But replies are not working.

**Root cause:** There is no separate "reply" endpoint in the Gmail API. The same `messages.send` endpoint is used for both composing and replying. The difference is entirely in what you include in the request body. The current implementation is treating reply like a fresh send — missing all threading data.

**Three conditions Gmail requires for a message to land in an existing thread (all three must be met simultaneously):**

1. `threadId` must be passed in the request body
2. `In-Reply-To` and `References` headers must be set in the MIME message (RFC 2822 standard)
3. `Subject` header must match exactly

**Critical distinction — two IDs that must not be confused:**

| ID | What it is | Looks like |
|---|---|---|
| **Gmail Message ID** | Gmail's internal hex identifier | `18e4f2a3b1c` |
| **RFC Message-ID** | Standard email header used for threading | `<abc123@mail.gmail.com>` (with angle brackets) |

`In-Reply-To` and `References` require the **RFC Message-ID** (with angle brackets), not the Gmail internal ID.

**How to get the RFC Message-ID when receiving:**
```js
const msg = await gmail.users.messages.get({
  userId: 'me',
  id: messageId,
  format: 'full'   // ← must be 'full', not 'minimal'
});

const rfcMessageId = msg.data.payload.headers
  .find(h => h.name === 'Message-ID')?.value;
// → "<CABxyz123@mail.gmail.com>"

const threadId = msg.data.threadId;
```

**Correct reply request structure:**
```js
async function sendReply({ auth, originalMessage, replyBody }) {
  const headers      = originalMessage.payload.headers;
  const getHeader    = (name) => headers.find(h => h.name === name)?.value;

  const rfcMessageId  = getHeader('Message-ID');
  const originalRefs  = getHeader('References') || '';
  const fromAddress   = getHeader('From');
  const subject       = getHeader('Subject');
  const threadId      = originalMessage.threadId;

  // Build References chain (ALL prior IDs, not just immediate parent)
  const referencesChain = originalRefs
    ? `${originalRefs} ${rfcMessageId}`
    : rfcMessageId;

  // Subject — add Re: only if not already there
  const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;

  const rawEmail = [
    `From: me@gmail.com`,
    `To: ${fromAddress}`,
    `Subject: ${replySubject}`,
    `In-Reply-To: ${rfcMessageId}`,
    `References: ${referencesChain}`,
    `Content-Type: text/plain; charset=utf-8`,
    ``,
    replyBody
  ].join('\r\n');

  const encodedMessage = Buffer.from(rawEmail)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
      threadId: threadId    // ← puts it in the right thread
    }
  });
}
```

**Additional reply pitfalls discovered:**
- `References` must chain ALL previous message IDs in order — not just the immediate parent
- If original subject already has `Re:`, do not add another one (`Re: Re: Subject` breaks threading)
- Recipient list must be preserved — changing To/CC makes Gmail treat it as a new conversation
- Add a delay between receive and reply — rapid back-to-back calls can confuse Gmail's server-side threading processor

---

### 🔴 P2 — OAuth Token Management

**The problem:** Access tokens expire after 1 hour. If the scheduler fires a warmup job and the token is expired, it will silently fail with a 401 and the warmup action will be skipped — no email sent, no error surfaced to the user.

**Additional edge cases:**
- Token also invalidates if: user revokes access, refresh token unused for 6 months, or user changes their Gmail password
- Hard limit of 100 refresh tokens per Google Account per OAuth client ID — excessive token generation during testing silently invalidates older ones

**What to store per Gmail account:**
```
access_token          (encrypted)
refresh_token         (encrypted)
token_expires_at      (timestamp)
token_scope           (string)
token_status          ENUM: VALID | EXPIRED | REVOKED | NEEDS_REAUTH
last_token_refresh_at (timestamp)
reauth_required       (boolean, default false)
```

**Handling strategy:**
- Before every API call, check `token_expires_at`
- If expiring in < 5 minutes, silently refresh using refresh_token
- If refresh fails → set `reauth_required = true`, pause that account's warmup, notify user in UI
- Never crash the scheduler — one bad token should not stop other accounts

---

### 🟠 P3 — Volume Ramp-Up Logic

**The problem:** The UI offers 5/10/20/30/40 day durations but there is no ramp-up logic behind them. Sending 30 emails per day from Day 1 looks automated and gets flagged.

**Warmup timeline decision:**
- Target: complete warmup in **~1.5 weeks (10 days)**
- Recommended industry standard is 2–4 weeks; we're compressing slightly with 10 days

**Ramp-up curve (10-day plan):**

| Day | Emails to Send |
|-----|---------------|
| 1   | 3 |
| 2   | 5 |
| 3   | 8 |
| 4   | 10 |
| 5   | 13 |
| 6   | 16 |
| 7   | 20 |
| 8   | 25 |
| 9   | 30 |
| 10  | 35 |

The key rule: increase volume by 5–10 per day, not doubling overnight.

**What to store:**
```
daily_send_limit   (integer) — recalculated each morning based on ramp curve
daily_send_count   (integer) — incremented on each send, reset at midnight
ramp_curve         ENUM: CONSERVATIVE | MODERATE | AGGRESSIVE
current_day        (integer, incremented at midnight)
```

---

### 🟠 P4 — Sending Time Randomisation

**The problem:** Sending all warmup emails at the same time each day (e.g. a cron job at 9am) is detectable. Gmail's spam filters look for unnatural patterns.

**Decision:** Send at random times, calculated within a window — nighttime or off-hours distribution preferred.

**What to store per account:**
```
account_timezone             (string, e.g. "Asia/Kolkata")
preferred_send_window_start  (time, e.g. "22:00")
preferred_send_window_end    (time, e.g. "06:00")
```

**Scheduler logic:**
- When scheduling a warmup send for the day, pick a random timestamp within the send window
- Space sends throughout the window — don't cluster them

---

### 🟠 P5 — Spam Rescue (Polling Required)

**The problem:** When the warmup system sends an email, it may land in the recipient account's spam folder. The system needs to detect this and rescue it (move to inbox + mark important) to signal to Gmail that the sender is trusted.

**This cannot be event-driven — it requires active polling.**

**Polling job logic:**
1. For each active warmup account, fetch recent messages from Gmail
2. Check if any warmup-sent emails have the `SPAM` label
3. If yes:
   - Remove `SPAM` label
   - Add `INBOX` label
   - Mark as important
   - Record `spam_rescued_at`
   - Increment `spam_rescues` counter in daily stats

**What to store:**
```
landed_in_spam      (boolean, default false)
spam_detected_at    (timestamp, nullable)
spam_rescued_at     (timestamp, nullable)
marked_important_at (timestamp, nullable)
```

---

### 🟡 P6 — Error Logging & Audit Trail *(Optional but recommended)*

Silent failures are the hardest bugs to find in production. An events log table makes debugging dramatically easier.

**What to log:**
```
TOKEN_REFRESHED | TOKEN_REVOKED | RATE_LIMITED
SPAM_DETECTED   | SPAM_RESCUED  | WARMUP_PAUSED
SEND_FAILED     | REPLY_FAILED  | REPLY_THREADED_SUCCESS
```

---

### 🟡 P7 — DemGrow Network Consent *(Optional)*

When accounts interact across users in DemGrow Network mode, explicit consent should be recorded.

```
network_consent_given_at  (timestamp, nullable)
network_opt_out_at        (timestamp, nullable)
```

---

## 5. LLM Integration Notes

- **Model:** Kimi K2.5 via Ollama Cloud API (already integrated — `ollama-client.js`)
- **Humanizer:** A prompt-based humanizer will be copy-pasted into the project (skill plugins not supported inside the project environment)
- **Content:** Email content quality is handled by the LLM + humanizer — no content fingerprinting needed
- **Gateway:** Ollama (`OLLAMA_API_KEY` env var) — already working and integrated, no changes needed

---

## 6. Database Schema

### Table: `warmup_accounts`
Core table for every Gmail account enrolled in warmup.

```sql
CREATE TABLE warmup_accounts (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES users(id),
  email_address               TEXT NOT NULL,

  -- Status
  status                      TEXT NOT NULL DEFAULT 'NOT_STARTED',
                              -- NOT_STARTED | WARMING | PAUSED | COMPLETED
  warmup_mode                 TEXT NOT NULL DEFAULT 'OWN_ACCOUNTS',
                              -- OWN_ACCOUNTS | DEMGROW_NETWORK

  -- Warmup schedule
  warmup_duration_days        INTEGER NOT NULL DEFAULT 10,
  current_day                 INTEGER NOT NULL DEFAULT 0,
  ramp_curve                  TEXT NOT NULL DEFAULT 'MODERATE',
                              -- CONSERVATIVE | MODERATE | AGGRESSIVE
  daily_send_limit            INTEGER NOT NULL DEFAULT 3,
  daily_send_count            INTEGER NOT NULL DEFAULT 0,

  -- Timing
  account_timezone            TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  preferred_send_window_start TIME NOT NULL DEFAULT '22:00',
  preferred_send_window_end   TIME NOT NULL DEFAULT '06:00',

  -- OAuth tokens (store encrypted)
  access_token                TEXT,
  refresh_token               TEXT,
  token_expires_at            TIMESTAMPTZ,
  token_scope                 TEXT,
  token_status                TEXT NOT NULL DEFAULT 'VALID',
                              -- VALID | EXPIRED | REVOKED | NEEDS_REAUTH
  last_token_refresh_at       TIMESTAMPTZ,
  reauth_required             BOOLEAN NOT NULL DEFAULT false,

  -- Rate limiting
  last_api_call_at            TIMESTAMPTZ,
  consecutive_rate_limit_errors INTEGER NOT NULL DEFAULT 0,
  backoff_until               TIMESTAMPTZ,

  -- DemGrow Network consent
  network_consent_given_at    TIMESTAMPTZ,
  network_opt_out_at          TIMESTAMPTZ,

  -- Lifecycle
  started_at                  TIMESTAMPTZ,
  paused_at                   TIMESTAMPTZ,
  completed_at                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### Table: `warmup_emails`
Every email sent or received as part of warmup. The most critical table — threading depends entirely on the IDs stored here.

```sql
CREATE TABLE warmup_emails (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  sender_account_id     UUID NOT NULL REFERENCES warmup_accounts(id),
  receiver_account_id   UUID NOT NULL REFERENCES warmup_accounts(id),

  -- Gmail IDs (BOTH required — do not confuse them)
  gmail_message_id      TEXT NOT NULL,
  -- Gmail's internal hex ID, e.g. "18e4f2a3b1c"

  rfc_message_id        TEXT NOT NULL,
  -- RFC 2822 Message-ID header, e.g. "<abc@mail.gmail.com>"
  -- Used in In-Reply-To and References headers

  gmail_thread_id       TEXT NOT NULL,
  -- Gmail's threadId — used in reply request body

  -- Email content
  subject               TEXT NOT NULL,
  body_snippet          TEXT,

  -- Direction and threading
  direction             TEXT NOT NULL,
                        -- SENT | RECEIVED
  reply_to_email_id     UUID REFERENCES warmup_emails(id),
                        -- Set when this email is a reply to another

  references_chain      TEXT,
  -- Space-separated list of ALL prior RFC Message-IDs in thread
  -- e.g. "<id1@mail.com> <id2@mail.com> <id3@mail.com>"
  -- Each reply appends the current rfc_message_id to this chain

  -- Reply scheduling
  reply_scheduled_at    TIMESTAMPTZ,
  reply_sent_at         TIMESTAMPTZ,

  -- Spam tracking
  landed_in_spam        BOOLEAN NOT NULL DEFAULT false,
  spam_detected_at      TIMESTAMPTZ,
  spam_rescued_at       TIMESTAMPTZ,
  marked_important_at   TIMESTAMPTZ,

  -- LLM metadata
  llm_model_used        TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### Table: `warmup_daily_stats`
Per-account per-day counters. Drives the UI stat display.

```sql
CREATE TABLE warmup_daily_stats (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warmup_account_id     UUID NOT NULL REFERENCES warmup_accounts(id),
  date                  DATE NOT NULL,
  emails_sent           INTEGER NOT NULL DEFAULT 0,
  emails_received       INTEGER NOT NULL DEFAULT 0,
  replies_sent          INTEGER NOT NULL DEFAULT 0,
  spam_rescues          INTEGER NOT NULL DEFAULT 0,

  UNIQUE (warmup_account_id, date)
);

-- Always update using upsert:
-- INSERT INTO warmup_daily_stats (warmup_account_id, date, emails_sent)
-- VALUES ($1, CURRENT_DATE, 1)
-- ON CONFLICT (warmup_account_id, date)
-- DO UPDATE SET emails_sent = warmup_daily_stats.emails_sent + 1;
```

---

### Table: `warmup_events` *(Optional — Error Logging)*

```sql
CREATE TABLE warmup_events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warmup_account_id     UUID NOT NULL REFERENCES warmup_accounts(id),
  warmup_email_id       UUID REFERENCES warmup_emails(id),
  event_type            TEXT NOT NULL,
  -- TOKEN_REFRESHED | TOKEN_REVOKED | RATE_LIMITED
  -- SPAM_DETECTED | SPAM_RESCUED | WARMUP_PAUSED
  -- SEND_FAILED | REPLY_FAILED | REPLY_THREADED_SUCCESS
  error_message         TEXT,
  metadata              JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### Indexes

```sql
-- Pending replies — scheduler queries this constantly
CREATE INDEX idx_warmup_emails_pending_reply
  ON warmup_emails (reply_scheduled_at)
  WHERE reply_sent_at IS NULL;

-- Thread lookup when building References chain
CREATE INDEX idx_warmup_emails_thread
  ON warmup_emails (gmail_thread_id);

-- Daily stats queries for UI
CREATE INDEX idx_warmup_daily_stats_account_date
  ON warmup_daily_stats (warmup_account_id, date);

-- Spam rescue polling job
CREATE INDEX idx_warmup_emails_spam
  ON warmup_emails (landed_in_spam)
  WHERE spam_rescued_at IS NULL;

-- Token check before API calls
CREATE INDEX idx_warmup_accounts_token_status
  ON warmup_accounts (token_status)
  WHERE reauth_required = false;
```

---

## 7. What to Build Next (Ordered)

| # | Task | Priority |
|---|---|---|
| 1 | Fix Reply API — save `rfc_message_id` + `gmail_thread_id` on receive, use correct MIME headers on reply | 🔴 Immediate |
| 2 | Token management — refresh before every API call, handle revoked tokens gracefully | 🔴 Before scaling |
| 3 | Volume ramp-up scheduler — calculate `daily_send_limit` per day, pick random send times within window | 🟠 Core logic |
| 4 | Spam rescue polling job — check for SPAM label, move to inbox, increment counter | 🟠 Core feature |
| 5 | Daily stats upsert — increment counters atomically on each warmup event | 🟠 Required for UI |
| 6 | DemGrow Network mode — shared pool coordination, consent gate | 🟡 After Own Accounts works |
| 7 | Error logging via `warmup_events` table | 🟡 Optional, recommended |
| 8 | Ollama integration — already done via `ollama-client.js`, no changes needed | ✅ Done |

---

*Document generated from research, conversation analysis, and Gmail API official documentation.*
*Last updated: March 2026*
