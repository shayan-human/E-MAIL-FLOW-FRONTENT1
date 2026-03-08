"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";

interface AppSidebarProps {
    user: { email?: string; id: string };
}

export function AppSidebar({ user }: AppSidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {collapsed && (
                <button
                    onClick={() => setCollapsed(false)}
                    className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#141414] border border-[#222] text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-all shadow-xl"
                    title="Open sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}
            <Sidebar
                user={user}
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
            />
        </>
    );
}
