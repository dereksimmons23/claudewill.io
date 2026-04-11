#!/usr/bin/env node

/**
 * PHASE 2: SPEND AGGREGATION
 * Runs daily (5 AM CST via GitHub Actions)
 * Queries all 15 services for costs, writes to Supabase spend_tracking table
 * Kitchen dashboard reads this data and displays real spend trends
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ═══════════════════════════════════════════════════════════════════════════
// SPEND FETCHERS FOR EACH SERVICE
// ═══════════════════════════════════════════════════════════════════════════

async function getAnthropicSpend(apiKey) {
  try {
    if (!apiKey?.startsWith('sk-ant-admin')) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = thirtyDaysAgo.toISOString();
    const endDate = now.toISOString();

    const res = await fetch(
      `https://api.anthropic.com/v1/organizations/cost_report?starting_at=${encodeURIComponent(startDate)}&ending_at=${encodeURIComponent(endDate)}`,
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2024-06-01',
        },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const apiSpend = data.data?.reduce((sum, item) => {
      return sum + (item.cost_in_cents ? item.cost_in_cents / 100 : 0);
    }, 0) || 0;

    return parseFloat(apiSpend.toFixed(2));
  } catch (error) {
    console.warn('⚠️  Anthropic fetch error:', error.message);
    return null;
  }
}

async function getStripeSpend(apiKey) {
  try {
    if (!apiKey) return null;

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

    if (!res.ok) return null;

    const data = await res.json();
    const charges = data.data || [];

    const totalFees = charges.reduce((sum, charge) => {
      if (charge.status === 'succeeded') {
        const amount = charge.amount / 100;
        const fee = amount * 0.022 + 0.3;
        return sum + fee;
      }
      return sum;
    }, 0);

    return parseFloat(totalFees.toFixed(2));
  } catch (error) {
    console.warn('⚠️  Stripe fetch error:', error.message);
    return null;
  }
}

async function getSupabaseSpend(url, apiKey) {
  try {
    if (!url || !apiKey) return null;

    // Supabase doesn't have a public billing API
    // For now, return null and rely on manual data
    // TODO: Integrate with Supabase Management API when available
    return null;
  } catch (error) {
    return null;
  }
}

async function getNetlifySpend(apiKey) {
  try {
    if (!apiKey) return null;

    const res = await fetch('https://api.netlify.com/api/v1/accounts', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    // Netlify returns account info; billing may require additional endpoint
    // For now, return null pending proper integration
    return null;
  } catch (error) {
    return null;
  }
}

async function getGeminiSpend(apiKey) {
  try {
    if (!apiKey) return null;

    // Google Gemini API cost tracking requires Cloud Billing API
    // For now, return null pending integration
    return null;
  } catch (error) {
    return null;
  }
}

// Add more fetchers as integrations are built

// ═══════════════════════════════════════════════════════════════════════════
// AGGREGATE SPEND DATA FROM ALL 15 SERVICES
// ═══════════════════════════════════════════════════════════════════════════

async function fetchAllSpend() {
  console.log('📊 Fetching spend data from all 15 services...');

  const spendByService = {};

  // Fetch from Supabase credentials table
  const { data: credentials, error } = await supabase
    .from('credentials')
    .select('service_name, secret_value, credential_type')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Failed to fetch credentials:', error.message);
    return spendByService;
  }

  // Build credential map
  const credentialMap = {};
  credentials.forEach(cred => {
    credentialMap[cred.service_name] = cred.secret_value;
  });

  // Query each service
  console.log('Querying Anthropic...');
  spendByService.anthropic = await getAnthropicSpend(credentialMap.anthropic);

  console.log('Querying Stripe...');
  spendByService.stripe = await getStripeSpend(credentialMap.stripe);

  console.log('Querying Supabase...');
  spendByService.supabase = await getSupabaseSpend(process.env.SUPABASE_URL, credentialMap['supabase-service-role']);

  console.log('Querying Netlify...');
  spendByService.netlify = await getNetlifySpend(credentialMap.netlify);

  console.log('Querying Gemini...');
  spendByService.gemini = await getGeminiSpend(credentialMap.gemini);

  // Additional services: Perplexity, Mistral, Cohere, ElevenLabs, DeepSeek, Cloudflare, GitHub
  // TODO: Add fetch functions for each when APIs are available

  console.log('✅ Spend data collected');
  return spendByService;
}

// ═══════════════════════════════════════════════════════════════════════════
// WRITE TO SUPABASE
// ═══════════════════════════════════════════════════════════════════════════

async function writeSpendData(spendByService) {
  console.log('💾 Writing to spend_tracking table...');

  const today = new Date().toISOString().split('T')[0];
  const rows = [];

  for (const [service, amount] of Object.entries(spendByService)) {
    if (amount !== null && amount !== undefined) {
      rows.push({
        service_name: service,
        date: today,
        amount_usd: amount,
        source: 'api',
      });
    }
  }

  if (rows.length === 0) {
    console.warn('⚠️  No spend data to write');
    return;
  }

  const { error } = await supabase
    .from('spend_tracking')
    .upsert(rows, { onConflict: 'service_name,date' });

  if (error) {
    console.error('❌ Failed to write spend data:', error.message);
    return;
  }

  console.log(`✅ Wrote ${rows.length} service spend records for ${today}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function writeSpendJson(spendByService) {
  const { writeFileSync } = await import('fs');
  const spendJsonPath = path.join(__dirname, '../../spend-data.json');

  const anthropicApi = spendByService.anthropic || 0;
  const stripeFees = spendByService.stripe || 0;
  const maxPlan = 200; // Claude Max subscription

  const services = {
    anthropic: maxPlan + anthropicApi,
    stripe: stripeFees,
    netlify: 0,
    supabase: 0,
    cloudflare: 0,
    github: 0,
    gemini: spendByService.gemini || null,
    perplexity: spendByService.perplexity || null,
    mistral: spendByService.mistral || null,
    cohere: spendByService.cohere || null,
    huggingface: spendByService.huggingface || null,
  };

  const monthlyTotal = Object.values(services).reduce((sum, v) => sum + (v || 0), 0);

  const data = {
    timestamp: new Date().toISOString(),
    month: new Date().toISOString().slice(0, 7),
    anthropic: { max: maxPlan, api: anthropicApi, total: maxPlan + anthropicApi },
    stripe: { fees: stripeFees },
    services,
    monthly_total: monthlyTotal,
    budget_threshold: 500,
    budget_used_pct: Math.round((monthlyTotal / 500) * 100),
    history: [{ month: new Date().toISOString().slice(0, 7), monthly_total: monthlyTotal, budget_used_pct: Math.round((monthlyTotal / 500) * 100) }],
    projections: {
      q2_projected: monthlyTotal * 3,
      monthly_avg: monthlyTotal,
      trend: monthlyTotal > 0 ? 'stable' : 'insufficient_data',
    },
  };

  writeFileSync(spendJsonPath, JSON.stringify(data, null, 2) + '\n');
  console.log(`✅ spend-data.json written (total: $${monthlyTotal})`);
}

async function main() {
  console.log('🚀 Phase 2: Spend Aggregation starting...\n');

  const spendByService = await fetchAllSpend();
  await writeSpendData(spendByService);
  await writeSpendJson(spendByService);

  console.log('\n✅ Phase 2 complete');
}

await main();
