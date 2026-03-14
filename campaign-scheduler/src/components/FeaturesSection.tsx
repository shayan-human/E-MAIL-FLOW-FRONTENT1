"use client";

import { Box, Lock, Search, Settings, Sparkles, Globe, Zap, RefreshCcw, Shield, Layers } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Core <span className="text-orange-500">Protocol</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-normal">
          Sovereign infrastructure designed for high-deliverability outreach at scale.
        </p>
      </div>

      <ul className="grid grid-cols-1 grid-rows-none gap-6 md:grid-cols-12 md:grid-rows-3 lg:gap-6 xl:grid-rows-2">
        <GridItem
          area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
          icon={<Globe className="h-5 w-5 text-orange-500" />}
          title="Unlimited Infrastructure"
          description="Scale your email automation without limits on volume or account count. Built for high-volume traders."
        />
        <GridItem
          area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
          icon={<Zap className="h-5 w-5 text-orange-500" />}
          title="Swift Execution"
          description="Real-time campaign triggering and sequence automation with sub-second latency."
        />
        <GridItem
          area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/9]"
          icon={<Shield className="h-5 w-5 text-orange-500" />}
          title="Official Google Compliance"
          description="Built strictly on official Gmail APIs. Zero risk of account suspension due to unauthorized scraping patterns. Your business, protected by design."
        />
        <GridItem
          area="md:[grid-area:2/7/3/13] xl:[grid-area:1/9/2/13]"
          icon={<RefreshCcw className="h-5 w-5 text-orange-500" />}
          title="Dynamic Load Balancing"
          description="Intelligent distribution across nodes. Automatically adjusts based on real-time account health and deliverability metrics."
        />
        <GridItem
          area="md:[grid-area:3/1/4/13] xl:[grid-area:2/5/3/13]"
          icon={<Layers className="h-5 w-5 text-orange-500" />}
          title="Unified Command Center"
          description="Manage thousands of identities from a single pane of glass. Full-spectrum visibility into every sent message, bounce, and reply."
        />
      </ul>
    </section>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={cn("min-h-[16rem] list-none", area)}>
      <div className="relative h-full rounded-[1.5rem] p-px border border-white/5 bg-white/5 overflow-hidden group">
        <GlowingEffect
          spread={60}
          glow={true}
          disabled={false}
          proximity={80}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[1.45rem] bg-black p-8 shadow-2xl transition-all duration-300 group-hover:bg-zinc-950/20">
          <div className="relative flex flex-1 flex-col justify-between gap-6">
            <div className="w-fit p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl backdrop-blur-sm">
              {icon}
            </div>
            <div className="space-y-4">
              <h3 className="text-xl leading-snug font-bold tracking-tight text-white md:text-2xl">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-400 md:text-base font-normal">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
