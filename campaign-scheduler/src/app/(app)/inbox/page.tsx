"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { toast } from "@/components/ui/toast-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, Mail, MessageSquareText, RefreshCw, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ReplyThread {
    id: string;
    senderEmail: string;
    campaignName: string;
    campaignId?: string;
    subject: string;
    preview: string;
    fullBody: string;
    timestamp: string;
    isRead: boolean;
    leadId: string;
    gmailThreadId?: string;
}

export default function InboxPage() {
    const [threads, setThreads] = useState<ReplyThread[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showOriginal, setShowOriginal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const threadIdParam = searchParams.get("threadId");

    const fetchReplies = async () => {
        try {
            const res = await fetch("/api/inbox");
            const data = await res.json();
            if (data.replies) {
                setThreads(data.replies);
            }
        } catch (error) {
            console.error("Error fetching replies:", error);
            toast.error("Failed to load inbox");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReplies();

        // Auto-refresh inbox data every 30 seconds
        const pollInterval = setInterval(() => {
            fetchReplies();
        }, 30 * 1000);

        // Auto-sync replies from Gmail every 2 minutes
        const syncInterval = setInterval(async () => {
            try {
                const res = await fetch("/api/campaign/sync-replies", { method: "POST" });
                if (res.ok) await fetchReplies();
            } catch {
                // Silent fail
            }
        }, 2 * 60 * 1000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(syncInterval);
        };
    }, []);

    useEffect(() => {
        if (threadIdParam && threads.length > 0 && !selectedId) {
            const thread = threads.find(t => t.gmailThreadId === threadIdParam);
            if (thread) {
                setSelectedId(thread.id);
            }
        }
    }, [threadIdParam, threads, selectedId]);

    const handleSync = async () => {
        setSyncing(true);
        toast.info("Syncing new replies...");
        try {
            const res = await fetch("/api/campaign/sync-replies", { method: "POST" });
            if (!res.ok) throw new Error("Sync failed");
            await fetchReplies();
            toast.success("Inbox is up to date");
        } catch (error) {
            console.error("Error syncing replies:", error);
            toast.error("Failed to sync replies");
        } finally {
            setSyncing(false);
        }
    };

    const handleSelectThread = async (thread: ReplyThread) => {
        setSelectedId(thread.id);
        setShowOriginal(false); // always collapse quoted text on selection

        if (!thread.isRead) {
            try {
                // Optimistically update UI
                setThreads(prev =>
                    prev.map(t => t.id === thread.id ? { ...t, isRead: true } : t)
                );

                await fetch(`/api/inbox/${thread.id}/read`, { method: "POST" });
            } catch (error) {
                console.error("Error marking as read:", error);
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
            <div className="flex items-center justify-center h-[calc(100vh-120px)] bg-[#141414] border border-[#222] rounded-[10px]">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div
            className="flex rounded-[10px] overflow-hidden"
            style={{
                backgroundColor: "#141414",
                border: "1px solid #222222",
                height: "calc(100vh - 120px)",
            }}
        >
            {/* ── Left Column: Thread list ─────────────────────────── */}
            <div
                className="flex flex-col shrink-0"
                style={{ width: 360, borderRight: "1px solid #222222" }}
            >
                {/* Header */}
                <div className="px-4 pt-4 pb-3 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-[16px] font-semibold text-white">Inbox</h2>
                        </div>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="p-1.5 rounded-md hover:bg-[#222] transition-colors disabled:opacity-50"
                            title="Sync Replies"
                        >
                            <RefreshCw className={`w-4 h-4 text-muted-foreground ${syncing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                            style={{ color: "#555" }}
                        />
                        <input
                            type="text"
                            placeholder="Search replies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg text-[12px] text-white placeholder:text-[#555] outline-none transition-colors focus:ring-1 focus:ring-[#333]"
                            style={{ backgroundColor: "#1a1a1a", border: "1px solid #222" }}
                        />
                    </div>
                </div>

                {/* Thread list */}
                <div className="flex-1 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Mail className="w-6 h-6 mb-2" style={{ color: "#333" }} />
                            <p className="text-[12px]" style={{ color: "#555" }}>No replies found</p>
                        </div>
                    ) : (
                        filtered.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => handleSelectThread(thread)}
                                className="w-full text-left px-4 py-3 transition-colors"
                                style={{
                                    borderBottom: "1px solid #1a1a1a",
                                    backgroundColor: selectedId === thread.id
                                        ? "#1a1a1a"
                                        : "transparent",
                                }}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <p
                                            className="text-[13px] truncate font-normal"
                                            style={{ color: thread.isRead ? "#888" : "#fff" }}
                                        >
                                            {thread.senderEmail}
                                        </p>
                                    </div>
                                    <span className="text-[10px] shrink-0 mt-0.5" style={{ color: "#555" }}>
                                        {formatDistanceToNow(new Date(thread.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-[11px] mt-0.5 truncate" style={{ color: "#555" }}>
                                    {thread.campaignName}
                                </p>
                                <p className="text-[12px] mt-1 line-clamp-1" style={{ color: "#777" }}>
                                    {thread.preview}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* ── Right Column: Email viewer ───────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">
                {!selected ? (
                    /* Empty state */
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                            style={{ backgroundColor: "#1a1a1a" }}
                        >
                            <MessageSquareText className="w-6 h-6" style={{ color: "#555" }} />
                        </div>
                        <p className="text-[14px] font-medium text-white">Select a reply to read</p>
                        <p className="text-[12px] mt-1" style={{ color: "#555" }}>
                            Click on a thread from the left to view it here
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Email header */}
                        <div className="px-6 py-4 shrink-0" style={{ borderBottom: "1px solid #1f1f1f" }}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[15px] font-semibold text-white">
                                        {selected.senderEmail}
                                    </p>
                                    <p className="text-[12px] mt-1" style={{ color: "#888" }}>
                                        {selected.subject}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {selected.campaignId && (
                                        <button
                                            onClick={() => router.push(`/campaigns/${selected.campaignId}`)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors hover:bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            View Campaign
                                        </button>
                                    )}
                                    <span className="text-[11px] shrink-0" style={{ color: "#555" }}>
                                        {formatDistanceToNow(new Date(selected.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Email body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {(() => {
                                // Split body at the quoted original email line
                                const quotedPattern = /\r?\nOn [\s\S]+?wrote:\r?\n/;
                                const match = selected.fullBody.match(quotedPattern);
                                const replyText = match
                                    ? selected.fullBody.slice(0, selected.fullBody.indexOf(match[0])).trim()
                                    : selected.fullBody.trim();
                                const quotedText = match
                                    ? selected.fullBody.slice(selected.fullBody.indexOf(match[0])).trim()
                                    : null;

                                return (
                                    <>
                                        <div
                                            className="text-[13px] leading-relaxed whitespace-pre-wrap"
                                            style={{ color: "#d4d4d4" }}
                                        >
                                            {replyText}
                                        </div>
                                        {quotedText && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => setShowOriginal(v => !v)}
                                                    className="text-[11px] px-2 py-1 rounded transition-colors"
                                                    style={{
                                                        color: "#666",
                                                        border: "1px solid #333",
                                                        backgroundColor: showOriginal ? "#1f1f1f" : "transparent",
                                                    }}
                                                >
                                                    {showOriginal ? "Hide original" : "Show original"}
                                                </button>
                                                {showOriginal && (
                                                    <div
                                                        className="mt-3 text-[12px] leading-relaxed whitespace-pre-wrap border-l-2 pl-3"
                                                        style={{ color: "#555", borderColor: "#333" }}
                                                    >
                                                        {quotedText}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Bottom bar */}
                        <div
                            className="px-6 py-3 shrink-0 flex items-center gap-2"
                            style={{ borderTop: "1px solid #1f1f1f" }}
                        >
                            <Mail className="w-3.5 h-3.5" style={{ color: "#444" }} />
                            <p className="text-[11px]" style={{ color: "#555" }}>
                                Read-only mode. Reply from your Gmail client.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
}

