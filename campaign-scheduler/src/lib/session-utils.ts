import { toast } from "@/components/ui/toast-provider";
import { insforge as supabase } from "@/lib/insforge";

const AUTH_KEYS = [
    'sb-access-token',
    'sb-refresh-token',
    'auth-token',
    'session',
    'user',
];

export async function handleSessionExpired(): Promise<void> {
    localStorage.clear();
    sessionStorage.clear();

    AUTH_KEYS.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    });

    toast.error("Your session has expired. Please sign in again.");

    window.location.href = "/auth/signin?reason=session_expired";
}

export function useSessionExpired() {
    return async function sessionExpired() {
        localStorage.clear();
        sessionStorage.clear();

        AUTH_KEYS.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        try {
            await supabase.auth.signOut();
        } catch {
        }

        toast.error("Your session has expired. Please sign in again.");

        window.location.href = "/auth/signin?reason=session_expired";
    };
}
