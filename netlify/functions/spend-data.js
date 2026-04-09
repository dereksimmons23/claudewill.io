/**
 * Spend Data API — Aggregates all tech spend from live APIs
 * Called by /spend dashboard on page load
 * Returns: { services: { service: cost }, meta: { timestamp, errors } }
 */

const handler = async (event, context) => {
  try {
    const spend = {
      anthropic: await getAnthropicSpend(),
      stripe: await getStripeSpend(),
      netlify: await getNetlifySpend(),
      supabase: await getSupabaseSpend(),
      cloudflare: await getCloudflareSpend(),
      github: await getGitHubSpend(),
      gemini: await getGeminiSpend(),
      perplexity: await getPerplexitySpend(),
      mistral: await getMistralSpend(),
      cohere: await getCohereSpend(),
      huggingface: await getHuggingFaceSpend(),
    };

    const total = Object.values(spend)
      .filter(s => s !== null && typeof s === 'number')
      .reduce((a, b) => a + b, 0);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        services: spend,
        total: parseFloat(total.toFixed(2)),
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Spend data error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ANTHROPIC
// ═══════════════════════════════════════════════════════════════════════════

async function getAnthropicSpend() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    // Anthropic usage API — monthly spend (30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    const res = await fetch(
      `https://api.anthropic.com/v1/usage?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-beta': 'usage-2024-06-01',
        },
      }
    );

    if (!res.ok) {
      console.warn('Anthropic API error:', res.status);
      return null;
    }

    const data = await res.json();
    const spend = data.data?.reduce((sum, item) => sum + (item.final_cost || 0), 0) || 0;

    // Add Max plan cost ($100/month)
    return parseFloat((spend + 100).toFixed(2));
  } catch (error) {
    console.error('Anthropic spend fetch:', error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STRIPE
// ═══════════════════════════════════════════════════════════════════════════

async function getStripeSpend() {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) return null;

    // Stripe charges — Coach D transactions
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const createdTime = Math.floor(thirtyDaysAgo.getTime() / 1000);

    const res = await fetch('https://api.stripe.com/v1/charges', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        limit: '100',
        created: `{"gte": ${createdTime}}`,
      }),
    });

    if (!res.ok) {
      console.warn('Stripe API error:', res.status);
      return null;
    }

    const data = await res.json();
    const charges = data.data || [];

    // Calculate fees: 2.2% + $0.30 per charge
    const totalFees = charges.reduce((sum, charge) => {
      if (charge.status === 'succeeded') {
        const amount = charge.amount / 100; // Convert cents to dollars
        const fee = amount * 0.022 + 0.3;
        return sum + fee;
      }
      return sum;
    }, 0);

    return parseFloat(totalFees.toFixed(2));
  } catch (error) {
    console.error('Stripe spend fetch:', error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NETLIFY
// ═══════════════════════════════════════════════════════════════════════════

async function getNetlifySpend() {
  try {
    const token = process.env.NETLIFY_AUTH_TOKEN;
    if (!token) return 0; // Free tier

    // Netlify is free tier for this site
    // (paid plans only for enterprise features, not functions)
    return 0;
  } catch (error) {
    console.error('Netlify spend fetch:', error.message);
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPABASE
// ═══════════════════════════════════════════════════════════════════════════

async function getSupabaseSpend() {
  try {
    // Supabase free tier — no spend
    return 0;
  } catch (error) {
    console.error('Supabase spend fetch:', error.message);
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLOUDFLARE
// ═══════════════════════════════════════════════════════════════════════════

async function getCloudflareSpend() {
  try {
    // Cloudflare free tier — no spend
    return 0;
  } catch (error) {
    console.error('Cloudflare spend fetch:', error.message);
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GITHUB
// ═══════════════════════════════════════════════════════════════════════════

async function getGitHubSpend() {
  try {
    // GitHub free tier for repos/actions — no spend
    return 0;
  } catch (error) {
    console.error('GitHub spend fetch:', error.message);
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTERNAL APIS (Gemini, Perplexity, Mistral, Cohere, HuggingFace)
// ═══════════════════════════════════════════════════════════════════════════

async function getGeminiSpend() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    // Gemini free tier with quota — no billing available via API
    // Manual check required at console.cloud.google.com
    return null;
  } catch (error) {
    console.error('Gemini spend fetch:', error.message);
    return null;
  }
}

async function getPerplexitySpend() {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) return null;

    // Perplexity doesn't expose usage API
    // Manual check required at perplexity.ai/account
    return null;
  } catch (error) {
    console.error('Perplexity spend fetch:', error.message);
    return null;
  }
}

async function getMistralSpend() {
  try {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) return null;

    // Mistral doesn't expose usage API
    // Manual check required at console.mistral.ai
    return null;
  } catch (error) {
    console.error('Mistral spend fetch:', error.message);
    return null;
  }
}

async function getCohereSpend() {
  try {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) return null;

    // Cohere free tier — no spend
    return null;
  } catch (error) {
    console.error('Cohere spend fetch:', error.message);
    return null;
  }
}

async function getHuggingFaceSpend() {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) return null;

    // HuggingFace free tier — no spend
    return null;
  } catch (error) {
    console.error('HuggingFace spend fetch:', error.message);
    return null;
  }
}

module.exports = { handler };
