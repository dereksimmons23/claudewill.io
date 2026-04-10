#!/usr/bin/env node

/**
 * Spend Audit — runs once daily (5 AM CST via GitHub Actions)
 * Queries Anthropic and Stripe APIs, writes spend-data.json
 * Matches Kitchen pipeline pattern
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════════════
// FETCH SPEND DATA
// ═══════════════════════════════════════════════════════════════════════════

async function getAnthropicSpend() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  ANTHROPIC_API_KEY not set');
      return { max: 200, api: 0 };
    }

    // Anthropic usage API — last 30 days
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
      console.warn('⚠️  Anthropic API error:', res.status);
      return { max: 200, api: 0 };
    }

    const data = await res.json();
    const apiSpend = data.data?.reduce((sum, item) => sum + (item.final_cost || 0), 0) || 0;

    return {
      max: 200,
      api: parseFloat(apiSpend.toFixed(2)),
    };
  } catch (error) {
    console.error('Anthropic fetch error:', error.message);
    return { max: 200, api: 0 };
  }
}

async function getStripeSpend() {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      console.warn('⚠️  STRIPE_SECRET_KEY not set');
      return 0;
    }

    // Stripe charges — Coach D transactions, last 30 days
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
      console.warn('⚠️  Stripe API error:', res.status);
      return 0;
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
    console.error('Stripe fetch error:', error.message);
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPILE SPEND DATA
// ═══════════════════════════════════════════════════════════════════════════

async function compileSpendData() {
  console.log('📊 Spend audit running...');

  const anthropic = await getAnthropicSpend();
  const stripe = await getStripeSpend();

  const spendData = {
    timestamp: new Date().toISOString(),
    anthropic: {
      max: anthropic.max,
      api: anthropic.api,
      total: parseFloat((anthropic.max + anthropic.api).toFixed(2)),
    },
    stripe: {
      fees: stripe,
    },
    services: {
      anthropic: parseFloat((anthropic.max + anthropic.api).toFixed(2)),
      stripe: stripe,
      netlify: 0,
      supabase: 0,
      cloudflare: 0,
      github: 0,
      gemini: null,
      perplexity: null,
      mistral: null,
      cohere: null,
      huggingface: null,
    },
    monthly_total: parseFloat(
      (anthropic.max + anthropic.api + stripe).toFixed(2)
    ),
    budget_threshold: 500,
    budget_used_pct: Math.round(
      ((anthropic.max + anthropic.api + stripe) / 500) * 100
    ),
  };

  return spendData;
}

// ═══════════════════════════════════════════════════════════════════════════
// WRITE TO DISK
// ═══════════════════════════════════════════════════════════════════════════

async function writeSpendData() {
  try {
    const data = await compileSpendData();
    const outPath = path.join(__dirname, '../../spend-data.json');

    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log('✅ spend-data.json written');
    console.log(`   Anthropic Max: $${data.anthropic.max}`);
    console.log(`   Anthropic API: $${data.anthropic.api}`);
    console.log(`   Stripe: $${data.stripe.fees}`);
    console.log(`   Monthly Total: $${data.monthly_total}`);
    console.log(`   Budget Used: ${data.budget_used_pct}%`);

    return data;
  } catch (error) {
    console.error('❌ Error writing spend data:', error.message);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

await writeSpendData();
