// Weekly CW Conversation Digest
// Scheduled function that emails a summary every Monday at 9am CT

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Format number with commas
function formatNumber(num) {
  return num.toLocaleString();
}

// Calculate cost from tokens (Haiku 3.5 pricing)
function calculateCost(inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1000000) * 0.25;  // $0.25 per 1M input
  const outputCost = (outputTokens / 1000000) * 1.25; // $1.25 per 1M output
  return (inputCost + outputCost).toFixed(4);
}

async function sendEmail(subject, body) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log('No RESEND_API_KEY - skipping email');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CW Strategies <onboarding@resend.dev>',
        to: 'simmons.derek@gmail.com',  // Resend test domain requires sending to account email
        subject: subject,
        text: body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

exports.handler = async (event) => {
  // Can be triggered by schedule or manually via GET request
  const isScheduled = event.headers?.['x-netlify-event'] === 'schedule';
  console.log(`Running weekly digest... (scheduled: ${isScheduled})`);

  if (!supabase) {
    console.error('Supabase not configured');
    return { statusCode: 500, body: 'Supabase not configured' };
  }

  // Get date range (last 7 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  try {
    // Query conversations from last 7 days
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return { statusCode: 500, body: 'Database query failed' };
    }

    // Calculate stats
    const totalConversations = conversations.length;
    const uniqueSessions = new Set(conversations.map(c => c.session_id).filter(Boolean)).size;

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    conversations.forEach(c => {
      if (c.token_usage) {
        totalInputTokens += c.token_usage.input || 0;
        totalOutputTokens += c.token_usage.output || 0;
      }
    });

    const totalCost = calculateCost(totalInputTokens, totalOutputTokens);

    // Group by day
    const byDay = {};
    conversations.forEach(c => {
      const day = c.created_at.split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    // Get all-time stats
    const { count: allTimeCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    // Sample some recent messages (first 50 chars of user messages)
    const sampleMessages = conversations
      .slice(0, 5)
      .map(c => {
        const preview = (c.user_message || '').substring(0, 80);
        return `  - "${preview}${c.user_message?.length > 80 ? '...' : ''}"`;
      })
      .join('\n');

    // Build email body
    const emailBody = `
CW's Porch — Weekly Digest
${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THIS WEEK
  Conversations: ${totalConversations}
  Unique sessions: ${uniqueSessions}
  Input tokens: ${formatNumber(totalInputTokens)}
  Output tokens: ${formatNumber(totalOutputTokens)}
  Estimated cost: $${totalCost}

ALL TIME
  Total conversations: ${formatNumber(allTimeCount || 0)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DAILY BREAKDOWN
${Object.entries(byDay)
  .sort((a, b) => b[0].localeCompare(a[0]))
  .map(([day, count]) => `  ${day}: ${count} conversations`)
  .join('\n') || '  No conversations this week'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECENT CONVERSATIONS
${sampleMessages || '  None this week'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View full data: https://supabase.com/dashboard
    `.trim();

    // Send email
    const sent = await sendEmail(
      `CW Weekly: ${totalConversations} conversations, $${totalCost}`,
      emailBody
    );

    console.log('Digest complete:', { totalConversations, sent });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        conversations: totalConversations,
        emailSent: sent,
      }),
    };

  } catch (err) {
    console.error('Digest error:', err);
    return { statusCode: 500, body: 'Digest failed' };
  }
};
