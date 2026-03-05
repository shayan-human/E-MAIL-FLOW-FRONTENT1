"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useUser } from "@insforge/nextjs";
import { insforge } from "@/lib/insforge";

export default function LoginPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.replace("/dashboard");
    }
  }, [isLoaded, user, router]);

  const handleSignIn = async () => {
    try {
      // Corrected parameters for InsForge SDK: redirectTo is top-level
      const { error } = await insforge.auth.signInWithOAuth({
        provider: 'google',
        redirectTo: `${window.location.origin}/api/auth/callback`,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  if (!isLoaded || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 relative overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-violet-400/10 dark:bg-violet-600/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-indigo-400/10 dark:bg-indigo-600/5 blur-[120px] rounded-full" />

      <div className="max-w-md w-full p-8 bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/5 flex flex-col items-center text-center space-y-6 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Welcome to Aur
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in to orchestrate your smart campaigns.
          </p>
        </div>
        <button
          onClick={handleSignIn}
          className="w-full py-3 px-4 bg-foreground text-background font-semibold rounded-xl shadow-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <Sparkles className="w-5 h-5" />
          Get Started with InsForge
        </button>
      </div>
    </main>
  );
}
