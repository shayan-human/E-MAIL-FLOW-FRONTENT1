-- Restore lost Foreign Key relationships and constraints
-- Date: 2026-04-27

-- 1. Campaigns & Leads
ALTER TABLE leads 
ADD CONSTRAINT fk_leads_campaign 
FOREIGN KEY (campaign_id) REFERENCES campaigns(id) 
ON DELETE CASCADE;

-- 2. Sender Accounts & Leads
ALTER TABLE leads 
ADD CONSTRAINT fk_leads_sender 
FOREIGN KEY (sender_account_id) REFERENCES sender_accounts(id) 
ON DELETE SET NULL;

-- 3. Campaign Accounts
ALTER TABLE campaign_accounts 
ADD CONSTRAINT fk_campaign_accounts_campaign 
FOREIGN KEY (campaign_id) REFERENCES campaigns(id) 
ON DELETE CASCADE;

ALTER TABLE campaign_accounts 
ADD CONSTRAINT fk_campaign_accounts_sender 
FOREIGN KEY (sender_account_id) REFERENCES sender_accounts(id) 
ON DELETE CASCADE;

-- 4. Warmup Accounts
ALTER TABLE warmup_accounts 
ADD CONSTRAINT fk_warmup_sender 
FOREIGN KEY (gmail_account_id) REFERENCES sender_accounts(id) 
ON DELETE CASCADE;

-- 5. Warmup Stats
ALTER TABLE warmup_stats 
ADD CONSTRAINT fk_warmup_stats_account 
FOREIGN KEY (account_id) REFERENCES warmup_accounts(id) 
ON DELETE CASCADE;

-- 6. Replies
ALTER TABLE replies 
ADD CONSTRAINT fk_replies_lead 
FOREIGN KEY (lead_id) REFERENCES leads(id) 
ON DELETE CASCADE;

ALTER TABLE replies 
ADD CONSTRAINT unique_gmail_message_id 
UNIQUE (gmail_message_id);

-- 7. Email Logs
ALTER TABLE email_logs 
ADD CONSTRAINT fk_email_logs_sender 
FOREIGN KEY (sender_account_id) REFERENCES sender_accounts(id) 
ON DELETE SET NULL;

ALTER TABLE email_logs 
ADD CONSTRAINT fk_email_logs_campaign 
FOREIGN KEY (campaign_id) REFERENCES campaigns(id) 
ON DELETE CASCADE;

ALTER TABLE email_logs 
ADD CONSTRAINT fk_email_logs_lead 
FOREIGN KEY (lead_id) REFERENCES leads(id) 
ON DELETE CASCADE;

-- 8. Warmup Emails
ALTER TABLE warmup_emails 
ADD CONSTRAINT fk_warmup_emails_from 
FOREIGN KEY (from_account_id) REFERENCES sender_accounts(id) 
ON DELETE CASCADE;

ALTER TABLE warmup_emails 
ADD CONSTRAINT fk_warmup_emails_to 
FOREIGN KEY (to_account_id) REFERENCES sender_accounts(id) 
ON DELETE CASCADE;
