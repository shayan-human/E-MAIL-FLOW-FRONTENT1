import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    }
});

// Shims for compatibility with @insforge/nextjs provider
(supabase as any).getHttpClient = () => ({
    baseUrl: supabaseUrl,
    get: async (path: string) => ({ data: {} })
});

(supabase as any).getConfig = () => ({
    baseUrl: supabaseUrl,
    anonKey: supabaseAnonKey,
    client: supabase
});

// Alias for easier transition
export const insforge = supabase;
