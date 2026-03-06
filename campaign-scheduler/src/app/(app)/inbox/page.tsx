"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/toast-provider";
import {
    Loader2,
    Search,
    Mail,
    MessageSquareText,
    RefreshCw,
    Activity,
    Terminal,
    Wifi,
    Database,
    Zap,
    Radio,
    ShieldAlert,
    Cpu,
    ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReplyThread {
    id: string;
    senderEmail: string;
    campaignName: string;
    subject: string;
    preview: string;
    fullBody: string;
    timestamp: string;
    isRead: boolean;
    leadId: string;
}

export default function InboxPage() {
    const [threads, setThreads] = useState<ReplyThread[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showOriginal, setShowOriginal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchReplies = async () => {
        try {
            const res = await fetch("/api/inbox");
            const data = await res.json();
            if (data.replies) {
                setThreads(data.replies);
            }
        } catch (error) {
            console.error("PROTOCOL_ERROR: INBOX_FETCH_FAILED", error);
            toast.error("SIGNAL_LOSS: INBOX_UNREACHABLE");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReplies();

        const pollInterval = setInterval(() => {
            fetchReplies();
        }, 30 * 1000);

        const syncInterval = setInterval(async () => {
            try {
                const res = await fetch("/api/campaign/sync-replies", { method: "POST" });
                if (res.ok) await fetchReplies();
            } catch {
                // Background silencer active
            }
        }, 2 * 60 * 1000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(syncInterval);
        };
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        toast.info("INITIATING_SYNC_SEQUENCE...");
        try {
            const res = await fetch("/api/campaign/sync-replies", { method: "POST" });
            if (!res.ok) throw new Error("SYNC_FAULT");
            await fetchReplies();
            toast.success("MATRIX_SYNCHRONIZED");
        } catch (error) {
            console.error("SYNC_ERROR", error);
            toast.error("PROTOCOL_ERROR: SYNC_INTERRUPTED");
        } finally {
            setSyncing(false);
        }
    };

    const handleSelectThread = async (thread: ReplyThread) => {
        setSelectedId(thread.id);
        setShowOriginal(false);

        if (!thread.isRead) {
            try {
                setThreads(prev =>
                    prev.map(t => t.id === thread.id ? { ...t, isRead: true } : t)
                );
                await fetch(`/api/inbox/${thread.id}/read`, { method: "POST" });
            } catch (error) {
                console.error("READ_STATE_FAULT", error);
            }
        }
    };

    const unreadCount = threads.filter(t => !t.isRead).length;
    const selected = threads.find(t => t.id === selectedId) || null;

    const filtered = threads.filter(t =>
        t.senderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] bg-black/40 border border-white/5 rounded-[2.5rem] animate-pulse">
                <Cpu className="w-8 h-8 text-blue-500 mb-4" />
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Calibrating_Matrix // Signal_Wait</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ── Signal_Stream Panel ─────────────────────────── */}
            <div className="w-[400px] flex flex-col bg-black/20 border border-white/5 rounded-[2.5rem] overflow-hidden group">
                {/* Panel Header */}
                <div className="px-8 pt-8 pb-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <Wifi className="w-4 h-4 text-blue-500 shadow-[0_0_8px_#3b82f6]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Signal_Stream</h2>
                                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mt-1">Ingress // {threads.length} Nodes</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 text-white ${syncing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Search Component */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                        <input
                            type="text"
                            placeholder="FILTER_MATRIX..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 bg-black/40 border border-white/5 rounded-2xl pl-11 pr-4 text-[10px] font-black text-white placeholder:text-zinc-700 uppercase tracking-widest focus:border-blue-500/50 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Signals Queue */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                            <Radio className="w-10 h-10 text-zinc-500 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No_Active_Signals</p>
                        </div>
                    ) : (
                        filtered.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => handleSelectThread(thread)}
                                className={`w-full text-left p-6 rounded-[1.5rem] border transition-all relative overflow-hidden group/item ${selectedId === thread.id
                                        ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.05)]"
                                        : "bg-white/5 border-white/5 hover:border-white/10"
                                    }`}
                            >
                                {!thread.isRead && (
                                    <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-bl-lg bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                                )}

                                <div className="flex items-start justify-between gap-4 relative z-10">
                                    <div className="min-w-0">
                                        <p className={`text-[10px] font-black uppercase tracking-widest truncate ${thread.isRead ? 'text-zinc-500' : 'text-white'}`}>
                                            {thread.senderEmail}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-tight truncate max-w-[150px]">
                                                {thread.campaignName}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-tighter shrink-0 mt-1">
                                        {formatDistanceToNow(new Date(thread.timestamp), { addSuffix: false })} // AGO
                                    </span>
                                </div>
                                <p className={`text-[11px] font-medium mt-3 line-clamp-2 leading-relaxed ${thread.isRead ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                    {thread.preview}
                                </p>

                                {selectedId === thread.id && (
                                    <div className="absolute bottom-0 left-0 h-[1px] bg-blue-500/50 w-full" />
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* ── Signal_Analyzer Panel ───────────────────────── */}
            <div className="flex-1 flex flex-col bg-black/20 border border-white/5 rounded-[2.5rem] overflow-hidden relative">
                {!selected ? (
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_center,_#3b82f6_0%,_transparent_70%)]" />
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6 relative">
                            <Activity className="w-8 h-8 text-zinc-700 animate-pulse" />
                            <div className="absolute inset-0 border border-blue-500/20 rounded-full animate-ping [animation-duration:3s]" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Select_Node // Read_Output</h3>
                        <p className="text-[9px] font-black text-zinc-600 uppercase mt-2 tracking-widest">Connect to a signal node to decode payload</p>
                    </div>
                ) : (
                    <>
                        {/* Analyzer Header */}
                        <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Terminal className="w-4 h-4 text-blue-500" />
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Decoding_Sequence</span>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                                            {selected.senderEmail}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-4">
                                            <span className="text-[10px] font-black text-blue-500/70 uppercase tracking-widest bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10">
                                                ID: {selected.id.slice(0, 8)}
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                                {selected.subject}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest p-2 border border-white/5 rounded-xl">
                                        TS: {new Date(selected.timestamp).getTime()}
                                    </span>
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                        LINK_ESTABLISHED
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Analysis Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                            {(() => {
                                const quotedPattern = /\r?\nOn [\s\S]+?wrote:\r?\n/;
                                const match = selected.fullBody.match(quotedPattern);
                                const replyText = match
                                    ? selected.fullBody.slice(0, selected.fullBody.indexOf(match[0])).trim()
                                    : selected.fullBody.trim();
                                const quotedText = match
                                    ? selected.fullBody.slice(selected.fullBody.indexOf(match[0])).trim()
                                    : null;

                                return (
                                    <div className="max-w-3xl">
                                        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 relative group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                                <Zap className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div className="text-[14px] font-medium leading-relaxed text-zinc-300 whitespace-pre-wrap font-mono">
                                                {replyText}
                                            </div>
                                        </div>

                                        {quotedText && (
                                            <div className="mt-8">
                                                <button
                                                    onClick={() => setShowOriginal(v => !v)}
                                                    className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] hover:text-white transition-colors pl-4"
                                                >
                                                    {showOriginal ? (
                                                        <>CLOSE_ARCHIVE <ArrowRight className="w-3 h-3 rotate-90" /></>
                                                    ) : (
                                                        <>ACCESS_HISTORICAL_LOGS <ArrowRight className="w-3 h-3" /></>
                                                    )}
                                                </button>
                                                {showOriginal && (
                                                    <div className="mt-6 p-8 rounded-[2rem] bg-black/40 border-l-2 border-zinc-800 text-[12px] leading-relaxed text-zinc-600 whitespace-pre-wrap font-mono">
                                                        {quotedText}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Status Guard */}
                        <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    NODE_STATUS: READ_ONLY_TRANSFORM
                                </p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Database className="w-3.5 h-3.5 text-zinc-700" />
                                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">STORAGE_STABLE</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-3.5 h-3.5 text-blue-500/50" />
                                    <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest">ENCRYPTION_ACTIVE</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

