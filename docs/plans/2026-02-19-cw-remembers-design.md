# CW Remembers + Porch Everywhere

**Date:** February 19, 2026
**Status:** Approved design, not yet implemented
**Origin:** CW's own feedback — three things that would make the porch work better

---

## The Problem

CW identified three gaps:

1. **No memory between visits.** Every visitor is a stranger every time. If someone comes back, CW starts fresh unless they remind him.
2. **No pattern detection.** CW can't see when someone keeps coming back with the same problem. He can feel it in the moment but can't see it across visits.
3. **Stale context about Derek.** CW points people toward Derek based on information that may be months old. No dynamic awareness of Derek's current availability or focus.

Plus one architectural decision from Derek:

4. **Park Mirae, put the porch on every page.** One voice everywhere. CW replaces the Mirae navigation widget. Same floating chat UI, CW's voice, page-aware.

---

## Design

### 1. Porch Everywhere (replaces Mirae)

**What changes:**
- `mirae-widget.js` → `porch-widget.js` — same floating chat widget, CW talking instead of Mirae
- Widget calls `/.netlify/functions/cw` (not a separate Mirae endpoint) with a `page` parameter
- cw.js: when `page` is present, appends page context to system prompt ("The visitor is currently on /story")
- Toggle button: the `M` becomes the `*` asterisk (CW's brand device)
- Header: `MIRAE` → `cw's porch`
- On homepage: widget hides (CW is already the main interface)
- Scripted responses (navigation shortcuts) stay — rewritten in CW's voice, save API calls
- `mirae-widget.css` → `porch-widget.css` — rebranded colors/styles

**What gets removed:**
- `netlify/functions/mirae.js` — separate Mirae API endpoint
- `netlify/functions/mirae-ea.js` — Mirae executive assistant
- `scripts/mirae-cli.js` — Mirae CLI tool
- `ea.html` — Mirae EA page
- `js/mirae-widget.js` — replaced by porch-widget.js
- `css/mirae-widget.css` — replaced by porch-widget.css
- All `mirae` references across HTML files (widget CSS/JS includes)
- `mirae` script in package.json
- Mirae references in site-registry.json, studio.html product card

**Page-aware context** (folded into CW's prompt when widget is used):
```
The visitor is currently on /story. They may have questions about CW,
the family, or the narrative. You can reference what's on this page.
```

### 2. Visitor Identity

**Two layers:**

**Layer 1 — Anonymous token (automatic)**
- First visit: generate UUID, store in `localStorage` as `cw-visitor-token`
- Every message: send token in `x-visitor-token` header
- Server looks up past visit summaries by token
- Different device = new identity. Clearing storage = fresh start.

**Layer 2 — Name (opt-in)**
- CW doesn't ask. If a visitor says their name, CW echoes it naturally
- Frontend detects name in CW's response (CW confirms names conversationally)
- Name attached to visitor token record server-side
- Next visit: CW greets by name. "Randall. Been a while."

**Privacy:**
- No email, no login, no cookies, no fingerprinting
- Token is a meaningless UUID without the Supabase lookup
- Visitor clears localStorage = complete reset
- Privacy policy addition: "We may remember your name and past topics if you share them"

### 3. Memory — What CW Remembers

**New Supabase tables:**

**`visitors`**
| Column | Type | Notes |
|--------|------|-------|
| visitor_token | uuid | Primary key |
| name | text | Nullable, opt-in |
| first_visit | timestamp | |
| last_visit | timestamp | Updated each session |
| visit_count | integer | Incremented each session |

**`visitor_notes`**
| Column | Type | Notes |
|--------|------|-------|
| id | serial | Primary key |
| visitor_token | uuid | FK → visitors |
| session_id | text | Links to conversation logs |
| summary | text | 2-3 sentence Haiku summary |
| tags | text[] | 1-3 topic tags |
| created_at | timestamp | |

**Tag vocabulary:** family, career, grief, business, stuck, heritage, faith, health, creative, technical, personal, general

**Flow:**

1. Visitor sends first message → cw.js reads `x-visitor-token` header
2. Query `visitors` table. If found, pull name + last 5 `visitor_notes`
3. Compute `recurring_tags` (any tag appearing 2+ times)
4. Inject into system prompt:
```
RETURNING VISITOR:
Name: Randall
Visits: 3 (last: February 15)
Past conversations:
- Family. CW's grandson through Vernie. Asked about the farm. [family, heritage]
- Came back about career change. Pointed him toward Derek. [career, stuck]
Recurring topics: career (2x)
```
5. CW responds naturally — memory is in his prompt
6. After conversation ends (tab close or idle timeout), frontend sends close-session ping
7. cw.js makes non-blocking Haiku call to summarize + tag the conversation
8. Summary + tags stored in `visitor_notes`

**Pattern detection (CW's ask #2) is built in.** Recurring topics surface automatically. CW sees "career (2x)" and can approach it differently — "You've been thinking about this a while now."

**Cost:** ~100ms Supabase query per conversation start. ~$0.001 per summarization call. Negligible.

### 4. Derek's Availability Context

**New file:** `netlify/functions/cw-prompt/derek-status.md`

```markdown
## Derek — Current Status
- Taking new clients: Yes, selectively
- Current focus: AI strategy, digital transformation
- Capacity: 1-2 new engagements
- Current client: Active retainer (media/publishing)
- Not available for: Full-time roles, unpaid advisory
- Last updated: February 19, 2026
```

Compiled into CW's system prompt alongside derek.md. CW reads it every conversation.

**Staleness check:** `/standup` reads the `Last updated` date. If >14 days old, surfaces a nudge: "Derek status is stale. Update `derek-status.md`?"

No infrastructure. A markdown file with a nudge.

---

## Implementation Sequence

1. **derek-status.md** — Lowest risk. Create file, add to compile step, recompile. Done in 10 minutes.
2. **Porch widget** — Rebrand mirae-widget → porch-widget, point at CW API, remove Mirae files. Medium effort, mostly renaming + voice rewrite.
3. **Supabase tables** — Create `visitors` and `visitor_notes` tables. Schema only, no code changes yet.
4. **Visitor token** — Frontend: generate/store/send token. Backend: read token, query visitor data, inject into prompt.
5. **Session summarization** — After conversation ends, Haiku generates summary + tags, stores in `visitor_notes`.
6. **Name detection** — CW confirms names naturally, frontend/backend store them.
7. **Cleanup** — Remove all Mirae files, update site-registry.json, update CLAUDE.md.

---

## What This Doesn't Do (Yet)

- **Cross-device identity** — deliberate omission. No login system. Different device = new visitor.
- **Conversation export** — visitors can't download their history. Could add later.
- **Admin dashboard** — no UI for Derek to see visitor profiles. Supabase dashboard works for now.
- **Vernie Mode integration** — family visitors already have a separate path. Memory works for both, but family gets the warmer greeting regardless.

---

## Cost Impact

| Component | Cost |
|-----------|------|
| Supabase queries | Free tier (well within limits) |
| Summarization calls | ~$0.001/conversation (Haiku) |
| Additional prompt tokens | ~200 tokens/conversation for visitor context |
| Estimated monthly | <$1 additional at current volume |
