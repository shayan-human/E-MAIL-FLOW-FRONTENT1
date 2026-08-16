import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://myagqulgddhnxrxkvvia.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15YWdxdWxnZGRobnhyeGt2dmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDM0NDQsImV4cCI6MjA5Mjc3OTQ0NH0.yz9h3IXnCQFbQ4ltj68dgkH3buFkL_oKcGptfYvZNUs';

const userUuidCache = new Map<string, string>();

async function resolveDbUserId(email: string): Promise<string | null> {
  if (userUuidCache.has(email)) {
    return userUuidCache.get(email)!;
  }

  try {
    const res = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: 'no-store'
    });
    if (res.ok) {
      const users = await res.json();
      if (users && users.length > 0 && users[0].id) {
        userUuidCache.set(email, users[0].id);
        return users[0].id;
      }
    }
  } catch (e) {
    console.error('[auth-helper] Error resolving DB user ID:', e);
  }
  return null;
}

export async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const dbUserId = await resolveDbUserId(session.user.email);
  const userId = dbUserId || (session.user as any).id as string;

  return {
    id: userId,
    email: session.user.email as string,
    name: session.user.name as string,
    image: session.user.image as string | undefined,
  };
}

export async function auth() {
  const user = await getUser();
  
  return {
    user,
    session: user ? { user } : null,
    token: null,
  };
}
