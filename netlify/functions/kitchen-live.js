// kitchen-live.js — Live metrics endpoint for the Kitchen dashboard
// Called by the browser every 60 seconds to get real-time data.
// Returns counts from Supabase: conversations, sessions, visitors, dawn day.
// All queries run in parallel. Failed queries return 0, never break the response.

const { createClient } = require('@supabase/supabase-js');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Dawn challenge: Jan 1, 2026 = Day 1
const DAWN_START = new Date('2026-01-01T00:00:00Z');
const DAWN_TOTAL = 151;

function getDawnDay() {
  const now = new Date();
  const diffMs = now - DAWN_START;
  const diffDays = Math.floor(diffMs / 86400000);
  return Math.max(1, diffDays + 1); // Day 1 = Jan 1
}

// Start of today in Central Time (UTC-5 = CST per spec)
function getTodayStartCentral() {
  const now = new Date();
  // Shift to Central time, get midnight, shift back to UTC
  const centralOffset = 5 * 60 * 60 * 1000; // UTC-5
  const centralNow = new Date(now.getTime() - centralOffset);
  const centralMidnight = new Date(
    centralNow.getUTCFullYear(),
    centralNow.getUTCMonth(),
    centralNow.getUTCDate()
  );
  // centralMidnight is local-time midnight interpreted as UTC — convert back
  return new Date(centralMidnight.getTime() + centralOffset).toISOString();
}

// 7 days ago as ISO date string (for session_memories which uses date type)
function getWeekAgoDate() {
  const d = new Date(Date.now() - 7 * 86400000);
  return d.toISOString().split('T')[0];
}

// 7 days ago as full ISO timestamp (for conversations which uses timestamptz)
function getWeekAgoTimestamp() {
  return new Date(Date.now() - 7 * 86400000).toISOString();
}

// Safe count query — returns 0 on any error
async function safeCount(promise) {
  try {
    const { count, error } = await promise;
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

// Safe row-fetch query — returns 0 on any error
async function safeLength(promise) {
  try {
    const { data, error } = await promise;
    if (error || !data) return 0;
    return data.length;
  } catch {
    return 0;
  }
}

exports.handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 503,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Supabase not configured' }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const todayStart = getTodayStartCentral();
  const weekAgoTimestamp = getWeekAgoTimestamp();
  const weekAgoDate = getWeekAgoDate();

  // Run all queries in parallel — one failed query returns 0, never breaks others
  const [
    convoToday,
    convoWeek,
    convoTotal,
    sessionsWeek,
    sessionsTotal,
    visitorsTotal,
  ] = await Promise.all([
    safeCount(
      supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', todayStart)
    ),
    safeCount(
      supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', weekAgoTimestamp)
    ),
    safeCount(
      supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
    ),
    safeCount(
      supabase
        .from('session_memories')
        .select('*', { count: 'exact', head: true })
        .gte('session_date', weekAgoDate)
    ),
    safeCount(
      supabase
        .from('session_memories')
        .select('*', { count: 'exact', head: true })
    ),
    // visitors table: no count-exact RLS — fetch rows and count length
    // (consistent with how daily-pulse.mjs queries this table)
    safeLength(
      supabase
        .from('visitors')
        .select('visitor_token')
    ),
  ]);

  const dawnDay = getDawnDay();
  const dawnRemaining = Math.max(0, DAWN_TOTAL - dawnDay);

  const payload = {
    conversations: {
      today: convoToday,
      week: convoWeek,
      total: convoTotal,
    },
    sessions: {
      week: sessionsWeek,
      total: sessionsTotal,
    },
    visitors: {
      total: visitorsTotal,
    },
    dawn: {
      day: dawnDay,
      remaining: dawnRemaining,
    },
    updatedAt: new Date().toISOString(),
  };

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(payload),
  };
};
