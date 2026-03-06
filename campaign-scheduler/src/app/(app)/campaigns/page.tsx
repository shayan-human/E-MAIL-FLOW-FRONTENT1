"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { useUser } from "@insforge/nextjs";
import { toast } from "@/components/ui/toast-provider";
import Link from "next/link";
import {
    Plus,
    Megaphone,
    MoreHorizontal,
    Eye,
    Pause,
    Trash2,
    Cpu,
    Zap,
    Target,
    Activity
} from "lucide-react";

interface CampaignRow {
    id: string;
    name: string;
    status: string;
    total_leads: number;
    subject: string | null;
    created_at: string;
    sent_count: number;
    reply_count: number;
    reply_rate: number;
}

const TABS = [
    { key: "All", label: "Global Archive" },
    { key: "RUNNING", label: "Active Engines" },
    { key: "COMPLETED", label: "Finished Cycles" },
    { key: "PAUSED", label: "Idle State" },
] as const;

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
                ACTIVE
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

function ProgressRing({ value }: { value: number }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 max-w-[80px] h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_#3b82f6]"
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="text-[10px] font-black text-zinc-500">{value}%</span>
        </div>
    );
}

function ActionMenu({
    campaign,
    onPause,
    onDelete,
}: {
    campaign: CampaignRow;
    onPause: (id: string, status: string) => void;
    onDelete: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-zinc-500 hover:text-white transition-all border border-white/5"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl py-2 z-50 shadow-2xl glass-card border border-white/10"
                >
                    <Link
                        href={`/campaigns/${campaign.id}`}
                        className="flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        onClick={() => setOpen(false)}
                    >
                        <Eye className="w-3.5 h-3.5" /> Initialize View
                    </Link>
                    {(campaign.status === "RUNNING" || campaign.status === "PAUSED" || campaign.status === "DRAFT") && (
                        <button
                            onClick={() => {
                                onPause(campaign.id, campaign.status === "RUNNING" ? "PAUSED" : "RUNNING");
                                setOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <Pause className="w-3.5 h-3.5" />
                            {campaign.status === "RUNNING" ? "Kill Cycle" : "Boot Engine"}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onDelete(campaign.id);
                            setOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all border-t border-white/5 mt-1"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Purge Memory
                    </button>
                </div>
            )}
        </div>
    );
}

export default function CampaignsPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("All");

    const fetchCampaigns = async () => {
        if (!user) return;
        try {
            const [campaignsRes, leadsRes] = await Promise.all([
                insforge.database
                    .from("campaigns")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false }),
                insforge.database
                    .from("leads")
                    .select("campaign_id, status")
                    .in("status", ["SENT", "REPLIED"]),
            ]);

            if (campaignsRes.error) throw campaignsRes.error;
            if (!campaignsRes.data) return;

            const sentMap: Record<string, number> = {};
            const repliedMap: Record<string, number> = {};
            for (const lead of (leadsRes.data || [])) {
                if (lead.status === "SENT" || lead.status === "REPLIED") {
                    sentMap[lead.campaign_id] = (sentMap[lead.campaign_id] || 0) + 1;
                }
                if (lead.status === "REPLIED") {
                    repliedMap[lead.campaign_id] = (repliedMap[lead.campaign_id] || 0) + 1;
                }
            }

            const enriched: CampaignRow[] = campaignsRes.data.map((c: any) => {
                const sent = sentMap[c.id] || 0;
                const replied = repliedMap[c.id] || 0;
                const replyRate = sent > 0 ? Math.round((replied / sent) * 100) : 0;
                return { ...c, sent_count: sent, reply_count: replied, reply_rate: replyRate };
            });

            setCampaigns(enriched);
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Telemetry link lost.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) fetchCampaigns();
    }, [isLoaded]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const { error } = await insforge.database
                .from("campaigns")
                .update({ status: newStatus })
                .eq("id", id);
            if (error) throw error;
            toast.success(`Engine Reconfigured: ${newStatus}`);
            setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch {
            toast.error("Status lock failed.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Confirm complete data purge? This action is IRREVERSIBLE.")) return;
        try {
            const { error } = await insforge.database.from("campaigns").delete().eq("id", id);
            if (error) throw error;
            toast.success("Memory purged.");
            setCampaigns(campaigns.filter(c => c.id !== id));
        } catch {
            toast.error("Purge interrupted.");
        }
    };

    const filtered = filter === "All" ? campaigns : campaigns.filter(c => c.status === filter);

    return (
        <div className="space-y-10 pb-20">
            {/* Engine Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-black/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <h1 className="text-4xl font-outfit font-black tracking-tighter text-white uppercase">Deployment Console</h1>
                    </div>
                    <p className="text-zinc-500 font-black text-[10px] tracking-[0.3em] uppercase opacity-60">Archive Monitoring // Sequence Control</p>
                </div>
                <Link
                    href="/campaigns/new"
                    className="relative z-10 px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                    <Plus className="w-3.5 h-3.5 inline-block mr-2" />
                    Initialize New Unit
                </Link>
            </div>

            {/* Matrix Tabs */}
            <div className="flex items-center gap-8 px-4">
                {TABS.map((tab) => {
                    const isActive = filter === tab.key;
                    const count = tab.key === "All"
                        ? campaigns.length
                        : campaigns.filter(c => c.status === tab.key).length;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`relative pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            {tab.label}
                            {count > 0 && <span className="ml-2 opacity-40">[{count}]</span>}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Console Content */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 glass-card animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-24 text-center">
                    <Megaphone className="w-16 h-16 text-zinc-900 mx-auto mb-8 opacity-20" />
                    <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-[12px]">No Active Sequences Detected</p>
                    <Link href="/campaigns/new" className="inline-block mt-10 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">
                        Start First Deployment //
                    </Link>
                </div>
            ) : (
                <div className="glass-card overflow-hidden rounded-[2.5rem]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 border-b border-white/5 bg-white/[0.01]">
                                <tr>
                                    <th className="py-6 px-10">Unit Identifier</th>
                                    <th className="py-6 px-4">State</th>
                                    <th className="py-6 px-4 text-center">Throughput</th>
                                    <th className="py-6 px-4 text-center">Hits</th>
                                    <th className="py-6 px-4 text-center">Efficiency</th>
                                    <th className="py-6 px-4">Cycle Progress</th>
                                    <th className="py-6 px-10 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map((c) => {
                                    const completionRate = c.total_leads > 0
                                        ? Math.round((c.sent_count / c.total_leads) * 100)
                                        : 0;
                                    return (
                                        <tr
                                            key={c.id}
                                            className="hover:bg-white/[0.02] transition-all group cursor-pointer"
                                            onClick={() => router.push(`/campaigns/${c.id}`)}
                                        >
                                            <td className="py-8 px-10">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                                                        {c.name || "UNNAMED_UNIT"}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-zinc-600 uppercase mt-1 tracking-widest">
                                                        SEQ_{c.id.slice(0, 8).toUpperCase()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-8 px-4">
                                                <StatusBadge status={c.status} completion={completionRate} />
                                            </td>
                                            <td className="py-8 px-4 text-center">
                                                <span className="text-xs font-black text-zinc-300">{c.sent_count}</span>
                                            </td>
                                            <td className="py-8 px-4 text-center">
                                                <span className={`text-xs font-black ${c.reply_count > 0 ? 'text-blue-500' : 'text-zinc-700'}`}>
                                                    {c.reply_count}
                                                </span>
                                            </td>
                                            <td className="py-8 px-4 text-center">
                                                <span className={`text-xs font-black ${c.reply_rate > 0 ? 'text-emerald-500' : 'text-zinc-700'}`}>
                                                    {c.reply_rate}%
                                                </span>
                                            </td>
                                            <td className="py-8 px-4">
                                                <ProgressRing value={completionRate} />
                                            </td>
                                            <td className="py-8 px-10 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-center">
                                                    <ActionMenu
                                                        campaign={c}
                                                        onPause={handleStatusChange}
                                                        onDelete={handleDelete}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
