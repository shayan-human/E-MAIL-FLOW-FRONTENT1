import { auth } from "@/lib/auth-helper";
import { getInsforgeClient } from "@/lib/insforge-server";
import DashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";
import { processChartData, processBestSendDay, processReplyQuality } from "@/lib/chart-utils";
import type { LeadData, ReplyData } from "@/lib/types";
import { isBounce } from "@/lib/email-utils";

export default async function DashboardPage() {
    const { user } = await auth();

    if (!user) {
        return null;
    }

    const insforge = await getInsforgeClient();

    // 1. Initial parallel fetch for campaigns and core stats
    const [campaignsRes, accountsRes] = await Promise.all([
        insforge
            .from("campaigns")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        insforge
            .from("sender_accounts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
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
    let chartData: Record<string, any[]> = { "24H": [], "7D": [], "30D": [] };
    let bestSendDay: any[] = [];
    let replyQuality: any = { positive: 0, negative: 0, neutral: 0, total: 0, percentages: { positive: 0, negative: 0, neutral: 0 } };
    let initialCampaigns: any[] = [];

    if (campaignIds.length > 0) {
        // 2. Fetch Aggregated Statistics in parallel
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            sentRes,
            bouncedRes,
            repliedLeadsRes,
            campaignStatsRes,
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

            // Get per-campaign counts for the table
            insforge
                .from("campaign_stats")
                .select("*")
                .in("campaign_id", campaignIds),

            // Get activity data for chart
            insforge
                .from("leads")
                .select("id, sent_at, status")
                .in("campaign_id", campaignIds)
                .gte("sent_at", thirtyDaysAgo.toISOString())
        ]);

        const sentCount = sentRes.count || 0;
        let baseBouncedCount = bouncedRes.count || 0;
        const repliedLeads = repliedLeadsRes.data || [];

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

        stats = {
            ...stats,
            emailsSent: sentCount,
            totalReplies: genuineReplyCount,
            avgReplyRate: `${avgReplyRate}%`,
            bouncedCount: totalBounced,
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
        const activityData = (activityRes.data || []) as LeadData[];
        chartData = processChartData(activityData);
        bestSendDay = processBestSendDay(activityData);

        // Reply Quality Data - only use genuine replies
        replyQuality = processReplyQuality(allGenuineReplies.map(r => ({
            id: r.id,
            body: r.body,
            lead_id: r.lead_id
        })));
    }

    return (
        <DashboardClient
            user={user}
            initialCampaigns={initialCampaigns}
            initialStats={stats}
            initialChartData={chartData}
            initialBestSendDay={bestSendDay}
            initialReplyQuality={replyQuality}
        />
    );
}
