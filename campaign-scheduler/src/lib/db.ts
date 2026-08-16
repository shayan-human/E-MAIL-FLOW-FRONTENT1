import { Pool } from 'pg';
import dns from 'dns';

// Render web services only support IPv4 egress. Force Node.js to resolve IPv4 addresses first.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://myagqulgddhnxrxkvvia.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15YWdxdWxnZGRobnhyeGt2dmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMDM0NDQsImV4cCI6MjA5Mjc3OTQ0NH0.yz9h3IXnCQFbQ4ltj68dgkH3buFkL_oKcGptfYvZNUs';

function getConnectionString(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    const fallbackRef = 'myagqulgddhnxrxkvvia';

    if (parsed.hostname.endsWith('.supabase.co')) {
      const parts = parsed.hostname.split('.');
      const projRef = (parts[0] === 'db' ? parts[1] : parts[0]) || fallbackRef;
      parsed.hostname = 'aws-0-ap-northeast-2.pooler.supabase.com';
      parsed.username = `postgres.${projRef}`;
      return parsed.toString();
    }

    if (parsed.hostname.includes('pooler.supabase.com')) {
      if (!parsed.username.startsWith('postgres.')) {
        parsed.username = `postgres.${fallbackRef}`;
      }
      return parsed.toString();
    }
  } catch (err) {
    // Ignore URL parse error
  }

  return url;
}

const connectionString = getConnectionString();

const rawPool = new Pool({
  connectionString,
  ssl: connectionString?.includes('supabase') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function restQueryFallback(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  try {
    const cleanText = text.trim();
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
    const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1`;

    if (/^SELECT/i.test(cleanText)) {
      const fromMatch = cleanText.match(/FROM\s+([a-zA-Z0-9_"]+)/i);
      if (!fromMatch) return { rows: [], rowCount: 0 };
      
      const rawTable = fromMatch[1].replace(/"/g, '');
      
      if (/COUNT\(\*\)/i.test(cleanText)) {
        let endpoint = `${restUrl}/${rawTable}?select=id`;
        
        if (cleanText.includes('user_id = $1') && params[0]) {
          endpoint += `&user_id=eq.${encodeURIComponent(params[0])}`;
        }
        if (cleanText.includes('is_active = true')) {
          endpoint += `&is_active=eq.true`;
        }
        if (cleanText.includes("status = 'BOUNCED'")) {
          endpoint += `&status=eq.BOUNCED`;
        }
        if (cleanText.includes("status IN ('SENT', 'REPLIED')")) {
          endpoint += `&status=in.(SENT,REPLIED)`;
        }
        if (cleanText.includes('campaign_id = ANY($1)') && Array.isArray(params[0])) {
          if (params[0].length === 0) return { rows: [{ count: 0 }], rowCount: 1 };
          endpoint += `&campaign_id=in.(${params[0].join(',')})`;
        }

        const countRes = await fetch(endpoint, {
          headers: { ...headers, 'Prefer': 'count=exact' }
        });
        const contentRange = countRes.headers.get('content-range');
        let count = 0;
        if (contentRange && contentRange.includes('/')) {
          count = parseInt(contentRange.split('/')[1]) || 0;
        } else if (countRes.ok) {
          const data = await countRes.json();
          count = Array.isArray(data) ? data.length : 0;
        }
        return { rows: [{ count }], rowCount: 1 };
      }

      let endpoint = `${restUrl}/${rawTable}?select=*`;
      
      if (cleanText.includes('WHERE user_id = $1') && params[0]) {
        endpoint += `&user_id=eq.${encodeURIComponent(params[0])}`;
      }
      if (cleanText.includes('campaign_id = ANY($1)') && Array.isArray(params[0])) {
        if (params[0].length === 0) return { rows: [], rowCount: 0 };
        endpoint += `&campaign_id=in.(${params[0].join(',')})`;
      }
      if (cleanText.includes('lead_id = ANY($1)') && Array.isArray(params[0])) {
        if (params[0].length === 0) return { rows: [], rowCount: 0 };
        endpoint += `&lead_id=in.(${params[0].join(',')})`;
      }
      if (cleanText.includes('ORDER BY created_at DESC')) {
        endpoint += `&order=created_at.desc`;
      }

      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const rows = await res.json();
        return { rows: Array.isArray(rows) ? rows : [], rowCount: Array.isArray(rows) ? rows.length : 0 };
      }
    }
  } catch (e) {
    console.error('[DB Rest Fallback Error]:', e);
  }

  return { rows: [], rowCount: 0 };
}

export const pool = {
  async query(text: string | any, params?: any[]) {
    const queryText = typeof text === 'string' ? text : text.text;
    const queryParams = typeof text === 'string' ? params : text.values;
    try {
      return await rawPool.query(queryText, queryParams);
    } catch (err: any) {
      console.warn(`[DB Pool Warning] ${err.message}. Falling back to Supabase REST API...`);
      return await restQueryFallback(queryText, queryParams);
    }
  },
  on(event: string, listener: (...args: any[]) => void) {
    return rawPool.on(event, listener);
  },
  connect() {
    return rawPool.connect();
  }
};
