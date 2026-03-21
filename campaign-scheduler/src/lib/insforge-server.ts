import { createClient } from '@insforge/sdk';
import { auth } from '@insforge/nextjs/server';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || 'https://4njfm5n4.us-east.insforge.app';

export async function getInsforgeClient() {
    const { token } = await auth();
    return createClient({
        baseUrl,
        edgeFunctionToken: token || undefined,
    });
}

export async function getInsforgeAdminClient() {
    const adminKey = process.env.INSFORGE_ADMIN_API_KEY;
    if (!adminKey) {
        throw new Error("INSFORGE_ADMIN_API_KEY is not configured");
    }
    return createClient({
        baseUrl,
        edgeFunctionToken: adminKey,
    });
}
