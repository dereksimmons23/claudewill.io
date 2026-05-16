// CW - Conversational Agent
// Built by Derek Simmons on Claude (Anthropic)
// Named after Claude William Simmons (1903-1967)

const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { SYSTEM_PROMPT, VERNIE_PROMPT, KITCHEN_PROMPT } = require('./cw-prompt');

// ── Live site knowledge — reads current state at runtime ──
function getLiveSiteKnowledge() {
  try {
    const rootDir = path.join(__dirname, '..', '..');
    const parts = [];

    // Read site-registry.json for current pages
    const registryPath = path.join(rootDir, 'site-registry.json');
    if (fs.existsSync(registryPath)) {
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      const pages = registry.pages.filter(p => p.cw).map(p => `${p.path} — ${p.title}: ${p.description}`);
      parts.push('CURRENT SITE PAGES:\n' + pages.join('\n'));
    }

    // Read stars.json for current content in the sky
    const starsPath = path.join(rootDir, 'stars.json');
    if (fs.existsSync(starsPath)) {
      const stars = JSON.parse(fs.readFileSync(starsPath, 'utf8'));
      const titles = stars.pool.map(s => s.text).join(', ');
      parts.push('CONTENT ON THE SITE (stars in the sky): ' + titles);
    }

    // Read being-claude directory for current essay count
    const bcDir = path.join(rootDir, 'being-claude');
    if (fs.existsSync(bcDir)) {
      const essays = fs.readdirSync(bcDir).filter(f => {
        const stat = fs.statSync(path.join(bcDir, f));
        return stat.isDirectory() && f !== 'articles' && fs.existsSync(path.join(bcDir, f, 'index.html'));
      });
      parts.push('Being Claude essays published: ' + essays.length + ' (' + essays.join(', ') + ')');
    }

    // Read cw-current.json for auto-updated current state (written by overnight agents)
    const currentPath = path.join(rootDir, 'cw-current.json');
    if (fs.existsSync(currentPath)) {
      const current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
      parts.push('CURRENT STATE (auto-updated daily):\n' + current.summary);
    }

    return parts.length > 0 ? '\n\nLIVE SITE STATE (auto-updated, overrides any static knowledge above):\n' + parts.join('\n\n') : '';
  } catch (err) {
    return '';
  }
}

