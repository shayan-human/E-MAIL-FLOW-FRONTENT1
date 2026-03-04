"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { useUser } from "@insforge/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    Megaphone,
    Star,
    ArrowUpRight,
    RefreshCw,
    Plus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast-provider";

interface CampaignWithStats {
    id: string;
    name: string;
    status: string;
    total_leads: number;
    created_at: string;
    sent_count: number;
    reply_count: number;
    completion_rate: number;
    reply_rate: number;
    star_rating: number;
}

function getStarRating(replyRate: number): number {
    if (replyRate >= 20) return 5;
    if (replyRate >= 15) return 4;
    if (replyRate >= 10) return 3;
    if (replyRate >= 5) return 2;
    return 1;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                        }`}
                />
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string }> = {
        DRAFT: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400" },
        RUNNING: { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-400" },
        PAUSED: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-400" },
        COMPLETED: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-400" },
    };
    const c = config[status] || config.DRAFT;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
            {status}
        </span>
    );
}

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);
    const [statsData, setStatsData] = useState({
        totalCampaigns: 0,
        emailsSent: 0,
        totalReplies: 0,
        avgReplyRate: "0%",
        activeAccounts: 0,
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const router = useRouter();

    const fetchData = async () => {
        if (!user) return;
        try {
            // Fetch campaigns and dashboard stats in parallel
            const [campaignsRes, statsRes] = await Promise.all([
                insforge.database
                    .from("campaigns")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false }),
                fetch("/api/dashboard/stats").then(res => res.json())
            ]);

            if (campaignsRes.error) throw campaignsRes.error;

            // Update live stats from our new endpoint
            if (statsRes.stats) {
                setStatsData(statsRes.stats);
                setChartData(statsRes.chartData || []);
            }

            const campaignsData = campaignsRes.data || [];

            // If we have stats data, we can use it, but for the table we might need per-campaign counts.
            // Let's fetch campaign_stats for these campaigns specifically.
            const campaignIds = campaignsData.map((c: any) => c.id);
            let statsMap: Record<string, any> = {};

            if (campaignIds.length > 0) {
                const { data: campaignStats } = await insforge.database
                    .from("campaign_stats")
                    .select("*")
                    .in("campaign_id", campaignIds);

                if (campaignStats) {
                    campaignStats.forEach((s: any) => {
                        statsMap[s.campaign_id] = s;
                    });
                }
            }

            const enriched: CampaignWithStats[] = campaignsData.map((c: any) => {
                const s: any = statsMap[c.id] || {};
                const sent = s.total_sent || 0;
                const replied = s.total_replied || 0;
                const replyRate = s.reply_rate || 0;

                return {
                    ...c,
                    sent_count: sent,
                    reply_count: replied,
                    completion_rate: c.total_leads > 0 ? Math.round((sent / c.total_leads) * 100) : 0,
                    reply_rate: replyRate,
                    star_rating: getStarRating(replyRate),
                };
            });

            setCampaigns(enriched);
        } catch (err) {
            console.error("Error in dashboard fetchData:", err);
            toast.error("Failed to refresh dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-sync replies every 2 minutes in the background
    const autoSync = async () => {
        try {
            const response = await fetch("/api/campaign/sync-replies", { method: "POST" });
            if (response.ok) {
                setLastSynced(new Date());
                await fetchData(); // refresh dashboard data after sync
            }
        } catch {
            // Silent fail for background sync
        }
    };

    useEffect(() => {
        if (isLoaded) {
            fetchData();
        }

        // Refresh stats and activity every 30 seconds (Live Polling)
        const pollInterval = setInterval(() => {
            if (isLoaded && user) fetchData();
        }, 30 * 1000);

        // Auto-sync every 2 minutes in background
        const syncInterval = setInterval(autoSync, 2 * 60 * 1000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(syncInterval);
        };
    }, []);

    const handleSyncReplies = async () => {
        setSyncing(true);
        toast.info("Syncing replies...");
        try {
            const response = await fetch("/api/campaign/sync-replies", {
                method: "POST",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Sync failed");
            }

            setLastSynced(new Date());
            toast.success("Replies synced successfully");

            // Refresh dashboard data
            await fetchData();
        } catch (err) {
            toast.error("Failed to sync replies");
        } finally {
            setSyncing(false);
        }
    };

    const statCards = [
        { label: "Total Campaigns", value: statsData.totalCampaigns },
        { label: "Emails Sent", value: statsData.emailsSent },
        { label: "Total Replies", value: statsData.totalReplies },
        { label: "Avg Reply Rate", value: statsData.avgReplyRate },
        { label: "Active Accounts", value: statsData.activeAccounts },
    ];

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Your campaign performance at a glance.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div
                            key={i}
                            className="rounded-[10px]"
                            style={{ backgroundColor: "#141414", border: "1px solid #222222", padding: 24 }}
                        >
                            <div className="h-4 w-20 rounded" style={{ backgroundColor: "#222222" }} />
                            <div className="h-8 w-16 rounded mt-2" style={{ backgroundColor: "#222222" }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
                    <p className="label-meta mt-1">Your campaign performance at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <button
                            onClick={handleSyncReplies}
                            disabled={syncing}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                            {syncing ? "Syncing..." : "Sync Replies"}
                        </button>
                        {lastSynced && (
                            <span className="text-[10px] text-[#6b7280] mt-1.5">
                                Last synced {lastSynced.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    <Link
                        href="/campaigns/new"
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Campaign
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-[10px] transition-colors duration-200 cursor-default"
                        style={{
                            backgroundColor: "#141414",
                            border: "1px solid #222222",
                            padding: 24,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#F59E0B")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#222222")}
                    >
                        <p className="text-[13px] font-medium" style={{ color: "#6b7280" }}>
                            {stat.label}
                        </p>
                        <p className="text-2xl font-semibold text-white mt-1">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Empty state message if no data */}
            {campaigns.length === 0 && (
                <p className="text-center italic mt-6 label-meta">
                    No activity yet. Connect a Gmail account and launch your first campaign to see data here.
                </p>
            )}

            {/* Email Activity Chart */}
            <EmailActivityChart data={chartData} />

            {/* Campaign Performance Table */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    {campaigns.length === 0 ? (
                        <div className="py-12 text-center">
                            <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-foreground font-medium">No campaigns yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Create your first campaign to see performance data.</p>
                            <Link
                                href="/campaigns/new"
                                className="inline-flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400 font-medium mt-3 hover:underline"
                            >
                                Create campaign <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="text-left py-3 px-2 font-medium">Rank</th>
                                        <th className="text-left py-3 px-2 font-medium">Campaign</th>
                                        <th className="text-left py-3 px-2 font-medium">Status</th>
                                        <th className="text-right py-3 px-2 font-medium">Sent</th>
                                        <th className="text-right py-3 px-2 font-medium">Replies</th>
                                        <th className="text-right py-3 px-2 font-medium">Reply Rate</th>
                                        <th className="text-right py-3 px-2 font-medium">Completion</th>
                                        <th className="text-left py-3 px-2 font-medium">Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map((c, i) => (
                                        <tr
                                            key={c.id}
                                            className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/campaigns/${c.id}`)}
                                        >
                                            <td className="py-3 px-2 font-mono text-muted-foreground">#{i + 1}</td>
                                            <td className="py-3 px-2 font-medium">{c.name}</td>
                                            <td className="py-3 px-2"><StatusBadge status={c.status} /></td>
                                            <td className="py-3 px-2 text-right tabular-nums">{c.sent_count}</td>
                                            <td className="py-3 px-2 text-right tabular-nums">
                                                <span className={c.reply_count > 0 ? "text-amber-500 font-medium" : ""}>
                                                    {c.reply_count}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-right tabular-nums">
                                                <span className={c.reply_rate > 10 ? "text-emerald-500 font-medium" : ""}>
                                                    {c.reply_rate}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-right tabular-nums">{c.completion_rate}%</td>
                                            <td className="py-3 px-2"><StarRating rating={c.star_rating} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ── Dummy data for chart ──────────────────────────────────────────────
