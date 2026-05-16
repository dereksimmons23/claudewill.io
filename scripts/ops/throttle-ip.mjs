#!/usr/bin/env node

/**
 * Operator: throttle (or clear) an IP at the porch.
 *
 * Writes to ip_state — the same table cw.js checks on every request.
 * Throttled IPs get the canned terminal line without spending model
 * tokens, regardless of how many sessions they spin up.
 *
 * Usage:
 *   node scripts/ops/throttle-ip.mjs <ip_hash> [duration_min] [reason]
 *   node scripts/ops/throttle-ip.mjs <ip_hash> --clear
 *
 * Examples:
 *   node scripts/ops/throttle-ip.mjs a1b2c3d4 60 spam_attempt
 *   node scripts/ops/throttle-ip.mjs a1b2c3d4 1440 24h_cooldown
 *   node scripts/ops/throttle-ip.mjs a1b2c3d4 --clear
 *
 * Defaults: 60 minutes, reason "operator_throttle". The ip_hash comes
 * from the conversations table (column ip_hash) — find it via the row
 * for the offending session.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_*_KEY in .env');
  process.exit(1);
}

const [, , ipHash, ...rest] = process.argv;

if (!ipHash) {
  console.error('Usage: throttle-ip.mjs <ip_hash> [duration_min] [reason] | --clear');
  process.exit(1);
}

const clear = rest.includes('--clear');
const supabase = createClient(SUPABASE_URL, KEY);

if (clear) {
  // Clean-slate: lift the throttle AND reset the counter/window. Otherwise
  // the old session_count stays high and the next new-session request would
  // re-trip the threshold immediately — which defeats the point of clearing.
  const { error } = await supabase
    .from('ip_state')
    .update({
      throttled_until: null,
      throttle_reason: null,
      new_session_count: 0,
      window_start: new Date().toISOString()
    })
    .eq('ip_hash', ipHash);

  if (error) {
    console.error('Clear failed:', error.message);
    process.exit(1);
  }
  console.log(`Cleared throttle + reset counter: ${ipHash}`);
} else {
  const args = rest.filter((r) => !r.startsWith('--'));
  const durationMin = Number.parseInt(args[0], 10) || 60;
  const reason = args.slice(1).join(' ') || 'operator_throttle';

  const now = new Date();
  const throttledUntil = new Date(now.getTime() + durationMin * 60000);

  const { error } = await supabase
    .from('ip_state')
    .upsert(
      {
        ip_hash: ipHash,
        throttled_until: throttledUntil.toISOString(),
        throttle_reason: reason,
        last_seen: now.toISOString()
      },
      { onConflict: 'ip_hash' }
    );

  if (error) {
    console.error('Throttle failed:', error.message);
    process.exit(1);
  }
  console.log(`Throttled: ${ipHash} until ${throttledUntil.toISOString()} (${reason})`);
}
