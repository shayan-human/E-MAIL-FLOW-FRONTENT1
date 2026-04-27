import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function auth() {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const { data: { session } } = await supabase.auth.getSession();
    
    // Emergency Bypass for demgrow_admin
    if (!session && cookieStore.get('bypass_auth')?.value === 'true') {
        return {
            session: null,
            user: {
                id: '00000000-0000-0000-0000-000000000000',
                email: 'admin@demgrow.space',
                role: 'authenticated',
            } as any,
        };
    }
    
    return {
        session,
        user: session?.user ?? null,
    };
}
