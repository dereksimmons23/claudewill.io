// Intake Form Handler for CW Strategies
// Stores submissions in Supabase and sends email notification

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Parse URL-encoded form data
function parseFormData(body) {
  const params = new URLSearchParams(body);
  return Object.fromEntries(params);
}

// Send email notification via Resend
async function sendEmailNotification(submission) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log('No RESEND_API_KEY - skipping email notification');
    return;
  }

  const emailBody = `
New CW Strategies Intake Submission

Name: ${submission.name}
Email: ${submission.email}

1. What are you trying to build?
${submission.trying_to_build || '(not answered)'}

2. What have you already tried?
${submission.already_tried || '(not answered)'}

3. What's the constraint?
${submission.constraint_faced || '(not answered)'}

4. What does success look like in 90 days?
${submission.success_90_days || '(not answered)'}

5. Why me?
${submission.why_me || '(not answered)'}

6. Engagement type:
${submission.engagement_type || '(not selected)'}

7. Anything else?
${submission.anything_else || '(not answered)'}

---
Submitted: ${new Date().toISOString()}
View in Supabase: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
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
        to: 'derek@claudewill.io',
        subject: `New Intake: ${submission.name}`,
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
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse form data
    const data = parseFormData(event.body);

    // Validate required fields
    if (!data.name || !data.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name and email are required' }),
      };
    }

    // Build submission object (field names match the HTML form)
    const submission = {
      name: data.name,
      email: data.email,
      trying_to_build: data.building || null,
      already_tried: data.tried || null,
      constraint_faced: data.constraint || null,
      success_90_days: data.success || null,
      why_me: data.why_me || null,
      engagement_type: data.engagement_type || null,
      anything_else: data.anything_else || null,
    };

    // Store in Supabase
    if (supabase) {
      const { error } = await supabase
        .from('intake_submissions')
        .insert([submission]);

      if (error) {
        console.error('Supabase error:', error);
        // Don't fail the request - still send email
      }
    }

    // Send email notification
    await sendEmailNotification(submission);

    // Redirect to thank you page (or return JSON for AJAX)
    const acceptHeader = event.headers['accept'] || '';
    if (acceptHeader.includes('application/json')) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Submission received' }),
      };
    }

    // HTML form submission - redirect
    return {
      statusCode: 302,
      headers: {
        Location: '/intake-thanks.html',
      },
      body: '',
    };

  } catch (err) {
    console.error('Intake handler error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
