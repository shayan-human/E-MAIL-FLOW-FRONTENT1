import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error('Supabase URL is missing in environment variables');
}

export async function getSupabaseClient() {
    const client = createClient(supabaseUrl!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
    
    (client as any).getHttpClient = () => ({
        baseUrl: supabaseUrl,
        get: async () => ({ data: {} })
    });
    
    (client as any).getConfig = () => ({
        baseUrl: supabaseUrl,
        client
    });

    return client;
}

export async function getSupabaseAdminClient() {
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
    }
    const client = createClient(supabaseUrl!, serviceRoleKey);

    (client as any).getHttpClient = () => ({
        baseUrl: supabaseUrl,
        get: async () => ({ data: {} })
    });
    
    (client as any).getConfig = () => ({
        baseUrl: supabaseUrl,
        client
    });

    return client;
}

// Keeping aliases to avoid breaking existing imports
export const getInsforgeClient = getSupabaseClient;
export const getInsforgeAdminClient = getSupabaseAdminClient;

const adminClient = (serviceRoleKey) ? createClient(supabaseUrl!, serviceRoleKey) : null;
if (adminClient) {
    (adminClient as any).getHttpClient = () => ({
        baseUrl: supabaseUrl,
        get: async () => ({ data: {} })
    });
    (adminClient as any).getConfig = () => ({
        baseUrl: supabaseUrl,
        client: adminClient
    });
}
export const supabaseAdmin = adminClient;
