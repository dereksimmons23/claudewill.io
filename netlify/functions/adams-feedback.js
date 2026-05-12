// /adams feedback intake. Posts notes to Resend → simmons.derek@gmail.com.
// Optional: include slide context, viewer email (for reply-to).

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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

  var resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return {
      statusCode: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'not_configured' }),
    };
  }

  var body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (e) { /* ignore */ }
  var message = (body.message || '').trim();
  var fromEmail = (body.email || '').trim();
  var slide = (body.slide || '').trim();
  var viewer = (body.name || '').trim();

  if (!message || message.length < 2) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'message_required' }),
    };
  }

  // Rate limit by message length (basic abuse guard)
  if (message.length > 4000) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'message_too_long' }),
    };
  }

  var subjectBits = ['adams* feedback'];
  if (slide) subjectBits.push('slide ' + slide);
  if (viewer) subjectBits.push('from ' + viewer);
  var subject = subjectBits.join(' · ');

  var textBody = [
    'New feedback on the /adams deck.',
    '',
    'Slide:  ' + (slide || '(unspecified)'),
    'Viewer: ' + (viewer || '(anonymous)'),
    'Email:  ' + (fromEmail || '(none)'),
    '',
    '----- message -----',
    message,
    '-------------------',
    '',
    'Source: https://claudewill.io/adams/',
  ].join('\n');

  var htmlBody = [
    '<p>New feedback on the <code>/adams</code> deck.</p>',
    '<table style="font-family: monospace; font-size: 13px; border-collapse: collapse;">',
    '<tr><td style="padding: 2px 8px; color: #666;">Slide</td><td style="padding: 2px 8px;">' + escapeHtml(slide || '(unspecified)') + '</td></tr>',
    '<tr><td style="padding: 2px 8px; color: #666;">Viewer</td><td style="padding: 2px 8px;">' + escapeHtml(viewer || '(anonymous)') + '</td></tr>',
    '<tr><td style="padding: 2px 8px; color: #666;">Email</td><td style="padding: 2px 8px;">' + escapeHtml(fromEmail || '(none)') + '</td></tr>',
    '</table>',
    '<blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 3px solid #d4a84b; background: #f8f6f0; font-family: monospace; white-space: pre-wrap;">' + escapeHtml(message) + '</blockquote>',
    '<p style="color: #888; font-size: 11px;">Source: <a href="https://claudewill.io/adams/">https://claudewill.io/adams/</a></p>',
  ].join('\n');

  var payload = {
    from: 'claudewill <onboarding@resend.dev>',
    to: ['simmons.derek@gmail.com'],
    subject: subject,
    text: textBody,
    html: htmlBody,
  };
  if (fromEmail && /.+@.+\..+/.test(fromEmail)) {
    payload.reply_to = fromEmail;
  }

  try {
    var res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      var errBody = await res.text();
      return {
        statusCode: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'send_failed', detail: errBody.slice(0, 200) }),
      };
    }
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'exception', detail: String(e).slice(0, 200) }),
    };
  }
};
