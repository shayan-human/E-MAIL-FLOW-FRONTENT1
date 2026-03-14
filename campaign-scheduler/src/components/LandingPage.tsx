"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  ArrowRight, 
  BarChart3, 
  RefreshCw, 
  Clock, 
  Mail, 
  ChevronRight,
  ShieldCheck,
  ZapIcon,
  Sparkles
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <Mail className="w-6 h-6 text-orange-500" />,
    title: "Gmail REST API",
    description: "Send emails directly through Google's API. Bypasses SMTP restrictions and maximizes deliverability."
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-orange-500" />,
    title: "Auto Token Refresh",
    description: "Zero-touch authentication management. Campaigns stay active 24/7 with secure automated refreshing."
  },
  {
    icon: <Clock className="w-6 h-6 text-orange-500" />,
    title: "Smart Orchestration",
    description: "Intelligent scheduling with randomized wait times to mimic human behavior and evade filters."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
    title: "Real-Time Intelligence",
    description: "Comprehensive audit trails. Track every send, bounce, and reply with millisecond precision."
  }
];

const steps = [
  { number: "01", title: "OAUTH CONNECT", desc: "Link corporate Gmail accounts via secure Google OAuth 2.0 gateway." },
  { number: "02", title: "LEAD INGESTION", desc: "Upload target lists. Automatic validation and deduplication engine." },
  { number: "03", title: "SEQUENCE BUILDER", desc: "Configure high-performance campaigns with custom delay logic." },
  { number: "04", title: "MISSION CONTROL", desc: "Monitor the orchestration engine as it executes your growth cycles." }
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-orange-500/30 overflow-x-hidden font-sans">
      {/* Dynamic Ethereal Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/4 w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.03)_0%,transparent_70%)]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-sm border-b border-white/5">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tighter">
            AUR <span className="text-orange-500">OS</span>
          </span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-8"
        >
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-widest">Core</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-orange-500 transition-colors uppercase tracking-widest">Protocol</a>
          </div>
          <Link href="/auth/signin">
            <Button variant="premium">ESTABLISH CONNECTION</Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-24 pb-32 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold uppercase tracking-[0.2em]">
              <Sparkles className="w-3 h-3" />
              Automated Infrastructure Orchestration
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white"
          >
            Scale Beyond <br />
            <span className="bg-gradient-to-tr from-orange-400 via-orange-500 to-amber-200 bg-clip-text text-transparent italic">
              Deliverability.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Deploy high-performance cold email infrastructure with 
            millisecond-precision orchestration. Built for growth elite.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Link href="/auth/signin">
              <button className="h-14 px-10 rounded-2xl bg-white text-slate-950 hover:bg-orange-50 transition-all font-bold text-lg shadow-2xl shadow-white/5 active:scale-[0.98] flex items-center gap-3">
                Initialize System
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <button className="h-14 px-10 rounded-2xl bg-slate-900 border border-white/5 hover:bg-slate-800 transition-all font-bold text-lg text-white">
              View Specs
            </button>
          </motion.div>

          {/* Stats Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/5 py-12"
          >
            {[
              { value: "99.9%", label: "INBOX RATE" },
              { value: "500K+", label: "SENT MONTHLY" },
              { value: "24/7/365", label: "UPTIME" },
              { value: "SECURE", label: "V3 PROTOCOL" }
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-3xl font-black text-white group-hover:text-orange-500 transition-colors">
                  {stat.value}
                </div>
                <div className="text-[10px] text-slate-600 mt-1 font-bold tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-32 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              Infrastructure <br />
              <span className="text-orange-500">Uncompromised.</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Maximum throughput. Minimal complexity.
            </p>
          </div>
          <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-orange-500/50 to-transparent mx-12 mb-8" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-orange-500/20 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                <ZapIcon className="w-24 h-24 text-orange-500" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-all duration-500">
                <div className="group-hover:text-white transition-colors">
                    {feature.icon}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-orange-500 transition-colors italic">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Protocol / How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 py-32 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              The <span className="text-orange-500">Orchestration</span> Protocol
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              Systematic Execution Map
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative p-8 rounded-3xl bg-slate-950 border border-white/5 h-full group hover:border-orange-500/30 transition-all"
              >
                <div className="text-5xl font-black text-white/5 mb-6 group-hover:text-orange-500/10 transition-colors">
                  {step.number}
                </div>
                <h3 className="text-sm font-black tracking-[0.2em] mb-3 text-white group-hover:text-orange-500 transition-colors uppercase">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-400 transition-colors">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact CTA */}
      <section className="relative z-10 px-6 py-32 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-16 md:p-24 rounded-[3rem] bg-gradient-to-br from-orange-600 to-amber-600 text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none">
              READY TO <br /> OPTIMIZE?
            </h2>
            <p className="text-orange-100 text-xl font-medium mb-12 max-w-xl mx-auto">
              Secure your spot in the future of email automation today.
            </p>
            <Link href="/auth/signin">
                <button className="h-16 px-12 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 transition-all font-black text-xl shadow-2xl active:scale-[0.98] uppercase tracking-tighter flex items-center justify-center gap-3 mx-auto">
                    Access System
                    <ArrowRight className="w-6 h-6" />
                </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Industrial Footer */}
      <footer className="relative z-10 px-8 py-16 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-500 fill-current" />
            </div>
            <div>
                <span className="font-black text-lg block leading-none">AUR OS</span>
                <span className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">Research & Development</span>
            </div>
          </div>
          
          <div className="text-slate-600 text-[11px] font-bold tracking-[0.2em] text-center md:text-right uppercase">
            &copy; 2026 Aur Infrastructure. All rights reserved. <br />
            <span className="text-slate-800">Mission-critical deployment v4.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Button({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "premium", className?: string }) {
    const base = "h-11 px-6 rounded-xl font-bold text-sm transition-all active:scale-[0.97] tracking-tighter uppercase";
    const styles = {
        default: "bg-slate-900 text-white border border-white/5 hover:bg-slate-800",
        premium: "bg-white text-slate-950 hover:bg-orange-50 shadow-lg shadow-white/5"
    };

    return (
        <button className={`${base} ${styles[variant]} ${className}`}>
            {children}
        </button>
    );
}
