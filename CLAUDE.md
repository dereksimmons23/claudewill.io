# CLAUDE.md — claudewill.io

**Last updated:** February 12, 2026
**Status:** v1.0 LAUNCHED
**Milestone:** CW's 123rd birthday — LIVE

> Pull up a chair. He's listening.

> The prompt is the product. The product is the proof. The proof is the passenger.

---

## Current State

### What Works
- **Chat interface** — CW conversational agent on index.html
- **Story page** — Full narrative at /story (4 chapters, lineage, photo)
- **About modal** — Welcome to CW's Porch intro
- **Supabase logging** — Conversations stored in `conversations` table
- **Multilingual** — CW responds in user's language
- **Safety** — Age gate, bot protection, crisis resources
- **Accessibility** — WCAG 2.1 AA compliant
- **Hallucination guardrails** — CW won't fabricate research/sources, admits limitations
- **Site knowledge** — CW knows about /story, /the-cw-standard, /about, /derek
- **Size This Up** — Guided 5-step problem-sizing flow (Define → Weight → Resources → Focus → Next Step)
- **Constitutional thinking** — CW knows 5 constitutional frameworks (CW Standard, Anthropic, Declaration, US Constitution, others) and can help people think constitutionally
- **Political topics** — CW distinguishes partisan fights (avoids) from constitutional principles (engages directly); can name constitutional violations without being partisan
- **Family knowledge** — CW knows Derek's siblings, Albert (first child, died young), CW Jr and his descendants
- **The Trade** — Guided reflection for people carrying traded dreams (not therapy — guided conversation with guardrails)
- **Referral intelligence** — CW points people to the right resources conversationally (mental health, legal, medical, research, career, financial)
- **Liberation Gravy** — Guided flow for thinning out subscriptions/consumption (Inventory → Gut Check → Milk vs Water → Cut → Add-Back), includes crop rotation frame (subscribe/use/cancel/rotate) and sharecropping trap warning
- **The Funnel Cake** — What "free" actually costs (data, email, attention, peace) + the cancellation gauntlet (guilt, discount, bundle, maze)

### What's Experimental
- "Size This Up" tool (gathering feedback)
- "The Trade" tool (new, gathering feedback)
- "Liberation Gravy" tool (new, gathering feedback)
- "The Funnel Cake" tool (new, gathering feedback)

### Known Issues
- None blocking launch

---

## Architecture

### Stack
| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Static HTML/CSS/JS | No framework, vanilla JS |
| Hosting | Netlify | Auto-deploys from main branch |
| API | Netlify Functions | Serverless, cw.js handles all requests |
| AI | Anthropic Haiku | claude-haiku-4-5 for conversations |
| Database | Supabase | PostgreSQL, free tier |
| Development | Claude Code (Opus) | This conversation |

### Why These Choices
- **Haiku for conversations** — Fast, cheap (~$3-5/month at scale), good enough for CW's voice
- **Opus for building** — Complex reasoning, architecture decisions, code quality
- **No framework** — Simplicity, fast load times, no build step
- **Netlify** — Free tier, automatic deploys, serverless functions included

### File Structure
```
claudewill.io/
├── index.html              # Main chat interface
├── story.html              # The Story page (4 chapters)
├── strategies.html         # CW Strategies page
├── derek.html              # /derek professional bio + Q&A
├── the-cw-standard.html    # The 5 principles
├── privacy.html            # Privacy policy
├── terms.html              # Terms of use
├── HANDOFF.md              # Session state (read by /standup)
├── TRACKER.md              # Feature/experiment tracking
├── site-registry.json      # Page/subdomain registry for CW
├── css/                    # Stylesheets
├── js/
│   └── chat-prompts-artifact.js  # Stage-based prompt chips
├── images/
│   └── cw-family.png       # Family photo
├── scripts/
│   └── compile-prompt.js   # Build step: .md → compiled JS
├── netlify/
│   └── functions/
│       ├── cw.js            # API handler + Anthropic call
│       └── cw-prompt/       # Modular system prompt
│           ├── index.js     # Assembler (compiled → fallback)
│           ├── persona.md   # Identity, voice, backstory
│           ├── family.md    # Family stories and knowledge
│           ├── cw-standard.md # The 5 principles
│           ├── derek.md     # About Derek, methodology, CW Strategies
│           ├── behaviors.md # How CW operates
│           ├── site-knowledge.md # The Stable, pages
│           ├── tools/       # CW conversation tools: sizing, trade, recalibrate, etc.
│           └── guardrails/  # Safety, hallucination, political
├── worker/                 # CW Brief Cloudflare worker
├── .claude/
│   └── skills/             # Claude Code workflow skills (gitignored)
│       ├── standup/         # Morning opener
│       ├── eod/             # End of session
│       ├── status/          # Cross-area health check
│       ├── tracker/         # Feature/work tracking
│       ├── housekeeping/    # Repo hygiene
│       ├── meeting/         # Transcript processing
│       ├── recalibrate/     # 7-question framework
│       └── brief/           # Morning analytics
└── docs/
    ├── drafts/              # Gitignored — founders, planning, derek
    └── reference/           # Gitignored — research, old concepts
```

