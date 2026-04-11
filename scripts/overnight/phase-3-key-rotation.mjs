#!/usr/bin/env node

/**
 * PHASE 3: KEY ROTATION AUTOMATION
 * Runs Monday mornings (via scheduled GitHub Actions trigger)
 * Identifies credentials needing rotation, generates new keys, syncs to GitHub Secrets + Netlify
 * Updates vault with new keys, marks old ones inactive, records in audit log
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import nacl from 'tweetnacl';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GITHUB_TOKEN = process.env.GH_TOKEN;
const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ═══════════════════════════════════════════════════════════════════════════
// ROTATION SCHEDULE LOGIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Determines if a credential should be rotated based on schedule and last rotation
 */
function shouldRotate(credential) {
  if (!credential.rotation_schedule) return false;

  const lastRotation = new Date(credential.last_rotated_at || credential.created_at);
  const now = new Date();

  const scheduleMap = {
    'weekly': 7,
    'monthly': 30,
    'quarterly': 90,
    'biannual': 180,
  };

  const daysSinceRotation = Math.floor((now - lastRotation) / (1000 * 60 * 60 * 24));
  const daysUntilRotation = scheduleMap[credential.rotation_schedule];

  return daysSinceRotation >= daysUntilRotation;
}

// ═══════════════════════════════════════════════════════════════════════════
// KEY GENERATION STUBS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a new key for each service
 * Real implementations would call service APIs to generate keys
 * For now, return placeholder indicating the service needs manual key generation
 */
async function generateNewKey(service, credential) {
  console.log(`🔑 Generating new key for ${service}...`);

  // TODO: Implement real key generation for each service
  // Examples:
  // - Anthropic: Create new Admin API key via console
  // - Stripe: Rotate via https://api.stripe.com/v1/api_keys
  // - GitHub: Create new PAT via GitHub API
  // - Netlify: Create new deploy token via Netlify API
  // - Cloudflare: Generate new API token via Cloudflare API

  // For now, return null to indicate manual rotation needed
  return {
    newKey: null,
    manualRequired: true,
    rotationUrl: getRotationUrl(service),
  };
}

/**
 * Get the URL where the user should rotate the key
 */
