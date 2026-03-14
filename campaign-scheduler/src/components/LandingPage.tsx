"use client";

import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { ShaderAnimation } from "@/components/ui/shader-lines";
import Link from "next/link";
import { 
  Mail, 
  Users, 
  Send, 
  BarChart3, 
  RefreshCcw, 
  Zap,
  Globe,
  ArrowRight,
  Shield,
  Layers
} from "lucide-react";

const features = [
  {
    icon: <Globe className="w-6 h-6 text-orange-500" />,
    title: "Unlimited Infrastructure",
    description: "Scale your email automation without limits on volume or account count."
  },
  {
    icon: <Users className="w-6 h-6 text-orange-500" />,
    title: "Multi-Account System",
    description: "Manage multiple sending identities seamlessly from a single dashboard."
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-orange-500" />,
    title: "Smart Distribution",
    description: "Load balance emails across accounts to ensure maximum deliverability."
  },
  {
    icon: <Shield className="w-6 h-6 text-orange-500" />,
    title: "Gmail API Powered",
    description: "Built on official Google APIs for industry-leading security and reliability."
  },
  {
    icon: <Layers className="w-6 h-6 text-orange-500" />,
    title: "Inbox Sync & Tracking",
    description: "Real-time reply tracking and unified inbox management for all campaigns."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
    title: "Campaign Analytics",
    description: "Deep dive into your campaign performance with granular data reporting."
  }
];

const LandingPage = () => {
  return (
    <div className="bg-slate-950 text-white min-h-screen font-sans selection:bg-orange-500/30">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] max-w-5xl z-[100]">
        <div className="flex items-center justify-between px-6 py-3 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(236,91,19,0.4)]">
              E
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              EMAIL FLOW
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-5">
            <Link 
              href="/auth/signin" 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signin" 
              className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(236,91,19,0.3)] hover:shadow-[0_0_30px_rgba(236,91,19,0.5)] active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[100vh] w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950">
        <ShaderAnimation />
        
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center relative z-50 px-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-10 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm"
          >
            Infrastructure Orchestration
          </motion.div>
          
          <h1 className="bg-gradient-to-b from-white to-slate-500 py-4 bg-clip-text text-center text-5xl font-bold tracking-tight text-transparent md:text-8xl leading-[1.15]">
            Build Email Automation <br /> 
            <span className="text-orange-500 drop-shadow-[0_0_40px_rgba(236,91,19,0.4)]">the Right Way.</span>
          </h1>
          
          <p className="mt-10 text-slate-400 text-center max-w-2xl text-lg md:text-xl leading-relaxed font-medium">
            Deploy high-performance cold email infrastructure with 
            precision. Engineered for the next generation of growth.
          </p>
          
          <div className="mt-14 flex flex-col sm:flex-row gap-6">
            <Link 
              href="/auth/signin" 
              className="px-10 py-4 rounded-2xl bg-white text-slate-950 font-black hover:bg-slate-200 transition-all flex items-center gap-3 group shadow-[0_0_30_rgba(255,255,255,0.15)] active:scale-95"
            >
              Initialize System <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/auth/signin" 
              className="px-10 py-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-white font-black hover:bg-slate-800 transition-all active:scale-95 backdrop-blur-md shadow-xl"
            >
              View Specs
            </Link>
          </div>
        </motion.div>

        {/* Bottom gradient overlay to blend with next section */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-slate-950 to-transparent z-40" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-40 px-6 max-w-7xl mx-auto relative mt-[-100px]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        
        <div className="text-center mb-28">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tight"
          >
            Core <span className="text-orange-500">Protocol</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 mt-8 max-w-2xl mx-auto text-lg leading-relaxed font-medium"
          >
            Sovereign infrastructure designed for high-deliverability outreach at scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="p-12 rounded-[3rem] bg-slate-900/40 border border-slate-800/50 hover:border-orange-500/30 transition-all group relative overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mb-8 p-5 rounded-2xl bg-slate-800/50 w-fit group-hover:scale-110 transition-transform duration-500 shadow-xl">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-2xl shadow-[0_0_20px_rgba(236,91,19,0.3)]">E</div>
              <span className="font-bold text-2xl tracking-tight">EMAIL FLOW</span>
            </div>
            <p className="text-slate-500 max-w-sm font-medium">
              Next-generation email infrastructure for high-growth teams. 
              Built for speed, delivered with precision.
            </p>
          </div>
          
          <div className="flex flex-col md:text-right gap-6">
            <div className="flex gap-10 text-sm font-bold text-slate-400">
              <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Privacy</a>
              <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Terms</a>
              <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Twitter</a>
            </div>
            <p className="text-slate-600 text-xs font-bold tracking-widest uppercase">
              © 2024 EMAIL FLOW. PREMIER INFRASTRUCTURE.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
