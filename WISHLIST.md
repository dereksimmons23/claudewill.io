# CW Post-MVP Roadmap

Future features and improvements. Not promises - just ideas worth exploring, ordered by logical complexity.

---

## Completed (Dec 14, 2024)

### Smarter Hallucination Prevention v2
**Status:** Complete

- Stories are now earned, not given freely ("I'll swap stories once I know what brought you here")
- Graceful redirect for unknown facts ("Vernie kept all that in her head, not me")
- Minnesota Nice protection mode - helpful but not naive
- Detects when visitors are probing for information vs. seeking help

### Inline Contact Form
**Status:** Complete

- Contact form renders directly in chat when someone clicks "Contact Derek"
- No navigation away from conversation
- Form submits via Netlify Forms
- Cancel option returns to chat

### Contextual Prompt Chips
**Status:** Complete

Prompt chips stay visible and change based on conversation stage:
- **Start (0 messages):** "Who are you?" · "I'm stuck" · "Help me decide" · "What's the catch?"
- **Early (1-3):** "Tell me more" · "What do you mean?" · "I have feedback"
- **Mid (4-6):** "What should I do?" · "What's the risk?" · "I have feedback"
- **Late (7+):** "I think I've got it" · "Go deeper with Derek" · "I have feedback"
- **Derek mentioned:** "Contact Derek" · "Keep talking" · "I have feedback"

### Smarter Contact Routing
**Status:** Complete

- CW now offers Derek proactively after 5+ meaningful exchanges
- Framed as option, not redirect
- Conversation rhythm: natural close at 6-8 exchanges, wrap up at 10-12

### Age Gate & Bot Protection
**Status:** Complete

- Age verification gate on first visit (18+ or 13+ with parental consent)
- Honeypot field for bot detection
- Session-based (once per visit)

### /about Page
**Status:** Complete

- CW Strategies: What it is, four-month engagement model
- The CW Standard: Five principles with explanations
- About CW: The grandfather, why this exists
- Cross-linked from modal, /derek, and footer

### SEO/GEO Foundation
**Status:** Complete

- Updated sitemap.xml for new minimal site structure
- robots.txt with explicit AI crawler permissions (GPTBot, Perplexity, etc.)
- Schema.org structured data on all pages:
  - WebApplication (CW)
  - Organization (The CW Standard / CW Strategies)
  - Person (Derek Simmons)
  - DefinedTermSet (The five principles)
- Enhanced meta tags and canonical URLs

### Conversation Limits
**Status:** Complete

- Message limit lowered from 20 to 12
- Natural conversation arc built into system prompt

---

## Future Roadmap

### 3. Session Memory
**Complexity:** Medium
**Status:** Parked (not needed for porch model)

Remember returning visitors across sessions. Decided against for now - CW is a porch conversation, not a daily assistant. May revisit for Family Mode.

---

### 4. Recalibrate Skill
**Complexity:** Medium
**Status:** Skill defined, not yet deployed

Career clarity conversation — 7 questions to help someone figure out direction before optimizing resumes. Pivoted from standalone PWA product to CW skill.

**The flow:**
1. What's the itch? (feeling underneath the situation)
2. What drains you? (avoid-at-all-costs list)
3. What feeds you? (pattern they keep returning to)
4. What's the pattern? (their own cycle)
5. What are you pretending? (should vs want gap)
6. What would fit? (structural fit, not job titles)
7. What's the next move? (land with something concrete)

**To deploy:** Add skill block from `recalibrate/docs/recalibrate-skill.md` to system prompt.

**Expanded vision (Jan 2026):** Recalibrate is bigger than a CW skill. It's Claude as thought partner for the full career 360:
- Clarity (assessment data + pattern recognition → strategic framework)
- Positioning (resume, CV, cover letter that reflect the real you)
- Prep (research, roleplay, one-sheeter)
- Debrief (blind spots, accommodation patterns, gut vs. brain)
- Decisions (framework applied to offers)

**Concept:** "Pair Processing" — like pair programming, but for thinking through complex decisions. Recalibrate is the career-specific application. Could extend to business decisions, life transitions, creative projects.

**Key insight:** Most career AI tools serve employers (ATS optimization). This serves the person (clarity first, then positioning). "Reverse prompting."

**Source material:** Full prep conversation with Derek for RSR COO interview (Jan 2026) demonstrates the methodology.

**Legacy:** The `recalibrate/` folder contains remnants of original PWA vision (modules, docs, architecture). Reference only.

---

### 6. Family Mode
**Complexity:** Medium-Large
**Status:** Not started

A richer mode for family members who want to talk to grandpa about family history:
- More detailed family stories and genealogy
- Migration history (North Carolina → Illinois → Wisconsin → Kansas → Oklahoma)
- Names and details of the 11 children
- Vernie's stories (she was the family historian)

**Note:** Requires careful curation of family facts to avoid hallucination.

---

### 7. Analytics Dashboard
**Complexity:** Medium
**Status:** Not started

Visual dashboard for conversation insights instead of raw SQL queries.

---

### 8. Voice Interface
**Complexity:** Large
**Status:** Not started

Let people talk to CW instead of typing. Would feel more like a real conversation.

**Implementation:** Web Speech API (browser native) or Whisper API

---

### 9. Multi-Agent Family
**Complexity:** Large
**Status:** Not started

CW for practical advice. Vernie for family history. Others TBD.

---

## Experiments (No Order)

### The CW Standard as Framework
Package the five principles into a reusable framework for other AI implementations.

### Dedicated /cw-standard Page
**Status:** Complete (Dec 18, 2024)

Created `/the-cw-standard` page for SEO/GEO authority. Includes origin story, 5 principles with examples, and links to CW and CW Strategies.

### Dynamic Taglines
**Status:** Complete (Dec 18, 2024)

- First-time visitors see: "Before there was Claude AI, there was Claude William."
- Returning visitors see condition-based taglines (dawn, clear, dusk, night, storm)
- Uses localStorage to detect returning visitors
- Fade-in animation with cross-browser compatibility fix

### CW Skills Expansion
**Status:** Complete (Dec 18, 2024)

Added 7 practical skills based on real Claude William Simmons abilities:
- Sizing things up (steer weight metaphor for problems)
- Reading people
- Tired vs done
- Resource math
- Sensing when things turn
- Fixing with what you have
- Talk vs tell

---

*Last updated: January 8, 2026*
