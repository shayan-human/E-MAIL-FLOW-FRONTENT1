import { toast } from "@/components/ui/toast-provider";
import { useAuth } from "@insforge/nextjs";

const AUTH_KEYS = [
    'insforge-session',
    'insforge-token',
    'insforge-refresh-token',
    'auth-token',
    'session',
    'user',
    'dashboard_visible_cards',
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
    const { signOut } = useAuth();

    return async function sessionExpired() {
        localStorage.clear();
        sessionStorage.clear();

        AUTH_KEYS.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        try {
            await signOut();
        } catch {
        }

        toast.error("Your session has expired. Please sign in again.");

        window.location.href = "/auth/signin?reason=session_expired";
    };
}
