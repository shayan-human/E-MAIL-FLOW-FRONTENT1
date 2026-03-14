'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const features = [
  {
    icon: '📧',
    title: 'Gmail REST API',
    description: 'Send emails directly through Google\'s API. No SMTP ports needed, no deliverability issues.'
  },
  {
    icon: '🔄',
    title: 'Auto Token Refresh',
    description: 'Tokens refresh automatically. Your campaigns run 24/7 without interruption.'
  },
  {
    icon: '⏰',
    title: 'Smart Cron Scheduling',
    description: 'Set it and forget it. Automated cycles with randomized delays to avoid spam detection.'
  },
  {
    icon: '📊',
    title: 'Real-Time Tracking',
    description: 'Monitor sent, pending, and failed emails instantly. Full audit trail for every campaign.'
  }
]

const steps = [
  { number: '01', title: 'Connect Gmail', desc: 'Link your Google account via OAuth. Secure token storage.' },
  { number: '02', title: 'Import Leads', desc: 'Upload your email list. We handle validation and deduping.' },
  { number: '03', title: 'Create Campaign', desc: 'Write your email, set schedule, and launch.' },
  { number: '04', title: 'Watch Results', desc: 'Track opens, replies, and failures in real-time.' }
]

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <span className="text-xl">⚡</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            EMAIL FLOW
          </span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it Works</a>
          <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all font-medium">
            Get Started
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 py-24 max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm mb-8">
              🚀 Automated Email Outreach Platform
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Reach More Inboxes.{' '}
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Deliver More Results.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Automate your cold email campaigns with intelligent scheduling, 
            auto-refreshing tokens, and real-time tracking. Built for teams that scale.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all font-semibold text-lg shadow-lg shadow-purple-500/25">
              Start Free Trial
            </button>
            <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-semibold text-lg">
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20 grid grid-cols-3 gap-8"
          >
            {[
              { value: '99.9%', label: 'Uptime' },
              { value: '50K+', label: 'Emails Sent' },
              { value: '<2min', label: 'Setup Time' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-8 py-24 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Scale Outreach
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Powerful features designed for modern sales teams and growth hackers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-8 py-24 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            From Zero to{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              First Reply
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get your first campaign running in minutes, not days.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-full">
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-500/50 to-blue-500/50 mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-24 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 md:p-16 rounded-3xl bg-gradient-to-br from-purple-900/50 via-blue-900/30 to-indigo-900/50 border border-purple-500/30 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Scale Your Outreach?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of teams using EMAIL FLOW to generate more leads and close more deals.
          </p>
          <button className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 transition-all font-semibold text-lg shadow-lg shadow-purple-500/30">
            Get Started Free
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-sm">⚡</span>
            </div>
            <span className="font-bold">EMAIL FLOW</span>
          </div>
          <div className="text-gray-500 text-sm">
            © 2026 EMAIL FLOW. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
