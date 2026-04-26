import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://myagqulgddhnxrxkvvia.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

export const insforge = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    }
});

// Shims for compatibility with @insforge/nextjs provider
(insforge as any).getHttpClient = () => ({
    baseUrl: supabaseUrl,
    get: async (path: string) => {
        // Mock get for basic metadata checks if any
        return { data: {} };
    }
});

(insforge as any).getConfig = () => ({
    baseUrl: supabaseUrl,
    anonKey: supabaseAnonKey,
    client: insforge
});

// Alias for easier transition
export const supabase = insforge;