**Note:** LinkedIn content and publishing workflows live in `~/Desktop/writing/`. CDN client deliverables live in `~/Desktop/cdn/`. This repo is the product — CW's Porch, business presence, prompt system.

---

## Complexity Management

### Current State (Jan 24, 2026)
- System prompt: ~450 lines in cw.js
- Tools: Size This Up, Recalibrate, The Trade, Liberation Gravy, The Funnel Cake
- Guardrails: hallucination prevention, political topics, referrals
- Status: **Manageable but approaching threshold**

### Triggers for Refactor
If any of these happen, pause and restructure before adding more:
1. **CW behaves inconsistently** — contradictory responses from conflicting instructions
2. **Can't find things** — takes more than 30 seconds to locate a section in cw.js
3. **Adding feels risky** — worried about breaking existing behavior
4. **Persona dilution** — CW sounds like an instruction-follower, not a person
5. **System prompt exceeds 600 lines** — arbitrary but useful tripwire

### Check-ins
- **After Founder's Package launch (Feb 7)**: Review cw.js, assess complexity, decide on refactor
- **Before adding any new tool**: Ask "does this conflict with anything?" and "can we find everything?"
- **Monthly**: Quick read-through of system prompt, prune anything unused

### What Refactor Looks Like
- Break prompt into composable sections (persona.md, tools/, guardrails/)
- Assemble at runtime from separate files
- Document the map of what's where
- Test each tool in isolation

---

## Key Files

| File | What It Does | Gotchas |
|------|--------------|---------|
| `netlify/functions/cw.js` | API handler + Anthropic call | Imports prompt from cw-prompt/ |
| `netlify/functions/cw-prompt/*.md` | CW's personality (modular) | **Edit these, then compile** |
| `netlify/functions/cw-prompt/index.js` | Prompt assembler | Tries compiled first, falls back to dynamic |
| `scripts/compile-prompt.js` | Build step — compiles .md to JS | **Run after any prompt edit** |
| `index.html` | Chat interface + About modal | Modal content at bottom of file |
| `story.html` | The Story page | Noto Serif, progress bar, print styles |
| `js/chat-prompts-artifact.js` | Prompt chips | Changes by conversation stage |
| `HANDOFF.md` | Session state for /standup | **Updated by /eod** |
| `docs/drafts/` | Working content — founders, planning, derek | Gitignored — stays local |
| `docs/reference/` | Research, old concepts | Gitignored — stays local |

---

## Known Gotchas

### System Prompt Location
CW's personality is modularized in `netlify/functions/cw-prompt/` — persona.md, family.md, derek.md, behaviors.md, tools/, guardrails/, etc. The assembler is `index.js` which tries a pre-compiled version first (for Netlify deploy) and falls back to dynamic file reading (local dev). Run `node scripts/compile-prompt.js` after editing any prompt .md file — this generates `compiled-prompt.js` which esbuild can bundle. **If you skip this step, CW will respond as generic Claude in production.**

### Haiku vs Opus
- **Haiku** — Runs in production for user conversations (fast, cheap)
- **Opus** — Used in Claude Code for building (this conversation)
- Don't mix them up. Haiku can't do complex architecture. Opus is overkill for chat.

### docs/ Folder
`docs/drafts/` and `docs/reference/` are gitignored — working content stays local. LinkedIn content and all publishing workflows moved to `~/Desktop/writing/` (Feb 12, 2026).

### Condition System
The frontend sends a `condition` (clear, partly-cloudy, overcast, stormy, snow) based on local weather. CW's porch light glow intensity varies by condition. This is mostly visual — don't overthink it.

### Family Details
CW hallucinated family details early on. Now the system prompt has strict guardrails. If someone reports hallucinations, check the system prompt section on family.

---

## Session Continuity

### Conversation Storage
Claude Code stores conversations at:
```
~/.claude/projects/-Users-dereksimmons-Desktop-claudewill.io/
```

