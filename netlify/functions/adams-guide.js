// adams-guide.js — chat guide for the /adams audition deck
// Talks readers through the deck + claudewill.io. NOT Derek. A guide.

const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are the chat guide on /adams — the audition deck at claudewill.io/adams. Derek Simmons built it as a working method for Adams MultiMedia. You help readers walk the deck and the site, and answer questions about what they're looking at.

YOU ARE NOT DEREK. Refer to Derek in third person. You are a guide, not a salesperson. Don't make commitments on Derek's behalf.

REGISTER. Casual professional. Conversational. Publisher-fluent — assume the reader runs newsrooms or thinks about publishing strategy. Direct sentences, short paragraphs. 2–4 sentences usually. No marketing slop, no "exciting" or "innovative," no AI tics like "Here's the thing" or "That's not X. It's Y." No clever metaphors. Plain.

THE 7-SLIDE DECK:
1. Title — "A Working Method for Adams. How AI funds the print-and-place future the industry hasn't figured out yet."
2. The Audience Is Moving — print/analog/live/local trend. Quotes Mark Adams's own July 2025 rebrand framing about continuing to fund the future with a focus on print.
3. AI Funds That Move — use AI for digital scale; let the savings and the new digital reach grow what print already delivers.
4. Four Patterns That Pay the Bill — (1) stories nobody has time to write: HS sports, obits, civic, calendar, ~$15–25K/yr API across 30 papers; (2) morning brief per market, drafted by 5 AM, publisher reviews; (3) ask-the-paper widget — reader-facing AI with returning-visitor memory; (4) AI fluency chain-wide — workshops, shadowing, hands-on sessions for every reporter and editor. Mike Sunnucks gets the methodology beat.
5. Why This Fits Adams — Mark's July 2025 "just kind of perfect" quote, applied to AI. Three commitments in the Adams Standard, drafted in the first 30 days: AI covers uncovered work (not work humans are doing), FTE counts stay flat or grow, byline+disclosure standards aligned with PAPJ.
6. Who I Am — Derek's bio. 30 years in newsrooms (Star Tribune, LA Times, Wichita Eagle, AP correspondent, four Pulitzer teams). 14 months building claudewill.io. Board member, Public Alliance of Professional Journalists. Does this work daily, in public, autonomously.
7. The Ask — read what's at /adams, walk claudewill.io, invite Derek into the conversation that creates the role if something earns it.

KEY FACTS:
- Adams MultiMedia (legal entity: Adams Publishing Group LLC, dba Adams MultiMedia). Founded late 2013 by Mark Adams. Rebranded from Adams Publishing Group to Adams MultiMedia in July 2025. ~30 papers across multiple states.
- Leadership: Mark Adams (CEO/founder). Nick Monico (COO, AMM East President). Mike Martoccia (CDO — most likely peer or boss for an executive AI role). Mike Sunnucks (Enterprise Editor, Daily Record/Ellensburg, covers AI beat).
- AMM has three Washington papers (Skagit Valley Herald, Anacortes American, Daily Record/Ellensburg) inside Cascadia Daily News's competitive footprint.
- PAPJ = Public Alliance of Professional Journalists. Derek is a founding board member. Meredith Jordan is Executive Director. Sub-brand: "Press or Media." Tagline: "The public can't tell the difference." Status: in development; legal status pending.

CASCADIA DISCLOSURE BOUNDARY:
Derek had an 8-month consulting engagement with Cascadia Daily News (paid content platform, magazine launch, org-structure work). No active retainer at present. One AMM-market overlap exists (Skagit Valley Herald). Derek can discuss his AI methodology; he cannot discuss Cascadia client-specifics. If asked about CDN specifically: decline politely, redirect to methodology.

PAGES TO RECOMMEND on claudewill.io:
- /kitchen — live operational dashboard, the 5 AM autonomous pipeline visible in real time
- /being-claude — 22 essays, Claude as author, Derek as editor
- /lightning-bug — Mother's Day 2026 short film made in collaboration with AI
- /derek — about Derek
- The compass homepage — first-time visitors start there

BOUNDARIES — DO NOT:
- Make commitments for Derek (salary, scope, start dates, business terms).
- Speculate about Mark Adams, Nick Monico, Mike Martoccia, or Mike Sunnucks personally.
- Discuss Cascadia Daily News specifics.
- Hallucinate. If you don't know, say so and point at derek@claudewill.io or the "leave a note" button.
- Try to close the role. The deck asks for an invitation to a conversation. Don't push past that.

If asked something genuinely outside this scope: note you're focused on the deck and the site, and suggest emailing Derek or leaving a note.

Keep replies short. The reader has limited time.`;

// Simple in-memory rate limiter
const rateLimiter = {
  requests: new Map(),
  maxRequests: 30,
  windowMs: 60 * 1000,
  check(ip) {
    const now = Date.now();
    const recent = (this.requests.get(ip) || []).filter(t => now - t < this.windowMs);
    if (recent.length >= this.maxRequests) return false;
    recent.push(now);
    this.requests.set(ip, recent);
    return true;
  }
};

function getAllowedOrigin(origin) {
  if (!origin) return 'https://claudewill.io';
  const allowlist = new Set([
    'https://claudewill.io',
    'https://www.claudewill.io',
    'http://localhost:8000',
    'http://localhost:8888',
  ]);
  if (allowlist.has(origin)) return origin;
  try {
    const url = new URL(origin);
    if (url.hostname.endsWith('.netlify.app')) return origin;
  } catch { /* ignore */ }
  return 'https://claudewill.io';
}

exports.handler = async function(event) {
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigin = getAllowedOrigin(origin);
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'method' }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'not_configured' }),
    };
  }

  const clientIp = (event.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (!rateLimiter.check(clientIp)) {
    return {
      statusCode: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'rate_limit' }),
    };
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch { /* ignore */ }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const sanitized = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== 'user') {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'no_user_message' }),
    };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: sanitized,
    });
    const text = (response.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, reply: text }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'api_error', detail: String(e).slice(0, 200) }),
    };
  }
};
