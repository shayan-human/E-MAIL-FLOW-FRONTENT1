"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { insforge } from "@/lib/insforge";

const COLORS = {
  page: "#0f0f0f",
  card: "#141414",
  border: "#222222",
  accent: "#F59E0B",
  text: "#FFFFFF",
  muted: "#888888",
};

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const reducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isLightMode = resolvedTheme === 'light';
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('reason') === 'session_expired') {
      setShowSessionExpired(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/dashboard";
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      console.log("Forcing direct Supabase OAuth...");
      const { error } = await insforge.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Direct OAuth failed:", error);
      alert(`Login Error: ${error.message || "Please check your Supabase/Google configuration"}`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.page }}
    >
      {/* Ambient glow behind card */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[600px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0) 70%)" }}
      />

      {/* Minimal Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className={isLightMode ? "rounded-lg p-1.5 bg-white" : ""}>
            <Image 
              src="/email_flow_logo.png" 
              alt="Email Flow" 
              height={40} 
              width={120}
              style={{ width: 'auto', height: 40 }}
            />
          </div>
        </Link>
        <Link
          href="/"
          className="text-sm transition-colors"
          style={{ color: COLORS.muted }}
          onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.muted)}
        >
          ← Back to Home
        </Link>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="w-full max-w-[480px] p-12 rounded-[12px]"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className={isLightMode ? "rounded-lg p-2 bg-white mb-4" : "mb-4"}>
              <Image 
                src="/email_flow_logo.png" 
                alt="Email Flow" 
                height={48} 
                width={144}
                style={{ width: 'auto', height: 48 }}
              />
            </div>
            <h1 className="text-[28px] font-bold" style={{ color: COLORS.text }}>
              Welcome back.
            </h1>
            <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
              Sign in to your EmailFlow account.
            </p>
          </div>

          {/* No Google, No Divider - Pure Email/Pass Only */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[13px] uppercase tracking-widest font-medium ml-1"
                style={{ color: COLORS.muted }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@agency.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 rounded-[10px] px-4 text-white placeholder:text-[#888888] outline-none transition-all"
                style={{
                  backgroundColor: COLORS.page,
                  border: `1px solid ${COLORS.border}`,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.accent;
                  e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = COLORS.border;
                  e.target.style.boxShadow = "none";
                }}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-[13px] uppercase tracking-widest font-medium ml-1"
                style={{ color: COLORS.muted }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 rounded-[10px] px-4 pr-12 text-white placeholder:text-[#888888] outline-none transition-all"
                  style={{
                    backgroundColor: COLORS.page,
                    border: `1px solid ${COLORS.border}`,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.accent;
                    e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = COLORS.border;
                    e.target.style.boxShadow = "none";
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: COLORS.muted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.muted)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-[12px] transition-colors"
                  style={{ color: COLORS.muted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.muted)}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-12 rounded-[10px] font-medium uppercase tracking-wide transition-all disabled:opacity-70"
              style={{
                backgroundColor: COLORS.accent,
                color: COLORS.page,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(110%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(100%)";
              }}
            >
              {!reducedMotion && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-[10px] pointer-events-none"
                  style={{ border: `1px solid rgba(245,158,11,0.55)` }}
                  animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                  transition={{ duration: 1.1, ease: easeOut, repeat: Infinity, repeatDelay: 1.9 }}
                />
              )}
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Bottom text */}
          <div className="mt-8 text-center">
            <span className="text-[13px]" style={{ color: COLORS.muted }}>
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href="/auth/signup"
              className="text-[13px] transition-colors"
              style={{ color: COLORS.accent }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D97706")}
              onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.accent)}
            >
              Get started free
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
