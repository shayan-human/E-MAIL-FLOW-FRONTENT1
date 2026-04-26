import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@insforge/nextjs/server";
import { processChartData, processSendIntelligence, processReplyQuality } from "@/lib/chart-utils";
import type { LeadData, ReplyData } from "@/lib/types";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const timeframe = (url.searchParams.get("timeframe") || "7D") as "24H" | "7D" | "30D";

    try {
        const { user } = await auth();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch campaigns and active accounts belonging to the user
        const insforge = await getInsforgeClient();
        const [campaignsRes, activeAccountsRes] = await Promise.all([
            insforge
                .from("campaigns")
                .select("id")
                .eq("user_id", user.id),
            insforge
                .from("sender_accounts")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .eq("is_active", true)
        ]);

        const campaignIds = (campaignsRes.data || []).map((c) => c.id as string) || [];
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
                chartData: { "24H": [], "7D": [], "30D": [] },
                sendIntelligence: []
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
            insforge
                .from("leads")
                .select("*", { count: "exact", head: true })
                .in("campaign_id", campaignIds)
                .in("status", ["SENT", "REPLIED"]),

            // Total Replies
            insforge
                .from("leads")
                .select("*", { count: "exact", head: true })
                .in("campaign_id", campaignIds)
                .eq("status", "REPLIED"),

            // Bounced
            insforge
                .from("leads")
                .select("*", { count: "exact", head: true })
                .in("campaign_id", campaignIds)
                .eq("status", "BOUNCED"),

            // Average Reply Time (fetch processed leads with timestamps)
            insforge
                .from("leads")
                .select("sent_at, replied_at")
                .in("campaign_id", campaignIds)
                .eq("status", "REPLIED")
                .not("sent_at", "is", null)
                .not("replied_at", "is", null),

            // Activity Chart (Last 30 days) - used for both charts
            insforge
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
            const times = avgReplyTimeRes.data.map((l: { sent_at: string; replied_at: string }) => {
                const sent = new Date(l.sent_at).getTime();
                const replied = new Date(l.replied_at).getTime();
                return (replied - sent) / (1000 * 60 * 60);
            });
            const sum = times.reduce((a, b) => a + b, 0);
            avgReplyTimeHours = Math.round(sum / times.length);
        }

        // 3. Process activity data
        const activityData = (activityRes.data || []) as LeadData[];
        const chartData = processChartData(activityData);
        const sendIntelligence = processSendIntelligence(activityData, timeframe);

        // 4. Fetch replies for quality analysis
        const { data: replies } = await insforge
            .from("replies")
            .select("body, lead_id")
            .in("lead_id", (activityData.map((l) => l.id).filter(Boolean) as string[]));

        const replyQuality = processReplyQuality((replies || []) as ReplyData[]);

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
            sendIntelligence,
            replyQuality
        });

    } catch (error) {
        console.error("[GET Dashboard Stats Error]:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
