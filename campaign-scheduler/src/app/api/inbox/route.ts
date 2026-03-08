import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@insforge/nextjs/server";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch replies along with lead and campaign info
        const insforge = await getInsforgeClient();
        const { data, error } = await insforge.database
            .from("replies")
            .select(`
                *,
                lead:leads(
                    id,
                    email,
                    first_name,
                    last_name,
                    gmail_thread_id,
                    sender_account_id,
                    sender_account_email,
                    campaign:campaigns(
                        id,
                        name,
                        user_id
                    )
                )
            `)
            .order("timestamp", { ascending: true }); // Chronological order for messages within threads

        if (error) {
            console.error("[Fetch Inbox Error]:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Group messages by contact email (unified thread)
        const threadMap: Record<string, any> = {};

        (data || []).forEach((r: any) => {
            const email = r.lead?.email;
            if (!email) return;

            if (!threadMap[email]) {
                threadMap[email] = {
                    email: email, // Logical ID for the thread
                    contactEmail: email,
                    contactName: `${r.lead?.first_name || ""} ${r.lead?.last_name || ""}`.trim() || email,
                    campaignName: r.lead?.campaign?.name || "Unknown Campaign",
                    campaignId: r.lead?.campaign?.id,
                    leadId: r.lead?.id, // Use the latest leadId for actions
                    senderAccountId: r.lead?.sender_account_id,
                    senderAccountEmail: r.lead?.sender_account_email,
                    gmailThreadId: r.lead?.gmail_thread_id || r.gmail_thread_id,
                    subject: r.subject,
                    messages: [],
                    lastMessageAt: r.timestamp,
                    lastMessagePreview: "",
                    isRead: true,
                };
            }

            // Always update the thread metadata with the LATEST message's context
            const currentLastAt = new Date(threadMap[email].lastMessageAt).getTime();
            const messageAt = new Date(r.timestamp).getTime();

            if (messageAt >= currentLastAt) {
                threadMap[email].campaignName = r.lead?.campaign?.name || "Unknown Campaign";
                threadMap[email].campaignId = r.lead?.campaign?.id;
                threadMap[email].leadId = r.lead?.id;
                threadMap[email].senderAccountId = r.lead?.sender_account_id;
                threadMap[email].senderAccountEmail = r.lead?.sender_account_email;
                if (r.lead?.gmail_thread_id || r.gmail_thread_id) {
                    threadMap[email].gmailThreadId = r.lead?.gmail_thread_id || r.gmail_thread_id;
                }
                threadMap[email].lastMessageAt = r.timestamp;
            }

            const message = {
                id: r.id,
                type: r.type || "incoming",
                senderEmail: r.sender_email,
                subject: r.subject,
                body: r.body,
                timestamp: r.timestamp,
                isRead: r.is_read,
                gmailMessageId: r.gmail_message_id,
            };

            threadMap[email].messages.push(message);
            threadMap[email].lastMessagePreview = r.body.slice(0, 100) + (r.body.length > 100 ? "..." : "");
            if (!r.is_read) {
                threadMap[email].isRead = false;
            }
        });

        // Convert map to array and sort by latest message
        const threads = Object.values(threadMap).sort((a: any, b: any) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );

        return NextResponse.json({ threads });
    } catch (error) {
        console.error("[Fetch Inbox Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
