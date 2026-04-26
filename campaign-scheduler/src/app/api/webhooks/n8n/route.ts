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

        // Use RPC to bypass RLS for this system update
        const { data: rpcResult, error: rpcError } = await insforge.rpc(
            "update_lead_status_from_webhook",
            {
                p_campaign_id: campaignId,
                p_email: email,
                p_event: event,
                p_gmail_message_id: gmailMessageId || null,
                p_gmail_thread_id: gmailThreadId || null,
            }
        );

        if (rpcError || (rpcResult as any)?.success === false) {
            console.error("[Webhook RPC Error]:", rpcError || (rpcResult as any)?.error);
            return NextResponse.json(
                {
                    error: "Failed to update lead status via RPC",
                    details: rpcError?.message || (rpcResult as any)?.error
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: "Lead status updated via RPC" });

    } catch (error: unknown) {
        console.error("[Webhook Error]:", error);
        const errMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { error: "Internal webhook processing error", details: errMessage },
            { status: 500 }
        );
    }
}
