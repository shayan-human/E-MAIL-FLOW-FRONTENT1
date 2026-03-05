import { auth } from "@insforge/nextjs/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import DashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const { user } = await auth();

    if (!user) {
        redirect("/");
    }

    const insforge = await getInsforgeClient();

    // 1. Initial parallel fetch for campaigns and core stats
    const [campaignsRes, accountsRes] = await Promise.all([
        insforge.database
            .from("campaigns")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        insforge.database
            .from("sender_accounts")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true)
    ]);

    const campaignsData = campaignsRes.data || [];
    const campaignIds = campaignsData.map((c: any) => c.id);

    // Initial default values
    let stats = {
        totalCampaigns: campaignsData.length,
        emailsSent: 0,
        totalReplies: 0,
        avgReplyRate: "0%",
        activeAccounts: accountsRes.count || 0,
        bouncedCount: 0,
        avgReplyTime: "---",
    };
    let chartData: any[] = [];
    let initialCampaigns: any[] = [];

    if (campaignIds.length > 0) {
        // 2. Fetch Aggregated Statistics in parallel
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            leadsStatsRes,
            campaignStatsRes,
            activityRes
        ] = await Promise.all([
            // Get sent, replied, bounced counts directly from leads
            insforge.database
                .from("leads")
                .select("status, sent_at, replied_at")
                .in("campaign_id", campaignIds),

            // Get per-campaign counts for the table
            insforge.database
                .from("campaign_stats")
                .select("*")
                .in("campaign_id", campaignIds),

            // Get activity data for chart
            insforge.database
                .from("leads")
                .select("sent_at")
                .in("campaign_id", campaignIds)
                .gte("sent_at", thirtyDaysAgo.toISOString())
        ]);

        const leads = leadsStatsRes.data || [];
        const sentCount = leads.filter(l => ["SENT", "REPLIED"].includes(l.status)).length;
        const replyCount = leads.filter(l => l.status === "REPLIED").length;
        const bouncedCount = leads.filter(l => l.status === "BOUNCED").length;
        const avgReplyRate = sentCount > 0 ? Math.round((replyCount / sentCount) * 100) : 0;

        // Calculate Average Reply Time
        const replyTimes = leads
            .filter(l => l.status === "REPLIED" && l.sent_at && l.replied_at)
            .map(l => (new Date(l.replied_at!).getTime() - new Date(l.sent_at!).getTime()) / (1000 * 60 * 60));

        const avgTime = replyTimes.length > 0
            ? Math.round(replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length)
            : null;

        stats = {
            ...stats,
            emailsSent: sentCount,
            totalReplies: replyCount,
            avgReplyRate: `${avgReplyRate}%`,
            bouncedCount: bouncedCount,
            avgReplyTime: avgTime !== null ? `${avgTime}h` : "---"
        };

        // Enrich campaigns for the table
        const campaignStatsMap: Record<string, any> = {};
        if (campaignStatsRes.data) {
            campaignStatsRes.data.forEach((s: any) => {
                campaignStatsMap[s.campaign_id] = s;
            });
        }

        initialCampaigns = campaignsData.map((c: any) => {
            const s = campaignStatsMap[c.id] || {};
            const sent = s.total_sent || 0;
            return {
                ...c,
                sent_count: sent,
                reply_count: s.total_replied || 0,
                completion_rate: c.total_leads > 0 ? Math.round((sent / c.total_leads) * 100) : 0,
                reply_rate: s.reply_rate || 0,
            };
        });

        // Generate Chart Data
        const dailyStats: Record<string, number> = {};
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dailyStats[d.toISOString().split('T')[0]] = 0;
        }

        (activityRes.data || []).forEach((l: any) => {
            if (l.sent_at) {
                const dateStr = l.sent_at.split('T')[0];
                if (dailyStats[dateStr] !== undefined) dailyStats[dateStr]++;
            }
        });

        chartData = Object.entries(dailyStats)
            .map(([date, count]) => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                sent: count,
                fullDate: date
            }))
            .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
    }

    return (
        <DashboardClient
            user={user}
            initialCampaigns={initialCampaigns}
            initialStats={stats}
            initialChartData={chartData}
        />
    );
}
