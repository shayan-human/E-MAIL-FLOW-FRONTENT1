import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error('Supabase URL is missing in environment variables');
}

export async function getSupabaseClient() {
    const cookieStore = await cookies();
    
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Handle cookie setting in RSC if needed
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Handle cookie removal in RSC if needed
                    }
                },
            },
        }
    );
}

export async function getSupabaseAdminClient() {
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    }
    return createClient(supabaseUrl!, serviceRoleKey);
}

// Keeping aliases to avoid breaking existing imports
export const getInsforgeClient = getSupabaseClient;
export const getInsforgeAdminClient = getSupabaseAdminClient;

export const supabaseAdmin = (serviceRoleKey) ? createClient(supabaseUrl!, serviceRoleKey) : null;
