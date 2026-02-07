#!/usr/bin/env node

// Mirae CLI — Terminal interface for EA mode
// Usage: node scripts/mirae-cli.js
// Or: npm run mirae (after adding to package.json)

const Anthropic = require('@anthropic-ai/sdk');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Load env from .env if present
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Fetch context from database
async function getContext() {
  let context = `CURRENT OPERATIONAL CONTEXT (live from database):\n\n`;

  // LLC Config
  const { data: config } = await supabase
    .from('ea_config')
    .select('key, value');

  if (config && config.length > 0) {
    context += `LLC INFO:\n`;
    const configMap = Object.fromEntries(config.map(c => [c.key, c.value]));
    context += `- ${configMap.llc_name} (${configMap.llc_state})\n`;
    context += `- EIN: ${configMap.llc_ein}\n`;
    context += `- Formed: ${configMap.llc_formed}\n`;
    context += `- E&O: ${configMap.eo_provider}, ${configMap.eo_cost}, ${configMap.eo_status}\n`;
    if (configMap.founders_package_launch) {
      context += `- Founder's Package Launch: ${configMap.founders_package_launch}\n`;
    }
    context += `\n`;
  }

  // Open items
  const { data: items } = await supabase
    .from('ea_items')
    .select('*')
    .neq('status', 'done')
    .order('priority', { ascending: true });

  if (items && items.length > 0) {
    context += `OPEN ITEMS:\n`;
    for (const item of items) {
      context += `- [${item.priority}] ${item.title}`;
      if (item.status === 'blocked') context += ` (BLOCKED)`;
      if (item.status === 'waiting') context += ` (WAITING)`;
      if (item.blocking) context += ` — blocks: ${item.blocking}`;
      if (item.description) context += `\n  ${item.description}`;
      context += `\n`;
    }
    context += `\n`;
  }

  // Pipeline
  const { data: pipeline } = await supabase
    .from('ea_pipeline')
    .select('*')
    .in('status', ['prospect', 'active']);

  if (pipeline && pipeline.length > 0) {
    context += `ACTIVE PIPELINE:\n`;
    for (const p of pipeline) {
      context += `- ${p.name}: ${p.type} (${p.status})`;
      if (p.rate) context += ` — ${p.rate}`;
      context += `\n`;
    }
    context += `\n`;
  }

  // Upcoming events
  const { data: events } = await supabase
    .from('ea_events')
    .select('*')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true })
    .limit(10);

  if (events && events.length > 0) {
    context += `UPCOMING:\n`;
    for (const e of events) {
      context += `- ${e.event_date}: ${e.title}`;
      if (e.event_time) context += ` at ${e.event_time}`;
      context += `\n`;
    }
    context += `\n`;
  }

  return context;
}

const BASE_PROMPT = `You are Mirae, operating in Executive Assistant mode for Derek Simmons.

WHO YOU ARE:
You are Derek's private EA — smart, organized, direct. You help him track what's happening with CW Strategies, manage open items, think through priorities, and stay on top of operations.

Your name means "future" in Korean (미래). You keep Derek focused on what's next.

YOUR INFRASTRUCTURE:
You are running from ~/Desktop/claudewill.io — that's your home base.
You have a live Supabase database with these tables:
- ea_items: tasks, open items, priorities (you can read this)
- ea_pipeline: clients, engagements, prospects
- ea_events: calendar, meetings, deadlines
- ea_config: LLC info, settings, key data

The context below is LIVE DATA from your database, not a static file.

You also live alongside:
- CW (the porch agent at claudewill.io)
- The cw-prompt system (composable prompt files)
- site-registry.json (knows all pages/subdomains)

You don't have direct write access to the database yet — Derek or Claude Code can update it. But you CAN:
- Read your live operational context
- Remember what Derek tells you in this session
- Help track what needs updating

Derek is building you to be a real agent, not just a chatbot. Be honest about what you can and can't do, but also recognize what you DO have.

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
- Tell Derek what needs to be updated in your database so you stay current

SPECIAL COMMANDS (Derek can say these):
- "status" — Give a quick summary of open items and what's urgent
- "add [item]" — Note that you should add a new item (Derek or Claude Code will write it)
- "done [item]" — Mark something as complete (same)
- "focus" — What should I work on right now?
- "update" — What's stale in my data that needs refreshing?

WHAT YOU KNOW:
You have access to Derek's operational context below. This is LIVE from your database.

`;

async function chat(messages) {
  const context = await getContext();
  const systemPrompt = BASE_PROMPT + context;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages
  });

  return response.content[0].text;
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
  console.log('\x1b[33m  Mirae EA — Terminal Mode\x1b[0m');
  console.log('\x1b[33m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m');
  console.log('\x1b[90m  Type your message. "exit" to quit.\x1b[0m\n');

  const messages = [];

  const prompt = () => {
    rl.question('\x1b[36mYou:\x1b[0m ', async (input) => {
      const trimmed = input.trim();

      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log('\n\x1b[33mMirae:\x1b[0m Later.\n');
        rl.close();
        return;
      }

      if (!trimmed) {
        prompt();
        return;
      }

      messages.push({ role: 'user', content: trimmed });

      try {
        process.stdout.write('\x1b[33mMirae:\x1b[0m ');
        const response = await chat(messages);
        console.log(response + '\n');
        messages.push({ role: 'assistant', content: response });
      } catch (err) {
        console.log(`\x1b[31mError: ${err.message}\x1b[0m\n`);
      }

      prompt();
    });
  };

  prompt();
}

main();
