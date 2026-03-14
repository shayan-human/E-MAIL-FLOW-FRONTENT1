"use client";

import { Globe, Zap, RefreshCcw, Shield, Layers, BarChart3 } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  const features = [
    {
      icon: <Globe className="h-5 w-5 text-orange-500" />,
      title: "Unlimited Infrastructure",
      description: "Scale your email automation without limits on volume or account count. Built for high-volume traders."
    },
    {
      icon: <Shield className="h-5 w-5 text-orange-500" />,
      title: "Official Google Compliance",
      description: "Built strictly on official Gmail APIs. Zero risk of account suspension due to unauthorized patterns."
    },
    {
      icon: <Zap className="h-5 w-5 text-orange-500" />,
      title: "Swift Execution",
      description: "Real-time campaign triggering and sequence automation with sub-second latency for all users."
    },
    {
      icon: <RefreshCcw className="h-5 w-5 text-orange-500" />,
      title: "Dynamic Load Balancing",
      description: "Intelligent distribution across nodes. Automatically adjusts based on real-time health metrics."
    },
    {
      icon: <Layers className="h-5 w-5 text-orange-500" />,
      title: "Unified Command Center",
      description: "Manage thousands of identities from a single pane of glass. Full-spectrum visibility into every reply."
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-orange-500" />,
      title: "Deep Analytics",
      description: "Granular data reporting and conversion tracking to optimize your outreach performance in real-time."
    }
  ];

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <GridItem
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}

interface GridItemProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ icon, title, description }: GridItemProps) => {
  return (
    <li className="list-none h-full">
      <div className="relative h-full rounded-[1.5rem] p-px border border-white/5 bg-white/5 overflow-hidden group">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <div className="relative flex h-full flex-col gap-6 overflow-hidden rounded-[1.45rem] bg-black p-8 shadow-2xl transition-all duration-300 group-hover:bg-zinc-950/20">
          <div className="w-fit p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl backdrop-blur-sm">
            {icon}
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-400 md:text-base font-normal">
              {description}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
};
