#!/usr/bin/env node

/**
 * Spend Audit — runs once daily (5 AM CST via GitHub Actions)
 * Queries Anthropic and Stripe APIs, writes spend-data.json
 * Matches Kitchen pipeline pattern
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

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

    // Check if it's an Admin API key (required for usage API)
    if (!apiKey.startsWith('sk-ant-admin')) {
      console.warn('⚠️  ANTHROPIC_API_KEY is not an Admin key (must start with sk-ant-admin)');
      console.warn('   Generate Admin key at: https://console.anthropic.com/');
      return { max: 200, api: 0 };
    }

    // Anthropic usage report API — last 30 days
    // Requires Admin API key. Returns cost report for all models used.
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = thirtyDaysAgo.toISOString();
    const endDate = now.toISOString();

    // Query: /v1/organizations/cost_report (returns USD costs)
    const res = await fetch(
      `https://api.anthropic.com/v1/organizations/cost_report?starting_at=${encodeURIComponent(startDate)}&ending_at=${encodeURIComponent(endDate)}`,
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2024-06-01',
        },
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      console.warn('⚠️  Anthropic API error:', res.status, errorBody.substring(0, 100));
      return { max: 200, api: 0 };
    }

    const data = await res.json();

    // Parse cost report: data.data is array of cost entries
    // Each entry has: model, cost_in_cents
    const apiSpend = data.data?.reduce((sum, item) => {
      if (item.cost_in_cents) {
        return sum + (item.cost_in_cents / 100); // Convert cents to dollars
      }
      return sum;
    }, 0) || 0;

    return {
      max: 200,  // Claude Max subscription (flat monthly fee)
      api: parseFloat(apiSpend.toFixed(2)),  // Variable API usage
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

function getYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function loadHistory() {
  try {
    const outPath = path.join(__dirname, '../../spend-data.json');
    if (fs.existsSync(outPath)) {
      const data = JSON.parse(fs.readFileSync(outPath, 'utf8'));
      return data.history || [];
    }
  } catch (error) {
    console.warn('⚠️  Could not load history:', error.message);
  }
  return [];
}

function calculateProjection(history, currentTotal) {
  if (history.length < 2) {
    return {
      q2_projected: currentTotal * 3,
      monthly_avg: currentTotal,
      trend: 'insufficient_data',
    };
  }

  const recentMonths = history.slice(-3);
  const recentTotal = recentMonths.reduce((sum, m) => sum + m.monthly_total, 0);
  const monthlyAvg = recentTotal / recentMonths.length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const remainingInQ2 = currentMonth <= 3 ? 3 - (currentMonth - 2) : 0;
  const q2Projected = monthlyAvg * remainingInQ2;

  let trend = 'stable';
  if (recentMonths.length >= 2) {
    const latest = recentMonths[recentMonths.length - 1].monthly_total;
    const previous = recentMonths[recentMonths.length - 2].monthly_total;
    if (latest > previous * 1.1) trend = 'increasing';
    else if (latest < previous * 0.9) trend = 'decreasing';
  }

  return {
    q2_projected: parseFloat(q2Projected.toFixed(2)),
    monthly_avg: parseFloat(monthlyAvg.toFixed(2)),
    trend,
  };
}

async function compileSpendData() {
  console.log('📊 Spend audit running...');

  const anthropic = await getAnthropicSpend();
  const stripe = await getStripeSpend();

  const monthlyTotal = parseFloat(
    (anthropic.max + anthropic.api + stripe).toFixed(2)
  );
  const currentMonth = getYearMonth();
  const budgetUsedPct = Math.round((monthlyTotal / 500) * 100);

  const history = loadHistory();

  const existingIndex = history.findIndex(m => m.month === currentMonth);
  if (existingIndex !== -1) {
    history[existingIndex] = {
      month: currentMonth,
      monthly_total: monthlyTotal,
      budget_used_pct: budgetUsedPct,
    };
  } else {
    history.push({
      month: currentMonth,
      monthly_total: monthlyTotal,
      budget_used_pct: budgetUsedPct,
    });
  }

  if (history.length > 12) {
    history.shift();
  }

  const projections = calculateProjection(history, monthlyTotal);

  const spendData = {
    timestamp: new Date().toISOString(),
    month: currentMonth,
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
    monthly_total: monthlyTotal,
    budget_threshold: 500,
    budget_used_pct: budgetUsedPct,
    history,
    projections,
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
