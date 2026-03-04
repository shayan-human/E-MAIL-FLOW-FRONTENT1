"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUser } from "@insforge/nextjs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        console.log("[AppLayout] Auth State:", { isLoaded, user: user?.email || "null" });

        let timeoutId: NodeJS.Timeout;

        if (isLoaded && !user) {
            console.warn("[AppLayout] No user found, waiting buffer before redirecting...");
            // Add a 750ms buffer/debounce to prevent flash logouts when the provider hydrates
            timeoutId = setTimeout(() => {
                router.replace("/");
            }, 750);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isLoaded, user, router]);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <Sidebar
                user={user}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((c) => !c)}
            />
            <main
                className="min-h-screen transition-all duration-300 ease-in-out bg-background"
                style={{ paddingLeft: sidebarCollapsed ? 64 : 240 }}
            >
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
