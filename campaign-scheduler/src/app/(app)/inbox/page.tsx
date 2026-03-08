"use client";

import { useState, useEffect, Suspense } from "react";
import { insforge } from "@/lib/insforge";
import { toast } from "@/components/ui/toast-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, Mail, MessageSquareText, RefreshCw, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
    id: string;
    type: 'incoming' | 'outgoing';
    senderEmail: string;
    subject: string;
    body: string;
    timestamp: string;
    isRead: boolean;
    gmailMessageId: string;
}

interface Thread {
    leadId: string;
    contactEmail: string;
    contactName: string;
    campaignName: string;
    campaignId: string;
    gmailThreadId: string;
    subject: string;
    messages: Message[];
    lastMessageAt: string;
    lastMessagePreview: string;
    isRead: boolean;
}

interface Account {
    id: string;
    email: string;
    is_active: boolean;
}

function InboxContent() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [replyText, setReplyText] = useState("");
    const [replySubject, setReplySubject] = useState("");
    const [selectedSenderId, setSelectedSenderId] = useState<string>("");
    const [isSending, setIsSending] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const threadIdParam = searchParams.get("threadId");

    const fetchInbox = async () => {
        try {
            const res = await fetch("/api/inbox");
            if (!res.ok) throw new Error("Failed to fetch inbox");
            const data = await res.json();
            if (data.threads) {
                setThreads(data.threads);
            }
        } catch (error) {
            console.error("Error fetching inbox:", error);
            toast.error("Failed to load inbox");
        } finally {
            setLoading(false);
        }
    };

    const fetchAccounts = async () => {
        try {
            const res = await fetch("/api/accounts");
            if (!res.ok) throw new Error("Failed to fetch accounts");
            const { data } = await res.json();
            const activeAccounts = (data || []).filter((a: any) => a.is_active);
            setAccounts(activeAccounts);
            if (activeAccounts.length > 0 && !selectedSenderId) {
                setSelectedSenderId(activeAccounts[0].id);
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    useEffect(() => {
        fetchInbox();
        fetchAccounts();

        const pollInterval = setInterval(fetchInbox, 30 * 1000);
        return () => clearInterval(pollInterval);
    }, []);

    // Handle deep linking
    useEffect(() => {
        if (threadIdParam && threads.length > 0 && !selectedThreadId) {
            const thread = threads.find(t => t.gmailThreadId === threadIdParam);
            if (thread) {
                setSelectedThreadId(thread.leadId);
            }
        }
    }, [threadIdParam, threads, selectedThreadId]);

    const handleSync = async () => {
        setSyncing(true);
        toast.info("Syncing new messages...");
        try {
            const res = await fetch("/api/campaign/sync-replies", { method: "POST" });
            if (!res.ok) throw new Error("Sync failed");
            await fetchInbox();
            toast.success("Inbox updated");
        } catch (error) {
            console.error("Error syncing inbox:", error);
            toast.error("Failed to sync messages");
        } finally {
            setSyncing(false);
        }
    };

    const handleSelectThread = (thread: Thread) => {
        setSelectedThreadId(thread.leadId);
        setReplyText("");
        setReplySubject(`Re: ${thread.subject}`);

        // Find if this lead already has a preferred sender linked?
        // For now just keep current selection or default
    };

    const handleSendReply = async () => {
        if (!selectedThread || !replyText.trim()) return;

        setIsSending(true);
        try {
            const res = await fetch("/api/inbox/reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    leadId: selectedThread.leadId,
                    gmailThreadId: selectedThread.gmailThreadId,
                    subject: replySubject || `Re: ${selectedThread.subject}`,
                    body: replyText,
                    senderAccountId: selectedSenderId, // Future enhancement for the API to support this
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to send message");
            }

            toast.success("Message sent");
            setReplyText("");
            await fetchInbox();
        } catch (error) {
            console.error("[Send Reply Error]:", error);
            toast.error(error instanceof Error ? error.message : "Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const selectedThread = threads.find(t => t.leadId === selectedThreadId) || null;

    const filteredThreads = threads.filter(t =>
        t.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lastMessagePreview.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                <div className="px-4 pt-4 pb-3 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[16px] font-semibold text-white">Inbox</h2>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="p-1.5 rounded-md hover:bg-[#222] transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 text-muted-foreground ${syncing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg text-[12px] bg-[#1a1a1a] border border-[#222] text-white outline-none focus:ring-1 focus:ring-[#333]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredThreads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Mail className="w-6 h-6 mb-2 text-[#333]" />
                            <p className="text-[12px] text-[#555]">No conversations found</p>
                        </div>
                    ) : (
                        filteredThreads.map((thread) => (
                            <button
                                key={thread.leadId}
                                onClick={() => handleSelectThread(thread)}
                                className={`w-full text-left px-4 py-3 border-b border-[#1a1a1a] transition-colors ${selectedThreadId === thread.leadId ? "bg-[#1a1a1a]" : "hover:bg-[#1a1a1a]/50"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className={`text-[13px] truncate ${thread.isRead ? "text-[#888]" : "text-white font-medium"}`}>
                                        {thread.contactName}
                                    </p>
                                    <span className="text-[10px] text-[#555] shrink-0 mt-0.5">
                                        {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-amber-500/70 mt-0.5 truncate uppercase tracking-tight">
                                    {thread.campaignName}
                                </p>
                                <p className="text-[12px] mt-1 text-[#777] line-clamp-1 italic">
                                    {thread.lastMessagePreview}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* ── Right Column: Conversation Viewer ───────────────── */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0c]">
                {!selectedThread ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
                            <MessageSquareText className="w-6 h-6 text-[#555]" />
                        </div>
                        <p className="text-[14px] font-medium text-white">Select a conversation</p>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4 shrink-0 border-b border-[#1f1f1f] bg-[#141414]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-[15px] font-semibold text-white">{selectedThread.contactName}</h3>
                                    <p className="text-[12px] text-[#888]">{selectedThread.contactEmail}</p>
                                </div>
                                {selectedThread.campaignId && (
                                    <button
                                        onClick={() => router.push(`/campaigns/${selectedThread.campaignId}`)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        View Campaign
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
                            {selectedThread.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col max-w-[80%] ${msg.type === 'outgoing' ? 'ml-auto items-end' : 'mr-auto items-start'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-[10px] text-[#555]">
                                            {msg.type === 'outgoing' ? 'You' : msg.senderEmail}
                                        </span>
                                        <span className="text-[10px] text-[#444]">•</span>
                                        <span className="text-[10px] text-[#444]">
                                            {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div
                                        className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${msg.type === 'outgoing'
                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                : 'bg-[#1a1a1a] text-[#d4d4d4] border border-[#222] rounded-tl-none'
                                            }`}
                                    >
                                        {msg.body}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-5 shrink-0 border-t border-[#1f1f1f] bg-[#141414]">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-[11px] text-[#888]">
                                        <span>Reply from:</span>
                                        <select
                                            value={selectedSenderId}
                                            onChange={(e) => setSelectedSenderId(e.target.value)}
                                            className="bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-white outline-none focus:border-indigo-500/50"
                                        >
                                            {accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.email}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={replySubject}
                                            onChange={(e) => setReplySubject(e.target.value)}
                                            placeholder="Subject"
                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-1 text-[12px] text-white outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-4 text-[13px] text-[#d4d4d4] placeholder:text-[#555] outline-none focus:border-indigo-500/50 min-h-[120px] resize-none"
                                        disabled={isSending}
                                    />
                                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                                        <span className="text-[10px] text-[#444]">
                                            Replying via {accounts.find(a => a.id === selectedSenderId)?.email || 'Gmail'}
                                        </span>
                                        <button
                                            onClick={handleSendReply}
                                            disabled={!replyText.trim() || isSending}
                                            className="flex items-center gap-2 px-5 py-2 rounded-lg text-[12px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-500/20"
                                        >
                                            {isSending ? (
                                                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Sending...</>
                                            ) : (
                                                <><Mail className="w-3.5 h-3.5" />Send Reply</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function InboxPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[calc(100vh-120px)] bg-[#141414] border border-[#222] rounded-[10px]">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
        }>
            <InboxContent />
        </Suspense>
    );
}
