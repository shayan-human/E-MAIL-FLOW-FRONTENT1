import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";
import { auth } from "@insforge/nextjs/server";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch campaigns first to get IDs
        const { data: campaigns } = await insforge.database
            .from("campaigns")
            .select("id")
            .eq("user_id", user.id);

        const campaignIds = (campaigns || []).map((c: any) => c.id) || [];

        if (campaignIds.length === 0) {
            return NextResponse.json({
                stats: {
                    totalCampaigns: 0,
                    emailsSent: 0,
                    totalReplies: 0,
                    avgReplyRate: "0%",
                    activeAccounts: 0,
                },
                chartData: []
            });
        }

        // 2. Fetch metrics
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const [
            sentRes,
            repliedRes,
            activeAccountsRes,
            activityRes
        ] = await Promise.all([
            // Emails Sent (status SENT or REPLIED)
            insforge.database
                .from("leads")
                .select("*", { count: "exact", head: true })
                .in("campaign_id", campaignIds)
                .in("status", ["SENT", "REPLIED"]),

            // Total Replies
            insforge.database
                .from("leads")
                .select("*", { count: "exact", head: true })
                .in("campaign_id", campaignIds)
                .eq("status", "REPLIED"),

            // Active Accounts
            insforge.database
                .from("sender_accounts")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("is_active", true),

            // Activity Chart (Last 30 days)
            insforge.database
                .from("leads")
                .select("sent_at")
                .in("campaign_id", campaignIds)
                .gte("sent_at", thirtyDaysAgo.toISOString())
        ]);

        const sentCount = sentRes.count || 0;
        const replyCount = repliedRes.count || 0;
        const avgReplyRate = sentCount > 0 ? Math.round((replyCount / sentCount) * 100) : 0;

        // 3. Process activity data
        const activityData = activityRes.data || [];
        const dailyStats: Record<string, number> = {};

        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyStats[dateStr] = 0;
        }

        activityData.forEach((lead: any) => {
            if (lead.sent_at) {
                const dateStr = lead.sent_at.split('T')[0];
                if (dailyStats[dateStr] !== undefined) {
                    dailyStats[dateStr]++;
                }
            }
        });

        const chartData = Object.entries(dailyStats)
            .map(([date, count]) => {
                const d = new Date(date);
                const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return { date: displayDate, sent: count, fullDate: date };
            })
            .sort((a, b) => a.fullDate.localeCompare(b.fullDate));

        return NextResponse.json({
            stats: {
                totalCampaigns: campaignIds.length,
                emailsSent: sentCount,
                totalReplies: replyCount,
                avgReplyRate: `${avgReplyRate}%`,
                activeAccounts: activeAccountsRes.count || 0,
            },
            chartData
        });

    } catch (error) {
        console.error("[GET Dashboard Stats Error]:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
