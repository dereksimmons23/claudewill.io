#!/usr/bin/env node

/**
 * PHASE 1 SEEDING — Populate Credentials Vault
 * Reads all 15 API keys from environment and seeds Supabase
 *
 * Usage:
 *   node scripts/ops/02-seed-credentials.mjs
 *
 * Requires:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (in .env or GitHub Secrets)
 *   All 15 API keys in .env or GitHub Secrets
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
// CREDENTIAL DEFINITIONS — 15 Services
// ═══════════════════════════════════════════════════════════════════════════

const CREDENTIALS_TO_SEED = [
  // CRITICAL: Anthropic (primary service)
  {
    service_name: 'anthropic',
    credential_type: 'API_KEY',
    secret_env: 'ANTHROPIC_API_KEY',
    rotation_schedule: 'weekly',
    secret_scope: 'all',
    tags: ['critical', 'monitoring', 'spend-tracking'],
    notes: 'Claude API — primary service',
  },

  // SPEND TRACKING: Stripe (payments)
  {
    service_name: 'stripe',
    credential_type: 'API_KEY',
    secret_env: 'STRIPE_SECRET_KEY',
    rotation_schedule: 'quarterly',
    secret_scope: 'netlify-env',
    tags: ['critical', 'spend-tracking'],
    notes: 'Coach D transactions, 2.2% + $0.30 per charge',
  },

  // OVERNIGHT AGENTS: Gemini, Perplexity, Mistral, Cohere
  {
    service_name: 'gemini',
    credential_type: 'API_KEY',
    secret_env: 'GEMINI_API_KEY',
    rotation_schedule: null,
    secret_scope: 'github-secrets',
    tags: ['overnight-agents', 'spend-tracking'],
    notes: 'Google Gemini — Free tier, quota-limited',
  },

  {
    service_name: 'perplexity',
    credential_type: 'BEARER',
    secret_env: 'PERPLEXITY_API_KEY',
    rotation_schedule: 'monthly',
    secret_scope: 'github-secrets',
    tags: ['overnight-agents', 'spend-tracking'],
    notes: 'Sonar model — Overnight agents, manual verification needed',
  },

  {
    service_name: 'mistral',
    credential_type: 'BEARER',
    secret_env: 'MISTRAL_API_KEY',
    rotation_schedule: 'monthly',
    secret_scope: 'github-secrets',
    tags: ['overnight-agents', 'spend-tracking'],
    notes: 'Mistral API — Overnight agents, manual verification needed',
  },

  {
    service_name: 'cohere',
    credential_type: 'BEARER',
    secret_env: 'COHERE_API_KEY',
    rotation_schedule: 'monthly',
    secret_scope: 'github-secrets',
    tags: ['overnight-agents', 'spend-tracking'],
    notes: 'Cohere reranking + embeddings — Free tier, quota-limited',
  },

  // INFRASTRUCTURE: Supabase, Cloudflare, GitHub, Netlify
  {
    service_name: 'supabase',
    credential_type: 'URL',
    secret_env: 'SUPABASE_URL',
    rotation_schedule: null,
    secret_scope: 'all',
    tags: ['infrastructure', 'database'],
    notes: 'Supabase project URL (cw-logging) — no rotation needed',
  },

  {
    service_name: 'supabase-anon-key',
    credential_type: 'API_KEY',
    secret_env: 'SUPABASE_ANON_KEY',
    rotation_schedule: null,
    secret_scope: 'local',
    tags: ['infrastructure', 'database', 'frontend'],
    notes: 'Supabase anon key — frontend access, read-only',
  },

  {
    service_name: 'supabase-service-role',
    credential_type: 'API_KEY',
    secret_env: 'SUPABASE_SERVICE_ROLE_KEY',
    rotation_schedule: 'quarterly',
    secret_scope: 'github-secrets',
    tags: ['infrastructure', 'database', 'critical'],
    notes: 'Supabase service role key — GitHub Actions only, write access',
  },

  {
    service_name: 'cloudflare-workers',
    credential_type: 'BEARER',
    secret_env: 'CLOUDFLARE_WORKER_AUTH',
    rotation_schedule: 'quarterly',
    secret_scope: 'github-secrets',
    tags: ['infrastructure'],
    notes: 'CW Brief auth for Cloudflare Workers',
  },

  {
    service_name: 'github-token',
    credential_type: 'API_KEY',
    secret_env: 'GH_TOKEN',
    rotation_schedule: 'quarterly',
    secret_scope: 'github-secrets',
    tags: ['infrastructure', 'critical'],
    notes: 'GitHub PAT — auto-provided by Actions, rarely rotated',
  },

  {
    service_name: 'netlify',
    credential_type: 'BEARER',
    secret_env: 'NETLIFY_TOKEN',
    rotation_schedule: 'quarterly',
    secret_scope: 'github-secrets',
    tags: ['infrastructure'],
    notes: 'Netlify deploy token — auto-deploy trigger',
  },

  // VOICE/CONTENT: ElevenLabs
  {
    service_name: 'elevenlabs',
    credential_type: 'API_KEY',
    secret_env: 'ELEVENLABS_API_KEY',
    rotation_schedule: 'monthly',
    secret_scope: 'netlify-env',
    tags: ['content', 'spend-tracking'],
    notes: 'Voice synthesis — Netlify functions only',
  },

  // FUTURE/UNUSED: DeepSeek, Grok, HuggingFace
  {
    service_name: 'deepseek',
    credential_type: 'BEARER',
    secret_env: 'DEEPSEEK_API_KEY',
    rotation_schedule: 'monthly',
    secret_scope: 'github-secrets',
    tags: ['sandbox', 'unused'],
    notes: 'DeepSeek — Not currently in use',
  },

  {
    service_name: 'grok',
    credential_type: 'BEARER',
    secret_env: 'GROK_API_KEY',
    rotation_schedule: 'monthly',
    secret_scope: 'github-secrets',
    tags: ['sandbox', 'unused'],
    notes: 'Grok — Not currently in use',
  },

  {
    service_name: 'huggingface',
    credential_type: 'BEARER',
    secret_env: 'HUGGINGFACE_API_KEY',
    rotation_schedule: 'monthly',
    secret_scope: 'github-secrets',
    tags: ['overnight-agents', 'sandbox'],
    notes: 'HuggingFace — Inference + training, free tier',
  },

  // INTERNAL: Option D code
  {
    service_name: 'option-d-code',
    credential_type: 'API_KEY',
    secret_env: 'OPTION_D_CODE',
    rotation_schedule: null,
    secret_scope: 'netlify-env',
    tags: ['internal', 'gated-access'],
    notes: '/d gated access code — no rotation needed',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SEED LOGIC
// ═══════════════════════════════════════════════════════════════════════════

async function seedCredentials() {
  console.log('🌱 Seeding credentials vault...\n');

  let seeded = 0;
  let skipped = 0;

  for (const cred of CREDENTIALS_TO_SEED) {
    const secret_value = process.env[cred.secret_env];

    if (!secret_value) {
      console.warn(`⏭️  SKIPPED: ${cred.service_name} (${cred.secret_env} not found)`);
      skipped++;
      continue;
    }

    try {
      const { data, error } = await supabase
        .from('credentials')
        .insert({
          service_name: cred.service_name,
          credential_type: cred.credential_type,
          secret_value,
          rotation_schedule: cred.rotation_schedule,
          secret_scope: cred.secret_scope,
          tags: cred.tags,
          notes: cred.notes,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        // If unique constraint violation, mark as skipped (already exists)
        if (error.code === '23505') {
          console.warn(`⏭️  EXISTS: ${cred.service_name} (already in vault)`);
          skipped++;
        } else {
          console.error(`❌ ERROR: ${cred.service_name} — ${error.message}`);
        }
      } else {
        console.log(
          `✅ SEEDED: ${cred.service_name.padEnd(20)} [${cred.credential_type.padEnd(8)}] rotation: ${cred.rotation_schedule || 'none'}`
        );
        seeded++;
      }
    } catch (err) {
      console.error(`❌ CATCH: ${cred.service_name} — ${err.message}`);
    }
  }

  console.log(`\n📊 Seeding complete: ${seeded} seeded, ${skipped} skipped\n`);

  if (seeded > 0) {
    // Log the seed action in audit log
    const { error: auditError } = await supabase
      .from('credential_audit_log')
      .insert({
        action: 'created',
        actor: 'seed-script',
        timestamp: new Date().toISOString(),
        details: {
          total_seeded: seeded,
          total_skipped: skipped,
          timestamp: new Date().toISOString(),
        },
      });

    if (auditError) {
      console.warn('⚠️  Audit log entry failed:', auditError.message);
    } else {
      console.log('📝 Audit log recorded\n');
    }
  }

  // Verify count
  const { count, error: countError } = await supabase
    .from('credentials')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`📊 Total credentials in vault: ${count}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════

seedCredentials().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
