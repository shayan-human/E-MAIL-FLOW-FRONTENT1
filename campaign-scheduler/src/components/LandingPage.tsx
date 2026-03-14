"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Star, 
  Zap, 
  Users, 
  Inbox, 
  BarChart3, 
  Shield, 
  Search,
  CheckCircle2,
  Mail,
  Settings,
  Activity,
  Send,
  Clock,
  TrendingUp
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="bg-[#0f0f0f] text-white min-h-screen font-sans">
      {/* 1. NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#222222] bg-[#0f0f0f]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center font-bold text-[#0f0f0f] text-sm">E</div>
            <span className="font-semibold text-lg text-slate-200">EmailFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/auth/signin" 
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-[#222222] rounded-lg hover:border-slate-500 transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signin" 
              className="px-4 py-2 text-sm font-medium text-[#0f0f0f] bg-[#F59E0B] rounded-lg hover:bg-[#D97706] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Amber radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#F59E0B]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium tracking-wide mb-6">
                Built for Cold Email Agencies
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Run 10 Client Campaigns.{' '}
                <span className="text-[#F59E0B]">One Dashboard.</span> Zero Chaos.
              </h1>
              
              <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto lg:mx-0">
                Manage unlimited Gmail accounts and run personalized cold email campaigns for all your clients from a single, powerful dashboard.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link 
                  href="/auth/signin" 
                  className="px-6 py-3 text-sm font-medium text-[#0f0f0f] bg-[#F59E0B] rounded-lg hover:bg-[#D97706] transition-all inline-flex items-center justify-center gap-2"
                >
                  Start Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  href="/auth/signin" 
                  className="px-6 py-3 text-sm font-medium text-slate-300 border border-[#222222] rounded-lg hover:border-slate-500 transition-all inline-flex items-center justify-center"
                >
                  See How It Works
                </Link>
              </div>
            </div>
            
            {/* Right side - Dashboard mockup */}
            <div className="relative">
              <div className="relative rounded-xl border border-[#222222] bg-[#141414] p-4 shadow-2xl">
                {/* Browser-like top bar */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#222222]">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  <span className="ml-4 text-xs text-slate-500">EmailFlow Dashboard</span>
                </div>
                
                {/* Campaign table mockup */}
                <div className="space-y-2">
                  {/* Header */}
                  <div className="grid grid-cols-5 gap-2 text-xs text-slate-500 pb-2 border-b border-[#222222]">
                    <div>Campaign</div>
                    <div>Account</div>
                    <div>Sent</div>
                    <div>Replies</div>
                    <div>Status</div>
                  </div>
                  
                  {/* Row 1 */}
                  <div className="grid grid-cols-5 gap-2 text-sm py-2">
                    <div className="font-medium text-white">Q1 Outreach</div>
                    <div className="text-slate-400">@client1.com</div>
                    <div className="text-slate-300">2,450</div>
                    <div className="text-[#F59E0B]">187</div>
                    <div><span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Active</span></div>
                  </div>
                  
                  {/* Row 2 */}
                  <div className="grid grid-cols-5 gap-2 text-sm py-2">
                    <div className="font-medium text-white">LeadGen Series</div>
                    <div className="text-slate-400">@agency.co</div>
                    <div className="text-slate-300">5,120</div>
                    <div className="text-[#F59E0B]">412</div>
                    <div><span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Active</span></div>
                  </div>
                  
                  {/* Row 3 */}
                  <div className="grid grid-cols-5 gap-2 text-sm py-2">
                    <div className="font-medium text-white">SaaS Startup</div>
                    <div className="text-slate-400">@startup.io</div>
                    <div className="text-slate-300">1,890</div>
                    <div className="text-[#F59E0B]">98</div>
                    <div><span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">Paused</span></div>
                  </div>
                  
                  {/* Row 4 */}
                  <div className="grid grid-cols-5 gap-2 text-sm py-2">
                    <div className="font-medium text-white">Enterprise B2B</div>
                    <div className="text-slate-400">@corp.net</div>
                    <div className="text-slate-300">890</div>
                    <div className="text-[#F59E0B]">45</div>
                    <div><span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Active</span></div>
                  </div>
                </div>
                
                {/* Stats bar */}
                <div className="mt-4 pt-3 border-t border-[#222222] flex gap-6">
                  <div>
                    <div className="text-xs text-slate-500">Total Sent</div>
                    <div className="text-lg font-semibold text-white">10,350</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Total Replies</div>
                    <div className="text-lg font-semibold text-[#F59E0B]">742</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Active Campaigns</div>
                    <div className="text-lg font-semibold text-white">3</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF BAR */}
      <section className="py-8 px-6 border-y border-[#222222] bg-[#141414]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
              ))}
            </div>
            <span className="text-slate-300">4.9 / 5 from agency users</span>
          </div>
          
          <div className="hidden md:block h-4 w-px bg-[#222222]" />
          
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <TrendingUp className="w-4 h-4 text-[#F59E0B]" />
            <span>$2.4M in client pipeline generated</span>
          </div>
          
          <div className="hidden md:block h-4 w-px bg-[#222222]" />
          
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Shield className="w-4 h-4 text-[#F59E0B]" />
            <span>Official Gmail API — Zero suspension risk</span>
          </div>
          
          <div className="hidden md:block h-4 w-px bg-[#222222]" />
          
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#222222] border-2 border-[#141414]" />
              <div className="w-8 h-8 rounded-full bg-[#333] border-2 border-[#141414]" />
              <div className="w-8 h-8 rounded-full bg-[#444] border-2 border-[#141414]" />
            </div>
            <span className="text-sm text-slate-400">Agency Partner</span>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Simple. Powerful. <span className="text-[#F59E0B]">Agency-Ready.</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="relative p-6 rounded-xl bg-[#141414] border border-[#222222]">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#F59E0B] text-[#0f0f0f] font-bold flex items-center justify-center text-sm">1</div>
              <div className="w-12 h-12 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Client Gmail Accounts</h3>
              <p className="text-sm text-slate-400">Secure OAuth integration to connect unlimited client Gmail accounts in seconds.</p>
            </div>
            
            {/* Step 2 */}
            <div className="relative p-6 rounded-xl bg-[#141414] border border-[#222222]">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#F59E0B] text-[#0f0f0f] font-bold flex items-center justify-center text-sm">2</div>
              <div className="w-12 h-12 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Build Campaigns with Personalization</h3>
              <p className="text-sm text-slate-400">Create sequenced outreach with dynamic personalization variables for each client.</p>
            </div>
            
            {/* Step 3 */}
            <div className="relative p-6 rounded-xl bg-[#141414] border border-[#222222]">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#F59E0B] text-[#0f0f0f] font-bold flex items-center justify-center text-sm">3</div>
              <div className="w-12 h-12 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4">
                <Inbox className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Monitor Replies Across All Clients</h3>
              <p className="text-sm text-slate-400">Track campaign performance and replies from a unified inbox for every client.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRODUCT SCREENSHOT */}
      <section className="py-24 px-6 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            {/* Left benefit blurb */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                One Dashboard.<br /><span className="text-[#F59E0B]">Complete Control.</span>
              </h2>
              <p className="text-slate-400">
                EmailFlow gives agencies a unified view across all connected Gmail accounts — no tab-switching, no confusion. Every reply, every campaign, every client in one place.
              </p>
            </div>
            
            {/* Right - Browser mockup */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-[#222222] bg-[#141414] overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#222222]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  </div>
                  <div className="flex-1 mx-4 px-4 py-1.5 rounded-lg bg-[#0f0f0f] text-xs text-slate-500 text-center">
                    emailflow.app/dashboard
                  </div>
                </div>
                
                {/* Dashboard content */}
                <div className="p-6">
                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="p-4 rounded-lg bg-[#0f0f0f] border border-[#222222]">
                      <div className="text-xs text-slate-500 mb-1">Accounts</div>
                      <div className="text-2xl font-bold text-white">8</div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0f0f0f] border border-[#222222]">
                      <div className="text-xs text-slate-500 mb-1">Campaigns</div>
                      <div className="text-2xl font-bold text-white">12</div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0f0f0f] border border-[#222222]">
                      <div className="text-xs text-slate-500 mb-1">Emails Sent</div>
                      <div className="text-2xl font-bold text-white">24.5K</div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0f0f0f] border border-[#222222]">
                      <div className="text-xs text-slate-500 mb-1">Replies</div>
                      <div className="text-2xl font-bold text-[#F59E0B]">1,842</div>
                    </div>
                  </div>
                  
                  {/* Campaign table */}
                  <div className="rounded-lg border border-[#222222] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#0f0f0f]">
                        <tr className="text-left text-xs text-slate-500">
                          <th className="px-4 py-3 font-medium">Campaign Name</th>
                          <th className="px-4 py-3 font-medium">Account</th>
                          <th className="px-4 py-3 font-medium">Sent</th>
                          <th className="px-4 py-3 font-medium">Replies</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222]">
                        <tr className="hover:bg-[#0f0f0f]/50">
                          <td className="px-4 py-3 font-medium text-white">Q1 Lead Generation</td>
                          <td className="px-4 py-3 text-slate-400">@acme.co</td>
                          <td className="px-4 py-3 text-slate-300">4,250</td>
                          <td className="px-4 py-3 text-[#F59E0B]">312</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Active</span></td>
                        </tr>
                        <tr className="hover:bg-[#0f0f0f]/50">
                          <td className="px-4 py-3 font-medium text-white">SaaS Outreach</td>
                          <td className="px-4 py-3 text-slate-400">@startup.io</td>
                          <td className="px-4 py-3 text-slate-300">2,890</td>
                          <td className="px-4 py-3 text-[#F59E0B]">198</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">Active</span></td>
                        </tr>
                        <tr className="hover:bg-[#0f0f0f]/50">
                          <td className="px-4 py-3 font-medium text-white">Enterprise B2B</td>
                          <td className="px-4 py-3 text-slate-400">@corp.net</td>
                          <td className="px-4 py-3 text-slate-300">1,560</td>
                          <td className="px-4 py-3 text-[#F59E0B]">87</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">Paused</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-sm text-slate-500 mt-4">
                Manage every client campaign from a single command center.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURES GRID */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything Your Agency <span className="text-[#F59E0B]">Needs</span>
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">
            Built specifically for agencies managing multiple client accounts.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#F59E0B]/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4 group-hover:bg-[#F59E0B]/20 transition-colors">
                <Users className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="text-base font-semibold mb-2">Multi-Account Gmail OAuth</h3>
              <p className="text-sm text-slate-400">Connect unlimited client Gmail accounts securely via official Google OAuth.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#F59E0B]/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4 group-hover:bg-[#F59E0B]/20 transition-colors">
                <Mail className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="text-base font-semibold mb-2">Campaign Builder</h3>
              <p className="text-sm text-slate-400">Build sequenced outreach campaigns with powerful personalization variables.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#F59E0B]/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4 group-hover:bg-[#F59E0B]/20 transition-colors">
                <Inbox className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="text-base font-semibold mb-2">Unified Inbox</h3>
              <p className="text-sm text-slate-400">See all client replies in one threaded inbox. Never miss a response.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#F59E0B]/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4 group-hover:bg-[#F59E0B]/20 transition-colors">
                <Activity className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="text-base font-semibold mb-2">Reply Tracking</h3>
              <p className="text-sm text-slate-400">Know exactly who replied, when, and from which campaign — instantly.</p>
            </div>
            
            {/* Feature 5 */}
            <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#F59E0B]/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4 group-hover:bg-[#F59E0B]/20 transition-colors">
                <Shield className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="text-base font-semibold mb-2">Official Google Compliance</h3>
              <p className="text-sm text-slate-400">Built on Gmail API only — no scraping, no unauthorized patterns, zero suspension risk.</p>
            </div>
            
            {/* Feature 6 */}
            <div className="p-5 rounded-xl bg-[#141414] border border-[#222222] hover:border-[#F59E0B]/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center mb-4 group-hover:bg-[#F59E0B]/20 transition-colors">
                <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <h3 className="text-base font-semibold mb-2">Real-Time Analytics</h3>
              <p className="text-sm text-slate-400">Track sends and replies per campaign and per client account in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-24 px-6 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Agencies Trust <span className="text-[#F59E0B]">EmailFlow</span>
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">
            Real feedback from agency owners who scaled their outreach.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="p-6 rounded-xl bg-[#141414] border border-[#222222]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <p className="text-sm text-slate-300 mb-6">
                "We manage 8 client campaigns and EmailFlow is the only tool that doesn't make us want to quit. The unified inbox alone saved us 4 hours a week."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center text-sm font-medium text-slate-300">JM</div>
                <div>
                  <div className="text-sm font-medium text-white">Jordan M.</div>
                  <div className="text-xs text-slate-500">Founder, LeadLayer Agency</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="p-6 rounded-xl bg-[#141414] border border-[#222222]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <p className="text-sm text-slate-300 mb-6">
                "Finally, a tool that understands how agencies work. Connecting 15 client accounts took 10 minutes. Campaign setup is blazing fast."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center text-sm font-medium text-slate-300">SK</div>
                <div>
                  <div className="text-sm font-medium text-white">Sarah K.</div>
                  <div className="text-xs text-slate-500">Director, OutreachPros</div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="p-6 rounded-xl bg-[#141414] border border-[#222222]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <p className="text-sm text-slate-300 mb-6">
                "Our clients love the reporting. We can show them exactly what's working. Closed $180K in new business last quarter thanks to better tracking."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#222222] flex items-center justify-center text-sm font-medium text-slate-300">DR</div>
                <div>
                  <div className="text-sm font-medium text-white">David R.</div>
                  <div className="text-xs text-slate-500">CEO, GrowthStack Agency</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Straightforward Pricing for <span className="text-[#F59E0B]">Agencies</span>
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">
            Choose the plan that fits your agency size.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Starter */}
            <div className="p-6 rounded-xl bg-[#141414] border border-[#222222]">
              <h3 className="text-lg font-semibold mb-2">Starter</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$49</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> Up to 3 Gmail accounts
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> 1,000 emails/month
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> Campaign builder
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> Unified inbox
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> Standard support
                </li>
              </ul>
              <Link 
                href="/auth/signin" 
                className="block w-full py-3 text-center text-sm font-medium text-white bg-[#222222] rounded-lg hover:bg-[#333] transition-all"
              >
                Get Started
              </Link>
            </div>
            
            {/* Agency */}
            <div className="p-6 rounded-xl bg-[#141414] border-2 border-[#F59E0B] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#F59E0B] text-[#0f0f0f] text-xs font-medium rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold mb-2">Agency</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> Unlimited Gmail accounts
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> Unlimited emails
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> All features
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> Priority support
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" /> White-label ready <span className="text-xs text-slate-500">(coming soon)</span>
                </li>
              </ul>
              <Link 
                href="/auth/signin" 
                className="block w-full py-3 text-center text-sm font-medium text-[#0f0f0f] bg-[#F59E0B] rounded-lg hover:bg-[#D97706] transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
          
          <p className="text-center text-sm text-slate-500 mt-8">
            No credit card required to start.
          </p>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-24 px-6 bg-[#141414] border-y border-[#222222]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Run Your Agency's<br />Outreach at <span className="text-[#F59E0B]">Scale?</span>
          </h2>
          <Link 
            href="/auth/signin" 
            className="inline-block px-8 py-4 text-lg font-medium text-[#0f0f0f] bg-[#F59E0B] rounded-lg hover:bg-[#D97706] transition-all"
          >
            Get Started Free
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            Takes 2 minutes to connect. No card required.
          </p>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#F59E0B] flex items-center justify-center font-bold text-[#0f0f0f] text-xs">E</div>
            <span className="text-sm text-slate-400">EmailFlow</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Twitter</a>
          </div>
          
          <p className="text-xs text-slate-600">
            © 2025 EmailFlow
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
