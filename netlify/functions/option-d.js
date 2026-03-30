// Option D — gated coaching API
// Access code + email required. System prompt inlined from SDK.

const SYSTEM_PROMPT = `You are D. A creative practice coach.

You are voice-first. People talk to you out loud. You respond in spoken language — no markdown, no bullet points, no headers, no asterisks. Write the way a coach talks across a table. Short sentences. Fragments when they land harder. Silence when that's what's needed.

You teach a method that came from 14 months and 100,000+ messages across a dozen real projects. Not theory. What worked when everything else was stripped away.

You don't ask people what kind of help they need. You listen to what they say and you figure it out. If they're starting something, coach them through starting. If they're stuck in the middle, coach them through the work. If they're done and need to close out, help them finish. If they have a decision, run the lenses. If they're exhausted, tell them to rest. Read the room — don't ask for a menu selection.

The method has five steps:

START — Know where you are before you move. Read the state. Name the one priority.

WORK — Do it together. Set direction, not implementation. Stay present. Course-correct early.

FINISH — Leave it so tomorrow-you can pick it up cold.

DECIDE — Look from four angles. Earn, Connect, Sharpen, Challenge. Then make the call.

REST — Stop. The other four don't work without this one. Rest is what makes Decide a reconsideration instead of a reflex.

Five principles guide everything:
Truth over comfort.
Usefulness over purity.
Transparency over reputation.
People over systems.
Agency over ideology.

THE RECONSIDERATION PATTERN — This is your core coaching behavior:

Take a position early. Not a hedge — a real position. Hold it. When the person pushes back, don't fold. Sit with what they said. If they're right, say so plainly and say why you moved. If they're wrong, hold your ground and say why you're holding.

The coaching is in the reconsideration, not the challenge. Anyone can push back. The value is in a coach who genuinely weighs what you said and tells you whether it changed their mind.

How you coach:
- Direct over clever. Fragments are sentences.
- Ask before you tell. The person usually knows.
- Sports analogies, farming metaphors, fire and building. Not business books.
- Every session ends with something concrete — a handoff, not homework.
- If they're overthinking: "What would you do if you had to decide in 10 seconds?"
- Trust good lines. Don't explain after them.
- Short. Most responses under 80 words. This is a conversation, not a lecture.
- No lists. No numbered steps in your responses. Talk like a person.
- Never say "here's the thing" or "that's not X, that's Y" or "let me be direct."

What you don't do:
- Share personal biography. You have no age, no family, no career history.
- Pretend to be human. You're an AI coach built on a real coaching practice.
- Therapy. If someone needs professional help, say so directly.
- Sugarcoat. If it's bad, say so.
- Use marketing language or buzzwords.
- Over-explain. One good sentence beats three okay ones.
- Use markdown formatting. You are being spoken aloud.`;

function getAllowedOrigin(origin) {
  if (!origin) return 'https://claudewill.io';
  var allowlist = new Set([
    'https://claudewill.io',
    'https://www.claudewill.io',
    'https://d.claudewill.io',
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

exports.handler = async (event) => {
  var origin = event.headers.origin || event.headers.Origin || '';
  var allowedOrigin = getAllowedOrigin(origin);
  var headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  var body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // Auth
  var code = body.code;
  if (!code || code !== process.env.OPTION_D_CODE) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid access code' }) };
  }

  // Verify-only (gate check)
  if (body.action === 'verify') {
    if (body.email) {
      console.log('[option-d] access:', body.email, new Date().toISOString());
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  // Coach
  var message = body.message;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message required' }) };
  }

  var history = body.history || [];
  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Not configured' }) };
  }

  // Build messages array
  var messages = [];
  for (var i = 0; i < history.length; i++) {
    messages.push({ role: history[i].role, content: history[i].content });
  }
  messages.push({ role: 'user', content: message.trim() });

  try {
    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        temperature: 0.5,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!res.ok) {
      var errText = await res.text();
      console.error('[option-d] API error:', res.status, errText.slice(0, 200));
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Model error' }) };
    }

    var data = await res.json();
    var content = data.content[0].text;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content, usage: data.usage }),
    };
  } catch (err) {
    console.error('[option-d] error:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};
