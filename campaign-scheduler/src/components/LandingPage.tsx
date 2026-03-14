"use client";

import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
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
      <nav className="fixed top-0 w-full z-[100] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-3 rounded-2xl border border-white/5 bg-slate-950/20 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(236,91,19,0.5)]">
              E
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              EMAIL FLOW
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth/signin" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signin" 
              className="px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(236,91,19,0.3)] hover:shadow-[0_0_30px_rgba(236,91,19,0.5)] active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <LampContainer className="pt-20">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center relative z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-8 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-500 text-xs font-bold tracking-widest uppercase"
          >
            Automated Infrastructure Orchestration
          </motion.div>
          
          <h1 className="bg-gradient-to-b from-white to-slate-500 py-4 bg-clip-text text-center text-5xl font-bold tracking-tight text-transparent md:text-8xl leading-[1.1]">
            Build Email Automation <br /> 
            <span className="text-orange-500 drop-shadow-[0_0_30px_rgba(236,91,19,0.3)]">the Right Way.</span>
          </h1>
          
          <p className="mt-8 text-slate-400 text-center max-w-2xl text-lg md:text-xl leading-relaxed">
            Deploy high-performance cold email infrastructure with 
            precision orchestration. Built for growth elite.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-6">
            <Link 
              href="/auth/signin" 
              className="px-10 py-4 rounded-2xl bg-white text-slate-950 font-bold hover:bg-slate-200 transition-all flex items-center gap-3 group shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
            >
              Initialize System <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/auth/signin" 
              className="px-10 py-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-white font-bold hover:bg-slate-800 transition-all active:scale-95 backdrop-blur-sm"
            >
              View Specs
            </Link>
          </div>
        </motion.div>
      </LampContainer>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold tracking-tight"
          >
            Core <span className="text-orange-500">Protocol</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 mt-6 max-w-2xl mx-auto text-lg"
          >
            Sovereign infrastructure designed for high-deliverability outreach at scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-10 rounded-[2.5rem] bg-slate-900/40 border border-slate-800/50 hover:border-orange-500/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mb-6 p-4 rounded-2xl bg-slate-800/50 w-fit group-hover:scale-110 transition-transform duration-500">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-slate-900/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(236,91,19,0.05),transparent)]" />
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1]">
              Engineered for <br /> 
              <span className="text-orange-500 tracking-tight">Performance.</span>
            </h2>
            <p className="text-slate-300 text-xl mb-12 leading-relaxed font-light">
              We eliminate the technical friction of cold outreach. Our automated setup 
              ensures your infrastructure is optimized from day one.
            </p>
            <div className="space-y-6">
              {[
                "Native Google API integration",
                "Advanced account rotation logic",
                "Dedicated deliverability support",
                "Real-time analytics engine"
              ].map((service, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                    <Zap className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-slate-100 text-lg font-medium">{service}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 w-full"
          >
            <div className="aspect-[4/3] rounded-[3rem] bg-gradient-to-br from-slate-800/50 to-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden group shadow-2xl">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,91,19,0.1),transparent)] group-hover:scale-150 transition-transform duration-1000" />
               <Zap className="w-40 h-40 text-orange-500 opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse" />
               
               <div className="absolute bottom-10 left-10 p-6 glass-panel rounded-2xl border border-white/5">
                 <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Status</div>
                 <div className="text-2xl font-bold text-white">System Active</div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-900/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-bold text-xl shadow-lg">E</div>
              <span className="font-bold text-2xl tracking-tight">EMAIL FLOW</span>
            </div>
            <p className="text-slate-500 max-w-sm">
              Next-generation email infrastructure for high-growth teams. 
              Built for speed, delivered with precision.
            </p>
          </div>
          
          <div className="flex flex-col md:text-right gap-4">
            <div className="flex gap-8 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
            <p className="text-slate-600 text-sm">
              © 2024 EMAIL FLOW. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
