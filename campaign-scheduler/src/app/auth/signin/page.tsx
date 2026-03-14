"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
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
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <LampContainer>
      <div className="relative z-50 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-10 rounded-[2rem] bg-slate-950/40 backdrop-blur-2xl border border-orange-500/20 shadow-[0_0_50px_-12px_rgba(249,115,22,0.3)]"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
              <div className="w-10 h-10 border-4 border-white/90 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full translate-x-1 -translate-y-1" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-white tracking-tighter mb-4">Aur</h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-[280px]">
              The AI-powered orchestration engine for elite email infrastructure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-orange-500/50 focus:ring-orange-500/20 transition-all"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 rounded-xl focus:border-orange-500/50 focus:ring-orange-500/20 transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-white hover:bg-slate-100 text-slate-950 text-lg font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: [0, 15, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ArrowRight className="w-5 h-5 rotate-[-45deg] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </motion.div>
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-6">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-bold">
              Powered by InsForge Enterprise
            </span>
            
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
            
            <div className="grid grid-cols-3 gap-8 w-full">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 transition-all hover:border-orange-500/50">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 transition-all hover:border-orange-500/50">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Global</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 transition-all hover:border-orange-500/50">
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Instant</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <p className="mt-8 text-[11px] text-slate-600">
          © 2024 Aur Research & Development. All rights reserved.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
      >
        <h2 className="text-8xl font-black text-white/5 tracking-tighter uppercase select-none">
          Infrastructure
        </h2>
      </motion.div>
    </LampContainer>
  );
}

