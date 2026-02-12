// CW Brief Worker — daily analytics for claudewill.io
// Pattern: Hancock (Cloudflare Worker + cron + KV state + activity log)

const MAX_ACTIVITY_LOG = 50;

// Supabase REST API helper
async function supabaseQuery(url, key, table, params = '') {
  const response = await fetch(`${url}/rest/v1/${table}${params}`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    console.error(`Supabase error: ${response.status} ${response.statusText}`);
    return null;
  }
  return response.json();
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getDayOfWeek() {
  const now = new Date();
  const ct = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[ct.getDay()];
}

function getDateCT() {
  const now = new Date();
  const ct = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[ct.getMonth()]} ${ct.getDate()}, ${ct.getFullYear()}`;
}

async function generateBrief(env) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  const dayOfWeek = getDayOfWeek();
  const date = getDateCT();

  const lines = [];
  lines.push(`## CW Brief — ${dayOfWeek}, ${date}`);
  lines.push('');

  // --- Conversation stats ---
  const now = new Date();
  const today = formatDate(now);
  const yesterday = formatDate(new Date(now - 24 * 60 * 60 * 1000));
  const weekAgo = formatDate(new Date(now - 7 * 24 * 60 * 60 * 1000));

  if (supabaseUrl && supabaseKey) {
    // Total conversations
    const allConvos = await supabaseQuery(supabaseUrl, supabaseKey, 'conversations', '?select=id&limit=1&order=id.desc');
    // Note: Supabase REST API doesn't return count easily without head request
    // Use count query instead
    const countResponse = await fetch(`${supabaseUrl}/rest/v1/conversations?select=id`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'count=exact',
      },
    });
    const totalCount = countResponse.headers.get('content-range');
    const total = totalCount ? totalCount.split('/')[1] : '?';

    // Last 24 hours
    const recentConvos = await supabaseQuery(supabaseUrl, supabaseKey, 'conversations',
      `?select=id,session_id,created_at&created_at=gte.${yesterday}T00:00:00&order=created_at.desc`);

    const recentCount = recentConvos ? recentConvos.length : 0;
    const recentSessions = recentConvos ? new Set(recentConvos.map(c => c.session_id)).size : 0;

    // Last 7 days
    const weekConvos = await supabaseQuery(supabaseUrl, supabaseKey, 'conversations',
      `?select=id,session_id,created_at&created_at=gte.${weekAgo}T00:00:00&order=created_at.desc`);

    const weekCount = weekConvos ? weekConvos.length : 0;
    const weekSessions = weekConvos ? new Set(weekConvos.map(c => c.session_id)).size : 0;

    lines.push('**Conversations:**');
    lines.push(`- Total: ${total}`);
    lines.push(`- Last 24h: ${recentCount} messages, ${recentSessions} sessions`);
    lines.push(`- Last 7d: ${weekCount} messages, ${weekSessions} sessions`);

    // Trend
    if (weekCount > 0) {
      const avgPerDay = (weekCount / 7).toFixed(1);
      lines.push(`- Avg: ${avgPerDay}/day this week`);
    }
  } else {
    lines.push('**Conversations:** Supabase not configured');
  }

  lines.push('');

  // --- Content calendar check ---
  lines.push('**Content:**');

  // Get last published date from KV
  const lastLinkedIn = await env.CW_STATE.get('lastLinkedInPost');
  const lastSubstack = await env.CW_STATE.get('lastSubstackPost');

  if (lastLinkedIn) {
    const daysSince = Math.floor((now - new Date(lastLinkedIn)) / (1000 * 60 * 60 * 24));
    lines.push(`- LinkedIn: last post ${daysSince} day${daysSince !== 1 ? 's' : ''} ago${daysSince >= 3 ? ' (overdue — 2-3x/week cadence)' : ''}`);
  } else {
    lines.push('- LinkedIn: no posts tracked yet (log with POST /content/linkedin)');
  }

  if (lastSubstack) {
    const daysSince = Math.floor((now - new Date(lastSubstack)) / (1000 * 60 * 60 * 24));
    lines.push(`- Substack: last post ${daysSince} day${daysSince !== 1 ? 's' : ''} ago${daysSince >= 7 ? ' (overdue — 1x/week cadence)' : ''}`);
  } else {
    lines.push('- Substack: no posts tracked yet (log with POST /content/substack)');
  }

  // LinkedIn follower milestone
  const followerCount = await env.CW_STATE.get('linkedinFollowers');
  if (followerCount) {
    const count = parseInt(followerCount);
    const toUnlock = 150 - count;
    if (toUnlock > 0) {
      lines.push(`- LinkedIn followers: ${count} (${toUnlock} to newsletter unlock)`);
    } else {
      lines.push(`- LinkedIn followers: ${count} (newsletter unlocked)`);
    }
  }

  lines.push('');

  // --- Slam Dunks from KV ---
  try {
    const dunks = JSON.parse(await env.CW_STATE.get('slamDunks') || '[]');
    if (dunks.length > 0) {
      lines.push('**Slam Dunks:**');
      for (let i = 0; i < dunks.length; i++) {
        lines.push(`- ${i + 1}. ${dunks[i].task} → ${dunks[i].criteria}`);
      }
      lines.push('_(say "dunk N" in Claude Code to execute)_');
    }
  } catch (e) {
    // Silently skip if KV read fails
  }

  lines.push('');

  // --- CW health ---
  lines.push('**System:** CW Porch operational (check /health for live status)');

  lines.push('');
  lines.push('---');
  lines.push(`*Generated ${new Date().toISOString()}*`);

  return {
    dayOfWeek,
    date,
    brief: lines.join('\n'),
  };
}

