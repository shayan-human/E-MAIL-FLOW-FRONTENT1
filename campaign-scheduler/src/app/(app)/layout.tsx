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
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden">
            <AppSidebar user={user} />
            <main className="flex-1 relative overflow-y-auto bg-zinc-950">
                {/* Background ambient glows */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full" />
                </div>

                <div className="p-8 max-w-7xl mx-auto relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
