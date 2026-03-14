"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, Sparkles, Shield, Globe } from "lucide-react";
import { LampContainer } from "@/components/ui/lamp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <LampContainer className="pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[440px] px-8 py-10 rounded-[2.5rem] bg-slate-900/40 backdrop-blur-3xl border border-white/5 shadow-[0_0_80px_-15px_rgba(249,115,22,0.15)] relative overflow-hidden"
        >
          {/* Subtle noise pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <div className="flex flex-col items-center text-center mb-10 relative z-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="w-20 h-20 bg-gradient-to-tr from-orange-500 via-orange-400 to-amber-300 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(249,115,22,0.4)] relative group"
            >
              <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Sparkles className="w-10 h-10 text-white drop-shadow-md" />
            </motion.div>
            
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">
              DemGrow <span className="text-orange-500 font-light">OS</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[300px]">
              Next-generation email infrastructure orchestration. Secure, scalable, and fully automated.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] uppercase tracking-widest text-slate-500 ml-1 font-bold">
                  Corporate Identity
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-slate-950/50 border-white/5 text-white placeholder:text-slate-700 rounded-2xl focus:border-orange-500/50 focus:ring-orange-500/10 transition-all text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                    Security Key
                  </Label>
                  <button type="button" className="text-[10px] text-orange-500/70 hover:text-orange-500 transition-colors uppercase tracking-wider font-bold">
                    Recovery?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 bg-slate-950/50 border-white/5 text-white placeholder:text-slate-700 rounded-2xl focus:border-orange-500/50 focus:ring-orange-500/10 transition-all text-base"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white text-base font-bold rounded-2xl mt-4 transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(249,115,22,0.5)] flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Establish Connection
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 relative z-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">End-to-End</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Multi-DC</span>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-600 font-medium tracking-wide">
              TERMINAL SECURED BY INSFORGE • V2.4.0
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center pointer-events-none"
        >
          <span className="text-[10px] text-orange-500/20 font-black tracking-[1em] uppercase">
            Aur Orchestration Engine
          </span>
        </motion.div>
      </LampContainer>
    </div>
  );
}