// Initialize Supabase client (only if env vars are present)
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Simple hash function for IP addresses (for privacy)
function createSimpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Simple rate limiting (resets on function cold start)
const rateLimiter = {
  requests: new Map(),
  maxRequests: 20,      // max requests per window
  windowMs: 60 * 1000,  // 1 minute window
  
  isAllowed(ip) {
    const now = Date.now();
    const record = this.requests.get(ip);
    
    if (!record || now - record.start > this.windowMs) {
      this.requests.set(ip, { start: now, count: 1 });
      return true;
    }
    
    if (record.count >= this.maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
};

// ── CW Remembers — Visitor Context ─────────────────────
// STATUS AUDIT (March 30, 2026):
// WORKING:
//   - visitorToken generated in porch-widget.js localStorage, sent in every request body
//   - getVisitorContext: reads visitors + visitor_notes tables (porch mode only)
//   - New visitor record created on first message (insert to visitors)
//   - Returning visitor: last_visit + visit_count updated on first message of session
//   - Past notes (up to 5) injected into system prompt via buildVisitorPrompt
//   - handleCloseSession: summarizes conversation via Haiku, writes to visitor_notes
//   - Name detection: Haiku extracts first name from conversation, stored in visitors.name
//   - Recurring tag analysis: tags counted across notes, shown to CW if 2+ occurrences
// GAPS / NOT YET IMPLEMENTED:
//   - No UI for visitors to see or clear their own data (privacy gap — policy says they can)
//   - Vernie gate validation call does not send visitorToken (acceptable — not a real convo)
//   - visitor_notes has no max cap; could grow unbounded for very frequent visitors
//   - No degrade/expire path for old visitor_notes (unlike session_memories dimmer switch)
//   - buildVisitorPrompt assumes visitor.last_visit is non-null on returning visitors —
//     if last_visit is null (edge case on insert race), toLocaleDateString will throw
// SUPABASE TABLES CONFIRMED: visitors, visitor_notes (RLS: anon can SELECT + INSERT)

async function getVisitorContext(visitorToken, isFirstMessage) {
  if (!supabase || !visitorToken) return null;

  try {
    const { data: visitor } = await supabase
      .from('visitors')
      .select('*')
      .eq('visitor_token', visitorToken)
      .single();

    if (!visitor) {
      // New visitor — create record on first message
      if (isFirstMessage) {
        await supabase.from('visitors').insert({ visitor_token: visitorToken });
      }
      return null;
    }

    // Returning visitor — update visit count on first message only
    if (isFirstMessage) {
      await supabase
        .from('visitors')
        .update({ last_visit: new Date().toISOString(), visit_count: visitor.visit_count + 1 })
        .eq('visitor_token', visitorToken);
    }

    // Get past conversation notes
    const { data: notes } = await supabase
      .from('visitor_notes')
      .select('*')
      .eq('visitor_token', visitorToken)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      name: visitor.name,
      visitCount: visitor.visit_count + (isFirstMessage ? 1 : 0),
      lastVisit: visitor.last_visit,
      notes: notes || []
    };
  } catch (error) {
    console.error('Visitor context error:', error.message);
    return null;
  }
}

function buildVisitorPrompt(context) {
  if (!context) return '';

  let prompt = '\n\nRETURNING VISITOR:';
  if (context.name) prompt += `\nName: ${context.name}`;
  prompt += `\nVisits: ${context.visitCount} (last: ${new Date(context.lastVisit).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })})`;

  if (context.notes.length > 0) {
    prompt += '\nPast conversations:';
    for (const note of context.notes) {
      const tags = note.tags && note.tags.length ? ` [${note.tags.join(', ')}]` : '';
      prompt += `\n- ${note.summary}${tags}`;
    }

    // Compute recurring tags
    const tagCounts = {};
    for (const note of context.notes) {
      if (note.tags) {
        for (const tag of note.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }
    const recurring = Object.entries(tagCounts)
      .filter(([_, count]) => count >= 2)
      .map(([tag, count]) => `${tag} (${count}x)`);

    if (recurring.length > 0) {
      prompt += `\nRecurring topics: ${recurring.join(', ')}`;
    }
  }

  prompt += '\nGreet them naturally. If you know their name, use it. Don\'t announce that you remember — just show it.';
  return prompt;
}

async function handleCloseSession(visitorToken, sessionId, messages) {
  if (!supabase || !visitorToken || !messages || messages.length < 2) return;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const summaryResponse = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system: 'Summarize this conversation in 2-3 sentences from the perspective of what the visitor wanted. Then provide 1-3 topic tags from ONLY this vocabulary: family, career, grief, business, stuck, heritage, faith, health, creative, technical, personal, general. If the visitor shared their first name, include it. Format exactly as:\nNAME: [name or "none"]\nSUMMARY: [your summary]\nTAGS: [tag1, tag2]',
      messages: [{ role: 'user', content: conversationText }]
    });

    const result = summaryResponse.content[0].text;
    const nameMatch = result.match(/NAME:\s*(.+)/);
    const summaryMatch = result.match(/SUMMARY:\s*(.+?)(?:\nTAGS:|$)/s);
    const tagsMatch = result.match(/TAGS:\s*(.+)/);

    const summary = summaryMatch ? summaryMatch[1].trim() : result.substring(0, 500).trim();
    const tags = tagsMatch
      ? tagsMatch[1].split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      : ['general'];

    // Store visitor name if detected and not already known
    const detectedName = nameMatch ? nameMatch[1].trim() : null;
    if (detectedName && detectedName.toLowerCase() !== 'none') {
      const { data: existing } = await supabase
        .from('visitors')
        .select('name')
        .eq('visitor_token', visitorToken)
        .single();

      if (existing && !existing.name) {
        await supabase
          .from('visitors')
          .update({ name: detectedName })
          .eq('visitor_token', visitorToken);
      }
    }

    await supabase.from('visitor_notes').insert({
      visitor_token: visitorToken,
      session_id: sessionId,
      summary: summary,
      tags: tags
    });
  } catch (error) {
    console.error('Close session error:', error.message);
  }
}

