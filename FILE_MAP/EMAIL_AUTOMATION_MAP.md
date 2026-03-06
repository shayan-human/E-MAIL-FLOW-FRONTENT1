# EMAIL_AUTOMATION_MAP.md

### 1. The Engine (Cron & Orchestration)
- **File:** `campaign-backend/server.js`
- **Logic:** `runCampaignAutomation()` handles the loop of fetching leads, checking account status, and calling the sender.

### 2. The Delivery (Gmail API)
- **File:** `campaign-backend/lib/email-service.js`
- **Logic:** `sendEmail()` - Direct REST API calls to Google. **Do not switch to SMTP.**

### 3. The Logs (Audit Trail)
- **File:** `campaign-backend/lib/email-service.js`
- **Logic:** `logFailure()` writes to the `email_logs` table for UI visibility.

### 4. Reply Sync
- **File:** `campaign-backend/lib/reply-service.js`
- **Logic:** `checkReplies()` - Polls Gmail for incoming responses to mark leads as "Replied".
