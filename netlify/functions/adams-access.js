// /adams — gate function. Validates access code against env var.
// Pattern mirrors /d's option-d.js gate but simpler: code-only, no email, no chat.

const crypto = require('crypto');

function getAllowedOrigin(origin) {
  if (!origin) return 'https://claudewill.io';
  var allowlist = new Set([
    'https://claudewill.io',
    'https://www.claudewill.io',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:8888',
  ]);
  if (allowlist.has(origin)) return origin;
  try {
    var url = new URL(origin);
    if (url.hostname.endsWith('.netlify.app')) return origin;
  } catch { /* ignore */ }
  return 'https://claudewill.io';
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  var bufA = Buffer.from(a);
  var bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still do a dummy compare to keep timing roughly constant.
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

exports.handler = async function(event) {
  var origin = event.headers.origin || event.headers.Origin || '';
  var allowedOrigin = getAllowedOrigin(origin);

  var corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ ok: false, error: 'method' }) };
  }

  var expected = process.env.ADAMS_ACCESS_CODE;
  if (!expected) {
    return {
      statusCode: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'not_configured' }),
    };
  }

  var body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { /* ignore */ }
  var code = (body.code || '').trim();

  if (!code) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'code_required' }),
    };
  }

  if (!timingSafeEqualStr(code, expected)) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'invalid' }),
    };
  }

  return {
    statusCode: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
