import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { auth } from "@insforge/nextjs/server";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch replies along with lead and campaign info
        const { data, error } = await insforge.database
            .from("replies")
            .select(`
                *,
                lead:leads(
                    id,
                    email,
                    campaign:campaigns(
                        id,
                        name,
                        user_id
                    )
                )
            `)
            .eq("lead.campaign.user_id", user.id)
            .order("timestamp", { ascending: false });

        if (error) {
            console.error("[Fetch Inbox Error]:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Flatten the structure for the frontend
        const replies = (data || []).map((r: any) => ({
            id: r.id,
            senderEmail: r.sender_email,
            campaignName: r.lead?.campaign?.name || "Unknown Campaign",
            subject: r.subject,
            preview: r.body.slice(0, 150) + (r.body.length > 150 ? "..." : ""),
            fullBody: r.body,
            timestamp: r.timestamp,
            isRead: r.is_read,
            leadId: r.lead_id,
        }));

        return NextResponse.json({ replies });
    } catch (error) {
        console.error("[Fetch Inbox Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
