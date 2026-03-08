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
import { useAuth } from "@insforge/nextjs";

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
    const [isHovered, setIsHovered] = useState(false);
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
    };

    const isExpanded = !collapsed || isHovered;

    return (
        <aside
            className="h-full flex flex-col border-r transition-all duration-300 ease-in-out shrink-0"
            style={{
                width: isExpanded ? 240 : 64,
                backgroundColor: "var(--color-background-dark)",
                borderColor: "rgba(236, 91, 19, 0.05)",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Brand + Toggle */}
            <div className="h-14 flex items-center justify-between px-4 border-b shrink-0" style={{ borderColor: "rgba(236, 91, 19, 0.05)" }}>
                <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(236,91,19,0.3)] shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    {isExpanded && (
                        <span className="text-[15px] font-bold tracking-tight text-white whitespace-nowrap">
                            Aur
                        </span>
                    )}
                </div>
                <button
                    onClick={onToggle}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
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
            <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={!isExpanded ? item.label : undefined}
                            className={`relative flex items-center gap-3 rounded-md text-[13px] font-medium transition-colors duration-150 group
                                ${!isExpanded ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
                                ${isActive
                                    ? "text-primary"
                                    : "text-[#6b7280] hover:text-primary hover:bg-primary/5"
                                }`}
                        >
                            {/* Amber left accent bar */}
                            {isActive && (
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
                                    style={{
                                        height: 18,
                                        backgroundColor: "var(--color-primary)",
                                    }}
                                />
                            )}
                            <item.icon
                                className={`shrink-0 transition-colors ${isActive ? "text-primary" : "text-[#6b7280] group-hover:text-primary"}`}
                                style={{ width: 18, height: 18 }}
                            />
                            {isExpanded && (
                                <span className="whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {!isExpanded && (
                                <span className="absolute left-full ml-2 px-2.5 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50"
                                    style={{ backgroundColor: "#1f1f1f" }}
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
                className="border-t p-2 shrink-0"
                style={{ borderColor: "rgba(236, 91, 19, 0.05)" }}
                onMouseEnter={() => setShowLogout(true)}
                onMouseLeave={() => setShowLogout(false)}
            >
                <div
                    className={`flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-white/[0.04] ${!isExpanded ? "justify-center" : ""}`}
                >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[11px] font-bold uppercase shrink-0 border border-primary/40">
                        {user.email?.[0] || "U"}
                    </div>

                    {/* Email + Logout */}
                    {isExpanded && (
                        <div className="flex-1 min-w-0 flex items-center gap-1">
                            <p className="text-[11px] text-[#6b7280] truncate flex-1">
                                {user.email}
                            </p>
                            <button
                                onClick={handleSignOut}
                                className={`p-1 rounded-md text-[#6b7280] hover:text-red-400 hover:bg-white/[0.06] transition-all shrink-0 ${showLogout ? "opacity-100" : "opacity-0"}`}
                                title="Sign out"
                            >
                                <LogOut style={{ width: 14, height: 14 }} />
                            </button>
                        </div>
                    )}

                    {/* Tooltip for collapsed */}
                    {!isExpanded && (
                        <span
                            className={`absolute left-full ml-2 px-2.5 py-1 rounded-md text-xs font-medium text-white whitespace-nowrap transition-opacity z-50 ${showLogout ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                            style={{ backgroundColor: "#1f1f1f" }}
                        >
                            {user.email}
                        </span>
                    )}
                </div>
            </div>
        </aside>
    );
}
