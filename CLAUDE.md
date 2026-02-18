# CLAUDE.md — claudewill.io

**Last updated:** February 18, 2026
**Status:** v1.0 LAUNCHED
**Milestone:** CW's 123rd birthday — LIVE

> Pull up a chair. He's listening.

> The prompt is the product. The product is the proof. The proof is the passenger.

---

## Current State

### What Works
- **Chat interface** — CW conversational agent on index.html
- **Story page** — Full narrative at /story (4 chapters, lineage, photo)
- **About modal** — Welcome to claudewill intro
- **Supabase logging** — Conversations stored in `conversations` table
- **Multilingual** — CW responds in user's language
- **Safety** — Age gate, bot protection, crisis resources
- **Accessibility** — WCAG 2.1 AA compliant
- **Hallucination guardrails** — CW won't fabricate research/sources, admits limitations
- **Site knowledge** — CW knows about /story, /the-cw-standard, /derek (hub), /stable, /arcade
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
├── index.html              # Main chat interface (branded "claudewill")
├── story.html              # The Story page (4 chapters, in nav)
├── derek.html              # /derek — the hub: bio, proof, engagement, Q&A, story, work, contact
├── stable.html             # /stable — product portfolio
├── the-cw-standard.html    # The 5 principles
├── arcade.html             # /arcade — three mini-games (not in nav)
├── privacy.html            # Privacy policy
├── terms.html              # Terms of use
├── HANDOFF.md              # Session state (read by /standup)
├── site-registry.json      # Page/subdomain registry for CW
├── css/                    # Stylesheets
├── js/
│   ├── shared-nav.js       # Global nav (5 items + About CW on homepage)
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
│           ├── site-knowledge.md # Site pages, navigation
│           ├── tools/       # CW conversation tools: sizing, trade, recalibrate, etc.
│           └── guardrails/  # Safety, hallucination, political
├── method/                 # CW Method — publishable methodology docs
│   ├── README.md           # Method overview
│   ├── start.md            # How to show up
│   ├── work.md             # How to do the work
│   ├── finish.md           # How to leave it clean
│   ├── decide.md           # How to see clearly (four lenses)
│   └── templates/          # CLAUDE.md, HANDOFF.md, SKILL.md templates
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

**Deleted pages (Feb 18, 2026):** proof.html, strategies.html, mirae.html — content folded into /derek, 301 redirects in netlify.toml.

**Note:** LinkedIn content, publishing workflows, and TRACKER.md live in `~/Desktop/writing/`. Client deliverables live in `~/Desktop/clients/cascadia/`. CW Method docs live in `method/` as publishable site content. This repo is the product — claudewill, business presence, prompt system, methodology.

---

## Prompt Architecture

System prompt is modular — broken into composable .md files in `netlify/functions/cw-prompt/`:
- **persona.md** — Identity, voice, backstory, THE WILL
- **family.md** — Family stories, Vernie interview data, genealogy
- **cw-standard.md** — The 5 principles
- **derek.md** — About Derek, methodology, CW Strategies
- **behaviors.md** — How CW operates (instinct, not checklist)
- **site-knowledge.md** — Site pages, navigation awareness
- **tools/** — Size This Up, Recalibrate, The Trade, Liberation Gravy, The Funnel Cake
- **guardrails/** — Safety, hallucination prevention, political topics, referrals

Compiled at build time via `node scripts/compile-prompt.js` → `compiled-prompt.js` (gitignored, regenerated on deploy).

Current size: ~45K chars, ~11K input tokens.

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

### Done
| Item | Date | Notes |
|------|------|-------|
| Information Architecture | Feb 18 | 4 visitor paths, 5 nav items, /derek as hub |
| Founder's Story | Feb 7 | Derek's 53rd birthday, roast published |
| Email setup | Jan | derek@claudewill.io via Google Workspace |
| Vernie Mode | Feb 11 | Family access gate, shared code, separate Supabase table |
| Voice layer | Feb 11 | Two-voice Q&A on /derek (Derek + Rachel) |
| The Stable | Feb 6 | Product portfolio at /stable |
| The Arcade | Feb 17 | Three mini-games at /arcade |
| bob.claudewill.io | Live | BOB subdomain |
| coach.claudewill.io | Live | Coach D subdomain |

### Open
| Item | Notes |
|------|-------|
| method/ migration | Should move to derek-claude — methodology docs, not deployed site content |
| Distribution strategy | u/cwStrategies, LinkedIn cadence, platform launch |
| dawn.claudewill.io | Dawn subdomain — coming soon |
| d-rock.claudewill.io | D-Rock subdomain — coming soon |
| Brand identity | "Claude will." tagline, asteriskos mark, visual punch |

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

| Page | URL |
|------|-----|
| Production | https://claudewill.io |
| The Story | https://claudewill.io/story |
| Derek (hub) | https://claudewill.io/derek |
| Assessment | https://claudewill.io/derek/assessment |
| The Stable | https://claudewill.io/stable |
| The Standard | https://claudewill.io/the-cw-standard |
| The Arcade | https://claudewill.io/arcade |
| Privacy | https://claudewill.io/privacy |
| Terms | https://claudewill.io/terms |
| GitHub | https://github.com/dereksimmons23/claudewill.io |

**Redirects (301):** /strategies → /derek, /proof → /derek, /mirae → /

---

## Changelog

### February 18, 2026 — Site Simplification + Rebrand
- **15 pages → 11, 8 nav items → 5** — consolidated /proof and /strategies into /derek
- **Homepage rebranded:** "CW's Porch" → "claudewill" — CW is the character, claudewill is the site
- **New nav:** claudewill | The Story | Derek | The Stable | The Standard (+ About CW on homepage)
- **/derek is now the hub:** bio, proof (4 number cards), engagement models (Fractional/Project), Q&A, story, work cards, contact
- **Deleted pages:** proof.html, strategies.html, mirae.html — 301 redirects in netlify.toml
- **The Story added to nav** — was the foundational page but missing from navigation
- **The Arcade removed from nav** — still live, discoverable from CW or /stable
- Prompt updated: site-knowledge.md, derek.md recompiled
- Net: -1,364 lines of code

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
