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
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { insforge } from "@/lib/insforge";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/inbox", label: "Inbox", icon: MessageSquareText },
    { href: "/accounts", label: "Gmail Accounts", icon: Mail },
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
            className="h-full flex flex-col border-r transition-all duration-300 ease-in-out shrink-0 bg-background border-card-border"
            style={{
                width: collapsed ? 64 : 240,
            }}
        >
            {/* Brand + Toggle */}
            <div className="h-14 flex items-center justify-between px-4 border-b shrink-0 border-card-border">
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-[15px] font-bold tracking-tight text-foreground whitespace-nowrap">
                            Aur
                        </span>
                    )}
                </div>
                <button
                    onClick={onToggle}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors shrink-0"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={`sidebar-link ${isActive ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
                        >
                            <item.icon
                                className={`shrink-0 transition-colors ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                                style={{ width: 18, height: 18 }}
                            />
                            {!collapsed && (
                                <span className="whitespace-nowrap text-[13px] font-medium">
                                    {item.label}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {collapsed && (
                                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 glass-card"
                                >
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User section at bottom */}
            <div
                className="border-t p-3 shrink-0 border-card-border"
                onMouseEnter={() => setShowLogout(true)}
                onMouseLeave={() => setShowLogout(false)}
            >
                <div
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04] ${collapsed ? "justify-center" : ""}`}
                >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold uppercase shrink-0">
                        {user.email?.[0] || "U"}
                    </div>

                    {/* Email + Logout */}
                    {!collapsed && (
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                            <p className="text-[11px] text-muted-foreground truncate flex-1">
                                {user.email}
                            </p>
                            <button
                                onClick={handleSignOut}
                                className={`p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all shrink-0 ${showLogout ? "opacity-100" : "opacity-0"}`}
                                title="Sign out"
                            >
                                <LogOut style={{ width: 14, height: 14 }} />
                            </button>
                        </div>
                    )}

                    {/* Tooltip for collapsed */}
                    {collapsed && (
                        <span
                            className={`absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-foreground whitespace-nowrap transition-opacity z-50 glass-card ${showLogout ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                        >
                            {user.email}
                        </span>
                    )}
                </div>
            </div>
        </aside>
    );
}
