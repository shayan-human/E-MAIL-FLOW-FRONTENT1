"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { toast } from "@/components/ui/toast-provider";
import { SimpleConfirmModal } from "@/components/ui/simple-confirm-modal";
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
    Eye,
    Copy,
    Check
} from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

interface CampaignDetail {
    id: string;
    name: string;
    status: string;
    subject: string;
    body: string;
    total_leads: number;
    created_at: string;
    user_id: string;
    sender_accounts: {
        sender_account: {
            email: string;
        };
    }[];
}

interface Lead {
    id: string;
    email: string;
    status: string;
    sent_at: string | null;
    replied_at: string | null;
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
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const handleCopyId = () => {
        if (campaign?.id) {
            navigator.clipboard.writeText(campaign.id);
            setCopied(true);
            toast.success("Campaign ID copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

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
            toast.error("Failed to load campaign data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
            toast.success(`Campaign ${newStatus === "PAUSED" ? "paused" : "resumed"}`);
            setCampaign({ ...campaign, status: newStatus });
        } catch {
            toast.error("Failed to update status");
        } finally {
            setSyncing(false);
        }
    };

    const handleDelete = async () => {
        setConfirmModalOpen(false);
        try {
            const { error } = await insforge.database
                .from("campaigns")
                .delete()
                .eq("id", campaignId);

            if (error) throw error;
            toast.success("Campaign deleted");
            router.push("/campaigns");
        } catch {
            toast.error("Failed to delete campaign");
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
            setIsEditingName(false);
            toast.success("Campaign name updated");
        } catch {
            toast.error("Failed to update name");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading campaign...</div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-muted-foreground">Campaign not found</p>
                <Link href="/campaigns" className="text-amber-500 hover:underline">
                    Back to Campaigns
                </Link>
            </div>
        );
    }

    const tooltipData = [
        { label: "Sent", value: stats.sent },
        { label: "Delivered", value: stats.delivered },
        { label: "Replies Received", value: stats.replied },
        { label: "Reply Rate", value: `${stats.replyRate}%` },
        { label: "Completion", value: `${stats.completion}%` },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <Link
                        href="/campaigns"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-white transition-colors group mb-1"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                        Campaigns
                    </Link>
                    <div className="flex items-center gap-3">
                        {isEditingName ? (
                            <input
                                autoFocus
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onBlur={handleNameUpdate}
                                onKeyDown={(e) => e.key === "Enter" && handleNameUpdate()}
                                className="text-2xl font-bold bg-transparent border-b border-amber-500 outline-none text-white"
                            />
                        ) : (
                            <h1
                                onClick={() => setIsEditingName(true)}
                                className="text-2xl font-bold text-white cursor-pointer hover:text-amber-500 transition-colors"
                            >
                                {campaign.name}
                            </h1>
                        )}
                        <StatusBadge status={campaign.status} />
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created on {new Date(campaign.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <button 
                            onClick={handleCopyId}
                            className="flex items-center gap-1 hover:text-amber-500 transition-colors"
                        >
                            <span className="font-mono">ID: {campaign.id.slice(0, 8)}...</span>
                            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleStatusToggle}
                        disabled={syncing}
                        className="btn-secondary h-9 px-4 text-xs flex items-center gap-2"
                    >
                        {campaign.status === "RUNNING" ? (
                            <><Pause className="w-3.5 h-3.5" /> Pause Campaign</>
                        ) : (
                            <><Play className="w-3.5 h-3.5" /> Resume Campaign</>
                        )}
                    </button>
                    <button
                        onClick={() => setConfirmModalOpen(true)}
                        className="btn-destructive h-9 px-4 text-xs flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                    <button
                        onClick={() => { setLoading(true); fetchData(); }}
                        className="p-2 rounded-md border border-[#222] bg-[#141414] hover:border-amber-500 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-muted-foreground ${syncing ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-[12px] p-4" style={{ backgroundColor: "#141414", border: "1px solid #222" }}>
                    <p className="text-xs text-muted-foreground mb-1">Total Leads</p>
                    <p className="text-2xl font-bold text-white">{campaign.total_leads}</p>
                </div>
                <div className="rounded-[12px] p-4" style={{ backgroundColor: "#141414", border: "1px solid #222" }}>
                    <p className="text-xs text-muted-foreground mb-1">Sent</p>
                    <p className="text-2xl font-bold text-emerald-500">{stats.sent}</p>
                </div>
                <div className="rounded-[12px] p-4" style={{ backgroundColor: "#141414", border: "1px solid #222" }}>
                    <p className="text-xs text-muted-foreground mb-1">Replies</p>
                    <p className="text-2xl font-bold text-amber-500">{stats.replied}</p>
                </div>
                <div className="rounded-[12px] p-4" style={{ backgroundColor: "#141414", border: "1px solid #222" }}>
                    <p className="text-xs text-muted-foreground mb-1">Reply Rate</p>
                    <p className="text-2xl font-bold text-amber-500">{stats.replyRate}%</p>
                </div>
            </div>

            {/* Chart */}
            <div className="rounded-[12px] p-6" style={{ backgroundColor: "#141414", border: "1px solid #222" }}>
                <h2 className="text-sm font-semibold text-white mb-4">Email Sent Over Time</h2>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis 
                                dataKey="date" 
                                stroke="#666" 
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                stroke="#666" 
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip 
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg bg-[#1f1f1f] border border-[#333] px-3 py-2 text-xs shadow-xl">
                                                <p className="font-medium text-white mb-1">{label}</p>
                                                <p className="text-amber-500 font-semibold">{payload[0].value} emails sent</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sent"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                dot={{ r: 0 }}
                                activeDot={{ r: 4, fill: "#F59E0B" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Replies */}
            {recentReplies.length > 0 && (
                <div className="rounded-[12px] p-6" style={{ backgroundColor: "#141414", border: "1px solid #222" }}>
                    <h2 className="text-sm font-semibold text-white mb-4">Recent Replies</h2>
                    <div className="space-y-3">
                        {recentReplies.map((reply: any) => (
                            <div 
                                key={reply.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a]"
                            >
                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{reply.email}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(reply.replied_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Leads Table */}
            <div className="rounded-[12px] overflow-hidden" style={{ backgroundColor: "#141414", border: "1px solid #222" }}>
                <div className="px-6 py-4 border-b border-[#1f1f1f]">
                    <h2 className="text-sm font-semibold text-white">Leads</h2>
                </div>
                {leads.length > 0 && (
                    <>
                        {(() => {
                            const sent = leads.filter(l => l.status === 'SENT' || l.status === 'REPLIED').length;
                            const failed = leads.filter(l => l.status === 'FAILED').length;
                            const blocked = leads.filter(l => l.status === 'BLOCKED').length;
                            const pending = leads.filter(l => l.status === 'PENDING').length;
                            return (
                                <div className="px-6 py-2 border-b border-[#1f1f1f] text-[11px]">
                                    <span className="text-muted-foreground">
                                        {sent} sent ·{' '}
                                        {failed > 0 ? (
                                            <span style={{ color: '#ff4444' }}>{failed} failed</span>
                                        ) : (
                                            '0 failed'
                                        )}
                                        {blocked > 0 ? (
                                            <> · <span style={{ color: '#ff4444' }}>{blocked} blocked</span></>
                                        ) : null}
                                        {' · '}{pending} pending
                                    </span>
                                </div>
                            );
                        })()}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[#1f1f1f]">
                                        <th className="text-left py-3 px-6 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Email Address</th>
                                        <th className="text-left py-3 px-6 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-6 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sent At</th>
                                        <th className="text-right py-3 px-6 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Replied</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.slice(0, 50).map((lead) => (
                                        <tr key={lead.id} className="border-b border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors">
                                            <td className="py-3 px-6 text-white">{lead.email}</td>
                                            <td className="py-3 px-6">
                                                <LeadStatusBadge status={lead.status} />
                                            </td>
                                            <td className="py-3 px-6 text-muted-foreground">
                                                {lead.sent_at ? new Date(lead.sent_at).toLocaleString() : '-'}
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                {lead.status === 'REPLIED' ? (
                                                    <span className="text-amber-500">✓</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {leads.length > 50 && (
                            <div className="px-6 py-3 text-xs text-muted-foreground">
                                Showing 50 of {leads.length} leads
                            </div>
                        )}
                    </>
                )}
                {leads.length === 0 && (
                    <div className="px-6 py-12 text-center text-muted-foreground">
                        No leads yet
                    </div>
                )}

                <SimpleConfirmModal
                    open={confirmModalOpen}
                    title="Delete Campaign"
                    message="Are you sure you want to delete this campaign? Your leads and send history will also be permanently removed."
                    confirmText="Delete Campaign"
                    cancelText="Cancel"
                    variant="danger"
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmModalOpen(false)}
                />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        DRAFT: { bg: "bg-zinc-800/50", text: "text-zinc-400", label: "Draft" },
        RUNNING: { bg: "bg-amber-500/10", text: "text-amber-500", label: "Active" },
        PAUSED: { bg: "bg-zinc-800/50", text: "text-zinc-400", label: "Paused" },
        COMPLETED: { bg: "bg-emerald-500/10", text: "text-emerald-500", label: "Completed" },
    };
    const c = config[status] || config.DRAFT;
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text} border border-white/[0.03]`}>
            {c.label}
        </span>
    );
}

function LeadStatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        PENDING: { bg: "bg-zinc-800", text: "text-zinc-500", label: "Pending" },
        SENT: { bg: "bg-emerald-500/10", text: "text-emerald-500", label: "Sent" },
        REPLIED: { bg: "bg-amber-500/10", text: "text-amber-500", label: "Replied" },
        FAILED: { bg: "#2a1010", text: "#ff4444", label: "Failed" },
        BLOCKED: { bg: "#2a1010", text: "#ff4444", label: "Blocked" },
    };
    const c = config[status] || config.PENDING;
    return (
        <span 
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium leading-none"
            style={{ backgroundColor: c.bg, color: c.text }}
        >
            {c.label}
        </span>
    );
}
