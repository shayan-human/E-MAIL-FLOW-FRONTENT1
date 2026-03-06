"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { insforge } from "@/lib/insforge";
import { useUser } from "@insforge/nextjs";
import { toast } from "@/components/ui/toast-provider";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, CheckCircle, Trash2, Shield, Radio, Activity, Link as LinkIcon, RefreshCw } from "lucide-react";

export interface Account {
    id: string;
    email: string;
    is_active: boolean;
    created_at: string;
    google_access_token: string | null;
    google_refresh_token: string | null;
}

interface Step1Props {
    onNext: () => void;
}

export function Step1Accounts({ onNext }: Step1Props) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const hasSavedTokens = useRef(false);

    const fetchAccounts = async () => {
        try {
            const { data, error } = await insforge.database
                .from("sender_accounts")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err: unknown) {
            console.error(err);
            toast.error("DATA_LINK_FAILURE");
            return [];
        }
    };

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            setIsLoading(true);

            // 1. Fetch existing accounts first
            const existing = await fetchAccounts();
            if (cancelled) return;
            setAccounts(existing);

            // 2. Check if we just returned from OAuth and need to save tokens
            if (!hasSavedTokens.current) {
                hasSavedTokens.current = true;
                // Mocking session for now
                const session = { user: { id: "temp-user-id", email: "temp@example.com" }, provider_token: null };
                if (session?.provider_token && session.user.email) {
                    await saveTokens(session, existing);
                    if (cancelled) return;
                    const refreshed = await fetchAccounts();
                    if (cancelled) return;
                    setAccounts(refreshed);
                }
            }

            // 3. Handle OAuth Success Redirect
            const successParam = searchParams.get("success");
            if (successParam === "account_connected") {
                toast.success("CORE_DETACH_SYNC_OK");
                router.replace("/campaigns/new", { scroll: false });
                if (existing.length > 0) {
                    onNext();
                }
            }

            setIsLoading(false);
        };

        init();
        return () => { cancelled = true; };
    }, [searchParams, router, onNext]);

    const handleConnectGmail = async () => {
        setIsConnecting(true);
        window.location.href = "/api/auth/google?redirect=/campaigns/new";
    };

    const saveTokens = async (
        session: { provider_token?: string | null; provider_refresh_token?: string | null; user: { id: string; email?: string } },
        currentAccounts: Account[]
    ) => {
        const providerToken = session.provider_token;
        const providerRefreshToken = session.provider_refresh_token;
        const userEmail = session.user.email;

        if (!providerToken || !userEmail) return;

        try {
            const existing = currentAccounts.find(a => a.email === userEmail);

            const { error } = await insforge.database
                .from("sender_accounts")
                .upsert([
                    {
                        user_id: session.user.id,
                        email: userEmail,
                        google_access_token: providerToken,
                        google_refresh_token: providerRefreshToken || (existing as any)?.google_refresh_token || null,
                        is_active: true,
                    }
                ], { onConflict: "email" });

            if (error) throw error;
            toast.success("KERNEL_LINK_ACTIVE");
        } catch (err: unknown) {
            console.error(err);
            toast.error("LINK_WRITE_FAULT");
        }
    };

    const handleSaveTokens = async () => {
        const session = { user: { id: "temp-user-id", email: "temp@example.com" }, provider_token: "mock-token" };
        if (!session) {
            toast.error("AUTH_SESSION_NULL");
            return;
        }
        await saveTokens(session, accounts);
        const refreshed = await fetchAccounts();
        setAccounts(refreshed);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("CONFIRM_DETACH_SEQUENCE?")) return;

        try {
            const { error } = await insforge.database
                .from("sender_accounts")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success("CORE_DETACHED");
            setAccounts(accounts.filter(acc => acc.id !== id));
        } catch (err: unknown) {
            console.error(err);
            toast.error("DETACH_SIG_ERROR");
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <Radio className="w-4 h-4 shadow-[0_0_8px_#3b82f6]" />
                    </div>
                    <h2 className="text-3xl font-black font-outfit text-white tracking-tighter uppercase">Kernel Authorization</h2>
                </div>
                <p className="text-zinc-500 font-medium text-[13px] tracking-tight">Select or authorize nodes to handle the outbound payload stream.</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-2">
                {/* Active Nodes */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Live_Nodes // Detected</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[9px] font-black text-blue-500/60 uppercase">{accounts.length} ACTIVE</span>
                        </div>
                    </div>

                    <div className="bg-black/20 border border-white/5 rounded-[2rem] p-4 min-h-[400px] flex flex-col gap-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-50" />

                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-blue-500 animate-spin opacity-20" />
                            </div>
                        ) : accounts.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative z-10">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5">
                                    <Shield className="w-8 h-8 text-zinc-800" />
                                </div>
                                <p className="text-zinc-500 font-black uppercase text-[10px] tracking-widest leading-relaxed">No Authorized Cores Found<br />in Local Matrix</p>
                            </div>
                        ) : (
                            <div className="space-y-3 relative z-10">
                                {accounts.map((acc) => (
                                    <div key={acc.id} className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-black text-white tracking-tight uppercase truncate">{acc.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                                        <CheckCircle className="w-2.5 h-2.5" /> STABLE_LINK
                                                    </span>
                                                    <span className="text-zinc-800 font-black text-[9px]">//</span>
                                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{new Date(acc.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            onClick={() => handleDelete(acc.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Authorization Panel */}
                <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Link_Interface // expansion</span>
                    <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-8 h-full relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">Initialize External Link</h3>
                            <p className="text-zinc-500 text-[12px] leading-relaxed font-medium">Connect a secondary Gmail node via Google Cloud Console OAUTH_V2 protocol. Encrypted tokens will be stored in the primary cluster keyring.</p>
                        </div>

                        <div className="space-y-4 relative z-10">
                            {[
                                { t: 'Establish SSL Handshake', i: Shield },
                                { t: 'Authorize Scope // Mail.Send', i: LinkIcon },
                                { t: 'Sync Metadata Architecture', i: RefreshCw }
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                                        <s.i className="w-3 h-3 text-zinc-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{s.t}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto space-y-4 relative z-10">
                            <button
                                onClick={handleConnectGmail}
                                disabled={isConnecting}
                                className="w-full py-5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/5 flex items-center justify-center gap-3 group/btn"
                            >
                                <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {isConnecting ? "AUTHORIZING..." : "LINK_GMAIL_NODE"}
                            </button>

                            <button
                                onClick={handleSaveTokens}
                                className="w-full py-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors border-t border-white/5 pt-6"
                            >
                                Refresh Active Tokens // Matrix Sync
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8 mt-12">
                <button
                    onClick={onNext}
                    disabled={accounts.length === 0}
                    className={`px-12 py-5 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-4 ${accounts.length === 0
                            ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5 opacity-50'
                            : 'bg-blue-600 text-white hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.2)] border border-blue-400'
                        }`}
                >
                    {accounts.length === 0 ? "AWAITING_AUTHORIZATION" : "TARGET_ACQUISITION"}
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
