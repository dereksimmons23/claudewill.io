// Weekly CW Conversation Digest
// Scheduled function that emails a summary every Monday at 9am CT

const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  console.log('Starting weekly digest...');

  // Initialize Supabase inside handler to ensure env vars are loaded
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  console.log('Supabase URL:', supabaseUrl ? 'set' : 'missing');
  console.log('Supabase Key:', supabaseKey ? 'set' : 'missing');

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Supabase not configured' })
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    console.log('Querying conversations...');

    // Query conversations from last 7 days
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('created_at, session_id, token_usage, user_message')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Database query failed', details: error.message })
      };
    }

    console.log('Found conversations:', conversations?.length || 0);

    // Calculate stats
    const totalConversations = conversations?.length || 0;
    const uniqueSessions = new Set((conversations || []).map(c => c.session_id).filter(Boolean)).size;

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    (conversations || []).forEach(c => {
      if (c.token_usage) {
        totalInputTokens += c.token_usage.input || 0;
        totalOutputTokens += c.token_usage.output || 0;
      }
    });

    // Calculate cost (Haiku 3.5 pricing)
    const inputCost = (totalInputTokens / 1000000) * 0.25;
    const outputCost = (totalOutputTokens / 1000000) * 1.25;
    const totalCost = (inputCost + outputCost).toFixed(4);

    // Group by day
    const byDay = {};
    (conversations || []).forEach(c => {
      if (c.created_at) {
        const day = c.created_at.split('T')[0];
        byDay[day] = (byDay[day] || 0) + 1;
      }
    });

    // Get all-time count
    const { count: allTimeCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    // Sample recent messages
    const sampleMessages = (conversations || [])
      .slice(0, 5)
      .map(c => {
        const preview = (c.user_message || '').substring(0, 80);
        return `  - "${preview}${(c.user_message?.length || 0) > 80 ? '...' : ''}"`;
      })
      .join('\n');

    // Build email body
    const emailBody = `
CW's Porch — Weekly Digest
${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}

THIS WEEK
  Conversations: ${totalConversations}
  Unique sessions: ${uniqueSessions}
  Input tokens: ${totalInputTokens.toLocaleString()}
  Output tokens: ${totalOutputTokens.toLocaleString()}
  Estimated cost: $${totalCost}

ALL TIME
  Total conversations: ${(allTimeCount || 0).toLocaleString()}

DAILY BREAKDOWN
${Object.entries(byDay)
  .sort((a, b) => b[0].localeCompare(a[0]))
  .map(([day, count]) => `  ${day}: ${count} conversations`)
  .join('\n') || '  No conversations this week'}

RECENT CONVERSATIONS
${sampleMessages || '  None this week'}

View full data: https://supabase.com/dashboard
    `.trim();

    // Send email
    const resendKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    if (resendKey) {
      console.log('Sending email...');
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'CW Strategies <onboarding@resend.dev>',
            to: 'simmons.derek@gmail.com',
            subject: `CW Weekly: ${totalConversations} conversations, $${totalCost}`,
            text: emailBody,
          }),
        });

        emailSent = response.ok;
        if (!response.ok) {
          const errText = await response.text();
          console.error('Resend error:', errText);
        }
      } catch (emailErr) {
        console.error('Email send failed:', emailErr.message);
      }
    }

    console.log('Digest complete');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        conversations: totalConversations,
        uniqueSessions,
        cost: totalCost,
        emailSent,
      }),
    };

  } catch (err) {
    console.error('Digest error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Digest failed', message: err.message })
    };
  }
};