// Non-blocking conversation logger
async function logConversation(data) {
  if (!supabase) return; // Skip if Supabase not configured

  try {
    const table = data.table || 'conversations';
    await supabase
      .from(table)
      .insert({
        timestamp: new Date().toISOString(),
        user_message: data.userMessage,
        cw_response: data.cwResponse,
        condition: data.condition,
        session_id: data.sessionId,
        ip_hash: data.ipHash,
        token_usage: data.tokenUsage
      });
  } catch (error) {
    // Log error but don't throw - logging failures shouldn't break conversations
    console.error('Logging failed:', error.message);
  }
}

// ── Server-side abuse defense ──────────────────────────
// Closed sessions return a canned line without spending tokens.
// Triggered by loop detection or (future) explicit operator close.

const TERMINAL_RESPONSE = 'The porch is closed for tonight. Come back later.';

async function isSessionClosed(sessionId) {
  if (!supabase || !sessionId || sessionId === 'unknown') return false;
  try {
    const { data } = await supabase
      .from('session_state')
      .select('state')
      .eq('session_id', sessionId)
      .maybeSingle();
    return data && data.state === 'closed';
  } catch (error) {
    console.error('session_state read failed:', error.message);
    return false; // fail open — don't block real users on infra hiccups
  }
}

async function closeSession(sessionId, ipHash, reason, triggerMessage) {
  if (!supabase || !sessionId || sessionId === 'unknown') return;
  try {
    await supabase
      .from('session_state')
      .upsert(
        {
          session_id: sessionId,
          state: 'closed',
          closed_at: new Date().toISOString(),
          closed_reason: reason,
          ip_hash: ipHash,
          trigger_message: (triggerMessage || '').slice(0, 200)
        },
        { onConflict: 'session_id' }
      );
  } catch (error) {
    console.error('session_state write failed:', error.message);
  }
}

// Detect 3 identical user messages in a row (case-folded, trimmed).
// Catches "I am a fish" x5 class. Edge case: legit "more more more" gets
// the same treatment, which is acceptable — short repeated tokens don't
// merit a thoughtful response after the second pass.
function detectIdenticalLoop(messages) {
  const userMsgs = messages
    .filter((m) => m && m.role === 'user')
    .map((m) => (m.content || '').trim().toLowerCase());
  if (userMsgs.length < 3) return false;
  const last3 = userMsgs.slice(-3);
  return (
    last3[0].length > 0 &&
    last3[0] === last3[1] &&
    last3[1] === last3[2]
  );
}

// ── Per-IP rate guard ──────────────────────────────────
//
// Catches the session-rotation pattern: one IP spinning up many short
// sessions in a small window. Existing in-memory rate limit only counts
// requests per IP; an attacker who opens fresh tabs sidesteps it because
// the per-session loop guard resets too. This is the cross-session layer.
//
// Threshold rationale: 8 new sessions per 60 min, throttle for 60 min.
// A shared NAT can plausibly produce 3-4 fresh sessions an hour;
// 8 leaves headroom for legit shared IPs while catching the documented
// 2026-05-14 pattern (13 sessions in 56 min) well before the hour mark.

const IP_THROTTLE_WINDOW_MIN = 60;
const IP_THROTTLE_THRESHOLD = 8;
const IP_THROTTLE_DURATION_MIN = 60;

async function checkIpThrottle(ipHash, isNewSession) {
  if (!supabase || !ipHash) return { throttled: false };

  try {
    const { data } = await supabase
      .from('ip_state')
      .select('*')
      .eq('ip_hash', ipHash)
      .maybeSingle();

    const now = new Date();

    // Already throttled — short-circuit before any model call.
    if (data && data.throttled_until && new Date(data.throttled_until) > now) {
      return { throttled: true, reason: data.throttle_reason || 'rate_limit' };
    }

    // Only new-session requests update the counter. Mid-session messages
    // just check the throttle gate and move on — they're already accounted
    // for by the session that started them.
    if (!isNewSession) return { throttled: false };

    let count = 1;
    let windowStart = now.toISOString();

    if (data) {
      const windowAge = (now - new Date(data.window_start)) / 60000;
      if (windowAge < IP_THROTTLE_WINDOW_MIN) {
        count = (data.new_session_count || 0) + 1;
        windowStart = data.window_start;
      }
      // else: window expired, reset counter
    }

    const update = {
      ip_hash: ipHash,
      new_session_count: count,
      window_start: windowStart,
      last_seen: now.toISOString()
    };

    let throttled = false;
    if (count > IP_THROTTLE_THRESHOLD) {
      update.throttled_until = new Date(
        now.getTime() + IP_THROTTLE_DURATION_MIN * 60000
      ).toISOString();
      update.throttle_reason = `session_rotation_${count}_in_${IP_THROTTLE_WINDOW_MIN}min`;
      throttled = true;
    }

    await supabase
      .from('ip_state')
      .upsert(update, { onConflict: 'ip_hash' });

    return { throttled, reason: update.throttle_reason };
  } catch (error) {
    console.error('ip_state check failed:', error.message);
    return { throttled: false }; // fail open
  }
}

