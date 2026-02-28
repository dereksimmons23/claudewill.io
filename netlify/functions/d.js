// D — auth-gated health accountability dashboard API
// Returns dawn/dusk tracking data from Supabase dawn_entries table

const { createClient } = require('@supabase/supabase-js');

var supabase = null;
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_ANON_KEY;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

function getAllowedOrigin(origin) {
  if (!origin) return 'https://claudewill.io';
  var allowlist = new Set([
    'https://claudewill.io',
    'https://www.claudewill.io',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
  ]);
  if (allowlist.has(origin)) return origin;
  try {
    var url = new URL(origin);
    if (url.hostname.endsWith('.netlify.app')) return origin;
  } catch { /* ignore */ }
  return 'https://claudewill.io';
}

// Challenge constants
var CHALLENGE_START = new Date('2025-12-31T00:00:00');
var CHALLENGE_DAYS = 151;

function getCurrentDay() {
  return Math.floor((Date.now() - CHALLENGE_START.getTime()) / 86400000);
}

function getWeekNumber(dateStr) {
  var d = new Date(dateStr + 'T12:00:00');
  var jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
}

// Build weight history — one entry per week where weight was recorded
function buildWeightHistory(entries) {
  var byWeek = {};
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.weight_lbs == null) continue;
    var w = e.week_number;
    // Keep the latest entry per week (entries are DESC, so first seen wins)
    if (!byWeek[w]) {
      byWeek[w] = {
        week: w,
        day: e.day_number,
        weight: e.weight_lbs,
        date: e.entry_date
      };
    }
  }
  var result = [];
  var keys = Object.keys(byWeek).sort(function (a, b) { return Number(a) - Number(b); });
  for (var k = 0; k < keys.length; k++) {
    result.push(byWeek[keys[k]]);
  }
  return result;
}

// Build week summaries — grouped by week_number
function buildWeekSummaries(entries) {
  var weeks = {};
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var w = e.week_number;
    if (!weeks[w]) {
      weeks[w] = { sleepTotal: 0, sleepCount: 0, raidCount: 0, raidDays: 0, raidCalTotal: 0, raidCalCount: 0, daysSeen: {} };
    }
    var wk = weeks[w];

    if (e.sleep_hours != null) {
      wk.sleepTotal += e.sleep_hours;
      wk.sleepCount++;
    }

    // Count unique raid days (both dawn and dusk phases could exist for same date)
    var dateKey = e.entry_date;
    if (e.raid && !wk.daysSeen[dateKey]) {
      wk.daysSeen[dateKey] = true;
      wk.raidDays++;
    }
    if (e.raid) {
      wk.raidCount++;
      if (e.raid_calories != null) {
        wk.raidCalTotal += e.raid_calories;
        wk.raidCalCount++;
      }
    }
  }

  var result = [];
  var keys = Object.keys(weeks).sort(function (a, b) { return Number(a) - Number(b); });
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    var wk = weeks[key];
    result.push({
      week: Number(key),
      sleepAvg: wk.sleepCount > 0 ? Math.round((wk.sleepTotal / wk.sleepCount) * 10) / 10 : null,
      raidCount: wk.raidCount,
      raidDays: wk.raidDays,
      raidCalAvg: wk.raidCalCount > 0 ? Math.round(wk.raidCalTotal / wk.raidCalCount) : null
    });
  }
  return result;
}

exports.handler = async (event) => {
  var origin = event.headers.origin || event.headers.Origin || '';
  var allowedOrigin = getAllowedOrigin(origin);

  var headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  var body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Auth check
  var dCode = body.dCode;
  if (!dCode || dCode !== process.env.D_CODE) {
    return { statusCode: 401, headers: headers, body: JSON.stringify({ error: 'Access denied' }) };
  }

  var action = body.action;

  // Verify-only action (for auth gate)
  if (action === 'verify') {
    return { statusCode: 200, headers: headers, body: JSON.stringify({ ok: true }) };
  }

  // State action — main payload
  if (action === 'state') {
    if (!supabase) {
      return { statusCode: 500, headers: headers, body: JSON.stringify({ error: 'Database not configured' }) };
    }

    try {
      // Parallel queries: entries + fragments
      var entriesPromise = supabase
        .from('dawn_entries')
        .select('*')
        .eq('year', 2026)
        .order('entry_date', { ascending: false });

      var fragsPromise = supabase
        .from('dawn_fragments')
        .select('id,type,content,source_year,title,tags,source_date,context')
        .order('source_year', { ascending: false });

      var results = await Promise.all([entriesPromise, fragsPromise]);

      var entries = results[0].data;
      var entriesError = results[0].error;
      var fragments = results[1].data;
      var fragsError = results[1].error;

      if (entriesError) {
        console.error('Supabase entries error:', entriesError.message);
        return { statusCode: 500, headers: headers, body: JSON.stringify({ error: 'Database query failed' }) };
      }
      if (fragsError) {
        console.error('Supabase fragments error:', fragsError.message);
        // Non-fatal — proceed without fragments
        fragments = [];
      }

      var currentDay = getCurrentDay();
      if (currentDay > CHALLENGE_DAYS) currentDay = CHALLENGE_DAYS;
      if (currentDay < 1) currentDay = 1;

      var remaining = CHALLENGE_DAYS - currentDay;
      var weightHistory = buildWeightHistory(entries || []);
      var weekSummaries = buildWeekSummaries(entries || []);

      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
          currentDay: currentDay,
          totalDays: CHALLENGE_DAYS,
          remaining: remaining,
          entries: entries || [],
          weightHistory: weightHistory,
          weekSummaries: weekSummaries,
          fragments: fragments || []
        })
      };
    } catch (err) {
      console.error('D data error:', err);
      return { statusCode: 500, headers: headers, body: JSON.stringify({ error: 'Failed to load data' }) };
    }
  }

  return { statusCode: 400, headers: headers, body: JSON.stringify({ error: 'Unknown action' }) };
};
