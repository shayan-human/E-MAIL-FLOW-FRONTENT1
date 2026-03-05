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
}

function StatusBadge({ status, completion = 0 }: { status: string, completion?: number }) {
    // If completion is 100%, force it to COMPLETED visually
    const displayStatus = completion === 100 && status === 'RUNNING' ? 'COMPLETED' : status;

    if (displayStatus === 'COMPLETED') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide" style={{ color: "#10B981", backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#10B981", boxShadow: "0 0 4px #10B981" }} />
                COMPLETED
            </span>
        );
    }

    if (displayStatus === 'RUNNING') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide" style={{ color: "#F59E0B", backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#F59E0B", boxShadow: "0 0 4px #F59E0B" }} />
                RUNNING
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide" style={{ color: "#888", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#888" }} />
            {displayStatus}
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
            {/* Campaign Performance Table */}
            <div
                className="rounded-[16px] overflow-hidden"
                style={{ backgroundColor: "#141414", border: "1px solid #222", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}
            >
                {/* Custom Card Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b" style={{ borderColor: "#222" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#F59E0B", boxShadow: "0 0 8px #F59E0B" }} />
                        <h2 className="text-[16px] font-semibold text-white">Campaign Performance</h2>
                        <span className="text-[12px] px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}>
                            {campaigns.length} total • all completed
                        </span>
                    </div>
                </div>

                <div>
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
                        <div className="overflow-x-auto text-[13px]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr style={{ backgroundColor: "#111" }}>
                                        <th className="py-3 px-6 font-semibold uppercase tracking-[0.1em] text-[10px]" style={{ color: "#444" }}>Rank</th>
                                        <th className="py-3 px-6 font-semibold uppercase tracking-[0.1em] text-[10px]" style={{ color: "#444" }}>Campaign</th>
                                        <th className="py-3 px-6 font-semibold uppercase tracking-[0.1em] text-[10px]" style={{ color: "#444" }}>Status</th>
                                        <th className="py-3 px-6 font-semibold uppercase tracking-[0.1em] text-[10px]" style={{ color: "#444" }}>Sent</th>
                                        <th className="py-3 px-6 font-semibold uppercase tracking-[0.1em] text-[10px]" style={{ color: "#444" }}>Replies</th>
                                        <th className="py-3 px-6 font-semibold uppercase tracking-[0.1em] text-[10px]" style={{ color: "#444" }}>Reply Rate</th>
                                        <th className="py-3 px-6 font-semibold uppercase tracking-[0.1em] text-[10px]" style={{ color: "#444" }}>Completion</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map((c, i) => {
                                        const isTop2 = i < 2;
                                        const isHighReply = c.reply_rate >= 50;
                                        return (
                                            <tr
                                                key={c.id}
                                                className="border-t cursor-pointer"
                                                style={{ borderColor: "#1A1A1A", transition: "background-color 150ms ease" }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(245,158,11,0.02)"}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                                onClick={() => router.push(`/campaigns/${c.id}`)}
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center justify-center w-[26px] h-[26px] rounded-[7px] text-[11px] font-bold"
                                                        style={isTop2 ? { backgroundColor: "rgba(245,158,11,0.1)", color: "#F59E0B" } : { backgroundColor: "#181818", color: "#666" }}>
                                                        #{i + 1}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-[7px] h-[7px]"
                                                            style={isHighReply ? { backgroundColor: "#F59E0B" } : { backgroundColor: "transparent", border: "1px solid #333" }}
                                                        />
                                                        <span className="font-mono transition-colors" style={{ color: "#bbb" }} onMouseEnter={(e) => e.currentTarget.style.color = "#f0f0f0"} onMouseLeave={(e) => e.currentTarget.style.color = "#bbb"}>
                                                            {c.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <StatusBadge status={c.status} completion={c.completion_rate} />
                                                </td>
                                                <td className="py-4 px-6 font-mono" style={{ color: "#888" }}>
                                                    {c.sent_count}
                                                </td>
                                                <td className="py-4 px-6 font-mono" style={{ color: c.reply_count > 0 ? "#F59E0B" : "#555" }}>
                                                    {c.reply_count}
                                                </td>
                                                <td className="py-4 px-6 font-mono font-medium" style={{ color: c.reply_rate >= 50 ? "#10B981" : c.reply_rate > 0 ? "#F59E0B" : "#444" }}>
                                                    {c.reply_rate}%
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-[11px]" style={{ color: c.completion_rate === 100 ? "#F59E0B" : "#888", width: "30px" }}>
                                                            {c.completion_rate}%
                                                        </span>
                                                        <div className="w-[60px] h-[4px] rounded-full overflow-hidden" style={{ backgroundColor: "#1e1e1e" }}>
                                                            <div
                                                                className="h-full rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${c.completion_rate}%`,
                                                                    backgroundColor: c.completion_rate === 100 ? "#F59E0B" : "#555",
                                                                    boxShadow: c.completion_rate === 100 ? "0 0 6px rgba(245,158,11,0.5)" : "none"
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer Strip */}
                {campaigns.length > 0 && (
                    <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "#1A1A1A", backgroundColor: "#0f0f0f" }}>
                        <span className="text-[11px]" style={{ color: "#555" }}>
                            Showing {campaigns.length} of {campaigns.length} campaigns
                        </span>
                        <div className="flex items-center justify-center w-[20px] h-[20px] rounded" style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "#F59E0B", fontSize: "10px", fontWeight: "bold" }}>
                            1
                        </div>
                    </div>
                )}
            </div>
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
