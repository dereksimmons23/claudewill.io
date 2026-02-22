// Kitchen Data API — auth-gated data aggregator for the Kitchen dashboard
// Returns brief, pulse, content, and decisions data for all four panels

const { createClient } = require('@supabase/supabase-js');

let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

function getAllowedOrigin(origin) {
  if (!origin) return 'https://claudewill.io';
  const allowlist = new Set([
    'https://claudewill.io',
    'https://www.claudewill.io',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ]);
  if (allowlist.has(origin)) return origin;
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.netlify.app')) return origin;
  } catch { /* ignore */ }
  return 'https://claudewill.io';
}

// Fetch from CW Brief Cloudflare Worker (server-to-server, bypasses CSP)
async function fetchWorker(path) {
  const workerUrl = process.env.WORKER_URL;
  const workerKey = process.env.WORKER_AUTH_KEY;
  if (!workerUrl || !workerKey) return null;

  try {
    const res = await fetch(`${workerUrl}${path}`, {
      headers: { 'X-Worker-Key': workerKey }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error(`Worker fetch ${path} failed:`, err.message);
    return null;
  }
}

// Get conversation stats from Supabase
async function getConversationStats() {
  if (!supabase) return null;

  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Total count
    const { count: total } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    // Last 24h
    const { data: last24h } = await supabase
      .from('conversations')
      .select('session_id')
      .gte('timestamp', oneDayAgo);

    // Last 7d
    const { data: last7d } = await supabase
      .from('conversations')
      .select('session_id')
      .gte('timestamp', sevenDaysAgo);

    const sessions24h = last24h ? new Set(last24h.map(r => r.session_id)).size : 0;
    const sessions7d = last7d ? new Set(last7d.map(r => r.session_id)).size : 0;

    return {
      total: total || 0,
      last24h: { messages: last24h ? last24h.length : 0, sessions: sessions24h },
      last7d: { messages: last7d ? last7d.length : 0, sessions: sessions7d },
      avgPerDay: last7d ? Math.round((last7d.length / 7) * 10) / 10 : 0
    };
  } catch (err) {
    console.error('Supabase stats failed:', err.message);
    return null;
  }
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigin = getAllowedOrigin(origin);

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Auth check — every request must include valid kitchen code
  const { kitchenCode, action } = body;
  if (!kitchenCode || kitchenCode !== process.env.KITCHEN_CODE) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Access denied' }) };
  }

  // Verify-only action (for auth gate)
  if (action === 'verify') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  // Fetch all panel data in parallel
  try {
    const [briefData, pulseData, contentData, slamDunks] = await Promise.all([
      fetchWorker('/brief'),
      getConversationStats(),
      fetchWorker('/content/linkedin').catch(() => null),
      fetchWorker('/slam-dunks').catch(() => null),
    ]);

    const panels = {
      brief: briefData ? (briefData.brief || briefData) : 'Brief unavailable. Worker may be offline.',
      pulse: pulseData || {
        total: '—',
        last24h: { messages: '—', sessions: '—' },
        last7d: { messages: '—', sessions: '—' },
        avgPerDay: '—'
      },
      content: contentData || { note: 'Content calendar data unavailable.' },
      decisions: slamDunks || []
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ panels })
    };

  } catch (err) {
    console.error('Kitchen data error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to load kitchen data.' })
    };
  }
};
