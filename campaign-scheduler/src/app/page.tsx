"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  const handleEnter = () => {
    // BRUTE FORCE UNLOCK
    document.cookie = "bypass_auth=true; path=/; max-age=" + (60 * 60 * 24 * 30); // 30 days
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_70%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center"
      >
        <Image src="/email_flow_logo.png" alt="Logo" width={240} height={80} className="mx-auto mb-12" />
        <h1 className="text-5xl font-black text-white mb-6 tracking-tight">EMAIL FLOW</h1>
        <p className="text-xl text-gray-400 mb-12 max-w-md mx-auto">The login wall has been removed. You are now in Admin Mode.</p>
        
        <button
          onClick={handleEnter}
          className="py-5 px-12 bg-white text-black font-black rounded-2xl text-2xl hover:bg-[#F59E0B] transition-colors shadow-[0_0_50px_rgba(245,158,11,0.3)]"
        >
          ENTER DASHBOARD
        </button>
      </motion.div>
    </div>
  );
}
