import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@insforge/nextjs/server";
import { sendGmailEmail } from "@/lib/gmail";

export async function POST(req: Request) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { leadId, gmailThreadId, subject, body } = await req.json();

        if (!leadId || !gmailThreadId || !body) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const insforge = await getInsforgeClient();

        // 1. Get lead and sender account ID
        const { data: lead, error: leadError } = await insforge.database
            .from("leads")
            .select(`
                email,
                sender_account_id
            `)
            .eq("id", leadId)
            .single();

        if (leadError || !lead) {
            console.error("[Reply API Error]: Failed to fetch lead", leadError);
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        if (!lead.sender_account_id) {
            return NextResponse.json({ error: "No sender account associated with this lead" }, { status: 400 });
        }

        // 2. Get sender account credentials
        const { data: sender, error: senderError } = await insforge.database
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
            accessToken: sender.google_access_token || "",
            refreshToken: sender.google_refresh_token,
            fromEmail: sender.email,
            threadId: gmailThreadId,
        });

        if (!response.success) {
            console.error("[Reply API Error]: Gmail send failed", response.error);
            return NextResponse.json({ error: response.error }, { status: 500 });
        }

        // 4. (Optional) Mark as replied in DB if needed
        // For now we just return success
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
