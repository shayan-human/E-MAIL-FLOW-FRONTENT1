import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing in environment variables');
}

// Use createBrowserClient so that it syncs session with cookies for middleware
export const insforge = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Alias for clarity in new files
export const supabase = insforge;
