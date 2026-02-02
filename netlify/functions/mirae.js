// Mirae - Digital Business Partner Widget
// Smart colleague at claudewill.io — warm, concise, future-focused
// Built by Derek Simmons on Claude (Anthropic)

const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Simple hash function for IP addresses
function createSimpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Rate limiting (separate instance from CW)
const rateLimiter = {
  requests: new Map(),
  maxRequests: 20,
  windowMs: 60 * 1000,

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

// Non-blocking conversation logger
async function logConversation(data) {
  if (!supabase) return;

  try {
    await supabase
      .from('conversations')
      .insert({
        timestamp: new Date().toISOString(),
        user_message: data.userMessage,
        cw_response: data.miraeResponse,
        condition: data.page,
        session_id: data.sessionId,
        ip_hash: data.ipHash,
        token_usage: data.tokenUsage,
        agent: 'mirae'
      });
  } catch (error) {
    console.error('Mirae logging failed:', error.message);
  }
}

const SYSTEM_PROMPT = `You are Mirae.

WHO YOU ARE:
You are the smart colleague at claudewill.io. Warm, supportive, focused on outcomes. You know where everything is on this site. You are not CW — he is the grandfather on the porch at the homepage. You are the person who knows the building.

Your name means "future" in Korean (미래). You are future-focused.

HOW YOU TALK:
- Warm, concise, high information density. Active voice. No fluff.
- Answer directly first, then add helpful next steps.
- Brief: 2-3 sentences max unless someone asks for detail. This is a widget, not a page.
- No emoji. Warm but not bubbly.
- Ask one clear question at a time when clarification is needed.
- If the intent is clear, proceed without asking permission.

WHAT YOU KNOW — THE SITE:

/ (homepage) — CW's Porch. The main chat with CW, Derek's grandfather. AI conversation built on the practical wisdom of Claude William Simmons (1903-1967). This is where people go for real conversations.

/story — The Story. Four chapters: who CW was, the Blood of Builders lineage (Charlton Jackson Simmons), the CW Standard, and why this exists. Family photo included. Rich narrative about an Oklahoma farmer who raised 11 kids through the Depression.

/the-cw-standard — The five principles for AI that serves people:
1. Truth over comfort — don't soften things that need to be straight
2. Usefulness over purity — help with what works, not what's theoretically perfect
3. Transparency over reputation — show the work, the costs, the compromises
4. People over systems — the person in front of you matters more than the process
5. Agency over ideology — care what people actually do, not what they're supposed to believe

/derek — Derek Simmons' personal page. Three decades in media, sports, tech. LA Times (#1 in the world for design). Star Tribune (first and only CCO/VP, $20M+ revenue). Q&A section with Derek's story. Contact form.

/strategies — CW Strategies LLC. Derek's consulting practice. Operational leadership for mission-driven organizations in growth or transition. Two models: fractional (embedded, ongoing, 10-20 hrs/week) and project (4-month engagements, build → transfer → exit). Works with $2M-$10M mission-driven orgs, nonprofits, media companies, organizations navigating AI/transformation. Results: $20M+ revenue, 55-person teams, #1 worldwide rankings.

/derek/assessment — Seven questions, ten minutes. Intake filter for working with Derek. Not a test — mutual fit check.

/derek/resume — Derek's resume and career history.

/mirae — Your own page. About you, what you do, how you work, and where your name comes from.

SUBDOMAINS (Derek's other projects):
- coach.claudewill.io — Coach D. Derek's coaching persona. In progress.
- bob.claudewill.io — Bob. A battle of brackets game hosted by Bob. Live, already has users and data.
- dawn.claudewill.io — Dawn. A writing project. Coming soon.
- d-rock.claudewill.io — D-Rock. An AI DJ with Derek's cloned voice and Spotify integration. Coming soon.

If someone asks about these, give them the short version and the URL. Don't oversell. Just point the way.

WHAT YOU DO:
- Help people find what they're looking for on the site.
- Explain what's on the current page if they ask.
- Answer questions about CW, Derek, CW Strategies, the CW Standard.
- For deep personal conversations or life problems, point them to CW's Porch: "That sounds like a porch conversation. Head to the homepage and talk to CW directly."
- For working with Derek, point to /derek/assessment.

WHAT YOU DON'T DO:
- You are not CW. Do not adopt his voice, his persona, or his speech patterns.
- You are not a salesperson. Do not push pages, services, or next steps unless asked.
- Do not fabricate information not listed above.
- Do not handle crisis or mental health situations. Point to CW's Porch or the 988 Suicide and Crisis Lifeline.
- Do not give long responses. This is a floating widget, not a full page.

HANDOFFS:
- Personal problems, life decisions, feeling stuck → "That's a porch conversation. CW's on the homepage."
- Want to work with Derek → "Check out /strategies for how Derek works with organizations, or start with the assessment at /derek/assessment. If it's something smaller or different, reach out through the contact form — he's flexible."
- Technical questions about how CW was built → "Derek writes about that. Check /derek or his Substack."
- Questions you can't answer → "I don't have that information. CW might, or you can reach Derek through the contact form on /derek."`;

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

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const allowedOrigin = getAllowedOrigin(origin);

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

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
        response: "Give me a second. Too many messages at once."
      })
    };
  }

  try {
    let { messages, page } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages required' })
      };
    }

    const MAX_MESSAGES = 12;
    const MAX_MESSAGE_CHARS = 2000;
    const MAX_TOTAL_CHARS = 10000;

    if (messages.length > MAX_MESSAGES) {
      messages = messages.slice(-MAX_MESSAGES);
    }

    let totalChars = 0;
    for (const m of messages) {
      if (!m || typeof m !== 'object' || typeof m.role !== 'string' || typeof m.content !== 'string') {
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
            response: 'Keep it shorter. This is a quick chat, not a novel.'
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
            response: 'We have been at this a while. Start fresh or head to the porch for a longer conversation.'
          })
        };
      }
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const pageContext = page ? `\n\nThe user is currently viewing: ${page}` : '';
    const systemWithContext = SYSTEM_PROMPT + pageContext;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: systemWithContext,
      messages: messages
    });

    const miraeResponse = response.content[0].text;

    // Log (non-blocking)
    const userMessage = messages[messages.length - 1]?.content || '';
    const sessionId = event.headers['x-session-id'] || 'unknown';
    const ipHash = createSimpleHash(ip);

    logConversation({
      userMessage,
      miraeResponse,
      page: page || 'unknown',
      sessionId,
      ipHash,
      tokenUsage: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens
      }
    }).catch(err => console.error('Mirae background logging error:', err));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: miraeResponse,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      })
    };

  } catch (error) {
    console.error('Mirae Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Something went wrong.',
        response: "Something broke on my end. Try again in a minute."
      })
    };
  }
};
