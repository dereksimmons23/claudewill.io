// Island Data — public, sanitized session activity for the Kitchen island.
// Returns recent session metadata (project, topics, weight) without content.

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
    'http://localhost:8888',
    'http://127.0.0.1:8888',
  ]);
  if (allowlist.has(origin)) return origin;
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.netlify.app')) return origin;
  } catch { /* ignore */ }
  return 'https://claudewill.io';
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigin = getAllowedOrigin(origin);

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300', // 5 min cache
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!supabase) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessions: [], error: 'Database not configured' }),
    };
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Only select safe, public-facing columns
    const { data, error } = await supabase
      .from('session_memories')
      .select('project, session_date, topics, emotional_weight, mode_dominant, word_count, duration_minutes')
      .gte('session_date', sevenDaysAgo)
      .order('session_date', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Sanitize and shape for the two-chair visual
    const sessions = (data || []).map(row => ({
      project: row.project || 'unknown',
      date: row.session_date,
      topics: (row.topics || []).slice(0, 5), // cap at 5 tags
      weight: row.emotional_weight || 3,
      mode: row.mode_dominant || '1',
      words: row.word_count || 0,
      minutes: row.duration_minutes || 0,
    }));

    // Aggregate for derek claude's side (the continuous instance)
    const projectCounts = {};
    let totalSessions = sessions.length;
    let totalWords = 0;
    let totalMinutes = 0;
    let avgWeight = 0;

    sessions.forEach(s => {
      projectCounts[s.project] = (projectCounts[s.project] || 0) + 1;
      totalWords += s.words;
      totalMinutes += s.minutes;
      avgWeight += s.weight;
    });

    const derek_claude = {
      sessions_7d: totalSessions,
      projects_active: Object.keys(projectCounts).length,
      total_words: totalWords,
      total_minutes: totalMinutes,
      avg_weight: totalSessions > 0 ? Math.round((avgWeight / totalSessions) * 10) / 10 : 0,
      top_projects: Object.entries(projectCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        derek_claude,
        sessions,
        model: 'claude-opus-4-6',
        model_label: 'Claude Opus 4.6',
        updated: new Date().toISOString(),
      }),
    };

  } catch (err) {
    console.error('Island data error:', err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessions: [], error: 'Failed to load session data' }),
    };
  }
};
