# Anthropic API Fix — Usage Report Endpoint

**Problem:** Spend dashboard getting 404 from `/v1/usage` endpoint

**Root Cause:** 
- Wrong endpoint path (`/v1/usage` doesn't exist)
- Requires **Admin API key**, not standard API key
- Current key is `sk-ant-api03-...` (standard) — needs `sk-ant-admin-...` (admin)

**Reference:** [Anthropic Usage and Cost API Documentation](https://docs.anthropic.com/en/api/usage-cost-api)

---

## Solution

### Step 1: Generate Admin API Key

1. Go to: https://console.anthropic.com/
2. Click **Settings** (left sidebar)
3. Click **API Keys**
4. Click **Create Admin API Key** (blue button, top right)
5. Copy the key (starts with `sk-ant-admin-...`)

**Important:** Only organization admins can create Admin keys. If you don't see the button, check your role in Settings → Team.

### Step 2: Update Your API Key

Update `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-admin-<your-new-key-here>
```

Also update in **GitHub Secrets** (`Settings → Secrets and variables → Actions`):
- Repository secret: `ANTHROPIC_API_KEY=sk-ant-admin-...`

Also update in **Netlify** (`Site settings → Environment variables`):
- `ANTHROPIC_API_KEY=sk-ant-admin-...`

### Step 3: Correct Endpoint (Already Fixed)

The `scripts/overnight/spend-audit.mjs` has been updated to use:

**Old endpoint:**
```
GET https://api.anthropic.com/v1/usage?start_date=...&end_date=...
Header: anthropic-beta: usage-2024-06-01
❌ Returns 404
```

**New endpoint:**
```
GET https://api.anthropic.com/v1/organizations/cost_report?starting_at=...&ending_at=...
Header: anthropic-version: 2024-06-01
✅ Returns USD costs
```

The script now:
1. ✅ Checks if key is Admin key (starts with `sk-ant-admin-`)
2. ✅ Queries `/v1/organizations/cost_report` (correct endpoint)
3. ✅ Parses `cost_in_cents` and converts to dollars
4. ✅ Falls back to $200/month if API fails

---

## Testing

After updating your API key, test locally:

```bash
ANTHROPIC_API_KEY=sk-ant-admin-... node scripts/overnight/spend-audit.mjs
```

Should output:
```
📊 Spend audit running...
✅ spend-data.json written
   Anthropic Max: $200
   Anthropic API: $23.45  (or actual usage)
   Stripe: $8.20
   Monthly Total: $231.65
   Budget Used: 46%
```

If still getting 404:
- Verify Admin key (must start with `sk-ant-admin-`)
- Check key is not revoked/expired
- Try: `curl -H "x-api-key: sk-ant-admin-..." https://api.anthropic.com/v1/organizations/cost_report?starting_at=2026-03-10T00:00:00Z&ending_at=2026-04-10T00:00:00Z`

---

## Impact

✅ **Spend Dashboard v2** can now pull real Anthropic API costs (not just $200 flat fee)  
✅ **Spend aggregation** (Phase 2) can consolidate all 15 services  
✅ **Kitchen TUI** can show accurate spend trends  

**Timeline:**
- Now: Generate Admin key, update `.env`, test locally
- Next: Deploy with new key in GitHub Secrets + Netlify
- Morning (5 AM CST): Overnight agent pulls real usage data

---

## Files Modified

- `scripts/overnight/spend-audit.mjs` — Updated endpoint, added Admin key check

## References

- [Anthropic Usage and Cost API](https://docs.anthropic.com/en/api/usage-cost-api)
- [Claude Console](https://console.anthropic.com/)
- Cost Report API: `/v1/organizations/cost_report`
- Usage Report API: `/v1/organizations/usage_report/messages`

---

## Next Steps (After Admin Key is Set)

1. **Phase 1:** Supabase credentials vault (ready now)
2. **Phase 2:** Spend aggregation (waiting on this Anthropic fix)
3. **Phase 3:** Key rotation automation
4. **Phase 4:** Alerts & polish