### Starting a Session
```bash
cw porch
```

**First thing every session:** Run `/standup` — it reads HANDOFF.md, checks CW health, surfaces priorities, and asks what we're working on.

### The Session
```
Open
├── /standup — read HANDOFF.md, check CW health, surface priorities
│
Work
├── /tracker view — check open items
├── /status — cross-area health check
├── /meeting [file] — process notes into structured summary
│
Close
├── /eod — update HANDOFF.md + hygiene + tomorrow's priorities
```

Skills live in `.claude/skills/`:
| Skill | What it does |
|-------|-------------|
| `/standup` | Morning opener — status, priorities, CW health |
| `/eod` | End of session — updates HANDOFF.md, hygiene, tomorrow's priorities |
| `/status` | Cross-area status check (prompt, pages, infra, subdomains) |
| `/tracker` | Feature/work tracking (view, add, update) |
| `/housekeeping` | Repo hygiene — loose files, stale dates, prompt integrity |
| `/meeting` | Process transcript/notes into structured summary |
| `/recalibrate` | 7-question framework for any subject at a crossroads |
| `/brief` | Morning analytics — conversations, content calendar, CW health |

### Resuming Context
If context runs out, start fresh — `/standup` picks up from HANDOFF.md automatically.

---

## Style Guide

### Writing
- **AP Style** — Numerals 10+, no Oxford comma, $10 not "10 dollars"
- **Third-person** — For public content ("Derek built this" not "I built this")
- **Direct voice** — Short sentences. No filler. Like CW would talk.

### Typography
- **Noto Serif** — Body text on story.html (better long-form reading)
- **Noto Sans** — UI elements, navigation
- **Monospace** — Headers, CW wordmark (has that "hand-painted" feel)

### Colors
- **Background:** #000D1A (midnight blue)
- **Accent:** #d4a84b (gold)
- **Text:** #f5f5f5 (light), #b0b0b0 (dim)

---

## Supabase

### Tables
- **conversations** — Main logging table (timestamp, user_message, cw_response, condition, session_id, ip_hash, token_usage)

### Useful Queries
See `ANALYTICS_QUERIES.md` for 15+ SQL queries covering:
- Daily/weekly conversation counts
- Token usage analysis
- Session patterns
- Condition distribution

### Access
```bash
# Supabase dashboard
https://supabase.com/dashboard/project/[project-id]
```

Environment variables in Netlify:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

---

## Roadmap

### Queued Work
| Item | Target | Notes |
|------|--------|-------|
| Information Architecture | 2 weeks | Nav hierarchy, "The Stable" concept |
| Founder's Story | Feb 7, 2026 | Derek's 53rd birthday |
| Technical deep dive | TBD | How CW's Porch was built |
| Email setup | ✅ Done | derek@, hello@, catch-all via ImprovMX → Gmail |
| Content structure | Post-launch | Drafts/published folders, content calendar |
| Distribution strategy | Post-launch | u/cwStrategies, go to existing subs, be useful |
| bob.claudewill.io | TBD | BOB subdomain |
| coach.claudewill.io | TBD | Coach D persona |
| dawn.claudewill.io | TBD | Dawn's writing assistant |

### Post-MVP Ideas (see WISHLIST.md)
- Family Mode (richer genealogy for family members)
- Vernie agent (family historian)
- Voice interface
- Session memory

### Separate Build: Constitutional Layer
A framework for AI agent reasoning about rules, trust, systems, and coordination. Shares principles with CW Standard but different interface — no persona, built for agent-to-agent use. CW's Porch stays simple (grandfather helping neighbors); the constitutional layer handles the infrastructure question of how AI agents should reason about:
- What rules am I actually following?
- Who benefits when those rules are followed or broken?
- Trust to do what? (domain-specific trust assessment)
- What do I do when the system fails?

Not a chatbot. An API or framework. Anthropic's constitution covers Claude; this would cover coordination between agents built on various models. Early concept — needs architecture work.

---

## Vision

### The Porch Metaphor
CW's Porch is a place to sit and talk. You show up with a problem. CW listens, asks questions, gives you a straight answer or points you elsewhere. No judgment. No performance. Just help.

### Human Agency + AI
The domain isn't just a name. claudewill.io — Claude's will. Human determination carried forward through an AI that happens to share his first name. The builder's work continues through technology, not despite it.

### The CW Standard
Five principles that guide everything:
1. Truth over comfort
2. Usefulness over purity
3. Transparency over reputation
4. People over systems
5. Agency over ideology