async function logActivity(env, type, details) {
  const log = JSON.parse(await env.CW_STATE.get('activityLog') || '[]');
  log.unshift({
    type,
    details,
    timestamp: new Date().toISOString(),
  });
  if (log.length > MAX_ACTIVITY_LOG) {
    log.length = MAX_ACTIVITY_LOG;
  }
  await env.CW_STATE.put('activityLog', JSON.stringify(log));
}

function isAuthorized(request, env) {
  const authKey = env.WORKER_AUTH_KEY;
  if (!authKey) return false;
  const header = request.headers.get('X-Worker-Key') || '';
  return header === authKey;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function unauthorized() {
  return json({ error: 'unauthorized' }, 401);
}

// --- HTTP Request Handler ---

async function handleRequest(request, env) {
  const url = new URL(request.url);

  // Public: health check
  if (url.pathname === '/health') {
    return json({
      status: 'alive',
      agent: 'cw-brief',
      date: getDateCT(),
    });
  }

  // Everything else requires auth
  if (!isAuthorized(request, env)) {
    return unauthorized();
  }

  // GET /brief — generate current brief
  if (url.pathname === '/brief') {
    const result = await generateBrief(env);
    await logActivity(env, 'brief_generated', { date: result.date });
    return json(result);
  }

  // GET /brief/text — plain text for terminal
  if (url.pathname === '/brief/text') {
    const result = await generateBrief(env);
    await logActivity(env, 'brief_generated', { date: result.date });
    return new Response(result.brief, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // POST /content/linkedin — log a LinkedIn post { title, date }
  if (url.pathname === '/content/linkedin' && request.method === 'POST') {
    const body = await request.json();
    await env.CW_STATE.put('lastLinkedInPost', body.date || new Date().toISOString());
    const log = JSON.parse(await env.CW_STATE.get('contentLog') || '[]');
    log.unshift({ platform: 'linkedin', title: body.title || '', date: body.date || new Date().toISOString() });
    await env.CW_STATE.put('contentLog', JSON.stringify(log));
    await logActivity(env, 'content_logged', { platform: 'linkedin', title: body.title });
    return json({ success: true });
  }

  // POST /content/substack — log a Substack post
  if (url.pathname === '/content/substack' && request.method === 'POST') {
    const body = await request.json();
    await env.CW_STATE.put('lastSubstackPost', body.date || new Date().toISOString());
    const log = JSON.parse(await env.CW_STATE.get('contentLog') || '[]');
    log.unshift({ platform: 'substack', title: body.title || '', date: body.date || new Date().toISOString() });
    await env.CW_STATE.put('contentLog', JSON.stringify(log));
    await logActivity(env, 'content_logged', { platform: 'substack', title: body.title });
    return json({ success: true });
  }

  // POST /followers — update LinkedIn follower count { count }
  if (url.pathname === '/followers' && request.method === 'POST') {
    const body = await request.json();
    await env.CW_STATE.put('linkedinFollowers', String(body.count));
    await logActivity(env, 'followers_updated', { count: body.count });
    return json({ success: true, count: body.count });
  }

  // GET /content — content posting history
  if (url.pathname === '/content') {
    const log = JSON.parse(await env.CW_STATE.get('contentLog') || '[]');
    return json({ content: log });
  }

  // GET /activity-log — for standup
  if (url.pathname === '/activity-log') {
    const log = JSON.parse(await env.CW_STATE.get('activityLog') || '[]');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    return json({ activities: log.slice(0, limit), total: log.length });
  }

  // POST /brief/slack — manually send brief to Slack
  if (url.pathname === '/brief/slack' && request.method === 'POST') {
    const result = await generateBrief(env);
    const slackSent = await sendToSlack(env, result.brief);
    await logActivity(env, 'brief_slack_manual', { date: result.date, sent: slackSent });
    return json({ success: slackSent, brief: result.brief });
  }

  // GET /slam-dunks — current slam dunks
  if (url.pathname === '/slam-dunks' && request.method === 'GET') {
    const dunks = JSON.parse(await env.CW_STATE.get('slamDunks') || '[]');
    return json({ dunks });
  }

  // POST /slam-dunks — update slam dunks [{ task, files, criteria, confidence }]
  if (url.pathname === '/slam-dunks' && request.method === 'POST') {
    const body = await request.json();
    const dunks = Array.isArray(body) ? body : body.dunks || [];
    await env.CW_STATE.put('slamDunks', JSON.stringify(dunks));
    await logActivity(env, 'slam_dunks_updated', { count: dunks.length });
    return json({ success: true, count: dunks.length });
  }

  // DELETE /slam-dunks — clear all slam dunks
  if (url.pathname === '/slam-dunks' && request.method === 'DELETE') {
    await env.CW_STATE.put('slamDunks', '[]');
    await logActivity(env, 'slam_dunks_cleared', {});
    return json({ success: true });
  }

  // GET /state — debug
  if (url.pathname === '/state') {
    const state = {
      lastLinkedInPost: await env.CW_STATE.get('lastLinkedInPost'),
      lastSubstackPost: await env.CW_STATE.get('lastSubstackPost'),
      linkedinFollowers: await env.CW_STATE.get('linkedinFollowers'),
      slamDunksCount: JSON.parse(await env.CW_STATE.get('slamDunks') || '[]').length,
      contentLogCount: JSON.parse(await env.CW_STATE.get('contentLog') || '[]').length,
      activityLogCount: JSON.parse(await env.CW_STATE.get('activityLog') || '[]').length,
    };
    return json(state);
  }

  return json({ error: 'not found', endpoints: ['/health', '/brief', '/brief/text', '/brief/slack', '/content', '/content/linkedin', '/content/substack', '/followers', '/slam-dunks', '/activity-log', '/state'] }, 404);
}

// --- Cron Handler ---

async function handleScheduled(event, env) {
  console.log('CW Brief cron triggered:', event.cron);
  const result = await generateBrief(env);

  // Store latest brief
  await env.CW_STATE.put('latestBrief', JSON.stringify(result));
  await logActivity(env, 'cron_brief', { date: result.date });

  // Check content cadence and log nudges
  const now = new Date();
  const lastLinkedIn = await env.CW_STATE.get('lastLinkedInPost');
  const lastSubstack = await env.CW_STATE.get('lastSubstackPost');

  if (lastLinkedIn) {
    const daysSince = Math.floor((now - new Date(lastLinkedIn)) / (1000 * 60 * 60 * 24));
    if (daysSince >= 3) {
      await logActivity(env, 'nudge', { platform: 'linkedin', daysSince, message: 'LinkedIn overdue (2-3x/week cadence)' });
    }
  }

  if (lastSubstack) {
    const daysSince = Math.floor((now - new Date(lastSubstack)) / (1000 * 60 * 60 * 24));
    if (daysSince >= 7) {
      await logActivity(env, 'nudge', { platform: 'substack', daysSince, message: 'Substack overdue (1x/week cadence)' });
    }
  }

  // Send to Slack
  const slackSent = await sendToSlack(env, result.brief);
  if (slackSent) {
    await logActivity(env, 'slack_sent', { date: result.date });
  }

  console.log(`CW brief generated for ${result.date} (slack: ${slackSent})`);
  return result;
}

// --- Slack ---

async function sendToSlack(env, brief) {
  const webhookUrl = env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL not configured');
    return false;
  }

  // Convert markdown-ish brief to Slack mrkdwn
  const slackText = brief
    .replace(/^## (.+)$/gm, '*$1*')
    .replace(/\*\*(.+?)\*\*/g, '*$1*');

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: slackText }),
  });

  if (!response.ok) {
    console.error(`Slack error: ${response.status} ${response.statusText}`);
    return false;
  }
  return true;
}

// --- Export ---

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(event, env));
  },
};