function getRotationUrl(service) {
  const urls = {
    'anthropic': 'https://console.anthropic.com/account/keys',
    'stripe': 'https://dashboard.stripe.com/apikeys',
    'github-token': 'https://github.com/settings/tokens',
    'netlify': 'https://app.netlify.com/user/applications/personal-access-tokens',
    'cloudflare-workers': 'https://dash.cloudflare.com/profile/api-tokens',
    'elevenlabs': 'https://elevenlabs.io/api-keys',
    'perplexity': 'https://www.perplexity.ai/settings/api',
    'mistral': 'https://console.mistral.ai/user/api-keys/',
    'cohere': 'https://dashboard.cohere.ai/api-keys',
    'deepseek': 'https://platform.deepseek.com/api_keys',
    'grok': 'https://grok.x.com/settings/api-keys',
    'huggingface': 'https://huggingface.co/settings/tokens',
  };

  return urls[service] || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// GITHUB SECRETS SYNC
// ═══════════════════════════════════════════════════════════════════════════

async function getGitHubPublicKey() {
  if (!GITHUB_TOKEN) return null;

  try {
    const res = await fetch('https://api.github.com/repos/dereksimmons23/claudewill.io/actions/secrets/public-key', {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!res.ok) {
      console.error('❌ Failed to fetch GitHub public key');
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching GitHub public key:', error.message);
    return null;
  }
}

/**
 * Encrypt secret value using libsodium-style sealed box
 * GitHub API expects secrets encrypted with their public key
 * This implements the sealed box algorithm: ephemeral_pk || nonce || ciphertext
 */
function encryptSecret(publicKeyBase64, secretValue) {
  try {
    // Decode public key from base64
    const publicKeyBytes = Buffer.from(publicKeyBase64, 'base64');
    const publicKey = new Uint8Array(publicKeyBytes);

    // Convert secret to bytes
    const message = Buffer.from(secretValue, 'utf8');

    // Generate ephemeral keypair for this encryption
    const ephemeral = nacl.box.keyPair();

    // Generate random nonce
    const nonce = nacl.randomBytes(24);

    // Encrypt using box with ephemeral secret key
    const ciphertext = nacl.box(
      new Uint8Array(message),
      nonce,
      publicKey,
      ephemeral.secretKey
    );

    // Construct sealed box: ephemeral_pk + nonce + ciphertext
    const sealedBox = new Uint8Array(
      ephemeral.publicKey.length + nonce.length + ciphertext.length
    );
    sealedBox.set(ephemeral.publicKey);
    sealedBox.set(nonce, ephemeral.publicKey.length);
    sealedBox.set(ciphertext, ephemeral.publicKey.length + nonce.length);

    // Encode to base64
    const encryptedBase64 = Buffer.from(sealedBox).toString('base64');

    return encryptedBase64;
  } catch (error) {
    console.error('❌ Error encrypting secret:', error.message);
    return null;
  }
}

async function updateGitHubSecret(secretName, secretValue) {
  if (!GITHUB_TOKEN) {
    console.warn(`⚠️  GH_TOKEN not set — skipping GitHub Secrets update for ${secretName}`);
    return false;
  }

  try {
    // Get public key for encryption
    const keyData = await getGitHubPublicKey();
    if (!keyData) {
      console.warn(`⚠️  Could not fetch GitHub public key for ${secretName}`);
      return false;
    }

    // Encrypt the secret value
    const encryptedValue = encryptSecret(keyData.key, secretValue);
    if (!encryptedValue) {
      console.warn(`⚠️  Could not encrypt secret ${secretName}`);
      return false;
    }

    // Update the secret via GitHub API
    const res = await fetch(`https://api.github.com/repos/dereksimmons23/claudewill.io/actions/secrets/${secretName}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encrypted_value: encryptedValue,
        key_id: keyData.key_id,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error(`❌ GitHub API error for ${secretName}:`, error.message);
      return false;
    }

    console.log(`✅ Updated GitHub Secret: ${secretName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update GitHub Secret ${secretName}:`, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NETLIFY ENV SYNC
// ═══════════════════════════════════════════════════════════════════════════

async function updateNetlifyEnvVar(envVarName, envVarValue) {
  if (!NETLIFY_TOKEN) {
    console.warn(`⚠️  NETLIFY_TOKEN not set — skipping Netlify env update for ${envVarName}`);
    return false;
  }

  try {
    // First, get the site ID (stored as environment variable or config)
    const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID || 'claudewill';

    // Netlify API requires the site ID to update env vars
    // The endpoint is: /api/v1/sites/{siteId}/env
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NETLIFY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: envVarName,
        values: [
          {
            value: envVarValue,
            context: 'production', // Can also be 'dev', 'deploy-preview', 'branch-deploy'
          },
        ],
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error(`❌ Netlify API error for ${envVarName}:`, error.message);
      return false;
    }

    console.log(`✅ Updated Netlify env: ${envVarName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update Netlify env ${envVarName}:`, error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// IDENTIFY CREDENTIALS NEEDING ROTATION
// ═══════════════════════════════════════════════════════════════════════════

async function getCredentialsNeedingRotation() {
  console.log('🔍 Checking for credentials that need rotation...\n');

  const { data: credentials, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Failed to fetch credentials:', error.message);
    return [];
  }

  const needsRotation = credentials.filter(cred => shouldRotate(cred));

  if (needsRotation.length === 0) {
    console.log('✅ All credentials are up to date — no rotation needed\n');
    return [];
  }

  console.log(`⏱️  ${needsRotation.length} credential(s) need rotation:\n`);
  needsRotation.forEach(cred => {
    const schedule = cred.rotation_schedule || 'manual';
    console.log(`   • ${cred.service_name.padEnd(20)} [${schedule}] — last rotated ${cred.last_rotated_at ? new Date(cred.last_rotated_at).toLocaleDateString() : 'never'}`);
  });
  console.log('');

  return needsRotation;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS ROTATION
// ═══════════════════════════════════════════════════════════════════════════

async function processRotation(credential) {
  console.log(`\n🔄 Processing rotation for ${credential.service_name}...\n`);

  // Generate new key
  const keyGen = await generateNewKey(credential.service_name, credential);

  if (keyGen.manualRequired) {
    console.log(`   ⚠️  Manual rotation required at: ${keyGen.rotationUrl}`);
    console.log(`   Instructions: Generate new key, add to GitHub Secrets, then run seed script\n`);

    // Record in audit log that rotation was attempted but requires manual intervention
    await supabase
      .from('credential_audit_log')
      .insert({
        action: 'rotation_required',
        actor: 'phase-3-automation',
        credential_id: credential.id,
        timestamp: new Date().toISOString(),
        details: {
          service: credential.service_name,
          schedule: credential.rotation_schedule,
          manual_required: true,
          rotation_url: keyGen.rotationUrl,
        },
      });

    return {
      service: credential.service_name,
      status: 'manual_required',
      rotationUrl: keyGen.rotationUrl,
    };
  }

  // If automated generation succeeded, update vault and sync to GitHub + Netlify
  const { newKey } = keyGen;

  if (!newKey) {
    console.log(`   ❌ Key generation failed for ${credential.service_name}`);
    return { service: credential.service_name, status: 'failed' };
  }

  // Mark old credential as inactive
  const { error: deactivateError } = await supabase
    .from('credentials')
    .update({ is_active: false })
    .eq('id', credential.id);

  if (deactivateError) {
    console.error(`   ❌ Failed to deactivate old credential:`, deactivateError.message);
    return { service: credential.service_name, status: 'failed' };
  }

  // Insert new credential
  const { error: insertError } = await supabase
    .from('credentials')
    .insert({
      service_name: credential.service_name,
      credential_type: credential.credential_type,
      secret_value: newKey,
      rotation_schedule: credential.rotation_schedule,
      secret_scope: credential.secret_scope,
      tags: credential.tags,
      notes: credential.notes,
      is_active: true,
      created_at: new Date().toISOString(),
      last_rotated_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error(`   ❌ Failed to insert new credential:`, insertError.message);
    return { service: credential.service_name, status: 'failed' };
  }

  // Sync to GitHub Secrets
  const gitHubSecretName = credential.secret_env;
  const gitHubSuccess = await updateGitHubSecret(gitHubSecretName, newKey);

  // Sync to Netlify (if scope includes netlify-env)
  let netlifySuccess = true;
  if (credential.secret_scope?.includes('netlify-env')) {
    netlifySuccess = await updateNetlifyEnvVar(gitHubSecretName, newKey);
  }

  // Record successful rotation in audit log
  if (gitHubSuccess && netlifySuccess) {
    await supabase
      .from('credential_audit_log')
      .insert({
        action: 'rotated',
        actor: 'phase-3-automation',
        credential_id: credential.id,
        timestamp: new Date().toISOString(),
        details: {
          service: credential.service_name,
          github_synced: gitHubSuccess,
          netlify_synced: netlifySuccess,
        },
      });

    console.log(`   ✅ Rotation complete: ${credential.service_name}`);
    return { service: credential.service_name, status: 'rotated' };
  }

  return { service: credential.service_name, status: 'partial' };
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT OUTPUT
// ═══════════════════════════════════════════════════════════════════════════

import fs from 'fs';

function writeReport(results) {
  const rotated = results.filter(r => r.status === 'rotated').length;
  const manual = results.filter(r => r.status === 'manual_required').length;
  const failed = results.filter(r => r.status === 'failed').length;

  let report = `# Key Rotation Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- ✅ Rotated: ${rotated}\n`;
  report += `- ⚠️  Manual required: ${manual}\n`;
  report += `- ❌ Failed: ${failed}\n\n`;

  if (results.length === 0) {
    report += `No rotations needed this week.\n`;
  } else {
    report += `## Results\n\n`;
    results.forEach(r => {
      if (r.status === 'rotated') {
        report += `- ✅ ${r.service}: Rotated automatically\n`;
      } else if (r.status === 'manual_required') {
        report += `- ⚠️  ${r.service}: Manual rotation required at [${r.rotationUrl}](${r.rotationUrl})\n`;
      } else if (r.status === 'failed') {
        report += `- ❌ ${r.service}: Rotation failed\n`;
      } else {
        report += `- ◐ ${r.service}: Partial rotation (check details)\n`;
      }
    });
  }

  // Ensure reports directory exists
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }

  fs.writeFileSync('reports/key-rotation.md', report);
  console.log('📝 Report written to reports/key-rotation.md');
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🚀 Phase 3: Key Rotation Automation starting...\n');

  const credentialsToRotate = await getCredentialsNeedingRotation();

  if (credentialsToRotate.length === 0) {
    console.log('✅ Phase 3 complete — no rotations needed');
    writeReport([]);
    return;
  }

  const results = [];
  for (const credential of credentialsToRotate) {
    const result = await processRotation(credential);
    results.push(result);
  }

  // Summary
  console.log('\n📊 Rotation Summary:');
  const rotated = results.filter(r => r.status === 'rotated').length;
  const manual = results.filter(r => r.status === 'manual_required').length;
  const failed = results.filter(r => r.status === 'failed').length;

  console.log(`   ✅ Rotated: ${rotated}`);
  console.log(`   ⚠️  Manual required: ${manual}`);
  console.log(`   ❌ Failed: ${failed}\n`);

  if (manual > 0) {
    console.log('📝 Manual rotation required for:');
    results
      .filter(r => r.status === 'manual_required')
      .forEach(r => {
        console.log(`   • ${r.service}: ${r.rotationUrl}`);
      });
  }

  writeReport(results);
  console.log('✅ Phase 3 complete');
}

await main();
