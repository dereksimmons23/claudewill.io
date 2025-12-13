# Supabase Conversation Logging Setup

This guide will help you set up conversation logging for CW using Supabase (free tier).

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `cw-logging` (or whatever you prefer)
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait ~2 minutes for setup

## 2. Create Conversations Table

1. In your Supabase project, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Paste the following SQL:

```sql
-- Create conversations table
CREATE TABLE conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp timestamptz NOT NULL DEFAULT now(),
  user_message text NOT NULL,
  cw_response text NOT NULL,
  condition text,
  session_id text,
  ip_hash text,
  token_usage jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add index for querying by session
CREATE INDEX idx_conversations_session ON conversations(session_id);

-- Add index for querying by timestamp
CREATE INDEX idx_conversations_timestamp ON conversations(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- With Netlify Functions, use the SUPABASE **service_role** key server-side.
-- The service role bypasses RLS, so you do NOT need public SELECT/INSERT policies here.
-- Keeping RLS enabled with no public policies prevents the anon key from reading conversation logs.
```

4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned"

## 3. Get Your Supabase Credentials

1. In Supabase, click "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **service_role** key (under "Project API keys")

**Important:** The **service_role** key is a **secret**. Never put it in browser JavaScript and never commit it to git. It should only live in Netlify environment variables.

## 4. Add Environment Variables to Netlify

1. Go to your Netlify dashboard
2. Select your `claudewill.io` site
3. Go to **Site settings** → **Environment variables**
4. Click "Add a variable" and add these two:

   **Variable 1:**
   - **Key**: `SUPABASE_URL`
   - **Value**: Your Project URL from step 3
   - **Scopes**: All scopes (build-time and runtime)

   **Variable 2:**
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Your service_role key from step 3
   - **Scopes**: All scopes (build-time and runtime)

5. Click "Save"

## 5. Redeploy Your Site

After adding the environment variables:

1. Go to **Deploys** in Netlify
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for deployment to complete (~1-2 minutes)

## 6. Verify Logging is Working

1. Visit `claudewill.io`
2. Have a conversation with CW
3. In Supabase, go to **Table Editor** → **conversations**
4. You should see your conversation logged!

## Viewing Conversations

To review conversations for improving CW:

1. Go to Supabase **Table Editor** → **conversations**
2. You can:
   - View all conversations
   - Filter by session_id to see multi-turn conversations
   - Search user messages or CW responses
   - Export to CSV for analysis

## Cost

- Supabase free tier includes:
  - 500MB database
  - Unlimited API requests
  - 50,000 monthly active users

For CW's usage (small-scale conversations), you'll stay well within the free tier.

## Privacy Notes

- IP addresses are hashed (not stored in plain text)
- Session IDs are randomly generated client-side (no user identification)
- Conversations contain only the messages exchanged
- No personally identifiable information is logged unless the user includes it in their messages

---

**Questions?** Check the [Supabase docs](https://supabase.com/docs) or contact Derek.
