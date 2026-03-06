"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { toast } from "@/components/ui/toast-provider";
import Link from "next/link";
import {
    ArrowLeft,
    RefreshCw,
    Pause,
    Play,
    Trash2,
    Calendar,
    Mail,
    User,
    Clock,
    CheckCircle2,
    ChevronRight,
    ExternalLink,
    Zap,
    Cpu,
    Target,
    Activity,
    Shield
} from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

interface Lead {
    id: string;
    email: string;
    status: string;
    sent_at: string | null;
    replied_at: string | null;
}

interface CampaignDetail {
    id: string;
    name: string;
    status: string;
    subject: string;
    total_leads: number;
    created_at: string;
    daily_limit: number;
    user_id: string;
    sender_accounts: any[];
}

function StatGauge({ value, label, color = "#3b82f6", icon: Icon }: { value: string | number, label: string, color?: string, icon: any }) {
    return (
        <div className="glass-card p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 block mb-2">{label}</span>
            <div className="flex items-end gap-2">
                <span className="text-4xl font-black font-outfit text-white tracking-tighter">{value}</span>
            </div>
            <div className="mt-4 h-1 w-12 rounded-full overflow-hidden bg-zinc-900">
                <div className="h-full rounded-full" style={{ backgroundColor: color, width: '60%', boxShadow: `0 0 8px ${color}` }} />
            </div>
        </div>
    );
}

