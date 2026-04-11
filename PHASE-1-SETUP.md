# PHASE 1: CREDENTIALS VAULT SETUP

**Status:** Ready to deploy  
**Time estimate:** 15 minutes  
**Blocker resolved:** No (Anthropic API 404 — separate from this)

---

## What This Does

Creates a single source of truth for all 15 API keys in Supabase. No more scattered secrets. No more manual tracking. Foundation for automated key rotation and unified spend tracking.

## Step 1: Create Schema in Supabase

1. Go to: https://supabase.com/dashboard/project/mftseqddebdecaoovqgw (cw-logging)
2. Click **SQL Editor** (left sidebar)
3. Click **+ New Query**
4. Copy the entire content of: `scripts/ops/01-credentials-schema.sql`
5. Paste into the query editor
6. Click **Run** (blue button, top right)
7. Should see: "credentials table created", "credential_audit_log table created", "spend_tracking table created", "RLS policies applied"

**What got created:**
- `credentials` table — encrypted storage for all 15 API keys
- `credential_audit_log` table — immutable audit trail of rotations/access
- `spend_tracking` table — consolidates billing data from all services
- `spend_budget` table — monthly limits and alerts
- RLS policies — locked to service role only (GitHub Actions)

## Step 2: Seed Credentials from Environment

Run locally or in GitHub Actions:

```bash
node scripts/ops/02-seed-credentials.mjs
```

**Requirements:**
- All 15 API keys in `.env` or GitHub Secrets
- `SUPABASE_SERVICE_ROLE_KEY` in `.env` (temporary for seeding)

**What it does:**
- Reads all 15 API keys from environment
- Inserts into `credentials` table with metadata (rotation schedule, scope, tags)
- Logs to audit trail
- Verifies total count

**Output:**
```
🌱 Seeding credentials vault...

✅ SEEDED: anthropic           [API_KEY  ] rotation: weekly
✅ SEEDED: stripe             [API_KEY  ] rotation: quarterly
✅ SEEDED: gemini             [API_KEY  ] rotation: none
...
📊 Seeding complete: 15 seeded, 0 skipped
📊 Total credentials in vault: 15
```

## Step 3: Get SUPABASE_SERVICE_ROLE_KEY

This is the key that GitHub Actions uses to access the vault. It's in GitHub Secrets already, but you need it in `.env` for the seed script.

**Option A (Easiest):**
1. Go to Supabase dashboard: https://supabase.com/dashboard/project/mftseqddebdecaoovqgw
2. Click **Settings** (bottom left)
3. Click **API** (left sidebar, under Settings)
4. Copy the **Service Role Secret** (under "service_role")
5. Add to `.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

**Option B (If you prefer not to put service role key in .env):**
- Paste the seed script output into Supabase SQL editor manually
- I can generate the INSERT statements if needed

## Step 4: Verify Setup

Run in Supabase SQL Editor:

```sql
SELECT service_name, credential_type, rotation_schedule, is_active, tags
FROM credentials
ORDER BY service_name;
```

Should show all 15 services with their metadata.

---

## After Phase 1

**Phase 2 (next):** Spend aggregation job — query all 15 APIs daily, consolidate into kitchen-data.json

**Phase 3 (after that):** Key rotation automation — Monday mornings, keys rotate themselves

**Phase 4:** Alerts — GitHub Issues for expiry/compromise

---

## Troubleshooting

**"credentials table already exists"**
- Already seeded from previous run. You can either:
  - Delete and re-create (SQL: `DROP TABLE credentials CASCADE;` then run schema again)
  - Skip seeding and update specific keys manually

**"SUPABASE_SERVICE_ROLE_KEY not found"**
- Add it to `.env` (see Step 3)
- Or run seed script with: `SUPABASE_SERVICE_ROLE_KEY=... node scripts/ops/02-seed-credentials.mjs`

**Some keys say "SKIPPED: ... not found"**
- That API key is not in `.env` or GitHub Secrets
- Add it and re-run the seed script
- Or add manually to Supabase SQL: 
  ```sql
  INSERT INTO credentials (service_name, credential_type, secret_value, rotation_schedule, tags)
  VALUES ('gemini', 'API_KEY', 'your-key-here', NULL, ARRAY['overnight-agents', 'spend-tracking']);
  ```

---

## Files Created

- `scripts/ops/01-credentials-schema.sql` — SQL schema (run in Supabase dashboard)
- `scripts/ops/02-seed-credentials.mjs` — Node script to populate from environment
- `PHASE-1-SETUP.md` — This file

## Timeline

- **Now:** Run SQL schema in Supabase
- **Immediately after:** Run seed script
- **Tomorrow:** Phase 2 (spend aggregation)
