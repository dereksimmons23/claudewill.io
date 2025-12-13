# CW Post-MVP Roadmap

Future features and improvements. Not promises - just ideas worth exploring, ordered by logical complexity.

---

## Roadmap Order

Each item builds infrastructure that makes the next one easier.

### 1. Smarter Hallucination Prevention
**Complexity:** Small
**Status:** Not started

Current approach redirects unknown family questions. Could be more graceful - acknowledge what's known, redirect what isn't.

**Why first:** Polish the core experience. No new infrastructure needed, just system prompt refinement.

---

### 2. Inline Contact Form
**Complexity:** Medium
**Status:** Not started

When someone asks to contact Derek, CW renders a contact form directly in the chat instead of linking away. User fills it out without leaving the conversation.

**Why second:** Better UX for existing flow. The Netlify form already exists on /derek - this just brings it into the chat.

---

### 3. Session Memory
**Complexity:** Medium
**Status:** Not started

Remember returning visitors across sessions. "Good to see you again."

**Implementation options:**
- localStorage (simple, client-side only)
- Supabase (already set up for logging)

**Why third:** Adds persistence layer that unlocks Family Mode and better Analytics.

---

### 4. Family Mode
**Complexity:** Medium-Large
**Status:** Not started

A richer mode for family members who want to talk to grandpa about family history:
- More detailed family stories and genealogy
- Migration history (North Carolina → Illinois → Wisconsin → Kansas → Oklahoma)
- Names and details of the 11 children
- Vernie's stories (she was the family historian)

**Why fourth:** Builds on Session Memory - could detect family members or provide a toggle.

**Note:** Requires careful curation of family facts to avoid hallucination.

---

### 5. Analytics Dashboard
**Complexity:** Medium
**Status:** Not started

Visual dashboard for conversation insights instead of raw SQL queries.

**Why fifth:** Builds on existing Supabase data. SQL queries already written in ANALYTICS_QUERIES.md.

---

### 6. Voice Interface
**Complexity:** Large
**Status:** Not started

Let people talk to CW instead of typing. Would feel more like a real conversation.

**Implementation:** Web Speech API (browser native) or Whisper API (Anthropic/OpenAI)

**Why sixth:** Independent feature, doesn't depend on earlier items but is technically complex.

---

### 7. Multi-Agent Family
**Complexity:** Large
**Status:** Not started

CW for practical advice. Vernie for family history. Others TBD.

**Why last:** Most complex - requires routing logic, separate system prompts, UI changes. Family Mode is a stepping stone.

---

## Experiments (No Order)

### The CW Standard as Framework
Package the five principles into a reusable framework for other AI implementations.

---

*Last updated: December 2024*
