"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function SignInContent() {
  const handleEnter = () => {
    // BRUTE FORCE UNLOCK
    document.cookie = "bypass_auth=true; path=/; max-age=" + (60 * 60 * 24 * 30); // 30 days
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-12 bg-[#141414] border border-[#222222] rounded-2xl shadow-2xl"
      >
        <Image src="/email_flow_logo.png" alt="Logo" width={180} height={60} className="mx-auto mb-8" />
        <h1 className="text-3xl font-bold text-white mb-4">Welcome Back, Shayan</h1>
        <p className="text-gray-400 mb-8">Access is unlocked. Click below to enter your dashboard.</p>
        
        <button
          onClick={handleEnter}
          className="w-full py-4 px-8 bg-[#F59E0B] text-black font-bold rounded-xl text-xl hover:scale-105 transition-transform active:scale-95"
        >
          ENTER DASHBOARD
        </button>
      </motion.div>
    </div>
  );
}
