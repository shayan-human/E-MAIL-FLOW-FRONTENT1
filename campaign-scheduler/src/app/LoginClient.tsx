"use client";

import { Sparkles, ArrowRight, Zap, Shield, Globe } from "lucide-react";
import { insforge } from "@/lib/insforge";

export default function LoginClient() {
    const handleSignIn = async () => {
        try {
            const { error } = await insforge.auth.signInWithOAuth({
                provider: 'google',
                redirectTo: `${window.location.origin}/api/auth/callback/google`,
            });

            if (error) throw error;
        } catch (error) {
            console.error("Sign in failed:", error);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050505] relative overflow-hidden selection:bg-amethyst-500/30 font-inter">
            {/* Cyber-Industrial Background Elements */}
            <div className="absolute inset-0 z-0">
                {/* Primary Engine Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[160px] rounded-full opacity-50" />

                {/* Moving Data Grid */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Floating Amethyst Trail */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-transparent via-[#9213ec]/40 to-transparent rounded-[2.5rem] blur-sm animate-pulse" />

                <div className="relative p-12 bg-black/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex flex-col items-center text-center space-y-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {/* Engine Core Icon */}
                    <div className="relative group">
                        <div className="absolute -inset-6 bg-[#9213ec]/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="w-24 h-24 bg-zinc-950 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-110">
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#9213ec]/20 to-blue-600/20" />
                            <Sparkles className="w-12 h-12 text-white relative z-10 animate-pulse" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-outfit font-black text-white tracking-tighter uppercase">
                            Aur <span className="text-[#9213ec] opacity-50">.</span>
                        </h1>
                        <p className="text-zinc-400 font-medium leading-relaxed max-w-[300px] mx-auto text-sm tracking-wide">
                            INITIATE THE AUTOMATION ENGINE.
                            <br />
                            <span className="opacity-50 text-xs">ELITE COLD OUTREACH INFRASTRUCTURE.</span>
                        </p>
                    </div>

                    <div className="w-full space-y-6">
                        <button
                            onClick={handleSignIn}
                            className="group relative w-full py-5 px-8 bg-white text-black font-black rounded-2xl transition-all duration-500 hover:tracking-widest overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                        >
                            {/* Button Fill Animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative z-10 flex items-center justify-center gap-3">
                                <Zap className="w-5 h-5 fill-current" />
                                <span>INITIALIZE ENGINE</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>

                        <div className="flex items-center justify-center gap-6 pt-2">
                            <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-help">
                                <Shield className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-help">
                                <Globe className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Distributed</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 w-full">
                        <p className="text-[9px] uppercase tracking-[0.4em] text-zinc-600 font-black">
                            Engine Version 4.0 // High Capacity
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Status bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[10px] text-zinc-700 font-black uppercase tracking-widest">
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    Systems Nominal
                </span>
                <span>&copy; 2024 AUR R&D</span>
            </div>
        </main>
    );
}
