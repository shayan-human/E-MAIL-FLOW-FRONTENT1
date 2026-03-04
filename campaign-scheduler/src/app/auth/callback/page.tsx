"use client";

import { useEffect } from "react";
import { useUser } from "@insforge/nextjs";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && user) {
            router.replace("/dashboard");
        }
    }, [isLoaded, user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    );
}
