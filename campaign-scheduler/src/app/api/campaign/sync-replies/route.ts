import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { auth } from "@insforge/nextjs/server";

/**
 * POST /api/campaign/sync-replies
 * 
 * Hybrid reply sync:
 * - Uses gmail_thread_id when available (fast, reliable)
 * - Falls back to email + date search for leads without thread IDs
 * - Saves refreshed tokens back to DB
 */
export async function POST() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch campaigns, sent leads, and sender accounts in parallel
        const [campaignsRes, allAccountsRes] = await Promise.all([
            insforge.database
                .from("campaigns")
                .select("id, subject")
                .eq("user_id", user.id),
            insforge.database
                .from("sender_accounts")
                .select("id, email, google_access_token, google_refresh_token")
                .eq("user_id", user.id)
                .eq("is_active", true),
        ]);

        const campaigns = campaignsRes.data;
        if (!campaigns || campaigns.length === 0) {
            return NextResponse.json({ message: "No campaigns found", synced: 0, repliesFound: 0 });
        }

        const campaignIds = campaigns.map(c => c.id);

        // Fetch leads and campaign_accounts in parallel
        const [leadsRes, caRes] = await Promise.all([
            insforge.database
                .from("leads")
                .select("id, campaign_id, email, gmail_thread_id, sent_at")
                .in("campaign_id", campaignIds)
                .in("status", ["SENT", "REPLIED"]),
            insforge.database
                .from("campaign_accounts")
                .select("campaign_id, sender_account_id")
                .in("campaign_id", campaignIds),
        ]);

        const sentLeads = leadsRes.data;
        if (!sentLeads || sentLeads.length === 0) {
            return NextResponse.json({ message: "No leads to sync", synced: 0, repliesFound: 0 });
        }

        // Build campaign -> token map
        const senderAccounts = allAccountsRes.data || [];
        const senderMap: Record<string, any> = {};
        for (const sa of senderAccounts) {
            senderMap[sa.id] = sa;
        }

        const campaignTokenMap: Record<string, { accessToken: string; refreshToken: string | null; senderAccountId: string }> = {};
        for (const ca of (caRes.data || [])) {
            const acc = senderMap[ca.sender_account_id];
            if (acc?.google_access_token && !campaignTokenMap[ca.campaign_id]) {
                campaignTokenMap[ca.campaign_id] = {
                    accessToken: acc.google_access_token,
                    refreshToken: acc.google_refresh_token || null,
                    senderAccountId: acc.id,
                };
            }
        }

        // 2. Check leads for replies in parallel batches of 5
        const BATCH_SIZE = 5;
        let repliesFound = 0;
        let synced = 0;
        const errors: string[] = [];
        const repliedLeadIds: string[] = [];

        for (let i = 0; i < sentLeads.length; i += BATCH_SIZE) {
            const batch = sentLeads.slice(i, i + BATCH_SIZE);

            const results = await Promise.allSettled(
                batch.map(async (lead) => {
                    const tokens = campaignTokenMap[lead.campaign_id];
                    if (!tokens) return { leadId: lead.id, replied: false, error: "no tokens" };

                    try {
                        let hasReply: boolean;

                        if (lead.gmail_thread_id) {
                            hasReply = await checkReplyByThread(
                                tokens.accessToken,
                                tokens.refreshToken,
                                lead.gmail_thread_id,
                                tokens.senderAccountId,
                                lead.id,
                            );
                        } else {
                            hasReply = await checkReplyByEmail(
                                tokens.accessToken,
                                tokens.refreshToken,
                                lead.email,
                                lead.sent_at,
                                tokens.senderAccountId,
                                lead.id,
                            );
                        }

                        return { leadId: lead.id, replied: hasReply, error: null };
                    } catch (err) {
                        return {
                            leadId: lead.id,
                            replied: false,
                            error: err instanceof Error ? err.message : "Unknown",
                        };
                    }
                })
            );

            for (const result of results) {
                if (result.status === "fulfilled") {
                    const { leadId, replied, error } = result.value;
                    synced++;
                    if (replied) {
                        repliedLeadIds.push(leadId);
                        repliesFound++;
                    }
                    if (error) errors.push(error);
                }
            }
        }

        // 3. Batch update all replied leads at once
        if (repliedLeadIds.length > 0) {
            await insforge.database
                .from("leads")
                .update({
                    status: "REPLIED",
                    replied_at: new Date().toISOString(),
                    reply_count: 1,
                })
                .in("id", repliedLeadIds);
        }

        // 4. Update campaign_stats efficiently
        const { data: leadCounts } = await insforge.database
            .from("leads")
            .select("campaign_id, status")
            .in("campaign_id", campaignIds)
            .in("status", ["SENT", "REPLIED"]);

        if (leadCounts) {
            const statsToUpdate: Record<string, { sent: number; replied: number }> = {};
            campaignIds.forEach(id => statsToUpdate[id] = { sent: 0, replied: 0 });

            leadCounts.forEach(lc => {
                if (statsToUpdate[lc.campaign_id]) {
                    statsToUpdate[lc.campaign_id].sent++;
                    if (lc.status === "REPLIED") {
                        statsToUpdate[lc.campaign_id].replied++;
                    }
                }
            });

            const upsertData = Object.entries(statsToUpdate).map(([campaignId, counts]) => ({
                campaign_id: campaignId,
                total_sent: counts.sent,
                total_replied: counts.replied,
                reply_rate: counts.sent > 0 ? Math.round((counts.replied / counts.sent) * 10000) / 100 : 0,
                last_synced_at: new Date().toISOString(),
            }));

            if (upsertData.length > 0) {
                await insforge.database
                    .from("campaign_stats")
                    .upsert(upsertData, { onConflict: "campaign_id" });
            }
        }

        return NextResponse.json({
            message: "Reply sync completed",
            synced,
            repliesFound,
            campaignsUpdated: campaignIds.length,
            errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
        });

    } catch (error: unknown) {
        console.error("[Sync Replies Error]:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// ── FAST PATH: Check reply via thread ID ──────────────────────────────
async function checkReplyByThread(
    accessToken: string,
    refreshToken: string | null,
    threadId: string,
    senderAccountId: string,
    leadId: string,
): Promise<boolean> {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`;

    const { response, token } = await gmailFetchWithRefresh(url, accessToken, refreshToken, senderAccountId);

    if (!response.ok) {
        if (response.status === 404) return false;
        const errText = await response.text().catch(() => "");
        throw new Error(`Gmail thread API ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const messages = data.messages || [];

    if (messages.length <= 1) return false;

    let newRepliesFound = false;
    const { data: senderAcc } = await insforge.database.from("sender_accounts").select("email").eq("id", senderAccountId).maybeSingle();

    for (let i = 1; i < messages.length; i++) {
        const msg = messages[i];

        const headers = msg.payload?.headers || [];
        const fromHeader = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "";

        if (senderAcc && fromHeader.toLowerCase().includes(senderAcc.email.toLowerCase())) continue;

        const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
        const body = extractBody(msg);
        const timestamp = new Date(parseInt(msg.internalDate)).toISOString();

        const { error: replyError } = await insforge.database
            .from("replies")
            .upsert([{
                lead_id: leadId,
                subject,
                body,
                sender_email: fromHeader,
                timestamp,
                gmail_message_id: msg.id,
                is_read: false,
            }], { onConflict: "gmail_message_id" });

        if (!replyError) {
            newRepliesFound = true;
        }
    }

    return newRepliesFound;
}

// ── FALLBACK: Check reply via email search ────────────────────────────
async function checkReplyByEmail(
    accessToken: string,
    refreshToken: string | null,
    leadEmail: string,
    sentAt: string | null,
    senderAccountId: string,
    leadId: string,
): Promise<boolean> {
    const afterDate = sentAt ? formatGmailDate(sentAt) : null;
    const query = afterDate
        ? `from:${leadEmail} after:${afterDate}`
        : `from:${leadEmail} newer_than:30d`;

    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`;

    const { response, token } = await gmailFetchWithRefresh(url, accessToken, refreshToken, senderAccountId);

    if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Gmail API ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const messages = data.messages || [];
    if (messages.length === 0) return false;

    let newRepliesFound = false;
    for (const m of messages) {
        const msgUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`;
        const msgRes = await fetch(msgUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (!msgRes.ok) continue;

        const msg = await msgRes.json();
        const headers = msg.payload?.headers || [];
        const fromHeader = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "";
        const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
        const body = extractBody(msg);
        const internalDate = parseInt(msg.internalDate);

        if (sentAt && new Date(internalDate) <= new Date(sentAt)) continue;

        const timestamp = new Date(internalDate).toISOString();

        const { error: replyError } = await insforge.database
            .from("replies")
            .upsert([{
                lead_id: leadId,
                subject,
                body,
                sender_email: fromHeader,
                timestamp,
                gmail_message_id: msg.id,
                is_read: false,
            }], { onConflict: "gmail_message_id" });

        if (!replyError) newRepliesFound = true;
    }

    return newRepliesFound;
}

function extractBody(message: any): string {
    const decodeBase64 = (data: string) => {
        const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
        return Buffer.from(base64, "base64").toString();
    };

    const payload = message.payload;
    if (!payload) return "";

    let body = "";
    if (payload.parts) {
        const part = payload.parts.find((p: any) => p.mimeType === "text/plain") ||
            payload.parts.find((p: any) => p.mimeType === "text/html") ||
            payload.parts[0];

        if (part && part.body && part.body.data) {
            body = decodeBase64(part.body.data);
        } else if (part && part.parts) {
            const subPart = part.parts.find((p: any) => p.mimeType === "text/plain") || part.parts[0];
            if (subPart && subPart.body && subPart.body.data) {
                body = decodeBase64(subPart.body.data);
            }
        }
    } else if (payload.body && payload.body.data) {
        body = decodeBase64(payload.body.data);
    }

    return body;
}

// ── Gmail fetch with automatic token refresh + DB save ────────────────
async function gmailFetchWithRefresh(
    url: string,
    accessToken: string,
    refreshToken: string | null,
    senderAccountId: string,
): Promise<{ response: Response; token: string }> {
    let token = accessToken;
    let response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401 && refreshToken) {
        try {
            token = await refreshAccessToken(refreshToken);

            await insforge.database
                .from("sender_accounts")
                .update({ google_access_token: token })
                .eq("id", senderAccountId);

            response = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch {
        }
    }

    return { response, token };
}

// ── Helpers ───────────────────────────────────────────────────────────
function formatGmailDate(isoDate: string): string {
    const d = new Date(isoDate);
    d.setDate(d.getDate() - 1);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    });

    if (!response.ok) throw new Error(`Token refresh failed: ${response.status}`);
    const data = await response.json();
    return data.access_token;
}

