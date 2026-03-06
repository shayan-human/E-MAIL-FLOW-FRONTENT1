"use client";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { useUser } from "@insforge/nextjs";

import { Plus, Mail, Unplug, Cpu, Activity, Zap, Shield, Link as LinkIcon, RefreshCw, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/toast-provider";

interface Account {
    id: string;
    email: string;
    is_active: boolean;
    created_at: string;
    google_access_token: string | null;
    google_refresh_token: string | null;
    sent_today: number;
    last_synced_at: string;
}

function StatusBadge({ status }: { status: "active" | "rate_limited" | "error" }) {
    if (status === 'active') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                LINKED_CORE
            </span>
        );
    }
    if (status === 'rate_limited') {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                THROTTLED
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            CRITICAL_FAULT
        </span>
    );
}

function timeAgo(dateStr: string): string {
    if (!dateStr) return "NEVER";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "SYNC_SYNCED";
    if (mins < 60) return `${mins}M_AGO`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}H_AGO`;
    const days = Math.floor(hrs / 24);
    return `${days}D_AGO`;
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
            toast.error("DATA_LINK_FAILURE");
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
                toast.error("KERNEL_INIT_ERROR");
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
        if (!confirm("INITIATE PERMANENT NODE SHUTDOWN?")) return;
        try {
            const { error } = await insforge.database.from("sender_accounts").delete().eq("id", id);
            if (error) throw error;
            toast.success("CORE_DETACHED");
            setAccounts(accounts.filter(acc => acc.id !== id));
        } catch (err: unknown) {
            console.error(err);
            toast.error("DETACH_FAILED");
        }
    };

    const getStatus = (acc: Account): "active" | "rate_limited" | "error" => {
        if (!acc.google_access_token && !acc.google_refresh_token) return "error";
        if (!acc.is_active) return "rate_limited";
        return "active";
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Control Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-black/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Cpu className="w-5 h-5 text-blue-500" />
                        <h1 className="text-4xl font-outfit font-black tracking-tighter text-white uppercase">Node Management</h1>
                    </div>
                    <p className="text-zinc-500 font-black text-[10px] tracking-[0.3em] uppercase opacity-60">Authorize // Cluster Expansion</p>
                </div>
                <button
                    onClick={handleConnectGmail}
                    disabled={isConnecting}
                    className="relative z-10 px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95"
                >
                    <Plus className="w-3.5 h-3.5 inline-block mr-2" />
                    {isConnecting ? "AUTHORIZING..." : "LINK NEW NODE"}
                </button>
            </div>

            {/* Matrix Content */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-32 glass-card animate-pulse" />
                    ))}
                </div>
            ) : accounts.length === 0 ? (
                <div className="glass-card p-24 text-center">
                    <Shield className="w-16 h-16 text-zinc-900 mx-auto mb-8 opacity-20" />
                    <p className="text-zinc-500 font-black uppercase tracking-[0.5em] text-[12px]">No Nodes Detected in Active Network</p>
                    <button onClick={handleConnectGmail} className="inline-block mt-10 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">
                        Establish First Link //
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {accounts.map((acc) => {
                        const status = getStatus(acc);
                        return (
                            <div
                                key={acc.id}
                                className="glass-card p-8 group transition-all hover:border-blue-500/50"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-start gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-xl shadow-[0_0_20px_rgba(59,130,246,0.1)] border border-blue-500/20">
                                            {acc.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-black font-outfit text-white tracking-tight uppercase">{acc.email}</h3>
                                                <Shield className="w-3.5 h-3.5 text-blue-500 opacity-50" />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">OAUTH_LINKED_STABLE</span>
                                                <span className="text-zinc-800 text-[10px] font-black">//</span>
                                                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                                    <RefreshCw className="w-3 h-3" /> {timeAgo(acc.last_synced_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 px-6 md:border-l border-white/5">
                                        <StatusBadge status={status} />
                                        <div className="flex items-center gap-3">
                                            <div className="h-1 w-24 bg-zinc-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" style={{ width: '40%' }} />
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-500 tracking-tighter">{acc.sent_today || 0} / 50 CYCLES</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleDisconnect(acc.id)}
                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Unplug className="w-4 h-4" />
                                        </button>
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-zinc-500 border border-white/10 group-hover:border-blue-500 transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
