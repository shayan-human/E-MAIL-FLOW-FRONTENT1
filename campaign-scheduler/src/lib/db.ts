import { Pool } from 'pg';
import dns from 'dns';

// Render web services only support IPv4 egress. Force Node.js to resolve IPv4 addresses first.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const globalForDb = global as unknown as { pool: Pool };

function getConnectionString(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    const fallbackRef = 'myagqulgddhnxrxkvvia';

    // Direct Supabase host `db.<ref>.supabase.co` resolves only to IPv6 addresses.
    // Replace with Supabase IPv4 Pooler host and pooler tenant username postgres.<ref>
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
    // If URL parsing fails, return raw DATABASE_URL
  }

  return url;
}

const connectionString = getConnectionString();

export const pool =
  globalForDb.pool ||
  new Pool({
    connectionString,
    ssl: connectionString?.includes('supabase') || process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
    max: 20, // Limit maximum connections to prevent database exhaustion
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Timeout after 10 seconds if connection cannot be established
  });

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;



