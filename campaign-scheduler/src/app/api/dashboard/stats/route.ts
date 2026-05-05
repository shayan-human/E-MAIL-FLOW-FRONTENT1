import { NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge-server";
import { auth } from "@/lib/auth-helper";
import { processChartData, processSendIntelligence, processReplyQuality } from "@/lib/chart-utils";
import type { LeadData, ReplyData } from "@/lib/types";
import { isBounce } from "@/lib/email-utils";

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

        // 2. Fetch leads to calculate stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const [
            sentRes,
            bouncedRes,
            repliedLeadsRes,
            activityRes
        ] = await Promise.all([
            // Exact counts for the main cards - bypasses row limits
            insforge
                .from("leads")
                .select("*", { count: "exact", head: true })
                .in("campaign_id", campaignIds)
                .in("status", ["SENT", "REPLIED"]),

            insforge
                .from("leads")
                .select("*", { count: "exact", head: true })
                .in("campaign_id", campaignIds)
                .eq("status", "BOUNCED"),

            // Only fetch actual lead rows for status = 'REPLIED' to filter them
            insforge
                .from("leads")
                .select("id, status, sent_at, replied_at")
                .in("campaign_id", campaignIds)
                .eq("status", "REPLIED"),

            // Activity Chart (Last 30 days) - used for both charts
            insforge
                .from("leads")
                .select("id, sent_at, status")
                .in("campaign_id", campaignIds)
                .gte("sent_at", thirtyDaysAgo.toISOString())
        ]);

        const sentCount = sentRes.count || 0;
        let baseBouncedCount = bouncedRes.count || 0;
        const repliedLeads = repliedLeadsRes.data || [];
        const activityData = (activityRes.data || []) as LeadData[];

        // Fetch replies for leads marked as REPLIED to verify they are genuine
        const potentialReplyLeadIds = repliedLeads.map(l => l.id);
        let genuineReplyCount = 0;
        let additionalBouncedCount = 0;
        let genuineReplyTimes: number[] = [];
        let allGenuineReplies: any[] = [];

        if (potentialReplyLeadIds.length > 0) {
            const { data: allReplies } = await insforge
                .from("replies")
                .select("lead_id, subject, body, sender_email, timestamp, type")
                .in("lead_id", potentialReplyLeadIds);

            const replies = allReplies || [];
            
            const repliesByLead: Record<string, any[]> = {};
            replies.forEach(r => {
                if (!repliesByLead[r.lead_id]) repliesByLead[r.lead_id] = [];
                repliesByLead[r.lead_id].push(r);
            });

            repliedLeads.forEach(lead => {
                const leadReplies = repliesByLead[lead.id] || [];
                const genuineReplies = leadReplies.filter(r => 
                    r.type === 'incoming' && !isBounce(r.subject, r.body, r.sender_email)
                );

                if (genuineReplies.length > 0) {
                    genuineReplyCount++;
                    allGenuineReplies.push(...genuineReplies);
                    
                    const earliestReply = genuineReplies.sort((a, b) => 
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    )[0];

                    if (lead.sent_at && earliestReply.timestamp) {
                        const timeDiff = (new Date(earliestReply.timestamp).getTime() - new Date(lead.sent_at).getTime()) / (1000 * 60 * 60);
                        if (timeDiff > 0) genuineReplyTimes.push(timeDiff);
                    }
                } else {
                    // This was marked REPLIED but only contains bounces
                    additionalBouncedCount++;
                }
            });
        }

        const totalBounced = baseBouncedCount + additionalBouncedCount;
        const avgReplyRate = sentCount > 0 ? Math.round((genuineReplyCount / sentCount) * 100) : 0;
        const avgTime = genuineReplyTimes.length > 0
            ? Math.round(genuineReplyTimes.reduce((a, b) => a + b, 0) / genuineReplyTimes.length)
            : null;

        // 3. Process activity data for charts
        const chartData = processChartData(activityData);
        const sendIntelligence = processSendIntelligence(activityData, timeframe);

        // 4. Process quality from genuine replies
        const replyQuality = processReplyQuality(allGenuineReplies.map(r => ({
            id: r.id,
            body: r.body,
            lead_id: r.lead_id
        })));

        return NextResponse.json({
            stats: {
                totalCampaigns: campaignIds.length,
                emailsSent: sentCount,
                totalReplies: genuineReplyCount,
                avgReplyRate: `${avgReplyRate}%`,
                activeAccounts: activeAccounts,
                bouncedCount: totalBounced,
                avgReplyTime: avgTime !== null ? `${avgTime}h` : "---"
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
