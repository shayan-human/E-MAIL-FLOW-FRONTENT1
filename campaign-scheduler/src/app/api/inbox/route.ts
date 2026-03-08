import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@insforge/nextjs/server";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const insforge = await getInsforgeClient();

        // Step 1: Fetch replies with lead data (flat, no nested relationships)
        const { data: repliesData, error: repliesError } = await insforge.database
            .from("replies")
            .select(`
                *,
                lead:leads(
                    id,
                    email,
                    first_name,
                    last_name,
                    business_name,
                    website,
                    phone,
                    custom_fields,
                    gmail_thread_id,
                    sender_account_id,
                    sender_account_email,
                    campaign_id
                )
            `)
            .order("timestamp", { ascending: true });

        if (repliesError) {
            console.error("[Fetch Inbox Error - Replies]:", repliesError);
            return NextResponse.json({ error: repliesError.message }, { status: 500 });
        }

        // Step 2: Collect unique campaign IDs from the leads
        const campaignIds = new Set<string>();
        (repliesData || []).forEach((r: any) => {
            if (r.lead?.campaign_id) {
                campaignIds.add(r.lead.campaign_id);
            }
        });

        // Step 3: Fetch campaigns separately
        let campaignMap: Record<string, any> = {};
        if (campaignIds.size > 0) {
            const { data: campaignsData, error: campaignsError } = await insforge.database
                .from("campaigns")
                .select("id, name, user_id")
                .in("id", Array.from(campaignIds));

            if (campaignsError) {
                console.error("[Fetch Inbox Error - Campaigns]:", campaignsError);
                // Non-fatal: continue without campaign names
            } else {
                (campaignsData || []).forEach((c: any) => {
                    campaignMap[c.id] = c;
                });
            }
        }

        // Step 4: Group messages by contact email (unified thread)
        const threadMap: Record<string, any> = {};

        (repliesData || []).forEach((r: any) => {
            const email = r.lead?.email;
            if (!email) return;

            const campaign = r.lead?.campaign_id ? campaignMap[r.lead.campaign_id] : null;

            if (!threadMap[email]) {
                threadMap[email] = {
                    email: email,
                    contactEmail: email,
                    contactName: `${r.lead?.first_name || ""} ${r.lead?.last_name || ""}`.trim() || email,
                    campaignName: campaign?.name || "Unknown Campaign",
                    campaignId: campaign?.id,
                    leadId: r.lead?.id,
                    company: r.lead?.business_name,
                    website: r.lead?.website,
                    phone: r.lead?.phone,
                    customFields: r.lead?.custom_fields,
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
                threadMap[email].campaignName = campaign?.name || "Unknown Campaign";
                threadMap[email].campaignId = campaign?.id;
                threadMap[email].leadId = r.lead?.id;
                threadMap[email].company = r.lead?.business_name;
                threadMap[email].website = r.lead?.website;
                threadMap[email].phone = r.lead?.phone;
                threadMap[email].customFields = r.lead?.custom_fields;
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
