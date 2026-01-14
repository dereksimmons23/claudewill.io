// Weekly CW Conversation Digest
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { statusCode: 500, body: 'Missing env vars' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple count query
    const { count, error } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    // Get last 7 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const { data, error: queryError } = await supabase
      .from('conversations')
      .select('created_at, session_id, token_usage, user_message')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (queryError) {
      return { statusCode: 500, body: JSON.stringify({ error: queryError.message }) };
    }

    const weekCount = data?.length || 0;
    const sessions = new Set(data?.map(d => d.session_id).filter(Boolean)).size;

    let inputTokens = 0;
    let outputTokens = 0;
    data?.forEach(d => {
      if (d.token_usage) {
        inputTokens += d.token_usage.input || 0;
        outputTokens += d.token_usage.output || 0;
      }
    });

    const cost = ((inputTokens / 1000000) * 0.25 + (outputTokens / 1000000) * 1.25).toFixed(4);

    // Send email
    const resendKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    if (resendKey) {
      const emailBody = `CW Weekly Digest

This Week: ${weekCount} conversations, ${sessions} sessions
Tokens: ${inputTokens} in / ${outputTokens} out
Cost: $${cost}

All Time: ${count} conversations

Recent:
${data?.slice(0, 3).map(d => '- ' + (d.user_message || '').slice(0, 60)).join('\n') || 'None'}
`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'CW <onboarding@resend.dev>',
          to: 'simmons.derek@gmail.com',
          subject: `CW Weekly: ${weekCount} conversations`,
          text: emailBody,
        }),
      });
      emailSent = res.ok;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ count, weekCount, sessions, cost, emailSent }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
