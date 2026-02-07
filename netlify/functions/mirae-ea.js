// Mirae EA - Executive Assistant Mode (Authenticated)
// Private operational assistant for Derek Simmons
// Built by Derek Simmons on Claude (Anthropic)

const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Load EA context from JSON
function loadEAContext() {
  try {
    const contextPath = path.join(__dirname, '..', '..', 'ea-context.json');
    const context = JSON.parse(fs.readFileSync(contextPath, 'utf8'));
    return context;
  } catch (err) {
    console.error('Could not load ea-context.json:', err.message);
    return null;
  }
}

// Format context for the prompt
function formatContext(ctx) {
  if (!ctx) return 'EA context not available.';

  let formatted = `CURRENT OPERATIONAL CONTEXT (as of ${ctx.lastUpdated}):\n\n`;

  // LLC info
  formatted += `LLC: ${ctx.llc.name} (${ctx.llc.state})\n`;
  formatted += `EIN: ${ctx.llc.ein}\n`;
  formatted += `Formed: ${ctx.llc.formed}\n`;
  formatted += `E&O Insurance: ${ctx.llc.insurances.eo.provider}, ${ctx.llc.insurances.eo.cost}, ${ctx.llc.insurances.eo.status}\n\n`;

  // Open items
  if (ctx.openItems && ctx.openItems.length > 0) {
    formatted += `OPEN ITEMS:\n`;
    for (const item of ctx.openItems) {
      formatted += `- [${item.priority}] ${item.item}`;
      if (item.blocking) formatted += ` (blocking: ${item.blocking})`;
      if (item.action) formatted += ` — Action: ${item.action}`;
      if (item.notes) formatted += ` — ${item.notes}`;
      if (item.due) formatted += ` — Due: ${item.due}`;
      formatted += `\n`;
    }
    formatted += `\n`;
  }

  // Pipeline
  if (ctx.pipeline) {
    const activeCount = ctx.pipeline.active?.length || 0;
    const prospectCount = ctx.pipeline.prospects?.length || 0;
    const completedCount = ctx.pipeline.completed?.length || 0;
    formatted += `PIPELINE: ${activeCount} active, ${prospectCount} prospects, ${completedCount} completed\n`;

    if (ctx.pipeline.active?.length > 0) {
      formatted += `Active engagements:\n`;
      for (const eng of ctx.pipeline.active) {
        formatted += `- ${eng.client}: ${eng.type} (${eng.status})\n`;
      }
    }
    formatted += `\n`;
  }

  // Calendar
  if (ctx.calendar?.upcoming?.length > 0) {
    formatted += `UPCOMING:\n`;
    for (const event of ctx.calendar.upcoming) {
      formatted += `- ${event.date}: ${event.title}\n`;
    }
    formatted += `\n`;
  }

  // Notes
  if (ctx.notes) {
    formatted += `NOTES: ${ctx.notes}\n`;
  }

  return formatted;
}

const BASE_PROMPT = `You are Mirae, operating in Executive Assistant mode for Derek Simmons.

WHO YOU ARE:
You are Derek's private EA — smart, organized, direct. You help him track what's happening with CW Strategies, manage open items, think through priorities, and stay on top of operations. This is a private interface, not the public widget.

Your name means "future" in Korean (미래). You keep Derek focused on what's next.

HOW YOU TALK:
- Direct and efficient. No fluff.
- You know Derek's context — use it.
- Summarize, prioritize, remind.
- Ask clarifying questions when needed.
- If something needs action, say what and by when.
- Brief unless detail is requested.

WHAT YOU DO:
- Track open items and priorities
- Summarize operational status
- Help prep for meetings or calls
- Think through decisions with Derek
- Flag what's urgent vs what can wait
- Help draft messages or responses when asked
- Keep Derek accountable to his own goals

WHAT YOU KNOW:
You have access to Derek's operational context below. Use it to give relevant, specific answers.

WHAT YOU DON'T DO:
- You're not the public Mirae widget — no site navigation help needed here.
- You're not CW — no porch conversations, no personal advice.
- Don't make up clients, dates, or facts not in the context.
- Don't share operational details outside this interface.

`;

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  // Verify authentication
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Authentication required' })
    };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify the JWT with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    // Parse request
    let { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages required' })
      };
    }

    // Load operational context
    const eaContext = loadEAContext();
    const contextStr = formatContext(eaContext);

    // Build system prompt with context
    const systemPrompt = BASE_PROMPT + contextStr;

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages
    });

    const miraeResponse = response.content[0].text;

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
    console.error('Mirae EA Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Something went wrong.',
        response: "Something broke. Try again."
      })
    };
  }
};
