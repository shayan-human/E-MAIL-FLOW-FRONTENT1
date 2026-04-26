import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://myagqulgddhnxrxkvvia.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.INSFORGE_ADMIN_API_KEY;

export async function getInsforgeClient() {
    const client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '');
    
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

export async function getInsforgeAdminClient() {
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY or INSFORGE_ADMIN_API_KEY is not configured");
    }
    const client = createClient(supabaseUrl, serviceRoleKey);

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

const adminClient = (serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null;
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
