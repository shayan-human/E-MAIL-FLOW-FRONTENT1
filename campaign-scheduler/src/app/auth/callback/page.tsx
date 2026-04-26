"use client";

import { useEffect } from "react";
import { insforge } from "@/lib/insforge";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session }, error } = await insforge.auth.getSession();
            
            if (session) {
                router.replace("/dashboard");
            } else if (error) {
                console.error("Auth callback session error:", error);
                router.replace("/?error=auth_failed");
            } else {
                // If no session yet, wait a bit and try again (for OAuth settling)
                setTimeout(async () => {
                    const { data: { session: retrySession } } = await insforge.auth.getSession();
                    if (retrySession) {
                        router.replace("/dashboard");
                    } else {
                        router.replace("/?error=auth_failed");
                    }
                }, 2000);
            }
        };

        checkSession();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    );
}
