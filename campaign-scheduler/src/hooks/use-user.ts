import { useEffect, useState } from 'react';
import { insforge as supabase } from '@/lib/insforge';
import type { User } from '@supabase/supabase-js';

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsLoaded(true);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setIsLoaded(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, isLoaded };
}

// Alias for files that expect useAuth
export const useAuth = useUser;
