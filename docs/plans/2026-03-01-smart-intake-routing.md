# Smart Intake Routing Architecture

**Date:** March 1, 2026
**Status:** Plan
**Depends on:** Twilio account ($1/month phone number), Resend verified domain (or keep test mode)

---

## Problem

Every form submission gets the same treatment: Supabase row + email to Derek's Gmail. A serious inquiry from a VP at a media company and a one-word "hi" from a bot get the same notification. Derek checks email, opens it, decides if it's real, responds manually. At scale (or even at 3 submissions/week), this wastes time on noise and risks burying signal.

## Solution

Haiku scores every submission on arrival. Score determines routing: text + email for hot leads, email only for warm, auto-response only for cold/spam.

---

## Architecture

```
Form submit (POST /.netlify/functions/intake)
│
├── 1. Validate fields (name, email, message)
├── 2. Store raw submission in Supabase (intake_submissions)
├── 3. Call Haiku with scoring prompt
│     └── Returns: { score: 1-5, tier: "hot"|"warm"|"cold", reason: "..." }
├── 4. Update Supabase row with score + tier
├── 5. Route based on tier:
│     ├── HOT (4-5): Text Derek (Twilio) + Email (Resend) + auto-reply to submitter
│     ├── WARM (2-3): Email Derek (Resend) + auto-reply to submitter
│     └── COLD (1): Auto-reply only. No notification to Derek.
└── 6. Redirect to thank-you state
```

---

## Scoring Rubric (Haiku Prompt)

```
You are a lead scoring assistant for CW Strategies, a digital strategy and AI consulting practice run by Derek Simmons.

Score this form submission from 1-5:

Name: {{name}}
Email: {{email}}
Message: {{message}}

SCORING CRITERIA:

5 - IMMEDIATE: Named a specific business problem. Professional email domain. Clear scope or budget signal. Decision-maker language ("my team," "our organization," "we need").
4 - STRONG: Real business problem described. Professional email domain. Could become a client with one conversation.
3 - INTERESTED: Genuine question but vague. Could be a real lead or just curious. Personal email is fine if the message has substance.
2 - THIN: One-line message, no specifics. Could be real but not worth interrupting Derek's day.
1 - NOISE: Empty, gibberish, obvious bot, or test submission. "hi," "test," single emoji, nonsense strings.

ADDITIONAL SIGNALS:
- Media/publishing/journalism industry terms → +1 (Derek's core domain)
- AI/strategy/consulting terms → +1
- @gmail.com, @yahoo.com alone doesn't lower score — substance matters
- Profanity or hostile language → score 1

Return JSON only:
{"score": N, "tier": "hot|warm|cold", "reason": "one sentence"}
```

**Tier mapping:**
- Score 4-5 → `hot`
- Score 2-3 → `warm`
- Score 1 → `cold`

---

## Twilio Integration

**What:** One phone number ($1/month) sends SMS to Derek's cell when a hot lead arrives.

**Setup:**
1. Create Twilio account at twilio.com
2. Buy a local phone number (~$1.15/month)
3. Add env vars to Netlify: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `DEREK_PHONE_NUMBER`

**Message format:**
```
🔥 CW Lead (5/5): Jane Smith, VP Digital @ Tribune Publishing
"We need help integrating AI into our newsroom workflow. Budget approved for Q2."
→ jane.smith@tribunepub.com
```

**Code (in intake.js):**
```javascript
async function sendTextAlert(submission, score) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.DEREK_PHONE_NUMBER;

  if (!sid || !token || !from || !to) return;

  const message = [
    `CW Lead (${score.score}/5): ${submission.name}`,
    submission.trying_to_build
      ? `"${submission.trying_to_build.substring(0, 140)}"`
      : '(no message)',
    `→ ${submission.email}`,
  ].join('\n');

  const params = new URLSearchParams();
  params.append('To', to);
  params.append('From', from);
  params.append('Body', message);

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${sid}:${token}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  );
}
```

---

## Email Routing (Updated)

**Hot leads:** Full submission + Haiku's assessment + "Reply now — this one's real."
**Warm leads:** Full submission + Haiku's assessment. No urgency language.
**Cold leads:** No email to Derek. Submission still in Supabase if he wants to audit.

**Auto-reply to submitter (all tiers):**
```
Subject: Got it — Derek Simmons, CW Strategies

{{name}},

Received. I'll follow up within 48 hours if there's a fit.
If not, I'll tell you that too.

Derek
derek@claudewill.io
claudewill.io
```

Requires Resend verified domain (claudewill.io) to send from derek@claudewill.io. Current setup uses resend.dev test domain which only sends to the account email. Verified domain unlocks sending to submitters.

---

## Supabase Schema Update

Add columns to `intake_submissions`:

```sql
ALTER TABLE intake_submissions
ADD COLUMN IF NOT EXISTS ai_score integer,
ADD COLUMN IF NOT EXISTS ai_tier text,
ADD COLUMN IF NOT EXISTS ai_reason text,
ADD COLUMN IF NOT EXISTS notified_via text[];
```

`notified_via` tracks what fired: `['email', 'text']`, `['email']`, or `['auto-reply']`.

---

## Updated intake.js Flow

```javascript
exports.handler = async (event) => {
  // 1. Validate + parse (existing)
  // 2. Insert raw submission to Supabase (existing)
  // 3. Score with Haiku (NEW)
  const score = await scoreSubmission(submission);
  // 4. Update row with score (NEW)
  await updateScore(submissionId, score);
  // 5. Route (NEW)
  const notified = [];
  if (score.tier === 'hot') {
    await sendTextAlert(submission, score);
    notified.push('text');
  }
  if (score.tier === 'hot' || score.tier === 'warm') {
    await sendEmailNotification(submission, score);
    notified.push('email');
  }
  await sendAutoReply(submission);
  notified.push('auto-reply');
  // 6. Update notified_via
  await updateNotified(submissionId, notified);
  // 7. Redirect
};
```

---

## Cost

| Item | Cost | Notes |
|------|------|-------|
| Twilio number | $1.15/month | One local number |
| Twilio SMS | $0.0079/message | Pennies per lead |
| Haiku scoring | ~$0.001/submission | ~200 input tokens, ~50 output tokens |
| Resend | Free tier | 100 emails/day, plenty |
| **Total** | ~$1.50/month | Plus whatever submissions come in |

---

## Env Vars Needed (Netlify)

```
ANTHROPIC_API_KEY          # Already exists
SUPABASE_URL               # Already exists
SUPABASE_ANON_KEY          # Already exists
RESEND_API_KEY             # Already exists
TWILIO_ACCOUNT_SID         # New
TWILIO_AUTH_TOKEN           # New
TWILIO_FROM_NUMBER          # New (purchased number)
DEREK_PHONE_NUMBER          # New (Derek's cell)
```

---

## Implementation Order

1. Add Supabase columns (SQL migration)
2. Write `scoreSubmission()` function (Haiku call)
3. Write `sendTextAlert()` function (Twilio)
4. Write `sendAutoReply()` function (Resend)
5. Update `sendEmailNotification()` to include score context
6. Wire it all together in `exports.handler`
7. Test with 3 submissions: one hot, one warm, one cold
8. Set up Twilio account + buy number
9. Verify claudewill.io domain on Resend (for auto-replies)
10. Deploy

---

## Derek-Only Setup Steps

- [ ] Create Twilio account (twilio.com)
- [ ] Buy a phone number (~$1.15/month)
- [ ] Add 4 Twilio env vars to Netlify
- [ ] Verify claudewill.io domain on Resend (for sending from derek@claudewill.io)
- [ ] Test by submitting the form yourself
