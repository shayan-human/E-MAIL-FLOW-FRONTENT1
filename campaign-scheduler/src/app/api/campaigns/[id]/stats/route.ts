import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@/lib/auth-helper";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: campaignId } = await params;
        const insforge = await getInsforgeClient();

        // 1. Verify ownership and fetch campaign metadata
        const { data: campaign, error: campaignError } = await insforge
            .from("campaigns")
            .select(`
                *,
                sender_accounts:campaign_accounts(
                    sender_account:sender_accounts(*)
                )
            `)
            .eq("id", campaignId)
            .single();

        if (campaignError || !campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        if (campaign.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Fetch stats and recent activity in parallel
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [leadsRes, statsRes, repliesRes] = await Promise.all([
            insforge
                .from("leads")
                .select("id, email, status, sent_at, replied_at")
                .eq("campaign_id", campaignId)
                .order("sent_at", { ascending: false, nullsFirst: false }),

            // Stats
            insforge
                .from("campaign_stats")
                .select("*")
                .eq("campaign_id", campaignId)
                .maybeSingle(),

            // Last 5 replies specifically for this campaign
            insforge
                .from("leads")
                .select("*")
                .eq("campaign_id", campaignId)
                .eq("status", "REPLIED")
                .order("replied_at", { ascending: false })
                .limit(5)
        ]);

        const leads = leadsRes.data || [];
        const stats = statsRes.data || { total_sent: 0, total_replied: 0, reply_rate: 0 };
        const recentReplies = repliesRes.data || [];

        // 3. Process activity data for chart (last 30 days)
        const dailyStats: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyStats[dateStr] = 0;
        }

        leads.forEach(lead => {
            if (lead.sent_at) {
                const dateStr = lead.sent_at.split('T')[0];
                if (dailyStats[dateStr] !== undefined) {
                    dailyStats[dateStr]++;
                }
            }
        });

        const chartData = Object.entries(dailyStats)
            .map(([date, count]) => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                sent: count,
                fullDate: date
            }))
            .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

        return NextResponse.json({
            campaign,
            stats: {
                sent: stats.total_sent || 0,
                replied: stats.total_replied || 0,
                replyRate: stats.reply_rate || 0,
                completion: campaign.total_leads > 0
                    ? Math.round(((stats.total_sent || 0) / campaign.total_leads) * 100)
                    : 0,
                delivered: stats.total_sent || 0,
            },
            chartData,
            leads,
            recentReplies
        });

    } catch (error) {
        console.error("[GET Campaign Detail Stats Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
