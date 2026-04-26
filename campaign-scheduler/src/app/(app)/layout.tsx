import { redirect } from "next/navigation";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AppSidebar } from "./AppSidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Server-side protection
    if (!user) {
        redirect("/auth/signin");
    }

    return (
        <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}>
            <AppSidebar user={user} />
            <main className="flex-1 relative overflow-y-auto" style={{ backgroundColor: "var(--bg-page)" }}>
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