const DUMMY_7D = [
    { date: "Mon", sent: 12 },
    { date: "Tue", sent: 28 },
    { date: "Wed", sent: 19 },
    { date: "Thu", sent: 34 },
    { date: "Fri", sent: 42 },
    { date: "Sat", sent: 8 },
    { date: "Sun", sent: 15 },
];

const DUMMY_30D = [
    { date: "1", sent: 5 }, { date: "2", sent: 12 }, { date: "3", sent: 18 },
    { date: "4", sent: 9 }, { date: "5", sent: 22 }, { date: "6", sent: 31 },
    { date: "7", sent: 28 }, { date: "8", sent: 14 }, { date: "9", sent: 36 },
    { date: "10", sent: 42 }, { date: "11", sent: 25 }, { date: "12", sent: 19 },
    { date: "13", sent: 33 }, { date: "14", sent: 47 }, { date: "15", sent: 38 },
    { date: "16", sent: 15 }, { date: "17", sent: 22 }, { date: "18", sent: 29 },
    { date: "19", sent: 44 }, { date: "20", sent: 35 }, { date: "21", sent: 18 },
    { date: "22", sent: 27 }, { date: "23", sent: 50 }, { date: "24", sent: 41 },
    { date: "25", sent: 32 }, { date: "26", sent: 24 }, { date: "27", sent: 38 },
    { date: "28", sent: 46 }, { date: "29", sent: 30 }, { date: "30", sent: 55 },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="rounded-lg px-3 py-2 text-xs shadow-lg"
            style={{ backgroundColor: "#1f1f1f", border: "1px solid #333" }}
        >
            <p className="font-medium text-white">{label}</p>
            <p style={{ color: "#F59E0B" }}>{payload[0].value} emails sent</p>
        </div>
    );
}

function EmailActivityChart({ data }: { data: any[] }) {
    const [range, setRange] = useState<"7d" | "30d">("7d");
    // If no real data, show empty state instead of dummy data
    const displayData = data && data.length > 0 ? data : [];

    return (
        <div
            className="rounded-[10px]"
            style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
        >
            {/* Header with toggle */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
                <h3 className="text-[16px] font-medium text-white">Email Activity</h3>
                <div className="flex gap-1 rounded-lg p-0.5" style={{ backgroundColor: "#1a1a1a" }}>
                    {(["7d", "30d"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className="relative px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200"
                            style={{
                                color: range === r ? "#F59E0B" : "#6b7280",
                                backgroundColor: range === r ? "#222222" : "transparent",
                            }}
                        >
                            {r === "7d" ? "7 Days" : "30 Days"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="px-4 pb-4">
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={displayData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                        <CartesianGrid
                            strokeDasharray="0"
                            stroke="#1f1f1f"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            dy={8}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            dx={-4}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#333", strokeWidth: 1 }} />
                        <Line
                            type="monotone"
                            dataKey="sent"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: "#F59E0B", stroke: "#141414", strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
