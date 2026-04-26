import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://myagqulgddhnxrxkvvia.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.INSFORGE_ADMIN_API_KEY;

export async function getInsforgeClient() {
    // For now, returning the standard client. 
    // In a full migration, this would use the user's session token.
    return createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '');
}

export async function getInsforgeAdminClient() {
    if (!serviceRoleKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY or INSFORGE_ADMIN_API_KEY is not configured");
    }
    return createClient(supabaseUrl, serviceRoleKey);
}

export const supabaseAdmin = (serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null;
