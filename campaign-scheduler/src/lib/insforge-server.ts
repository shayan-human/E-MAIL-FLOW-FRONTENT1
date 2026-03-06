import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://4njfm5n4.us-east.insforge.app';

/**
 * Returns an authenticated InsForge client for the current request.
 * Uses the user's accessToken from the session to enforce RLS.
 */
export async function getInsforgeClient() {
    const { token } = await auth();

    // If no session, return the default anon client (RLS will still block sensitive data)
    const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

    return createClient({
        baseUrl,
        anonKey,
        edgeFunctionToken: token || undefined,
    });
}
