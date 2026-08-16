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
  connectionTimeoutMillis: 5000, // 5s connection timeout to accommodate Oregon-Seoul latency
});

function extractFilters(cleanText: string, params: any[] = []): string {
  let filters = '';

  // 1. user_id filter
  const userIdMatch = cleanText.match(/user_id\s*=\s*\$(\d+)/i);
  if (userIdMatch) {
    const val = params[parseInt(userIdMatch[1], 10) - 1];
    if (val !== undefined) {
      filters += `&user_id=eq.${encodeURIComponent(String(val))}`;
    }
  }

  // 2. campaign_id filter
  const campaignIdMatch = cleanText.match(/campaign_id\s*=\s*ANY\(\$(\d+)(?:::uuid\[\])?\)/i);
  if (campaignIdMatch) {
    const arr = params[parseInt(campaignIdMatch[1], 10) - 1];
    if (Array.isArray(arr)) {
      if (arr.length === 0) return 'EMPTY_CAMPAIGN_ID';
      filters += `&campaign_id=in.(${arr.map(x => encodeURIComponent(String(x))).join(',')})`;
    }
  }

  // 3. lead_id filter
  const leadIdMatch = cleanText.match(/lead_id\s*=\s*ANY\(\$(\d+)(?:::uuid\[\])?\)/i);
  if (leadIdMatch) {
    const arr = params[parseInt(leadIdMatch[1], 10) - 1];
    if (Array.isArray(arr)) {
      if (arr.length === 0) return 'EMPTY_LEAD_ID';
      filters += `&lead_id=in.(${arr.map(x => encodeURIComponent(String(x))).join(',')})`;
    }
  }

  // 4. status filter
  const statusLiteralMatch = cleanText.match(/status\s*=\s*'([A-Z_]+)'/i);
  if (statusLiteralMatch) {
    filters += `&status=eq.${statusLiteralMatch[1]}`;
  } else {
    const statusParamMatch = cleanText.match(/status\s*=\s*\$(\d+)/i);
    if (statusParamMatch) {
      const val = params[parseInt(statusParamMatch[1], 10) - 1];
      if (val !== undefined) {
        filters += `&status=eq.${encodeURIComponent(String(val))}`;
      }
    }
  }

  const statusInMatch = cleanText.match(/status\s+in\s*\(([^)]+)\)/i);
  if (statusInMatch) {
    const content = statusInMatch[1].trim();
    if (content.startsWith('$')) {
      const paramIndex = parseInt(content.substring(1), 10);
      const val = params[paramIndex - 1];
      if (Array.isArray(val)) {
        filters += `&status=in.(${val.map(x => encodeURIComponent(String(x))).join(',')})`;
      }
    } else {
      const cleaned = content.replace(/['"\s]/g, '');
      filters += `&status=in.(${cleaned})`;
    }
  }

  // 5. is_active filter
  if (cleanText.includes('is_active = true')) {
    filters += `&is_active=eq.true`;
  } else {
    const isActiveParamMatch = cleanText.match(/is_active\s*=\s*\$(\d+)/i);
    if (isActiveParamMatch) {
      const val = params[parseInt(isActiveParamMatch[1], 10) - 1];
      if (val !== undefined) {
        filters += `&is_active=eq.${val ? 'true' : 'false'}`;
      }
    }
  }

  // 6. sent_at filter
  const sentAtMatch = cleanText.match(/sent_at\s*>=\s*\$(\d+)/i);
  if (sentAtMatch) {
    const val = params[parseInt(sentAtMatch[1], 10) - 1];
    if (val !== undefined) {
      filters += `&sent_at=gte.${encodeURIComponent(String(val))}`;
    }
  }

  return filters;
}

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
      const filters = extractFilters(cleanText, params);

      if (filters === 'EMPTY_CAMPAIGN_ID' || filters === 'EMPTY_LEAD_ID') {
        if (/COUNT\(\*\)/i.test(cleanText)) {
          return { rows: [{ count: 0 }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }

      if (/COUNT\(\*\)/i.test(cleanText)) {
        const endpoint = `${restUrl}/${rawTable}?select=id${filters}`;
        const countRes = await fetch(endpoint, {
          headers: { ...headers, 'Prefer': 'count=exact' }
        });
        const contentRange = countRes.headers.get('content-range');
        let count = 0;
        if (contentRange && contentRange.includes('/')) {
          count = parseInt(contentRange.split('/')[1], 10) || 0;
        } else if (countRes.ok) {
          const data = await countRes.json();
          count = Array.isArray(data) ? data.length : 0;
        }
        return { rows: [{ count }], rowCount: 1 };
      }

      let endpoint = `${restUrl}/${rawTable}?select=*${filters}`;

      if (cleanText.includes('ORDER BY created_at DESC')) {
        endpoint += `&order=created_at.desc`;
      } else if (cleanText.includes('ORDER BY sent_at DESC')) {
        endpoint += `&order=sent_at.desc`;
      } else if (cleanText.includes('ORDER BY replied_at DESC')) {
        endpoint += `&order=replied_at.desc`;
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
    const start = Date.now();
    const queryText = typeof text === 'string' ? text : text.text;
    const queryParams = typeof text === 'string' ? params : text.values;

    const timeoutPromise = new Promise<{ timeout: true }>((resolve) => setTimeout(() => resolve({ timeout: true }), 2000));
    let result: any = null;
    let method = 'TCP';

    try {
      const raceResult: any = await Promise.race([
        rawPool.query(queryText, queryParams),
        timeoutPromise
      ]);
      if (raceResult && !raceResult.timeout) {
        result = raceResult;
      } else {
        method = 'REST_FALLBACK';
      }
    } catch (err) {
      console.error('[DB PG Connection Error]:', err);
      method = 'REST_FALLBACK';
    }

    if (method === 'REST_FALLBACK') {
      result = await restQueryFallback(queryText, queryParams);
    }

    const duration = Date.now() - start;
    console.log(`[DB Query] method=${method} duration=${duration}ms rows=${result?.rowCount ?? 0} sql="${queryText.trim().replace(/\s+/g, ' ').substring(0, 120)}..."`);
    return result;
  },
  on(event: string, listener: (...args: any[]) => void) {
    return rawPool.on(event, listener);
  },
  connect() {
    return rawPool.connect();
  }
};
