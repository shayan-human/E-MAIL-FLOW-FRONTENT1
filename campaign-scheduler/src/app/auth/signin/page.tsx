"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Sparkles, Shield, Globe } from "lucide-react";
import { LampContainer } from "@/components/ui/lamp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-950 min-h-screen">
      {/* Mini Navbar for Sign In */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] max-w-5xl z-[100]">
        <div className="flex items-center justify-between px-6 py-3 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
              E
            </div>
            <span className="font-bold text-lg tracking-tight text-white hover:text-orange-500 transition-colors">
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

      <LampContainer childrenClassName="-translate-y-20 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[460px] px-10 py-12 rounded-[3rem] bg-slate-900/60 backdrop-blur-3xl border border-white/5 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle noise pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <div className="flex flex-col items-center text-center mb-10 relative z-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="w-16 h-16 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(249,115,22,0.4)] relative group"
            >
              <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
            </motion.div>
            
            <h1 className="text-3xl font-black text-white tracking-tight mb-3">
              ESTABLISH <span className="text-orange-500 font-light">CONNECTION</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[300px] font-medium">
              Access your high-performance email infrastructure orchestrator.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-slate-500 ml-1 font-black">
                  Corporate Identity
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-800 rounded-2xl focus:border-orange-500/50 focus:ring-orange-500/10 transition-all text-base font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                    Security Key
                  </Label>
                  <button type="button" className="text-[9px] text-orange-500/70 hover:text-orange-500 transition-colors uppercase tracking-widest font-black">
                    Recovery?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-800 rounded-2xl focus:border-orange-500/50 focus:ring-orange-500/10 transition-all text-base font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white text-base font-black rounded-2xl mt-6 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)] flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  INITIALIZE SESSION
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 relative z-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500 font-black">Encrypted</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500 font-black">Verified</span>
              </div>
            </div>
            
            <p className="text-[9px] text-slate-700 font-black tracking-[0.3em] uppercase">
              TERMINAL SECURED BY INSFORGE
            </p>
          </div>
        </motion.div>
      </LampContainer>
    </div>
  );
}
