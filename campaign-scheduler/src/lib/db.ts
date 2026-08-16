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

  // 1. ANY array parameters: column = ANY($X) or column = ANY($X::uuid[])
  const anyParamRegex = /\b([a-zA-Z0-9_]+)\s*=\s*ANY\(\$(\d+)(?:::uuid\[\])?\)/gi;
  let match;
  while ((match = anyParamRegex.exec(cleanText)) !== null) {
    const column = match[1].toLowerCase();
    const paramIndex = parseInt(match[2], 10);
    const arr = params[paramIndex - 1];
    if (Array.isArray(arr)) {
      if (arr.length === 0) {
        return `EMPTY_${column.toUpperCase()}`;
      }
      filters += `&${column}=in.(${arr.map(x => encodeURIComponent(String(x))).join(',')})`;
    }
  }

  // 2. Parameter equality: column = $X
  const eqParamRegex = /\b(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s*=\s*\$(\d+)\b/g;
  while ((match = eqParamRegex.exec(cleanText)) !== null) {
    const column = match[1].toLowerCase();
    if (filters.includes(`&${column}=`)) {
      continue;
    }
    const paramIndex = parseInt(match[2], 10);
    const val = params[paramIndex - 1];
    if (val !== undefined && val !== null) {
      filters += `&${column}=eq.${encodeURIComponent(String(val))}`;
    }
  }

  // 3. Literal equalities: column = 'value' or column = true/false or column = number
  const eqLiteralRegex = /\b(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s*=\s*(?:'([^']+)'|(true|false|\d+)\b)/g;
  while ((match = eqLiteralRegex.exec(cleanText)) !== null) {
    const column = match[1].toLowerCase();
    if (filters.includes(`&${column}=`)) {
      continue;
    }
    const val = match[2] !== undefined ? match[2] : match[3];
    filters += `&${column}=eq.${encodeURIComponent(val)}`;
  }

  // 4. IN list expressions: column IN ('val1', 'val2') or column IN ($1)
  const inRegex = /\b(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s+in\s*\(([^)]+)\)/gi;
  while ((match = inRegex.exec(cleanText)) !== null) {
    const column = match[1].toLowerCase();
    if (filters.includes(`&${column}=`)) {
      continue;
    }
    const content = match[2].trim();
    if (content.startsWith('$')) {
      const paramIndex = parseInt(content.substring(1), 10);
      const val = params[paramIndex - 1];
      if (Array.isArray(val)) {
        filters += `&${column}=in.(${val.map(x => encodeURIComponent(String(x))).join(',')})`;
      }
    } else {
      const cleaned = content.replace(/['"\s]/g, '');
      filters += `&${column}=in.(${cleaned})`;
    }
  }

  // 5. GTE comparison: column >= $X
  const gteRegex = /\b(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s*>=\s*\$(\d+)\b/g;
  while ((match = gteRegex.exec(cleanText)) !== null) {
    const column = match[1].toLowerCase();
    const paramIndex = parseInt(match[2], 10);
    const val = params[paramIndex - 1];
    if (val !== undefined && val !== null) {
      filters += `&${column}=gte.${encodeURIComponent(String(val))}`;
    }
  }

  return filters;
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const results: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

async function restQueryFallback(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  try {
    const cleanText = text.trim();
    const token = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    const headers = {
      'apikey': token,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };
    const restUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1`;

    // 0. RPC Function fallback (specifically for update_lead_status_from_webhook)
    if (/update_lead_status_from_webhook/i.test(cleanText)) {
      const payload = {
        p_campaign_id: params[0],
        p_email: params[1],
        p_event: params[2],
        p_gmail_message_id: params[3] || null,
        p_gmail_thread_id: params[4] || null
      };
      
      const endpoint = `${restUrl}/rpc/update_lead_status_from_webhook`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const val = await res.json();
        return { rows: [{ result: val }], rowCount: 1 };
      } else {
        const errorText = await res.text();
        console.error('[DB Rest Fallback Error] RPC update_lead_status_from_webhook failed:', res.status, errorText);
        return { rows: [], rowCount: 0 };
      }
    }

    // 1. SELECT Query fallback
    if (/^SELECT/i.test(cleanText)) {
      const fromMatch = cleanText.match(/FROM\s+([a-zA-Z0-9_"]+)/i);
      if (!fromMatch) return { rows: [], rowCount: 0 };
      
      const rawTable = fromMatch[1].replace(/"/g, '');

      // Check if there is a large array parameter (> 50 items) that could cause HTTP 400 URL length errors
      let arrayParamIndex = -1;
      let largeArray: any[] = [];
      params.forEach((p, idx) => {
        if (Array.isArray(p) && p.length > 50 && arrayParamIndex === -1) {
          arrayParamIndex = idx;
          largeArray = p;
        }
      });

      if (arrayParamIndex !== -1 && largeArray.length > 50) {
        const chunks = chunkArray(largeArray, 50);
        const isCount = /COUNT\(\*\)/i.test(cleanText);

        const chunkPromises = chunks.map(async (chunk) => {
          const subParams = [...params];
          subParams[arrayParamIndex] = chunk;
          return restQueryFallback(cleanText, subParams);
        });

        const chunkResults = await Promise.all(chunkPromises);

        if (isCount) {
          const totalCount = chunkResults.reduce((acc, res) => {
            const cnt = parseInt(res.rows[0]?.count, 10) || 0;
            return acc + cnt;
          }, 0);
          return { rows: [{ count: totalCount }], rowCount: 1 };
        } else {
          let combinedRows = chunkResults.flatMap(res => res.rows);

          const orderMatch = cleanText.match(/ORDER BY\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?/i);
          if (orderMatch) {
            const col = orderMatch[1].toLowerCase();
            const isDesc = (orderMatch[2] || 'ASC').toUpperCase() === 'DESC';
            combinedRows.sort((a, b) => {
              const valA = a[col] ?? '';
              const valB = b[col] ?? '';
              if (valA < valB) return isDesc ? 1 : -1;
              if (valA > valB) return isDesc ? -1 : 1;
              return 0;
            });
          }

          const limitMatch = cleanText.match(/\bLIMIT\s+(\d+)\b/i);
          if (limitMatch) {
            const limitVal = parseInt(limitMatch[1], 10);
            combinedRows = combinedRows.slice(0, limitVal);
          }

          return { rows: combinedRows, rowCount: combinedRows.length };
        }
      }

      const filters = extractFilters(cleanText, params);

      if (filters.startsWith('EMPTY_')) {
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

      // Dynamic ORDER BY extraction
      const orderMatch = cleanText.match(/ORDER BY\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?/i);
      if (orderMatch) {
        const column = orderMatch[1].toLowerCase();
        const direction = (orderMatch[2] || 'ASC').toLowerCase();
        endpoint += `&order=${column}.${direction}`;
      }

      // Dynamic LIMIT extraction
      const limitMatch = cleanText.match(/\bLIMIT\s+(\d+)\b/i);
      if (limitMatch) {
        endpoint += `&limit=${limitMatch[1]}`;
      }

      // Dynamic OFFSET extraction
      const offsetMatch = cleanText.match(/\bOFFSET\s+(\d+)\b/i);
      if (offsetMatch) {
        endpoint += `&offset=${offsetMatch[1]}`;
      }

      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const rows = await res.json();
        return { rows: Array.isArray(rows) ? rows : [], rowCount: Array.isArray(rows) ? rows.length : 0 };
      } else {
        console.error('[DB Rest Fallback Error] SELECT failed:', res.status, await res.text());
      }
    }

    // 2. UPDATE Query fallback
    if (/^UPDATE/i.test(cleanText)) {
      const tableMatch = cleanText.match(/UPDATE\s+([a-zA-Z0-9_"]+)/i);
      if (!tableMatch) return { rows: [], rowCount: 0 };
      const rawTable = tableMatch[1].replace(/"/g, '');

      // Parse SET fields
      const setMatch = cleanText.match(/SET\s+(.*?)\s+(?:WHERE|$)/i);
      const payload: Record<string, any> = {};
      if (setMatch) {
        const setAssignments = setMatch[1].split(',');
        for (const assignment of setAssignments) {
          const parts = assignment.split('=');
          if (parts.length === 2) {
            const col = parts[0].trim().replace(/"/g, '');
            const paramMatch = parts[1].trim().match(/\$(\d+)/);
            if (paramMatch) {
              const paramIndex = parseInt(paramMatch[1], 10);
              payload[col] = params[paramIndex - 1];
            } else {
              const literalVal = parts[1].trim().replace(/['"]/g, '');
              if (literalVal === 'true') payload[col] = true;
              else if (literalVal === 'false') payload[col] = false;
              else if (!isNaN(Number(literalVal))) payload[col] = Number(literalVal);
              else payload[col] = literalVal;
            }
          }
        }
      }

      const filters = extractFilters(cleanText, params);
      const endpoint = `${restUrl}/${rawTable}?${filters.replace(/^&/, '')}`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const rows = await res.json();
        return { rows: Array.isArray(rows) ? rows : [], rowCount: Array.isArray(rows) ? rows.length : 0 };
      } else {
        console.error('[DB Rest Fallback Error] UPDATE failed:', res.status, await res.text());
      }
    }

    // 3. DELETE Query fallback
    if (/^DELETE/i.test(cleanText)) {
      const tableMatch = cleanText.match(/DELETE\s+FROM\s+([a-zA-Z0-9_"]+)/i);
      if (!tableMatch) return { rows: [], rowCount: 0 };
      const rawTable = tableMatch[1].replace(/"/g, '');

      const filters = extractFilters(cleanText, params);
      const endpoint = `${restUrl}/${rawTable}?${filters.replace(/^&/, '')}`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        const rows = await res.json();
        return { rows: Array.isArray(rows) ? rows : [], rowCount: Array.isArray(rows) ? rows.length : 0 };
      } else {
        console.error('[DB Rest Fallback Error] DELETE failed:', res.status, await res.text());
      }
    }

    // 4. INSERT Query fallback
    if (/^INSERT/i.test(cleanText)) {
      const tableMatch = cleanText.match(/INSERT\s+INTO\s+([a-zA-Z0-9_"]+)/i);
      if (!tableMatch) return { rows: [], rowCount: 0 };
      const rawTable = tableMatch[1].replace(/"/g, '');

      const columnsMatch = cleanText.match(/\(([^)]+)\)\s*VALUES/i);
      const valuesMatch = cleanText.match(/VALUES\s*\(([^)]+)\)/i);

      if (columnsMatch && valuesMatch) {
        const columns = columnsMatch[1].split(',').map(c => c.trim().replace(/"/g, ''));
        const values = valuesMatch[1].split(',').map(v => v.trim());

        const payload: Record<string, any> = {};
        columns.forEach((col, index) => {
          const valStr = values[index];
          const paramMatch = valStr.match(/\$(\d+)/);
          if (paramMatch) {
            const paramIndex = parseInt(paramMatch[1], 10);
            payload[col] = params[paramIndex - 1];
          } else {
            const literalVal = valStr.replace(/['"]/g, '');
            if (literalVal === 'true') payload[col] = true;
            else if (literalVal === 'false') payload[col] = false;
            else if (!isNaN(Number(literalVal))) payload[col] = Number(literalVal);
            else payload[col] = literalVal;
          }
        });

        const endpoint = `${restUrl}/${rawTable}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const rows = await res.json();
          return { rows: Array.isArray(rows) ? rows : [], rowCount: Array.isArray(rows) ? rows.length : 0 };
        } else {
          console.error('[DB Rest Fallback Error] INSERT failed:', res.status, await res.text());
        }
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
