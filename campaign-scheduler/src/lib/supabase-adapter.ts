import { randomUUID } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://myagqulgddhnxrxkvvia.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15YWdxdWxnZGRobnhyeGt2dmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDM0NDQsImV4cCI6MjA5Mjc3OTQ0NH0.yz9h3IXnCQFbQ4ltj68dgkH3buFkL_oKcGptfYvZNUs';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

function formatUser(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || null,
    email: row.email,
    emailVerified: row.email_verified ? new Date(row.email_verified) : null,
    image: row.image || null,
    password: row.password || null,
  };
}

export function SupabaseRestAdapter(): any {
  const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1`;

  return {
    async createUser(user: any) {
      const id = user.id || randomUUID();
      const payload = {
        id,
        name: user.name || null,
        email: user.email,
        email_verified: user.emailVerified ? new Date(user.emailVerified).toISOString() : null,
        image: user.image || null,
      };

      const res = await fetch(`${restUrl}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('[SupabaseAdapter] createUser error:', err);
        throw new Error(`Failed to create user: ${err}`);
      }

      const rows = await res.json();
      return formatUser(rows[0]);
    },

    async getUser(id: string) {
      const res = await fetch(`${restUrl}/users?id=eq.${encodeURIComponent(id)}`, { headers });
      if (!res.ok) return null;
      const rows = await res.json();
      return formatUser(rows[0]);
    },

    async getUserByEmail(email: string) {
      const res = await fetch(`${restUrl}/users?email=eq.${encodeURIComponent(email)}`, { headers });
      if (!res.ok) return null;
      const rows = await res.json();
      return formatUser(rows[0]);
    },

    async getUserByAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      const url = `${restUrl}/accounts?provider=eq.${encodeURIComponent(provider)}&providerAccountId=eq.${encodeURIComponent(providerAccountId)}&select=user_id,users(*)`;
      const res = await fetch(url, { headers });
      if (!res.ok) return null;
      const rows = await res.json();
      if (!rows || rows.length === 0 || !rows[0].users) return null;
      return formatUser(rows[0].users);
    },

    async updateUser(user: any) {
      const payload: any = {};
      if (user.name !== undefined) payload.name = user.name;
      if (user.email !== undefined) payload.email = user.email;
      if (user.emailVerified !== undefined) payload.email_verified = user.emailVerified ? new Date(user.emailVerified).toISOString() : null;
      if (user.image !== undefined) payload.image = user.image;

      const res = await fetch(`${restUrl}/users?id=eq.${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) return null;
      const rows = await res.json();
      return formatUser(rows[0]);
    },

    async linkAccount(account: any) {
      const payload = {
        id: randomUUID(),
        user_id: account.userId,
        type: account.type,
        provider: account.provider,
        provider_account_id: account.providerAccountId,
        refresh_token: account.refresh_token || null,
        access_token: account.access_token || null,
        expires_at: account.expires_at || null,
        token_type: account.token_type || null,
        scope: account.scope || null,
        id_token: account.id_token || null,
        session_state: account.session_state || null,
      };

      const res = await fetch(`${restUrl}/accounts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('[SupabaseAdapter] linkAccount error:', err);
        throw new Error(`Failed to link account: ${err}`);
      }

      return account;
    },

    async deleteUser(userId: string) {
      await fetch(`${restUrl}/users?id=eq.${encodeURIComponent(userId)}`, { method: 'DELETE', headers });
    },

    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      await fetch(`${restUrl}/accounts?provider=eq.${encodeURIComponent(provider)}&providerAccountId=eq.${encodeURIComponent(providerAccountId)}`, {
        method: 'DELETE',
        headers,
      });
    },
  };
}
