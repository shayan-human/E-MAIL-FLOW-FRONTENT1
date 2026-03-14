"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Sparkles, Shield, Globe } from "lucide-react";
import { LampContainer } from "@/components/ui/lamp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { insforge } from "@/lib/insforge";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/dashboard";
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    await insforge.auth.signInWithOAuth({
      provider: "google",
      redirectTo: window.location.origin + "/dashboard",
    });
  };

  return (
    <div className="bg-slate-950 min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] max-w-5xl z-[100]">
        <div className="flex items-center justify-between px-6 py-3 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
              E
            </div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-orange-500 transition-colors">
              EMAIL FLOW
            </span>
          </Link>
          <Link 
            href="/" 
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      <LampContainer childrenClassName="pt-40 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[460px] px-10 py-12 rounded-[3rem] bg-slate-900/60 backdrop-blur-3xl border border-white/5 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle noise pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <div className="flex flex-col items-center text-center mb-10 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            
            <h1 className="text-3xl font-black text-white tracking-tight mb-3">
              ESTABLISH <span className="text-orange-500">CONNECTION</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Access your high-performance orchestration core.
            </p>
          </div>

          <div className="space-y-6 relative z-10">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full h-14 bg-white hover:bg-slate-200 text-slate-950 text-base font-black rounded-2xl transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#020617] px-4 text-slate-500 font-black tracking-widest">
                  OR USE TERMINAL
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black ml-1">
                  ID ENTITY
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-800 rounded-2xl focus:border-orange-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                    SECURITY KEY
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-800 rounded-2xl focus:border-orange-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white text-base font-black rounded-2xl mt-4 shadow-lg active:scale-95 disabled:opacity-70 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "ESTABLISH UPLINK"
                )}
              </Button>
            </form>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 relative z-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                <Shield className="w-4 h-4 text-slate-500" />
                <span className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Encrypted</span>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-[8px] uppercase tracking-widest text-slate-600 font-black">Verified</span>
              </div>
            </div>
            
            <p className="text-[9px] text-slate-800 font-black tracking-[0.4em] uppercase">
              TERMINAL SECURED BY INSFORGE
            </p>
          </div>
        </motion.div>
      </LampContainer>
    </div>
  );
}
