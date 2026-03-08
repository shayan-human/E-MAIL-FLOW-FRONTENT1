import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@insforge/nextjs/server";
import { processChartData, processBestSendDay, processReplyQuality } from "@/lib/chart-utils";

export async function GET() {
    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch campaigns and active accounts belonging to the user
        const insforge = await getInsforgeClient();
        const [campaignsRes, activeAccountsRes] = await Promise.all([
            insforge.database
                .from("campaigns")
                .select("id")
                .eq("user_id", user.id),
            insforge.database
                .from("sender_accounts")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("is_active", true)
        ]);

        const campaignIds = (campaignsRes.data || []).map((c: any) => c.id) || [];
        const activeAccounts = activeAccountsRes.count || 0;

        if (campaignIds.length === 0) {
            return NextResponse.json({
                stats: {
                    totalCampaigns: 0,
                    emailsSent: 0,
                    totalReplies: 0,
                    avgReplyRate: "0%",
                    activeAccounts: activeAccounts,
                    bouncedCount: 0,
                    avgReplyTime: "---"
                },
                chartData: { "24H": [], "7D": [], "30D": [] }
            });
        }

        // 2. Fetch metrics
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const [
            sentRes,
            repliedRes,
            bouncedRes,
            avgReplyTimeRes,
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

            // Bounced
            insforge.database
                .from("leads")
                .select("*", { count: "exact", head: true })
                .in("campaign_id", campaignIds)
                .eq("status", "BOUNCED"),

            // Average Reply Time (fetch processed leads with timestamps)
            insforge.database
                .from("leads")
                .select("sent_at, replied_at")
                .in("campaign_id", campaignIds)
                .eq("status", "REPLIED")
                .not("sent_at", "is", null)
                .not("replied_at", "is", null),

            // Activity Chart (Last 30 days)
            insforge.database
                .from("leads")
                .select("sent_at, status")
                .in("campaign_id", campaignIds)
                .gte("sent_at", thirtyDaysAgo.toISOString())
        ]);

        const sentCount = sentRes.count || 0;
        const replyCount = repliedRes.count || 0;
        const bouncedCount = bouncedRes.count || 0;

        const avgReplyRate = sentCount > 0 ? Math.round((replyCount / sentCount) * 100) : 0;

        // Calculate avg reply time in hours
        let avgReplyTimeHours: number | null = null;
        if (avgReplyTimeRes.data && avgReplyTimeRes.data.length > 0) {
            const times = avgReplyTimeRes.data.map((l: any) => {
                const sent = new Date(l.sent_at).getTime();
                const replied = new Date(l.replied_at).getTime();
                return (replied - sent) / (1000 * 60 * 60);
            });
            const sum = times.reduce((a, b) => a + b, 0);
            avgReplyTimeHours = Math.round(sum / times.length);
        }

        // 3. Process activity data
        const activityData = activityRes.data || [];
        const chartData = processChartData(activityData);
        const bestSendDay = processBestSendDay(activityData);

        // 4. Fetch replies for quality analysis
        const { data: replies } = await insforge.database
            .from("replies")
            .select("body, lead_id")
            .in("lead_id", (activityData.map((l: any) => l.id).filter(Boolean)));

        const replyQuality = processReplyQuality(replies || []);

        return NextResponse.json({
            stats: {
                totalCampaigns: campaignIds.length,
                emailsSent: sentCount,
                totalReplies: replyCount,
                avgReplyRate: `${avgReplyRate}%`,
                activeAccounts: activeAccounts,
                bouncedCount: bouncedCount,
                avgReplyTime: avgReplyTimeHours !== null ? `${avgReplyTimeHours}h` : "---"
            },
            chartData,
            bestSendDay,
            replyQuality
        });

    } catch (error) {
        console.error("[GET Dashboard Stats Error]:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
