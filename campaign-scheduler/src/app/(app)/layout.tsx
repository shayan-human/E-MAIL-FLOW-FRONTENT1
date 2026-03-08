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
        <div className="h-screen bg-background-dark text-slate-100 flex overflow-hidden">
            <AppSidebar user={user} />
            <main className="flex-1 relative overflow-y-auto bg-background-dark">
                {/* Background ambient glows */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full" />
                </div>

                <div className="p-8 max-w-7xl mx-auto relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
