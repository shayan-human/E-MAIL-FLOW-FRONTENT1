"use client";

import { useState, useEffect, useRef } from "react";
import { insforge } from "@/lib/insforge";
import { useRouter } from "next/navigation";
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
    ArrowUpRight,
    RefreshCw,
    Plus,
    SlidersHorizontal,
    Check
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

interface DashboardClientProps {
    user: { id: string; email?: string };
    initialCampaigns: CampaignWithStats[];
    initialStats: any;
    initialChartData: any[];
}

function StatusBadge({ status, completion = 0 }: { status: string, completion?: number }) {
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

export default function DashboardClient({ user, initialCampaigns, initialStats, initialChartData }: DashboardClientProps) {
    const [campaigns, setCampaigns] = useState<CampaignWithStats[]>(initialCampaigns);
    const [statsData, setStatsData] = useState(initialStats);
    const [chartData, setChartData] = useState<any[]>(initialChartData);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const [visibleCards, setVisibleCards] = useState<string[]>([
        "Total Campaigns",
        "Emails Sent",
        "Total Replies",
        "Avg Reply Rate",
        "Active Accounts",
        "Bounced",
        "Avg Reply Time"
    ]);
    const customizeRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem("dashboard_visible_cards");
        if (saved) {
            try { setVisibleCards(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("dashboard_visible_cards", JSON.stringify(visibleCards));
    }, [visibleCards]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (customizeRef.current && !customizeRef.current.contains(event.target as Node)) {
                setIsCustomizeOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [campaignsRes, statsRes] = await Promise.all([
                insforge.database
                    .from("campaigns")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false }),
                fetch("/api/dashboard/stats").then(res => res.json())
            ]);

            if (campaignsRes.error) throw campaignsRes.error;

            if (statsRes.stats) {
                setStatsData(statsRes.stats);
                setChartData(statsRes.chartData || []);
            }

            const campaignsData = campaignsRes.data || [];
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
        } finally {
            setLoading(false);
        }
    };

    const autoSync = async () => {
        try {
            const response = await fetch("/api/campaign/sync-replies", { method: "POST" });
            if (response.ok) {
                setLastSynced(new Date());
                await fetchData();
            }
        } catch { }
    };

    useEffect(() => {
        fetchData();
        const pollInterval = setInterval(fetchData, 60 * 1000); // 1 minute live poll
        const syncInterval = setInterval(autoSync, 5 * 60 * 1000); // 5 minute background sync
        return () => {
            clearInterval(pollInterval);
            clearInterval(syncInterval);
        };
    }, []);

    const handleSyncReplies = async () => {
        setSyncing(true);
        toast.info("Syncing replies...");
        try {
            const response = await fetch("/api/campaign/sync-replies", { method: "POST" });
            if (!response.ok) throw new Error("Sync failed");
            setLastSynced(new Date());
            toast.success("Replies synced successfully");
            await fetchData();
        } catch (err) {
            toast.error("Failed to sync replies");
        } finally {
            setSyncing(false);
        }
    };

    const allStatCards = [
        { label: "Total Campaigns", value: statsData.totalCampaigns },
        { label: "Emails Sent", value: statsData.emailsSent },
        { label: "Total Replies", value: statsData.totalReplies },
        { label: "Avg Reply Rate", value: statsData.avgReplyRate },
        { label: "Active Accounts", value: statsData.activeAccounts },
        { label: "Bounced", value: statsData.bouncedCount, color: statsData.bouncedCount > 0 ? "#EF4444" : "#888" },
        { label: "Avg Reply Time", value: statsData.avgReplyTime },
    ];

    const statCards = allStatCards.filter(card => visibleCards.includes(card.label));

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Overview</h1>
                    <p className="text-muted-foreground text-sm mt-2">Manage and monitor your cold outreach performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSyncReplies}
                        disabled={syncing}
                        className="sidebar-link flex items-center gap-2 border border-card-border"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Syncing..." : "Sync Replies"}
                    </button>
                    <Link
                        href="/campaigns/new"
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        New Campaign
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat: any) => (
                    <div
                        key={stat.label}
                        className="glass-card premium-stats-card p-6 group"
                    >
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-blue-400 transition-colors">
                            {stat.label}
                        </p>
                        <div className="flex items-end justify-between mt-3">
                            <p className="text-3xl font-bold text-foreground" style={{ color: stat.color }}>
                                {stat.value}
                            </p>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-blue-400">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {campaigns.length === 0 && (
                <div className="glass-card p-12 text-center border-dashed border-2">
                    <Megaphone className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">No outreach activity yet</p>
                    <p className="text-muted-foreground text-sm mt-2">Connect an account and launch your first campaign to see data here.</p>
                    <Link href="/campaigns/new" className="inline-flex items-center gap-2 text-blue-400 font-medium mt-6 hover:underline">
                        Start your first campaign <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            )}

            {chartData.length > 0 && <EmailActivityChart data={chartData} />}

            <div className="glass-card overflow-hidden">
                <div className="px-6 py-6 border-b border-card-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <h2 className="text-lg font-semibold text-foreground">Campaign Performance</h2>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 text-muted-foreground border border-card-border">
                        {campaigns.length} total
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {campaigns.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-muted-foreground">No campaigns to display</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02]">
                                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Campaign</th>
                                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Status</th>
                                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Sent</th>
                                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Replies</th>
                                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Reply Rate</th>
                                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Progress</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-card-border">
                                {campaigns.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/campaigns/${c.id}`)}
                                    >
                                        <td className="py-5 px-6">
                                            <span className="font-medium text-foreground group-hover:text-blue-400 transition-colors">
                                                {c.name}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <StatusBadge status={c.status} completion={c.completion_rate} />
                                        </td>
                                        <td className="py-5 px-6 font-medium text-muted-foreground">
                                            {c.sent_count}
                                        </td>
                                        <td className="py-5 px-6 font-medium" style={{ color: c.reply_count > 0 ? "#3b82f6" : undefined }}>
                                            {c.reply_count}
                                        </td>
                                        <td className="py-5 px-6 font-bold text-foreground">
                                            {c.reply_rate}%
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                                        style={{ width: `${c.completion_rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-medium text-muted-foreground">
                                                    {c.completion_rate}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card px-4 py-3 shadow-2xl">
            <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold text-blue-400">{payload[0].value} <span className="text-xs font-medium text-foreground/60">emails sent</span></p>
        </div>
    );
}

function EmailActivityChart({ data }: { data: any[] }) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-semibold text-foreground">Outreach Activity</h3>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-white/5 px-2.5 py-1 rounded-md border border-card-border">
                    Last 30 days
                </div>
            </div>
            <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 500 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
                        <Line
                            type="monotone"
                            dataKey="sent"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: "#3b82f6", stroke: "#09090b", strokeWidth: 2 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
