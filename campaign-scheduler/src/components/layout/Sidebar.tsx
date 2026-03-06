"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Megaphone,
    MessageSquareText,
    Mail,
    LogOut,
    Cpu,
    ChevronLeft,
    ChevronRight,
    Activity
} from "lucide-react";
import { insforge } from "@/lib/insforge";

const navItems = [
    { href: "/dashboard", label: "Console", icon: LayoutDashboard },
    { href: "/campaigns", label: "Deployments", icon: Megaphone },
    { href: "/inbox", label: "Comm-Link", icon: MessageSquareText },
    { href: "/accounts", label: "Nodes", icon: Mail },
];

interface SidebarProps {
    user: { email?: string; id: string };
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const [showLogout, setShowLogout] = useState(false);

    const handleSignOut = async () => {
        await insforge.auth.signOut();
        window.location.href = "/";
    };

    return (
        <aside
            className={`h-full flex flex-col border-r transition-all duration-500 ease-in-out shrink-0 bg-[#050505] border-white/5 relative z-40`}
            style={{
                width: collapsed ? 80 : 280,
            }}
        >
            {/* Brand + Toggle */}
            <div className="h-24 flex items-center justify-between px-6 border-b shrink-0 border-white/5 group relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 overflow-hidden relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-[#9213ec] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)] shrink-0">
                        <Cpu className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="text-xl font-outfit font-black tracking-tighter text-white uppercase whitespace-nowrap">
                                Aur <span className="text-blue-500">.</span>
                            </span>
                            <span className="text-[8px] font-black tracking-[0.3em] text-zinc-600 uppercase whitespace-nowrap">
                                Engine v4.0
                            </span>
                        </div>
                    )}
                </div>
                {!collapsed && (
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-600 hover:text-white hover:bg-white/5 transition-all shrink-0 z-50"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Navigation Grid */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={`
                                group relative flex items-center gap-4 px-4 py-4 rounded-2xl
                                transition-all duration-300
                                ${isActive
                                    ? 'bg-blue-600/10 text-white'
                                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                                }
                                ${collapsed ? "justify-center px-0" : ""}
                            `}
                        >
                            {/* Active Glow Indicator */}
                            {isActive && (
                                <div className="absolute left-0 w-[2.5px] h-6 bg-blue-500 shadow-[0_0_15px_#3b82f6] rounded-full" />
                            )}

                            <item.icon className={`transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-blue-500' : ''}`} style={{ width: 18, height: 18 }} />

                            {!collapsed && (
                                <span className={`text-[11px] font-black uppercase tracking-[0.1em] whitespace-nowrap ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                                    {item.label}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {collapsed && (
                                <span className="absolute left-full ml-4 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all z-50 glass-card">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* System Status / User Section */}
            <div className="p-4 border-t border-white/5">
                <div
                    className={`glass-card rounded-2xl overflow-hidden transition-all duration-500 ${collapsed ? "p-2" : "p-4"}`}
                    onMouseEnter={() => setShowLogout(true)}
                    onMouseLeave={() => setShowLogout(false)}
                >
                    {!collapsed && (
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0">
                                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-black text-white uppercase tracking-tight truncate">{user.email?.split('@')[0]}</span>
                                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Core Status: Active</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSignOut}
                        className={`
                            w-full flex items-center gap-3 px-3 py-3 rounded-xl
                            text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-all
                            ${collapsed ? "justify-center" : ""}
                        `}
                    >
                        <LogOut style={{ width: 16, height: 16 }} />
                        {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>}
                    </button>
                </div>
            </div>

            {/* Toggle Button for Collapsed State */}
            {collapsed && (
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-24 w-6 h-6 bg-[#050505] border border-white/5 rounded-full flex items-center justify-center text-zinc-600 hover:text-white transition-all z-50 shadow-xl"
                >
                    <ChevronRight className="w-3 h-3" />
                </button>
            )}
        </aside>
    );
}
