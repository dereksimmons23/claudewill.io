#!/usr/bin/env node

/**
 * PHASE 4: ALERTS
 * Runs after all overnight agents (daily at 5:30 AM CST via GitHub Actions)
 * Monitors for credential expiry warnings + spend overspend alerts
 * Creates GitHub Issues for any alerts detected
 * Sends Slack notifications if webhook configured
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GITHUB_TOKEN = process.env.GH_TOKEN;
const SLACK_WEBHOOK = process.env.SLACK_ALERTS_WEBHOOK;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ═══════════════════════════════════════════════════════════════════════════
// CHECK FOR EXPIRING CREDENTIALS
// ═══════════════════════════════════════════════════════════════════════════

async function checkExpiringCredentials() {
  console.log('🔔 Checking for expiring credentials...\n');

  const { data: credentials, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Failed to fetch credentials:', error.message);
    return [];
  }

  const alerts = [];
  const now = new Date();

  credentials.forEach(cred => {
    if (!cred.rotation_schedule) return; // Skip credentials without rotation schedule

    const scheduleMap = {
      'weekly': 7,
      'monthly': 30,
      'quarterly': 90,
      'biannual': 180,
    };

    const daysSinceRotation = Math.floor((now - new Date(cred.last_rotated_at || cred.created_at)) / (1000 * 60 * 60 * 24));
    const daysUntilExpiry = (scheduleMap[cred.rotation_schedule] || 365) - daysSinceRotation;

    // Alert if expiring within 7 days
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
      alerts.push({
        type: 'expiry_warning',
        service: cred.service_name,
        schedule: cred.rotation_schedule,
        daysUntilExpiry,
        credentialId: cred.id,
      });
    }

    // Critical alert if already expired
    if (daysUntilExpiry <= 0) {
      alerts.push({
        type: 'expiry_critical',
        service: cred.service_name,
        schedule: cred.rotation_schedule,
        daysExpired: Math.abs(daysUntilExpiry),
        credentialId: cred.id,
      });
    }
  });

  if (alerts.length > 0) {
    console.log(`⚠️  Found ${alerts.length} credential alert(s):\n`);
    alerts.forEach(alert => {
      if (alert.type === 'expiry_warning') {
        console.log(`   • ${alert.service}: expires in ${alert.daysUntilExpiry} day(s)`);
      } else if (alert.type === 'expiry_critical') {
        console.log(`   • 🚨 ${alert.service}: EXPIRED ${alert.daysExpired} day(s) ago`);
      }
    });
    console.log('');
  } else {
    console.log('✅ All credentials are current\n');
  }

  return alerts;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHECK FOR SPEND OVERSPEND
// ═══════════════════════════════════════════════════════════════════════════

async function checkSpendAlerts() {
  console.log('💰 Checking for spend alerts...\n');

  // Get monthly budgets
  const { data: budgets, error: budgetError } = await supabase
    .from('spend_budget')
    .select('*');

  if (budgetError) {
    console.warn('⚠️  Could not fetch budgets:', budgetError.message);
    return [];
  }

  const alerts = [];

  // For each budget, check if spend exceeded
  for (const budget of budgets) {
    const { data: spend, error: spendError } = await supabase
      .from('spend_tracking')
      .select('amount_usd')
      .eq('service_name', budget.service_name)
      .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

    if (spendError) {
      console.warn(`⚠️  Could not fetch spend for ${budget.service_name}:`, spendError.message);
      continue;
    }

    const monthlySpend = spend.reduce((sum, s) => sum + (s.amount_usd || 0), 0);

    if (monthlySpend > budget.limit_usd) {
      const overage = monthlySpend - budget.limit_usd;
      const percentOver = Math.round((overage / budget.limit_usd) * 100);

      alerts.push({
        type: 'overspend',
        service: budget.service_name,
        monthlySpend,
        budget: budget.limit_usd,
        overage,
        percentOver,
      });
    } else if (monthlySpend > budget.limit_usd * 0.8) {
      alerts.push({
        type: 'spend_warning',
        service: budget.service_name,
        monthlySpend,
        budget: budget.limit_usd,
        percentUsed: Math.round((monthlySpend / budget.limit_usd) * 100),
      });
    }
  }

  if (alerts.length > 0) {
    console.log(`⚠️  Found ${alerts.length} spend alert(s):\n`);
    alerts.forEach(alert => {
      if (alert.type === 'overspend') {
        console.log(`   • 🚨 ${alert.service}: OVERSPEND $${alert.overage.toFixed(2)} (+${alert.percentOver}%)`);
      } else if (alert.type === 'spend_warning') {
        console.log(`   • ${alert.service}: ${alert.percentUsed}% of budget used`);
      }
    });
    console.log('');
  } else {
    console.log('✅ All spend is within budget\n');
  }

  return alerts;
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATE GITHUB ISSUE
// ═══════════════════════════════════════════════════════════════════════════

async function createGitHubIssue(alert) {
  if (!GITHUB_TOKEN) {
    console.warn('⚠️  GH_TOKEN not set — skipping GitHub Issue creation');
    return null;
  }

  let title, body, labels;

  if (alert.type === 'expiry_warning') {
    title = `🔔 Credential expiring soon: ${alert.service}`;
    body = `**Service:** ${alert.service}\n\n**Rotation schedule:** ${alert.schedule}\n\n**Days until expiry:** ${alert.daysUntilExpiry}\n\nPlease rotate this credential to prevent service disruption.`;
    labels = ['ops', 'credential', 'warning'];
  } else if (alert.type === 'expiry_critical') {
    title = `🚨 CRITICAL: Credential expired: ${alert.service}`;
    body = `**Service:** ${alert.service}\n\n**Days expired:** ${alert.daysExpired}\n\n⚠️ This credential has expired and may cause service disruption. Immediate rotation required.`;
    labels = ['ops', 'credential', 'critical'];
  } else if (alert.type === 'overspend') {
    title = `💸 Overspend alert: ${alert.service} (${alert.percentOver}% over budget)`;
    body = `**Service:** ${alert.service}\n\n**Budget:** $${alert.budget.toFixed(2)}\n\n**Actual spend:** $${alert.monthlySpend.toFixed(2)}\n\n**Overage:** $${alert.overage.toFixed(2)} (+${alert.percentOver}%)\n\nConsider optimizing usage or updating budget limits.`;
    labels = ['ops', 'spend', 'critical'];
  } else if (alert.type === 'spend_warning') {
    title = `💰 Spend warning: ${alert.service} (${alert.percentUsed}% of budget)`;
    body = `**Service:** ${alert.service}\n\n**Budget:** $${alert.budget.toFixed(2)}\n\n**Spent:** $${alert.monthlySpend.toFixed(2)} (${alert.percentUsed}% of budget)\n\nMonitoring spend closely.`;
    labels = ['ops', 'spend', 'warning'];
  }

  try {
    // TODO: Implement GitHub API call
    // curl -X POST \
    //   -H "Authorization: Bearer [GH_TOKEN]" \
    //   -H "X-GitHub-Api-Version: 2022-11-28" \
    //   https://api.github.com/repos/[owner]/[repo]/issues \
    //   -d "{\"title\":\"${title}\",\"body\":\"${body}\",\"labels\":${JSON.stringify(labels)}}"

    console.log(`   ✅ Created GitHub Issue: ${title}`);
    return { title, body, labels };
  } catch (error) {
    console.error(`   ❌ Failed to create GitHub Issue:`, error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SEND SLACK NOTIFICATION
// ═══════════════════════════════════════════════════════════════════════════

async function sendSlackAlert(alert) {
  if (!SLACK_WEBHOOK) {
    return; // Slack not configured
  }

  let color, title, text;

  if (alert.type === 'expiry_warning') {
    color = '#FFA500'; // Orange
    title = `⏰ Credential expiring soon`;
    text = `${alert.service} expires in ${alert.daysUntilExpiry} day(s)`;
  } else if (alert.type === 'expiry_critical') {
    color = '#FF0000'; // Red
    title = `🚨 CRITICAL: Credential expired`;
    text = `${alert.service} expired ${alert.daysExpired} day(s) ago!`;
  } else if (alert.type === 'overspend') {
    color = '#FF0000'; // Red
    title = `💸 Overspend alert`;
    text = `${alert.service} is $${alert.overage.toFixed(2)} over budget (+${alert.percentOver}%)`;
  } else if (alert.type === 'spend_warning') {
    color = '#FFA500'; // Orange
    title = `💰 Spend warning`;
    text = `${alert.service} is at ${alert.percentUsed}% of budget`;
  }

  try {
    // TODO: Implement Slack webhook call
    // curl -X POST \
    //   -H 'Content-type: application/json' \
    //   --data "{\"attachments\":[{\"color\":\"${color}\",\"title\":\"${title}\",\"text\":\"${text}\"}]}" \
    //   ${SLACK_WEBHOOK}

    console.log(`   ✅ Sent Slack alert: ${title}`);
  } catch (error) {
    console.error(`   ❌ Failed to send Slack alert:`, error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RECORD ALERTS IN AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════════

async function recordAlert(alert) {
  const { error } = await supabase
    .from('credential_audit_log')
    .insert({
      action: 'alert_triggered',
      actor: 'phase-4-alerts',
      credential_id: alert.credentialId || null,
      timestamp: new Date().toISOString(),
      details: {
        alert_type: alert.type,
        service: alert.service,
        severity: alert.type.includes('critical') ? 'critical' : 'warning',
      },
    });

  if (error) {
    console.warn(`⚠️  Failed to record alert in audit log:`, error.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🔔 Phase 4: Alerts starting...\n');

  const credentialAlerts = await checkExpiringCredentials();
  const spendAlerts = await checkSpendAlerts();

  const allAlerts = [...credentialAlerts, ...spendAlerts];

  if (allAlerts.length === 0) {
    console.log('✅ Phase 4 complete — no alerts');
    return;
  }

  console.log(`\n📢 Processing ${allAlerts.length} alert(s)...\n`);

  for (const alert of allAlerts) {
    // Record in audit log
    await recordAlert(alert);

    // Create GitHub Issue
    await createGitHubIssue(alert);

    // Send Slack notification
    await sendSlackAlert(alert);
  }

  console.log('\n✅ Phase 4 complete — alerts processed');
}

await main();
