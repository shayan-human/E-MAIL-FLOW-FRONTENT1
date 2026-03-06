import { redirect } from "next/navigation";
import { auth } from "@insforge/nextjs/server";
import { AppSidebar } from "./AppSidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const { user } = await auth();

    // Server-side protection
    if (!user) {
        redirect("/");
    }

    return (
        <div className="h-screen bg-black text-zinc-100 flex overflow-hidden relative font-sans selection:bg-blue-500/30">
            {/* Cyber Background Infrastructure */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-[0.2]" />
                <div className="scanline" />

                {/* Dynamic Ambient Anomalies */}
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/[0.03] blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/[0.03] blur-[150px] rounded-full animate-pulse [animation-duration:8s]" />

                {/* Horizontal Divider Lines */}
                <div className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
                <div className="absolute top-3/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />
            </div>

            <AppSidebar user={user} />

            <main className="flex-1 relative overflow-y-auto bg-transparent custom-scrollbar z-10">
                <div className="p-8 max-w-7xl mx-auto min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
}
