"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShaderAnimation } from "@/components/ui/shader-lines";
import { FeaturesSection } from "@/components/FeaturesSection";
import DisplayCards from "@/components/ui/display-cards";
import Link from "next/link";
import { ArrowRight, Send, MailOpen, Reply } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-orange-500/30">
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

      <section className="relative min-h-[700px] h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden bg-black">
        <ShaderAnimation />
        
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center relative z-50 px-6 pt-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-5 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-400 text-[11px] font-medium tracking-[0.2em] uppercase backdrop-blur-md"
          >
            Infrastructure Orchestration
          </motion.div>
          
          <h1 className="bg-gradient-to-b from-white to-slate-400 py-2 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent md:text-6xl lg:text-7xl leading-[1.1]">
            Build Email Automation <br /> 
            with <span className="text-orange-500">Precision.</span>
          </h1>
          
          <p className="mt-5 text-slate-400 text-center max-w-xl text-base md:text-lg leading-relaxed font-normal">
            Deploy high-performance cold email infrastructure with 
            unmatched reliability. Engineered for the next generation of outreach.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center">
            <Link 
              href="/auth/signin" 
              className="px-7 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all flex items-center gap-2 group"
            >
              Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/auth/signin" 
              className="px-7 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-300 font-medium hover:bg-white/10 transition-all"
            >
              View Specs
            </Link>
          </div>
        </motion.div>

        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-40" />
      </section>

      <section className="relative z-50 -mt-24 pb-14">
        <DisplayCards
          cards={[
            {
              icon: <Send className="size-4 text-blue-300" />,
              title: "Emails Sent",
              description: "24,892",
              date: "Total delivered",
              iconClassName: "text-orange-500",
              titleClassName: "text-orange-500",
              className:
                "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
            },
            {
              icon: <MailOpen className="size-4 text-blue-300" />,
              title: "Open Rate",
              description: "47.3%",
              date: "Industry avg: 21%",
              iconClassName: "text-blue-500",
              titleClassName: "text-blue-500",
              className:
                "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
            },
            {
              icon: <Reply className="size-4 text-blue-300" />,
              title: "Reply Rate",
              description: "18.5%",
              date: "Industry avg: 8%",
              iconClassName: "text-green-500",
              titleClassName: "text-green-500",
              className:
                "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
            },
          ]}
        />
      </section>

      {/* Features Section */}
      <FeaturesSection />

      <footer className="py-16 px-6 border-t border-white/5 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-sm">E</div>
            <span className="font-medium text-lg text-slate-300">EMAIL FLOW</span>
          </div>
          
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Twitter</a>
          </div>
          
          <p className="text-slate-600 text-xs">
            © 2024 EMAIL FLOW
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