// SYSTEM_PROMPT is now imported from ./cw-prompt/index.js
// Edit prompt content in cw-prompt/*.md files

// Old inline prompt removed - was ~530 lines
// Now organized as:
//   cw-prompt/persona.md      - Identity, voice, backstory
//   cw-prompt/family.md       - Family stories and knowledge
//   cw-prompt/cw-standard.md  - The 5 principles
//   cw-prompt/derek.md        - About Derek, CW Strategies
//   cw-prompt/behaviors.md    - How CW operates
//   cw-prompt/skills/         - Sizing, recalibrate, trade, etc.
//   cw-prompt/guardrails/     - Safety, hallucination, political
//   cw-prompt/site-knowledge.md - The Stable, pages

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
  } catch {
    // ignore
  }

  return 'https://claudewill.io';
}

exports.handler = async (event, context) => {
  // CORS headers
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigin = getAllowedOrigin(origin);

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Rate limiting
  const forwardedFor = event.headers['x-forwarded-for'] || event.headers['X-Forwarded-For'];
  const ip = (
    forwardedFor ? forwardedFor.split(',')[0].trim()
      : (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown')
  );
  if (!rateLimiter.isAllowed(ip)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ 
        error: 'Too many requests',
        response: "Easy there. Give me a minute to catch my breath."
      })
    };
  }

  try {
    let { messages, condition, vernieCode, mode, kitchenCode, action, visitorToken, sessionId: bodySessionId, healthCheck } = JSON.parse(event.body);

    // Handle close-session action (from sendBeacon on tab close)
    // Must await — Netlify kills the function after return, so fire-and-forget never completes
    if (action === 'close-session') {
      await handleCloseSession(visitorToken, bodySessionId, messages);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages required' })
      };
    }

    const MAX_MESSAGES = 12;
    const MAX_MESSAGE_CHARS = 4000;
    const MAX_TOTAL_CHARS = 20000;

    // Cap history length to keep costs predictable
    if (messages.length > MAX_MESSAGES) {
      messages = messages.slice(-MAX_MESSAGES);
    }

    let totalChars = 0;
    for (const m of messages) {
      if (!m || typeof m !== 'object') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid messages format' })
        };
      }

      if (typeof m.role !== 'string' || typeof m.content !== 'string') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid messages format' })
        };
      }

      if (m.content.length > MAX_MESSAGE_CHARS) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Message too long',
            response: 'That’s too much at once. Break it up and try again.'
          })
        };
      }

      totalChars += m.content.length;
      if (totalChars > MAX_TOTAL_CHARS) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Conversation too long',
            response: 'We’ve got enough history now. Start a fresh session.'
          })
        };
      }
    }

    // Session identity (needed for abuse defense + logging)
    const sessionId = event.headers['x-session-id'] || 'unknown';
    const ipHash = createSimpleHash(ip);
    const currentUserMsg = messages[messages.length - 1]?.content || '';

    // Abuse defense: short-circuit closed sessions before any model call.
    if (await isSessionClosed(sessionId)) {
      await logConversation({
        userMessage: currentUserMsg,
        cwResponse: '[blocked: session closed]',
        condition: 'blocked',
        sessionId,
        ipHash,
        tokenUsage: { input: 0, output: 0 }
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response: TERMINAL_RESPONSE, terminated: true })
      };
    }

    // Abuse defense: per-IP session-rotation guard.
    // messages.length === 1 means this is the first user message of a fresh
    // session — that's what we count toward the per-IP threshold.
    const isNewSession = messages.length === 1;
    const ipCheck = await checkIpThrottle(ipHash, isNewSession);
    if (ipCheck.throttled) {
      await logConversation({
        userMessage: currentUserMsg,
        cwResponse: '[blocked: ip throttled]',
        condition: 'ip_throttled',
        sessionId,
        ipHash,
        tokenUsage: { input: 0, output: 0 }
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response: TERMINAL_RESPONSE, terminated: true })
      };
    }

    // Abuse defense: 3 identical user messages → close session.
    if (detectIdenticalLoop(messages)) {
      await closeSession(sessionId, ipHash, 'loop_3_identical', currentUserMsg);
      await logConversation({
        userMessage: currentUserMsg,
        cwResponse: TERMINAL_RESPONSE,
        condition: 'terminated',
        sessionId,
        ipHash,
        tokenUsage: { input: 0, output: 0 }
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ response: TERMINAL_RESPONSE, terminated: true })
      };
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Add condition and date context to system prompt
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const month = today.getMonth() + 1; // 0-indexed
    const day = today.getDate();

    let dateContext = `\n\nToday's date: ${dateStr}`;

    // Special days CW should know about
    if (month === 2 && day === 7) {
      dateContext += `\nToday is Derek's birthday. He turns 53. You can acknowledge it naturally if it fits — "Derek's birthday today. Good day to be on the porch." Don't force it. Once is enough.`;
    }
    if (month === 1 && day === 6) {
      dateContext += `\nToday is your birthday. January 6, 1903. You can mention it if someone asks what day it is, but don't make it about you.`;
    }

    // Mode routing: kitchen > vernie > porch (default)
    const isKitchenMode = mode === 'kitchen' && kitchenCode && kitchenCode === process.env.KITCHEN_CODE;
    const isVernieMode = !isKitchenMode && vernieCode && vernieCode === process.env.VERNIE_CODE;

    // Reject kitchen mode with bad auth (don't fall through to expensive model)
    if (mode === 'kitchen' && !isKitchenMode) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Kitchen access denied', response: 'Wrong key.' })
      };
    }

    let basePrompt, selectedModel, maxTokens;
    if (isKitchenMode) {
      basePrompt = KITCHEN_PROMPT;
      selectedModel = 'claude-opus-4-20250514';
      maxTokens = 1500;
    } else if (isVernieMode) {
      basePrompt = VERNIE_PROMPT;
      selectedModel = 'claude-haiku-4-5';
      maxTokens = 500;
    } else {
      basePrompt = SYSTEM_PROMPT;
      selectedModel = 'claude-haiku-4-5';
      maxTokens = 500;
    }

    // CW Remembers — visitor context (porch mode only)
    let visitorContext = '';
    if (!isKitchenMode && !isVernieMode && visitorToken) {
      const isFirstMessage = messages.length === 1;
      const context = await getVisitorContext(visitorToken, isFirstMessage);
      visitorContext = buildVisitorPrompt(context);
    }

    const liveKnowledge = getLiveSiteKnowledge();
    const systemWithCondition = basePrompt + dateContext + visitorContext + liveKnowledge + `\nCurrent condition: ${condition || 'clear'}`;

    const response = await client.messages.create({
      model: selectedModel,
      max_tokens: maxTokens,
      system: systemWithCondition,
      messages: messages
    });

    const cwResponse = response.content[0].text;

    // Await logging — Netlify kills function after return, fire-and-forget is unreliable
    // healthCheck: true skips logging so autonomous health pings don't pollute conversation tables
    if (!healthCheck) await logConversation({
      userMessage: currentUserMsg,
      cwResponse,
      condition: isKitchenMode ? 'kitchen' : (condition || 'clear'),
      sessionId,
      ipHash,
      tokenUsage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens
      },
      table: isVernieMode ? 'family_conversations' : 'conversations'
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: cwResponse,
        vernieMode: isVernieMode,
        kitchenMode: isKitchenMode,
        model: selectedModel,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      })
    };

  } catch (error) {
    console.error('CW Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Something went wrong.',
        response: "Having trouble thinking right now. Try again in a minute."
      })
    };
  }
};

