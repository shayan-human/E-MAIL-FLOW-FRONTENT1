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
    Settings,
    FileText,
} from "lucide-react";
import { useAuth } from "@insforge/nextjs";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/campaigns", label: "Campaigns", icon: Megaphone },
    { href: "/inbox", label: "Inbox", icon: MessageSquareText },
    { href: "/drafts", label: "Drafts", icon: FileText },
    { href: "/accounts", label: "Gmail Accounts", icon: Mail },
    { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
    user: { email?: string; id: string };
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const [showLogout, setShowLogout] = useState(false);
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
    };

    const isExpanded = !collapsed;

    return (
            <aside
            className={`h-full flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-x-hidden ${isExpanded ? "border-r" : "border-r-0"}`}
            style={{
                width: isExpanded ? 240 : 64,
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
        >
            <style jsx>{`
                aside::-webkit-scrollbar {
                    display: none;
                }
                nav::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            {/* Brand + Toggle */}
            <div className={`h-14 flex items-center border-b shrink-0 transition-all ${isExpanded ? "justify-between px-4" : "justify-center"}`} style={{ borderColor: "rgba(236, 91, 19, 0.05)" }}>
                {isExpanded ? (
                    <>
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#F59E0B", color: "#0f0f0f" }}>
                                <span className="text-[18px] font-bold">E</span>
                            </div>
                            <span className="text-[15px] font-bold tracking-tight text-white whitespace-nowrap">
                                Aur
                            </span>
                        </div>
                        <button
                            onClick={onToggle}
                            className="w-6 h-6 flex items-center justify-center rounded-md text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors shrink-0"
                            title="Collapse sidebar"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
                        style={{ backgroundColor: "#F59E0B", color: "#0f0f0f" }}
                        title="Expand sidebar"
                    >
                        <span className="text-[18px] font-bold">E</span>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={!isExpanded ? item.label : undefined}
                            className={`relative flex items-center gap-3 rounded-md transition-colors duration-150 group
                                ${isExpanded ? "px-3 py-2.5 text-[13px]" : "justify-center px-0 py-3"}
                                ${isActive
                                    ? "text-primary bg-primary/5"
                                    : "text-[#6b7280] hover:text-primary hover:bg-primary/5"
                                }`}
                        >
                            {/* Amber left accent bar */}
                            {isActive && (
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full"
                                    style={{
                                        backgroundColor: "var(--color-primary)",
                                    }}
                                />
                            )}
                            <item.icon
                                className={`shrink-0 transition-colors ${isActive ? "text-primary" : "text-[#6b7280] group-hover:text-primary"}`}
                                style={{ width: 18, height: 18 }}
                            />
                            {isExpanded && (
                                <span className="whitespace-nowrap font-medium">
                                    {item.label}
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {!isExpanded && (
                                <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md text-xs font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl"
                                    style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
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
                className={`border-t p-2 shrink-0 transition-all ${isExpanded ? "" : "flex justify-center"}`}
                style={{ borderColor: "rgba(236, 91, 19, 0.05)" }}
                onMouseEnter={() => setShowLogout(true)}
                onMouseLeave={() => setShowLogout(false)}
            >
                <div className={`flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-white/[0.04] ${isExpanded ? "w-full" : "justify-center"}`}>
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[11px] font-bold uppercase shrink-0 border border-primary/40">
                        {user.email?.[0] || "U"}
                    </div>

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

                    {!isExpanded && showLogout && (
                        <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md text-xs font-medium text-white whitespace-nowrap z-50 shadow-xl"
                            style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                        >
                            {user.email}
                        </span>
                    )}
                </div>
            </div>
        </aside>
    );
}
