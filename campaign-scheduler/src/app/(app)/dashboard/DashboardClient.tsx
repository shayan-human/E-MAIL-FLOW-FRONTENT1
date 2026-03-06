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
    Activity,
    Zap,
    Cpu,
    Target,
    BarChart3
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

function RadialGauge({ value, label, max = 100, color = "#3b82f6", icon: Icon }: { value: number, label: string, max?: number, color?: string, icon: any }) {
    const percentage = Math.min(Math.round((value / max) * 100), 100);
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="glass-card p-6 flex flex-col items-center justify-center relative group">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform">
                    {/* Background Track */}
                    <circle
                        cx="64" cy="64" r={radius}
                        className="stroke-white/5"
                        strokeWidth="6"
                        fill="transparent"
                    />
                    {/* Progress Bar */}
                    <circle
                        cx="64" cy="64" r={radius}
                        stroke={color}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className="w-4 h-4 mb-1 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color }} />
                    <span className="text-2xl font-black tracking-tighter text-white">{value}</span>
                </div>
            </div>
            <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                {label}
            </span>
        </div>
    );
}

function AutomationStream({ campaigns }: { campaigns: CampaignWithStats[] }) {
    return (
        <div className="glass-card h-full flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Engine Stream</span>
                </div>
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500/20" />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/20" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
                </div>
            </div>
            <div className="p-4 flex-1 space-y-3 font-mono text-[10px] tracking-tight overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505] z-10 pointer-events-none" />
                {campaigns.slice(0, 10).map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3 opacity-60 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                        <span className="text-zinc-700">[{new Date(c.created_at).toLocaleTimeString()}]</span>
                        <span className="text-blue-500">INIT:</span>
                        <span className="text-zinc-300 truncate">{c.name}</span>
                        <span className={`ml-auto ${c.status === 'RUNNING' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                            {c.status}
                        </span>
                    </div>
                ))}
                {campaigns.length === 0 && (
                    <div className="py-4 text-center text-zinc-700 italic">... NO DATA LOGGED ...</div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status, completion = 0 }: { status: string, completion?: number }) {
    const displayStatus = completion === 100 && status === 'RUNNING' ? 'COMPLETED' : status;

    if (displayStatus === 'COMPLETED') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                COMPLETED
            </span>
        );
    }

    if (displayStatus === 'RUNNING') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-[#9213ec]/10 text-[#9213ec] border border-[#9213ec]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9213ec] shadow-[0_0_8px_#9213ec] animate-pulse" />
                ACTIVE ENGINE
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-zinc-900 text-zinc-500 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
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
    const router = useRouter();

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
            console.error("Dashboard sync error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const pollInterval = setInterval(fetchData, 60 * 1000);
        return () => clearInterval(pollInterval);
    }, []);

    const handleSyncReplies = async () => {
        setSyncing(true);
        try {
            const response = await fetch("/api/campaign/sync-replies", { method: "POST" });
            if (!response.ok) throw new Error("Sync failed");
            toast.success("Engine stats recalibrated");
            await fetchData();
        } catch (err) {
            toast.error("Telemetry sync failed");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Engine Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-black/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Cpu className="w-5 h-5 text-blue-500" />
                        <h1 className="text-4xl font-outfit font-black tracking-tighter text-white uppercase">Engine Overview</h1>
                    </div>
                    <p className="text-zinc-500 font-black text-[10px] tracking-[0.3em] uppercase opacity-60">System Operational // All Core Nodes Running</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={handleSyncReplies}
                        disabled={syncing}
                        className="glass-card px-6 py-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                        {syncing ? "Recalibrating..." : "Sync Telemetry"}
                    </button>
                    <Link
                        href="/campaigns/new"
                        className="px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5 inline-block mr-2" />
                        Deploy New Campaign
                    </Link>
                </div>
            </div>

            {/* Hub Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Gauges */}
                <RadialGauge icon={Megaphone} label="Network Capacity" value={statsData.totalCampaigns} color="#3b82f6" />
                <RadialGauge icon={Target} label="Logic Deployments" value={statsData.emailsSent} color="#9213ec" max={1000} />
                <RadialGauge icon={Zap} label="Response Hits" value={statsData.totalReplies} color="#10b981" max={100} />

                {/* Live Stream Activity */}
                <div className="col-span-1">
                    <AutomationStream campaigns={campaigns} />
                </div>
            </div>

            {/* Performance Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    {chartData.length > 0 && <EmailActivityChart data={chartData} />}
                </div>
                <div className="glass-card p-8 flex flex-col justify-center gap-8 group">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 block mb-4">Reply Affinity</span>
                        <div className="flex items-end gap-2">
                            <span className="text-6xl font-black font-outfit text-white tracking-tighter">
                                {statsData.avgReplyRate}%
                            </span>
                            <span className="mb-2 text-blue-500"><ArrowUpRight className="w-6 h-6" /></span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 mt-2">Conversion efficiency across all nodes.</p>
                    </div>
                </div>
            </div>

            {/* Deployment Console (Table) */}
            <div className="glass-card overflow-hidden rounded-[2.5rem]">
                <div className="px-8 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white">Active Deployment Console</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-white">{campaigns.length}</span>
                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Active Units</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {campaigns.length === 0 ? (
                        <div className="py-24 text-center">
                            <Megaphone className="w-12 h-12 text-zinc-800 mx-auto mb-6 opacity-20" />
                            <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px]">No Active Deployments Detected</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 border-b border-white/5">
                                <tr>
                                    <th className="py-6 px-8">Deployment Name</th>
                                    <th className="py-6 px-8">Engine Status</th>
                                    <th className="py-6 px-8 text-center">Throughput</th>
                                    <th className="py-6 px-8 text-center">Feedback</th>
                                    <th className="py-6 px-8">Efficiency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {campaigns.map((c) => (
                                    <tr
                                        key={c.id}
                                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/campaigns/${c.id}`)}
                                    >
                                        <td className="py-8 px-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                                                    {c.name}
                                                </span>
                                                <span className="text-[9px] font-bold text-zinc-600 uppercase mt-1">ID: {c.id.slice(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-8">
                                            <StatusBadge status={c.status} completion={c.completion_rate} />
                                        </td>
                                        <td className="py-8 px-8 text-center">
                                            <span className="text-xs font-black text-zinc-300">{c.sent_count}</span>
                                            <span className="text-[9px] font-bold text-zinc-600 ml-2 uppercase">Pkg</span>
                                        </td>
                                        <td className="py-8 px-8 text-center">
                                            <span className={`text-xs font-black ${c.reply_count > 0 ? 'text-blue-500' : 'text-zinc-700'}`}>
                                                {c.reply_count}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-600 ml-2 uppercase">Hits</span>
                                        </td>
                                        <td className="py-8 px-8">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-[10px] font-black text-zinc-500 uppercase">
                                                    <span>{c.completion_rate}%</span>
                                                    <span>Load</span>
                                                </div>
                                                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_#3b82f6]"
                                                        style={{ width: `${c.completion_rate}%` }}
                                                    />
                                                </div>
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
        <div className="glass-card px-5 py-3 border border-[#9213ec]/20 shadow-[0_0_30px_rgba(146,19,236,0.1)]">
            <p className="text-[9px] font-black text-zinc-500 mb-1 uppercase tracking-[0.2em]">{label}</p>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                <p className="text-xl font-black text-white tracking-tight">{payload[0].value}</p>
                <span className="text-[8px] font-black text-zinc-600 uppercase">Unit Load</span>
            </div>
        </div>
    );
}

function EmailActivityChart({ data }: { data: any[] }) {
    return (
        <div className="glass-card p-8 group">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Engine Telemetry // 30 Days</h3>
                </div>
            </div>
            <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900, textAnchor: 'middle' }}
                            dy={20}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(146,19,236,0.1)", strokeWidth: 1 }} />
                        <Line
                            type="monotone"
                            dataKey="sent"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            dot={false}
                            activeDot={{ r: 8, fill: "#3b82f6", stroke: "#050505", strokeWidth: 4 }}
                            animationDuration={2500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