export default function CampaignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
    const [stats, setStats] = useState({
        sent: 0,
        delivered: 0,
        replied: 0,
        replyRate: 0,
        completion: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [recentReplies, setRecentReplies] = useState<any[]>([]);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState("");

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/campaigns/${campaignId}/stats`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setCampaign(data.campaign);
            setEditedName(data.campaign.name);
            setStats(data.stats);
            setChartData(data.chartData || []);
            setLeads(data.leads || []);
            setRecentReplies(data.recentReplies || []);
        } catch (err) {
            console.error("Error fetching campaign details:", err);
            toast.error("Telemetry link lost.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (campaignId) fetchData();
    }, [campaignId]);

    const handleStatusToggle = async () => {
        if (!campaign) return;
        const newStatus = campaign.status === "RUNNING" ? "PAUSED" : "RUNNING";
        setSyncing(true);
        try {
            const { error } = await insforge.database
                .from("campaigns")
                .update({ status: newStatus })
                .eq("id", campaignId);

            if (error) throw error;
            toast.success(`Unit State: ${newStatus}`);
            setCampaign({ ...campaign, status: newStatus });
        } catch {
            toast.error("State toggle failed.");
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("WIPE UNIT_DATA ENTIRELY? This cannot be undone.")) return;
        try {
            const { error } = await insforge.database
                .from("campaigns")
                .delete()
                .eq("id", campaignId);

            if (error) throw error;
            toast.success("Unit purged.");
            router.push("/campaigns");
        } catch {
            toast.error("Purge encountered error.");
        }
    };

    const handleNameUpdate = async () => {
        if (!campaign || editedName === campaign.name) {
            setIsEditingName(false);
            return;
        }
        try {
            const { error } = await insforge.database
                .from("campaigns")
                .update({ name: editedName })
                .eq("id", campaignId);

            if (error) throw error;
            setCampaign({ ...campaign, name: editedName });
            toast.success("Designation updated.");
        } catch {
            toast.error("Recall failed.");
            setEditedName(campaign.name);
        } finally {
            setIsEditingName(false);
        }
    };

    if (loading) return <div className="p-8 space-y-8">
        <div className="h-24 glass-card animate-pulse" />
        <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 glass-card animate-pulse" />)}
        </div>
    </div>;

    if (!campaign) return <div className="p-24 text-center text-zinc-700 font-black uppercase tracking-[0.5em]">Unit Null_Defined</div>;

    return (
        <div className="space-y-10 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 p-10 bg-black/40 border border-white/5 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/[0.02]" />
                <div className="relative z-10 flex flex-col gap-4">
                    <Link
                        href="/campaigns"
                        className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" /> Back to Console
                    </Link>
                    <div className="flex items-center gap-6">
                        {isEditingName ? (
                            <input
                                autoFocus
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onBlur={handleNameUpdate}
                                onKeyDown={(e) => e.key === "Enter" && handleNameUpdate()}
                                className="text-4xl font-black font-outfit uppercase bg-transparent border-b-2 border-blue-500 outline-none text-white px-0 tracking-tighter"
                            />
                        ) : (
                            <h1
                                onClick={() => setIsEditingName(true)}
                                className="text-5xl font-black font-outfit tracking-tighter text-white uppercase cursor-pointer hover:text-blue-500 transition-all"
                            >
                                {campaign.name || "UNNAMED_UNIT"}
                            </h1>
                        )}
                        <StatusBadge status={campaign.status} />
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] opacity-60">
                        <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Established_{new Date(campaign.created_at).toLocaleDateString()}
                        </span>
                        <span>//</span>
                        <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" /> SECURE_NODE_{campaign.id.slice(0, 8).toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={handleStatusToggle}
                        disabled={syncing}
                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                        {campaign.status === "RUNNING" ? (
                            <div className="flex items-center gap-3"><Pause className="w-3.5 h-3.5" /> KILL CYCLE</div>
                        ) : (
                            <div className="flex items-center gap-3"><Play className="w-3.5 h-3.5" /> BOOT ENGINE</div>
                        )}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> PURGE_MEMORY
                    </button>
                    <button
                        onClick={() => { setLoading(true); fetchData(); }}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:border-blue-500 transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Matrix Data Row */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                <StatGauge label="Loaded Pkgs" value={stats.sent} icon={Target} color="#3b82f6" />
                <StatGauge label="Delivered" value={stats.delivered} icon={CheckCircle2} color="#10b981" />
                <StatGauge label="Hit Return" value={stats.replied} icon={Zap} color="#9213ec" />
                <StatGauge label="Efficiency" value={`${stats.replyRate}%`} icon={Activity} color="#10b981" />
                <StatGauge label="Load Cycle" value={`${stats.completion}%`} icon={Cpu} color="#3b82f6" />
            </div>

            {/* Telemetry Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Analytics */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="glass-card p-10 group overflow-hidden relative">
                        <div className="absolute inset-0 bg-blue-600/[0.01]" />
                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div className="flex items-center gap-4">
                                <Activity className="w-4 h-4 text-blue-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Unit Telemetry // Active Feed</h3>
                            </div>
                        </div>
                        <div className="h-[320px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900 }}
                                        dy={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9, fontWeight: 900 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(59,130,246,0.1)", strokeWidth: 1 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="sent"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        dot={false}
                                        activeDot={{ r: 8, fill: "#3b82f6", stroke: "#050505", strokeWidth: 4 }}
                                        animationDuration={3000}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Operational Console (Table) */}
                    <div className="glass-card overflow-hidden">
                        <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <Target className="w-4 h-4 text-zinc-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Operational Targets</h3>
                            </div>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Logged_{leads.length}_Nodes</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 bg-white/[0.01] border-b border-white/5">
                                    <tr>
                                        <th className="py-6 px-10">Target Unit</th>
                                        <th className="py-6 px-6">State</th>
                                        <th className="py-6 px-6">Transmission</th>
                                        <th className="py-6 px-10 text-right">Hit_Back?</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leads.length > 0 ? leads.map((lead) => (
                                        <tr
                                            key={lead.id}
                                            className="hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="py-6 px-10 text-[13px] font-black text-white/90">{lead.email}</td>
                                            <td className="py-6 px-6">
                                                <LeadStatusBadge status={lead.status} />
                                            </td>
                                            <td className="py-6 px-6 text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
                                                {lead.sent_at ? new Date(lead.sent_at).toLocaleString() : "--- WAITING ---"}
                                            </td>
                                            <td className="py-6 px-10 text-right">
                                                {lead.status === "REPLIED" ? (
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(16,185,129,0.2)] bg-emerald-500/10 px-3 py-1 rounded-full">
                                                        CONFIRMED
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">VOID</span>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="py-24 text-center text-zinc-700 font-black uppercase text-[10px] tracking-[0.5em]">
                                                No Targets Detected in Range
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sub-Systems */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Kernel Configuration */}
                    <div className="glass-card overflow-hidden">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Kernel Config</h3>
                            <Shield className="w-4 h-4 text-blue-500 opacity-50" />
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Node_Authorized
                                </label>
                                <div className="space-y-2">
                                    {(campaign.sender_accounts || []).map((acc: any) => (
                                        <div key={acc.sender_account.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-blue-500/50 transition-all">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-[12px] shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                                {acc.sender_account.email.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-[11px] font-black text-white/70 truncate tracking-tight">{acc.sender_account.email}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 pt-4 border-t border-white/5">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Payload Throughput</label>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <Zap className="w-3.5 h-3.5 text-emerald-500" />
                                        </div>
                                        <span className="text-xl font-black text-white font-outfit tracking-tighter">{campaign.daily_limit} <span className="text-[10px] text-zinc-600 uppercase ml-1">Daily_Hits</span></span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Transmitted Designation</label>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <Mail className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        <span className="text-sm font-black text-white/60 font-outfit tracking-tight truncate italic">"{campaign.subject}"</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Comms-Feed */}
                    <div className="glass-card overflow-hidden">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-3">
                                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Feedback Logic</h3>
                            </div>
                            <Link href="/inbox" className="text-[9px] font-black text-blue-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                                OPEN_BRIDGE <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-white/5">
                            {recentReplies.length > 0 ? recentReplies.map((reply: any) => (
                                <Link
                                    key={reply.id}
                                    href={`/inbox?threadId=${reply.gmail_thread_id}`}
                                    className="block p-6 hover:bg-white/[0.02] transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-black text-white group-hover:text-blue-500 transition-colors uppercase tracking-widest truncate max-w-[150px]">{reply.email}</span>
                                        <span className="text-[9px] font-black text-zinc-600 uppercase">
                                            {new Date(reply.replied_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                                        <span className="truncate opacity-60">LINK_ACK_{campaign.name.slice(0, 15)}</span>
                                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </Link>
                            )) : (
                                <div className="p-16 text-center text-zinc-700 font-black uppercase text-[10px] tracking-[0.5em]">
                                    SILENCE REIGNING
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'RUNNING') {
        return (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
                ACTIVE_ENGINE
            </span>
        );
    }

    if (status === 'COMPLETED') {
        return (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                FINISHED_CYCLE
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] bg-zinc-900 text-zinc-500 border border-white/5 uppercase">
            {status}
        </span>
    );
}

function LeadStatusBadge({ status }: { status: string }) {
    const config: Record<string, { color: string; bg: string; label: string }> = {
        PENDING: { color: "text-zinc-600", bg: "bg-zinc-900 border-zinc-800", label: "STANDBY" },
        SENT: { color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", label: "TRANSMITTED" },
        REPLIED: { color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", label: "ACKNOWLEDGED" },
        FAILED: { color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", label: "FAULT" },
    };
    const c = config[status || "PENDING"];
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black tracking-widest border ${c.bg} ${c.color}`}>
            {c.label}
        </span>
    );
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-card px-5 py-3 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <p className="text-[9px] font-black text-zinc-500 mb-1 uppercase tracking-[0.2em]">{label}</p>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <p className="text-xl font-black text-white tracking-tight">{payload[0].value}</p>
                <span className="text-[8px] font-black text-zinc-600 uppercase">Load Dispatch</span>
            </div>
        </div>
    );
}
