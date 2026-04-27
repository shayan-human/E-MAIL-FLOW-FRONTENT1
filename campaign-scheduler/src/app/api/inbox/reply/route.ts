import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@/lib/auth-helper";
import { sendGmailEmail } from "@/lib/gmail";
import { encrypt, decrypt } from "@/lib/encryption";

export async function POST(req: Request) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await req.json();
        console.log("[Reply API] Received payload:", JSON.stringify(payload, null, 2));

        const { leadId, gmailThreadId: reqThreadId, subject, body, senderAccountId } = payload;

        if (!leadId || !body) {
            console.error("[Reply API] Missing required fields:", { leadId: !!leadId, body: !!body });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const insforge = await getInsforgeClient();

        // 1. Get lead and sender account ID
        const { data: lead, error: leadError } = await insforge
            .from("leads")
            .select(`
                email,
                sender_account_id,
                sender_account_email,
                gmail_thread_id
            `)
            .eq("id", leadId)
            .single();

        if (leadError || !lead) {
            console.error("[Reply API Error]: Failed to fetch lead", leadError);
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        let gmailThreadId = reqThreadId || lead.gmail_thread_id;

        if (!gmailThreadId) {
            console.log(`[Reply API]: Thread ID missing on lead ${leadId}, checking replies table...`);
            const { data: lastReply } = await insforge
                .from("replies")
                .select("gmail_thread_id")
                .eq("lead_id", leadId)
                .not("gmail_thread_id", "is", null)
                .limit(1)
                .maybeSingle();

            if (lastReply?.gmail_thread_id) {
                gmailThreadId = lastReply.gmail_thread_id;
                // Backfill lead for future
                await insforge
                    .from("leads")
                    .update({ gmail_thread_id: gmailThreadId })
                    .eq("id", leadId);
            }
        }

        if (!gmailThreadId) {
            return NextResponse.json({ error: "Missing thread ID: Please sync your inbox first" }, { status: 400 });
        }

        if (senderAccountId) {
            lead.sender_account_id = senderAccountId;
        } else if (!lead.sender_account_id) {
            if (lead.sender_account_email) {
                console.log(`[Reply API]: Falling back to email lookup for lead ${leadId}`);
                const { data: fallbackAcc } = await insforge
                    .from("sender_accounts")
                    .select("id")
                    .eq("email", lead.sender_account_email)
                    .single();

                if (fallbackAcc) {
                    lead.sender_account_id = fallbackAcc.id;
                    // Link it in DB for future efficiency
                    await insforge
                        .from("leads")
                        .update({ sender_account_id: fallbackAcc.id })
                        .eq("id", leadId);
                }
            }
        }

        if (!lead.sender_account_id) {
            return NextResponse.json({ error: "No sender account associated with this lead" }, { status: 400 });
        }

        // 2. Get sender account credentials
        const { data: sender, error: senderError } = await insforge
            .from("sender_accounts")
            .select(`
                email,
                google_access_token,
                google_refresh_token
            `)
            .eq("id", lead.sender_account_id)
            .single();

        if (senderError || !sender) {
            console.error("[Reply API Error]: Failed to fetch sender account", senderError);
            return NextResponse.json({ error: "Sender account not found" }, { status: 404 });
        }

        // 3. Send email via Gmail API
        const response = await sendGmailEmail({
            to: lead.email,
            subject: subject.startsWith("Re: ") ? subject : `Re: ${subject}`,
            body: body,
            accessToken: decrypt(sender.google_access_token || ""),
            refreshToken: sender.google_refresh_token ? decrypt(sender.google_refresh_token) : null,
            fromEmail: sender.email,
            threadId: gmailThreadId,
        });

        if (!response.success) {
            console.error("[Reply API Error]: Gmail send failed", response.error);
            return NextResponse.json({ error: response.error }, { status: 500 });
        }

        // 4. Update the sender account with the new access token if it was refreshed
        if (response.newAccessToken) {
            await insforge
                .from("sender_accounts")
                .update({ google_access_token: encrypt(response.newAccessToken) })
                .eq("id", lead.sender_account_id);
        }

        // 5. Save the outgoing reply to the database
        const { error: insertError } = await insforge
            .from("replies")
            .insert([{
                lead_id: leadId,
                subject: subject.startsWith("Re: ") ? subject : `Re: ${subject}`,
                body: body,
                sender_email: sender.email,
                type: 'outgoing',
                gmail_message_id: response.messageId,
                is_read: true,
                timestamp: new Date().toISOString(),
            }]);

        if (insertError) {
            console.warn("[Reply API]: Failed to save outgoing reply to DB", insertError);
        }

        // 6. Return success
        return NextResponse.json({
            success: true,
            messageId: response.messageId,
            threadId: response.threadId
        });

    } catch (error) {
        console.error("[Reply API Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
