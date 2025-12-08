# MVP Deployment Checklist

## What's Been Completed ✅

### 1. Disclaimer Update
- Added transparency: "Conversations may be reviewed to improve CW"
- Complies with data collection best practices

### 2. Hallucination Safeguards
- Strengthened system prompt with explicit boundaries
- Added "NEVER invent family details" language
- Clear instruction to redirect when asked for unknown information

### 3. Conversation Logging Infrastructure
- Supabase integration with graceful degradation
- Session tracking for multi-turn conversations
- Privacy-conscious: IP hashing, minimal data collection
- Non-blocking: logging failures don't break conversations

### 4. Analytics Foundation
- Comprehensive SQL query guide (ANALYTICS_QUERIES.md)
- Track: conversations, sessions, common questions, token usage, costs
- Ready to use as soon as logging is configured

## Deployment Steps

### Step 1: Merge to Main (if ready)
```bash
# From main branch
git checkout main
git merge claude/repo-review-011CUKMG5Vtm1fUc597EsXwH
git push origin main
```

**OR** deploy the claude branch directly to test first:
```bash
# In Netlify dashboard
# Go to Deploys → Deploy settings → Deploy contexts
# Add branch: claude/repo-review-011CUKMG5Vtm1fUc597EsXwH
```

### Step 2: Set Up Supabase Logging (15 minutes)

Follow **SUPABASE_SETUP.md** step by step:

1. ✅ Create free Supabase project
2. ✅ Run SQL to create conversations table
3. ✅ Copy Project URL and anon key
4. ✅ Add environment variables to Netlify:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. ✅ Trigger Netlify redeploy (to pick up new env vars)

**NOTE**: Site will work fine WITHOUT Supabase configured. Logging will silently fail and conversations will continue normally.

### Step 3: Verify Deployment

1. Visit claudewill.io
2. Open browser DevTools → Network tab
3. Have a conversation with CW
4. Check:
   - ✅ Conversations work normally
   - ✅ New disclaimer appears in footer
   - ✅ CW doesn't make up family details (test by asking about siblings)

If Supabase is configured:
5. Go to Supabase → Table Editor → conversations
6. Verify your test conversation was logged

### Step 4: Test Analytics

Once you have some conversations logged:

1. Go to Supabase → SQL Editor
2. Try queries from **ANALYTICS_QUERIES.md**:
   - Total conversations count
   - Common questions
   - Token usage and cost

Save your favorite queries for quick daily checks.

## What's Left to Do

### Testing Tasks (You)

**Voice Testing (#3)**
- Have 5-10 conversations with CW
- Test edge cases:
  - Asking about unknown family members
  - Being rude (should get "We're done here")
  - Complex decision-making scenarios
- Adjust system prompt if needed

**Mobile Testing (#5)**
- Test on iPhone/Android
- Check:
  - Prompt chips display correctly
  - Input field resizes properly
  - Chat scrolling works
  - Footer disclaimer readable

### Evaluation Tasks

**Sonnet Upgrade (#6)**
- After testing Haiku quality, decide if upgrade needed
- Cost difference: Haiku ~$0.001/conversation, Sonnet ~$0.015/conversation
- Only upgrade if Haiku quality is insufficient
- To upgrade: Change `claude-3-5-haiku-latest` to `claude-3-5-sonnet-latest` in netlify/functions/cw.js

### Launch Tasks

**Soft Launch (#9)**
- Share with 5-10 trusted people
- Ask for honest feedback on:
  - CW's voice/personality
  - Helpfulness
  - Any bugs or issues
  - Mobile experience

**LinkedIn Post (#10)**
- Lead with heritage story (Claude William Simmons 1903-1967)
- Frame as "living lab" experiment
- Mention The CW Standard principles
- Light on tech details, heavy on purpose
- CTA: Try it at claudewill.io

## Quick Troubleshooting

**Logging not working?**
- Check Netlify env vars are set correctly
- Verify you triggered a new deploy after adding vars
- Check Netlify function logs for "Logging failed:" errors
- Confirm Supabase table has RLS policies enabled

**Hallucinations still happening?**
- Check exact prompt used
- Review system prompt in netlify/functions/cw.js
- May need to add specific facts OR stronger redirect
- Consider upgrading to Sonnet for better instruction following

**Rate limiting too aggressive?**
- Current: 20 requests per minute per IP
- Adjust in netlify/functions/cw.js: `maxRequests` and `windowMs`
- For soft launch, 20/min should be fine

## Success Metrics (Track in Supabase)

**Week 1 Goals:**
- 10+ unique sessions
- 50+ total messages
- 0 hallucinated family details reported
- Average 3+ messages per session
- Cost under $0.50

**Week 2 Goals:**
- Soft launch feedback collected
- Mobile testing complete
- Decision on Haiku vs Sonnet
- LinkedIn post published
- 50+ unique sessions

## Cost Monitoring

Run this query daily to track costs:

```sql
SELECT
  COUNT(*) as total_conversations,
  ROUND(
    (SUM((token_usage->>'input')::int) * 0.80 / 1000000.0) +
    (SUM((token_usage->>'output')::int) * 4.00 / 1000000.0),
    4
  ) as estimated_cost_usd
FROM conversations
WHERE token_usage IS NOT NULL;
```

At current usage estimates (~100 conversations/day), monthly cost: **~$3-5**

## Next Session Priorities

1. Complete Supabase setup (15 min)
2. Test voice and mobile (30 min)
3. Soft launch to 5-10 people (1 hour)
4. Draft LinkedIn post (1 hour)

**Total time to MLP: ~3 hours remaining** (you already have ~1.5 hours invested in logging/analytics infrastructure)

---

**Questions?** Everything is documented in:
- SUPABASE_SETUP.md - Logging configuration
- ANALYTICS_QUERIES.md - Data analysis queries
- This file - Deployment and next steps