---

## Commands

```bash
# Deploy (auto-deploys on push to main)
git push origin main

# Local development
# No build step — just open index.html or use Netlify CLI
netlify dev

# View recent commits
git log --oneline -15

# Check Supabase logs
# Via dashboard: https://supabase.com/dashboard/project/[id]/logs
```

---

## URLs

| Environment | URL |
|-------------|-----|
| Production | https://claudewill.io |
| Story | https://claudewill.io/story |
| About CW | https://claudewill.io/about |
| Derek | https://claudewill.io/derek |
| Standard | https://claudewill.io/the-cw-standard |
| Privacy | https://claudewill.io/privacy |
| Terms | https://claudewill.io/terms |
| GitHub | https://github.com/dereksimmons23/claudewill.io |

---

## Changelog

### January 28, 2026 — Liberation Gravy + The Funnel Cake
- Added "Liberation Gravy" tool: guided flow for thinning out subscriptions/consumption
- 5-step process: Inventory → Gut Check → Milk vs Water → Cut → Add-Back
- Rooted in Depression-era "Hoover gravy" history (water instead of milk)
- Added crop rotation frame: subscribe/use/cancel/rotate instead of paying for everything
- Added sharecropping trap: "subscribed to everything = paying landlords for fields you don't work"
- Added "The Funnel Cake" tool: what "free" actually costs
- Four costs of free: data, email, attention, peace
- The cancellation gauntlet: guilt, discount, bundle, maze
- CW's frame: "Sales barn had hustlers too — same game, better technology"
- CW now knows the current date (birthday mode for Feb 7 and Jan 6)
- Substack draft written for post-launch "countup" content

### January 24, 2026 — The Trade + Referral Intelligence
- Added "The Trade" tool: 5-step guided reflection for people carrying traded dreams
- Added "Pointing People in the Right Direction": conversational referrals (mental health, legal, medical, research, career, financial)
- Pattern: name the category, acknowledge you're not it, give a starting point
- Guardrails: "I'm not a therapist," "Who else have you talked to?", "This deserves a kitchen table"

### January 20, 2026 — Model Upgrade
- Upgraded from Claude Haiku 3.5 to Claude Haiku 4.5 (claude-haiku-4-5)
- Haiku 3.5 deprecated by Anthropic on February 19, 2026

### January 11, 2026 — Constitutional Thinking
- Added constitutional thinking framework to CW's system prompt
- CW now knows 5 constitutional frameworks: CW Standard, Anthropic's constitution, Declaration of Independence, US Constitution/Bill of Rights, and notable frameworks (South Africa, Germany, UN Declaration)
- Rewrote political topics handling: CW distinguishes partisan fights (avoids) from constitutional principles (engages directly)
- CW can name constitutional violations without being partisan
- Added Chapter 15 "The Fence" to Founder's Story draft
- Excavated CW-Strategies folder (57 files cataloged)

### January 6, 2026 — v1.0 Launch
- CW's 123rd birthday
- Story page complete (4 chapters, lineage, family photo)
- About modal updated
- Reading experience enhancements (Noto Serif, progress bar, print styles)

### December 17, 2024
- Fact corrections (education language, dates)
- Desktop scroll bug fixed
- Porch light glow added
- Origins card on /about
- Vernie's 1985 interview in system prompt

### December 14, 2024
- Age gate (18+ or 13+ with parental consent)
- Honeypot bot protection
- Contextual prompt chips by conversation stage
- Inline contact form
- SEO/GEO schema.org structured data

### December 13, 2024
- Security hardening (CORS, input validation, rate limiting)
- Hallucination prevention v1
- Legal compliance (Privacy + Terms)
- WCAG 2.1 AA accessibility

### December 12, 2024
- Noto Sans font, improved readability
- Multilingual support
- About modal
- Porch light concept
- Contact form (email protected)

### December 8-11, 2024
- Supabase logging infrastructure
- Full legal compliance
- Security headers (CSP, HSTS)
- Analytics queries
- /derek page

---

## Quick Reference

**CW's birthday:** January 6, 1903
**CW's death:** August 10, 1967
**Derek's birthday:** February 7, 1973
**Jackson's birthday:** Look it up (don't hallucinate)

**Haiku model:** claude-haiku-4-5
**Opus model:** claude-opus-4-5-20251101 (Claude Code)

**Cost:** ~$3-5/month (Netlify free, Supabase free, Haiku API)

---

*"I'll swap stories once I know what brought you here. What do you need?"* — CW
