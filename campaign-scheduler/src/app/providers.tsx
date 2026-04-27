'use client';

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
    // We are now using pure Supabase SSR, so we don't need a heavy wrapper provider.
    // The session is handled by the middleware and the auth helper.
    return <>{children}</>;
}
