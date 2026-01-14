# CW Analytics Queries

Simple SQL queries to analyze CW conversations in Supabase.

## Quick Stats

### Total Conversations
```sql
SELECT COUNT(*) as total_messages
FROM conversations;
```

### Unique Sessions
```sql
SELECT COUNT(DISTINCT session_id) as unique_sessions
FROM conversations;
```

### Today's Activity
```sql
SELECT COUNT(*) as messages_today
FROM conversations
WHERE timestamp >= CURRENT_DATE;
```

## Conversation Analysis

### Average Conversation Length (messages per session)
```sql
SELECT
  ROUND(AVG(message_count), 2) as avg_messages_per_session,
  MIN(message_count) as shortest_session,
  MAX(message_count) as longest_session
FROM (
  SELECT
    session_id,
    COUNT(*) as message_count
  FROM conversations
  GROUP BY session_id
) session_stats;
```

### Most Active Hours
```sql
SELECT
  EXTRACT(HOUR FROM timestamp) as hour,
  COUNT(*) as message_count
FROM conversations
GROUP BY hour
ORDER BY message_count DESC;
```

### Daily Activity (last 7 days)
```sql
SELECT
  DATE(timestamp) as date,
  COUNT(*) as messages,
  COUNT(DISTINCT session_id) as unique_sessions
FROM conversations
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

## Content Analysis

### Common Questions (first user message in sessions)
```sql
WITH first_messages AS (
  SELECT DISTINCT ON (session_id)
    session_id,
    user_message
  FROM conversations
  ORDER BY session_id, timestamp
)
SELECT
  user_message,
  COUNT(*) as times_asked
FROM first_messages
GROUP BY user_message
ORDER BY times_asked DESC
LIMIT 20;
```

### Keyword Search in User Messages
Replace 'decision' with any keyword you want to track:

```sql
SELECT
  timestamp,
  session_id,
  user_message,
  cw_response
FROM conversations
WHERE user_message ILIKE '%decision%'
ORDER BY timestamp DESC
LIMIT 50;
```

### Conversations About Family
```sql
SELECT
  timestamp,
  session_id,
  user_message,
  cw_response
FROM conversations
WHERE
  user_message ILIKE '%family%' OR
  user_message ILIKE '%grandfather%' OR
  user_message ILIKE '%vernie%' OR
  user_message ILIKE '%claude william%'
ORDER BY timestamp DESC;
```

### CW Saying "We're Done Here" (conversation terminations)
```sql
SELECT
  timestamp,
  session_id,
  user_message,
  cw_response
FROM conversations
WHERE cw_response ILIKE '%we''re done here%'
ORDER BY timestamp DESC;
```

## Token Usage Analysis

### Average Tokens Per Response
```sql
SELECT
  ROUND(AVG((token_usage->>'input')::int), 0) as avg_input_tokens,
  ROUND(AVG((token_usage->>'output')::int), 0) as avg_output_tokens,
  ROUND(AVG((token_usage->>'input')::int + (token_usage->>'output')::int), 0) as avg_total_tokens
FROM conversations
WHERE token_usage IS NOT NULL;
```

### Estimated Cost (Haiku 3.5 pricing: $0.25/1M input, $1.25/1M output)
```sql
SELECT
  COUNT(*) as total_conversations,
  SUM((token_usage->>'input')::int) as total_input_tokens,
  SUM((token_usage->>'output')::int) as total_output_tokens,
  ROUND(
    (SUM((token_usage->>'input')::int) * 0.25 / 1000000.0) +
    (SUM((token_usage->>'output')::int) * 1.25 / 1000000.0),
    4
  ) as estimated_cost_usd
FROM conversations
WHERE token_usage IS NOT NULL;
```

## Session Deep-Dive

### View Full Conversation for a Specific Session
Replace 'SESSION_ID_HERE' with actual session ID:

```sql
SELECT
  timestamp,
  user_message,
  cw_response,
  condition
FROM conversations
WHERE session_id = 'SESSION_ID_HERE'
ORDER BY timestamp ASC;
```

### Longest Conversations (by message count)
```sql
SELECT
  session_id,
  COUNT(*) as message_count,
  MIN(timestamp) as started_at,
  MAX(timestamp) as last_message_at,
  EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp)))/60 as duration_minutes
FROM conversations
GROUP BY session_id
ORDER BY message_count DESC
LIMIT 10;
```

## Condition Analysis

### Messages by Condition (storm, clear, dawn, dusk, night)
```sql
SELECT
  condition,
  COUNT(*) as message_count
FROM conversations
GROUP BY condition
ORDER BY message_count DESC;
```

## Exporting Data

### Export All Conversations (for analysis in Excel/Google Sheets)
```sql
SELECT
  timestamp,
  session_id,
  user_message,
  cw_response,
  condition,
  (token_usage->>'input')::int as input_tokens,
  (token_usage->>'output')::int as output_tokens
FROM conversations
ORDER BY timestamp DESC;
```

Then click "Download as CSV" in Supabase SQL Editor.

---

## How to Run These Queries

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste any query from above
5. Click **Run** (or press Cmd/Ctrl + Enter)

## Creating a Simple Dashboard

For quick daily checks, save these queries as "Saved Queries" in Supabase:

1. **Daily Summary**: Total messages, unique sessions, avg tokens
2. **Common Questions**: First messages ranked by frequency
3. **Cost Tracking**: Running token usage and estimated cost

---

**Pro Tip**: Set up a weekly reminder to review these metrics and look for:
- Questions CW struggles with (repeated similar questions)
- Topics that lead to "We're done here" (may need better handling)
- Token usage trends (watch for unexpectedly long responses)
