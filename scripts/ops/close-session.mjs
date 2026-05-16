#!/usr/bin/env node

/**
 * Operator: close (or reopen) a porch session.
 *
 * Writes to session_state — the same table cw.js checks on every request.
 * Closed sessions get the canned terminal line without spending model
 * tokens; reopening removes the gate.
 *
 * Usage:
 *   node scripts/ops/close-session.mjs <session_id> [reason]
 *   node scripts/ops/close-session.mjs <session_id> --reopen
 *
 * Examples:
 *   node scripts/ops/close-session.mjs porch-1736999999999-abc123 spam
 *   node scripts/ops/close-session.mjs porch-1736999999999-abc123 --reopen
 *
 * Look up session_ids in the conversations table when you need to find
 * the one to close.
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

const [, , sessionId, ...rest] = process.argv;

if (!sessionId) {
  console.error('Usage: close-session.mjs <session_id> [reason | --reopen]');
  process.exit(1);
}

const reopen = rest.includes('--reopen');
const reason = rest.filter((r) => !r.startsWith('--')).join(' ') || 'operator_close';

const supabase = createClient(SUPABASE_URL, KEY);

if (reopen) {
  const { error } = await supabase
    .from('session_state')
    .delete()
    .eq('session_id', sessionId);

  if (error) {
    console.error('Reopen failed:', error.message);
    process.exit(1);
  }
  console.log(`Reopened: ${sessionId}`);
} else {
  const { error } = await supabase
    .from('session_state')
    .upsert(
      {
        session_id: sessionId,
        state: 'closed',
        closed_at: new Date().toISOString(),
        closed_reason: reason,
        trigger_message: '[operator]'
      },
      { onConflict: 'session_id' }
    );

  if (error) {
    console.error('Close failed:', error.message);
    process.exit(1);
  }
  console.log(`Closed: ${sessionId} (${reason})`);
}
