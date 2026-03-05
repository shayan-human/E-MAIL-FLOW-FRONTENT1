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
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-950 relative overflow-hidden selection:bg-violet-500/30">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <div className="max-w-md w-full relative z-10 group">
                {/* Glow behind the card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                <div className="relative p-10 bg-zinc-900/80 backdrop-blur-2xl rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-8 shadow-2xl">
                    {/* Logo with animation */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-violet-500/20 rounded-full blur-2xl animate-pulse" />
                        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <Sparkles className="w-10 h-10 text-white animate-pulse" />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            Aur
                        </h1>
                        <p className="text-zinc-400 font-medium leading-relaxed max-w-[280px] mx-auto">
                            The AI-powered orchestration engine for elite email infrastructure.
                        </p>
                    </div>

                    <div className="w-full space-y-4 pt-4">
                        <button
                            onClick={handleSignIn}
                            className="group relative w-full py-4 px-6 bg-white text-black font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <Zap className="w-5 h-5 relative z-10 text-violet-600" />
                            <span className="relative z-10">Get Started Now</span>
                            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
                            Powered by InsForge Enterprise
                        </p>
                    </div>

                    {/* Features showcase */}
                    <div className="grid grid-cols-3 gap-4 w-full pt-6 border-t border-white/5">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="p-2 rounded-lg bg-zinc-800/50">
                                <Shield className="w-4 h-4 text-violet-400" />
                            </div>
                            <span className="text-[10px] text-zinc-500 font-medium">Secure</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="p-2 rounded-lg bg-zinc-800/50">
                                <Globe className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span className="text-[10px] text-zinc-500 font-medium">Global</span>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            <div className="p-2 rounded-lg bg-zinc-800/50">
                                <Zap className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-[10px] text-zinc-500 font-medium">Instant</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer hint */}
            <footer className="absolute bottom-8 text-zinc-600 text-[11px] font-medium tracking-wide">
                &copy; 2024 Aur Research & Development. All rights reserved.
            </footer>
        </main>
    );
}
