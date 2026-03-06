import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://4njfm5n4.us-east.insforge.app';

/**
 * Returns an authenticated InsForge client for the current request.
 * Uses the user's accessToken from the session to enforce RLS.
 */
export async function getInsforgeClient() {
    const { token } = await auth();

    // We only pass the user's token. 
    // Passing the anonKey would override the authenticated session for data fetching.
    return createClient({
        baseUrl,
        edgeFunctionToken: token || undefined,
    });
}
