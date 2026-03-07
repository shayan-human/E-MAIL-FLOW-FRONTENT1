"use client";

import { useState, useEffect, useRef } from "react";
import { insforge } from "@/lib/insforge";
import { useUser } from "@insforge/nextjs";

import { Plus, Mail, Unplug } from "lucide-react";
import { toast } from "@/components/ui/toast-provider";

interface Account {
    id: string;
    email: string;
    is_active: boolean;
    status: string;
    created_at: string;
    google_access_token: string | null;
    google_refresh_token: string | null;
    sent_today: number;
    last_synced_at: string;
}

// ── Status badge component ────────────────────────────────────────────
function StatusBadge({ status }: { status: "active" | "rate_limited" | "error" | "reauth_required" }) {
    const config = {
        active: { bg: "rgba(22,163,106,0.12)", text: "#16a34a", label: "Active" },
        rate_limited: { bg: "rgba(234,179,8,0.12)", text: "#eab308", label: "Rate Limited" },
        error: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", label: "Error" },
        reauth_required: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", label: "Re-auth Required" },
    };
    const c = config[status] || config.error;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ backgroundColor: c.bg, color: c.text, border: status === 'reauth_required' ? `1px solid ${c.text}40` : 'none' }}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'reauth_required' ? 'animate-pulse' : ''}`} style={{ backgroundColor: c.text }} />
            {c.label}
        </span>
    );
}

// ── Time ago helper ───────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
    if (!dateStr) return "never";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function AccountsPage() {
    const { user, isLoaded } = useUser();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);

    const fetchAccounts = async () => {
        try {
            const response = await fetch("/api/accounts");
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data.data || [];
        } catch (err: unknown) {
            console.error(err);
            toast.error("Failed to fetch accounts");
            return [];
        }
    };

    useEffect(() => {
        let cancelled = false;
        if (!isLoaded) return;

        const init = async () => {
            setIsLoading(true);
            try {
                const existing = await fetchAccounts();
                if (cancelled) return;
                setAccounts(existing);
            } catch (err) {
                console.error("Error in accounts init:", err);
                toast.error("An unexpected error occurred loading accounts.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        init();
        return () => { cancelled = true; };
    }, [isLoaded]);

    const handleConnectGmail = async () => {
        setIsConnecting(true);
        window.location.href = "/api/auth/google?redirect=/accounts";
    };

    const handleDisconnect = async (id: string) => {
        if (!confirm("Disconnect this Gmail account? This cannot be undone.")) return;
        try {
            const { error } = await insforge.database.from("sender_accounts").delete().eq("id", id);
            if (error) throw error;
            toast.info("Account removed");
            setAccounts(accounts.filter(acc => acc.id !== id));
        } catch (err: unknown) {
            console.error(err);
            toast.error("Failed to disconnect account");
        }
    };

    // Determine account status
    const getStatus = (acc: Account): "active" | "rate_limited" | "error" | "reauth_required" => {
        if (acc.status === "REAUTH_REQUIRED") return "reauth_required";
        if (!acc.google_access_token && !acc.google_refresh_token) return "error";
        if (!acc.is_active) return "rate_limited";
        return "active";
    };

    // ── Loading state ─────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Gmail Accounts</h1>
                </div>
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div
                            key={i}
                            className="rounded-[10px] animate-pulse"
                            style={{ backgroundColor: "#141414", border: "1px solid #222222", padding: 20 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full" style={{ backgroundColor: "#222" }} />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-48 rounded" style={{ backgroundColor: "#222" }} />
                                    <div className="h-3 w-32 rounded" style={{ backgroundColor: "#1a1a1a" }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ── Empty state ───────────────────────────────────────────────────
    if (accounts.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-white">Gmail Accounts</h1>
                </div>
                <div
                    className="rounded-[10px] flex flex-col items-center justify-center py-20"
                    style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
                >
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                        style={{ backgroundColor: "#1a1a1a" }}
                    >
                        <Mail className="w-7 h-7" style={{ color: "#6b7280" }} />
                    </div>
                    <p className="text-white font-medium text-[15px]">No Gmail accounts connected</p>
                    <p className="text-[13px] mt-1.5 mb-6" style={{ color: "#6b7280" }}>
                        Connect an account to start sending campaigns
                    </p>
                    <button
                        onClick={handleConnectGmail}
                        disabled={isConnecting}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {isConnecting ? "Connecting..." : "Connect Account"}
                    </button>
                </div>
            </div>
        );
    }

    // ── Main view ─────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight text-white">Gmail Accounts</h1>
                <button
                    onClick={handleConnectGmail}
                    disabled={isConnecting}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    {isConnecting ? "Connecting..." : "Connect Account"}
                </button>
            </div>

            {/* Account cards */}
            <div className="space-y-3">
                {accounts.map((acc) => {
                    const status = getStatus(acc);
                    return (
                        <div
                            key={acc.id}
                            className="rounded-[10px] transition-colors duration-200 group"
                            style={{ backgroundColor: "#141414", border: "1px solid #222222", padding: 20 }}
                        >
                            {/* Top row */}
                            <div className="flex items-center justify-between">
                                {/* Left: avatar + info */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold uppercase shrink-0"
                                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                                    >
                                        {acc.email[0]}
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-medium text-white">{acc.email}</p>
                                        <p className="text-[11px] mt-0.5" style={{ color: "#6b7280" }}>
                                            Connected via OAuth
                                        </p>
                                    </div>
                                </div>

                                {/* Right: status + meta */}
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[11px]" style={{ color: "#6b7280" }}>
                                            Last synced: {timeAgo(acc.last_synced_at)}
                                        </p>
                                    </div>
                                    <StatusBadge status={status} />
                                </div>
                            </div>

                            {/* Bottom row */}
                            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid #1f1f1f" }}>
                                <div className="flex items-center gap-4">
                                    <span className="text-[11px]" style={{ color: "#6b7280" }}>
                                        Sent today: <span className="text-white font-medium">{acc.sent_today || 0}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {status === "reauth_required" && (
                                        <button
                                            onClick={handleConnectGmail}
                                            className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Re-auth
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDisconnect(acc.id)}
                                        className="btn-destructive flex items-center gap-1.5 text-[12px] opacity-0 group-hover:opacity-100"
                                    >
                                        <Unplug className="w-3.5 h-3.5" />
                                        Disconnect
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
