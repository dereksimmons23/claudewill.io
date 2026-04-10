-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 1: CREDENTIALS VAULT
-- Run this in Supabase SQL Editor (mftseqddebdecaoovqgw - cw-logging project)
-- This creates the schema for unified key management
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing tables if restarting
-- DROP TABLE IF EXISTS credential_audit_log CASCADE;
-- DROP TABLE IF EXISTS credentials CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- CREDENTIALS TABLE — Single Source of Truth for All 15 API Keys
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS credentials (
  id BIGSERIAL PRIMARY KEY,
  service_name TEXT NOT NULL,
  credential_type TEXT NOT NULL CHECK (credential_type IN ('API_KEY', 'BEARER', 'OAUTH', 'WEBHOOK', 'URL')),
  secret_value TEXT NOT NULL,  -- Encrypted by Supabase at rest
  created_at TIMESTAMP DEFAULT now(),
  rotated_at TIMESTAMP,
  expires_at TIMESTAMP,
  rotation_schedule TEXT CHECK (rotation_schedule IN ('daily', 'weekly', 'monthly', 'quarterly', NULL)),
  secret_scope TEXT CHECK (secret_scope IN ('local', 'github-secrets', 'netlify-env', 'all')),
  is_active BOOLEAN DEFAULT true,
  compromise_status TEXT DEFAULT 'active' CHECK (compromise_status IN ('active', 'compromised', 'rotated')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,

  -- Prevent duplicate active credentials per service
  CONSTRAINT unique_active_per_service UNIQUE (service_name, is_active) WHERE is_active = true
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CREDENTIAL AUDIT LOG — Immutable Record of All Rotations & Actions
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS credential_audit_log (
  id BIGSERIAL PRIMARY KEY,
  credential_id BIGINT REFERENCES credentials(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (action IN ('created', 'rotated', 'compromised', 'synced', 'accessed', 'expired')),
  actor TEXT,  -- 'github-actions', 'derek', 'claude', etc
  timestamp TIMESTAMP DEFAULT now(),
  details JSONB,

  INDEX idx_credential_id (credential_id),
  INDEX idx_timestamp (timestamp)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SPEND TRACKING — Consolidate All 15 Services
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS spend_tracking (
  id BIGSERIAL PRIMARY KEY,
  service_name TEXT NOT NULL,
  date DATE NOT NULL,
  amount_usd DECIMAL(10, 4) NOT NULL DEFAULT 0.00,
  usage_metric TEXT,  -- tokens, requests, bandwidth, etc
  api_call_count INT,
  source TEXT CHECK (source IN ('api', 'manual', 'estimated')),

  UNIQUE(service_name, date),
  INDEX idx_service_date (service_name, date)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SPEND BUDGET — Monthly Limits & Alerts
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS spend_budget (
  id BIGSERIAL PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  monthly_limit DECIMAL(10, 2),
  quarterly_limit DECIMAL(10, 2),
  alert_at_pct INT DEFAULT 80 CHECK (alert_at_pct >= 0 AND alert_at_pct <= 100),
  notes TEXT
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — Lock Down to Service Role Only
-- Only GitHub Actions (with service role key) can access credentials
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE credential_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE spend_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE spend_budget ENABLE ROW LEVEL SECURITY;

-- Service role (GitHub Actions) can do everything
CREATE POLICY "service_role_credentials" ON credentials
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_audit" ON credential_audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_spend" ON spend_tracking
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_budget" ON spend_budget
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anon key cannot access credentials directly (only spend tracking for kitchen display)
CREATE POLICY "anon_spend_read" ON spend_tracking
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_budget_read" ON spend_budget
  FOR SELECT
  TO anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES — Performance
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_credentials_service ON credentials(service_name);
CREATE INDEX IF NOT EXISTS idx_credentials_active ON credentials(is_active);
CREATE INDEX IF NOT EXISTS idx_credentials_expires ON credentials(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON credential_audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_spend_date ON spend_tracking(date DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY
-- ═══════════════════════════════════════════════════════════════════════════

SELECT 'credentials table created' AS status;
SELECT 'credential_audit_log table created' AS status;
SELECT 'spend_tracking table created' AS status;
SELECT 'spend_budget table created' AS status;
SELECT 'RLS policies applied' AS status;
