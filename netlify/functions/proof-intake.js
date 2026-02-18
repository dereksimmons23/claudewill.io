// Proof Intake Handler
// Stores submissions in Supabase and sends email notification via Resend

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': 'https://claudewill.io',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

// Rate limiting (in-memory, resets on cold start)
const rateLimiter = {
  requests: {},
  isAllowed(ip) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const max = 5; // 5 submissions per minute

    if (!this.requests[ip]) {
      this.requests[ip] = [];
    }

    this.requests[ip] = this.requests[ip].filter(t => now - t < windowMs);

    if (this.requests[ip].length >= max) {
      return false;
    }

    this.requests[ip].push(now);
    return true;
  }
};

// Send email notification via Resend
async function sendNotification(submission) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log('No RESEND_API_KEY - skipping email notification');
    return;
  }

  const emailBody = `
New /proof Intake Submission

Name: ${submission.name}
Email: ${submission.email}

What happened?
${submission.situation || '(not answered)'}

What are you trying to build?
${submission.building_toward || '(not answered)'}

How did you find this?
${submission.found_via || '(not answered)'}

---
Submitted: ${new Date().toISOString()}
  `.trim();

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
        subject: `Proof Intake: ${submission.name}`,
        text: emailBody,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
    }
  } catch (err) {
    console.error('Email send failed:', err);
  }
}

exports.handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Rate limiting
  const ip = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
  if (!rateLimiter.isAllowed(ip)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ error: 'Too many requests' }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Validate required fields
    if (!data.name || !data.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name and email are required' }),
      };
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' }),
      };
    }

    const submission = {
      name: data.name.slice(0, 200),
      email: data.email.slice(0, 200),
      situation: (data.situation || '').slice(0, 2000),
      building_toward: (data.building_toward || '').slice(0, 2000),
      found_via: (data.found_via || '').slice(0, 100),
    };

    // Store in Supabase
    if (supabase) {
      const { error } = await supabase
        .from('proof_intake')
        .insert([submission]);

      if (error) {
        console.error('Supabase error:', error);
      }
    }

    // Send email notification (non-blocking)
    sendNotification(submission).catch(err => console.error('Notification error:', err));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    console.error('Proof intake error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
