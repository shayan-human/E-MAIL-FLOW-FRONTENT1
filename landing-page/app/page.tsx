"use client";

import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { 
  Mail, 
  Users, 
  Send, 
  BarChart3, 
  RefreshCcw, 
  Zap,
  Globe,
  Settings,
  ArrowRight
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
    icon: <Send className="w-6 h-6 text-orange-500" />,
    title: "Gmail API Powered",
    description: "Built on official Google APIs for industry-leading security and reliability."
  },
  {
    icon: <Mail className="w-6 h-6 text-orange-500" />,
    title: "Inbox Sync & Tracking",
    description: "Real-time reply tracking and unified inbox management for all campaigns."
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
    title: "Campaign Analytics",
    description: "Deep dive into your campaign performance with granular data reporting."
  }
];

const services = [
  "Automated sending system setup",
  "Account rotation & warming",
  "Lead distribution logic",
  "Campaign management optimization",
  "Inbox tracking integration"
];

export default function LandingPage() {
  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Hero Section */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center"
        >
          <h1 className="mt-8 bg-gradient-to-br from-slate-100 to-slate-400 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
            Build Email Automation <br /> the Right Way
          </h1>
          <p className="mt-4 text-slate-400 text-center max-w-lg text-lg">
            High-performance automated cold email infrastructure. 
            Deliver more, scale faster, and close deals effortlessly.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2">
              Start Building <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3 rounded-full bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors">
              Watch Demo
            </button>
          </div>
        </motion.div>
      </LampContainer>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
          >
            Powerful Features
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 mt-4 max-w-2xl mx-auto"
          >
            Everything you need to run high-converting email campaigns at scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-orange-500/50 transition-all group"
            >
              <div className="mb-4 p-3 rounded-lg bg-slate-800 w-fit group-hover:bg-slate-700 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Free Email Automation <br /> 
              <span className="text-orange-500">System Setup</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              We don&apos;t just provide the tool; we build the infrastructure for you. 
              Our expert team handles the complexities so you can focus on growth.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-slate-300 text-sm">{service}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/30 flex items-center justify-center overflow-hidden">
               <Zap className="w-32 h-32 text-orange-500/50 animate-pulse" />
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold">E</div>
            <span className="font-bold text-xl tracking-tight">EMAIL FLOW</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2024 EMAIL FLOW. All rights reserved. Built with precision.
          </p>
        </div>
      </footer>
    </div>
  );
}
