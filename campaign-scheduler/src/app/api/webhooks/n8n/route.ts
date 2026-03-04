import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { insforge } from "@/lib/insforge";

// Webhook payload from n8n when an email is sent or a reply is detected
const WebhookPayloadSchema = z.object({
    campaignId: z.string().uuid(),
    event: z.enum(["EMAIL_SENT", "EMAIL_REPLY", "EMAIL_FAILED"]),
    email: z.string().email(),
    timestamp: z.string().datetime().optional(),
    gmailMessageId: z.string().optional(),
    gmailThreadId: z.string().optional(),
    metadata: z.any().optional(),
});

export async function POST(req: Request) {
    try {
        // Basic auth protection for the webhook
        const headersList = await headers();
        const authHeader = headersList.get("authorization");

        // In production, configure n8n to send a Bearer token matching this secret
        const expectedSecret = process.env.CAMPAIGN_API_SECRET;

        if (expectedSecret && (!authHeader || authHeader !== `Bearer ${expectedSecret}`)) {
            return NextResponse.json({ error: "Unauthorized webhook access" }, { status: 401 });
        }

        const body = await req.json();
        const validationResult = WebhookPayloadSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Invalid webhook payload", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const { campaignId, event, email, gmailMessageId, gmailThreadId } = validationResult.data;

        // Find the specific lead in this campaign
        const { data: lead, error: findError } = await insforge.database
            .from("leads")
            .select("id, status, sent_at")
            .eq("campaign_id", campaignId)
            .eq("email", email)
            .limit(1)
            .single();

        if (findError || !lead) {
            return NextResponse.json(
                { error: "Lead not found in specified campaign" },
                { status: 404 }
            );
        }

        // Build update data based on event type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = {};

        switch (event) {
            case "EMAIL_SENT":
                updateData.status = "SENT";
                updateData.sent_at = new Date().toISOString();
                break;
            case "EMAIL_REPLY":
                updateData.status = "REPLIED";
                updateData.replied_at = new Date().toISOString();
                updateData.reply_count = (lead as any).reply_count ? (lead as any).reply_count + 1 : 1;
                break;
            case "EMAIL_FAILED":
                updateData.status = "FAILED";
                break;
        }

        // Store Gmail message/thread IDs for reply tracking
        if (gmailMessageId) updateData.gmail_message_id = gmailMessageId;
        if (gmailThreadId) updateData.gmail_thread_id = gmailThreadId;

        const { error: updateError } = await insforge.database
            .from("leads")
            .update(updateData)
            .eq("id", lead.id);

        if (updateError) {
            console.error("[Webhook Update Error]:", updateError);
            return NextResponse.json(
                { error: "Failed to update lead status", details: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: "Lead status updated" });

    } catch (error: unknown) {
        console.error("[Webhook Error]:", error);
        const errMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { error: "Internal webhook processing error", details: errMessage },
            { status: 500 }
        );
    }
}
