# CLAUDE.md — claudewill.io

**Last updated:** February 22, 2026
**Status:** v2.1 — The Kitchen + Model Routing
**Milestone:** Private command center, Opus/Haiku routing, CW Link Renderer

> Pull up a chair. He's listening.

> The prompt is the product. The product is the proof. The proof is the passenger.

---

## Current State

### What Works
- **Homepage** — 4-screen billboard: invitation (wordmark, typewriter, nav), the story, the builder (assessment CTA), the standard (5 principles)
- **Porch widget** — `cw> _` terminal trigger on every page including homepage. Slide-up chat panel connects to CW API. Vernie Mode via "family?" chip or `?family=true` URL parameter.
- **Command palette** — Terminal-style nav overlay. Triggered by `*` in sticky headers or floating `*` button on other pages. Replaces hamburger drawer.
- **Story page** — Full narrative at /story (4 chapters, lineage, photo)
- **Library** — /library with 4 shelves: dispatches (Substack), research (Between Claudes), the book (Finding Claude), selected (coming)
- **Supabase logging** — Conversations stored in `conversations` table
- **Multilingual** — CW responds in user's language
- **Safety** — Bot protection, crisis resources, inline disclosure
- **Accessibility** — WCAG 2.1 AA compliant
- **Hallucination guardrails** — CW won't fabricate research/sources, admits limitations
- **Site index** — Everything at claudewill.io in one place at /map
- **Site knowledge** — CW knows about /story, /story#the-cw-standard, /derek, /workshop, /library, /arcade, /map
- **Size This Up** — Guided 5-step problem-sizing flow (Define → Weight → Resources → Focus → Next Step)
- **Constitutional thinking** — CW knows 5 constitutional frameworks (CW Standard, Anthropic, Declaration, US Constitution, others) and can help people think constitutionally
- **Political topics** — CW distinguishes partisan fights (avoids) from constitutional principles (engages directly); can name constitutional violations without being partisan
- **Family knowledge** — CW knows Derek's siblings, Albert (first child, died young), CW Jr and his descendants
- **The Trade** — Guided reflection for people carrying traded dreams (not therapy — guided conversation with guardrails)
- **Referral intelligence** — CW points people to the right resources conversationally (mental health, legal, medical, research, career, financial)
- **Liberation Gravy** — Guided flow for thinning out subscriptions/consumption (Inventory → Gut Check → Milk vs Water → Cut → Add-Back), includes crop rotation frame (subscribe/use/cancel/rotate) and sharecropping trap warning
- **The Funnel Cake** — What "free" actually costs (data, email, attention, peace) + the cancellation gauntlet (guilt, discount, bundle, maze)
- **The Kitchen** — Private command center at /kitchen. Auth gate + 4-panel dashboard. Kitchen CW runs on Opus as sous chef.
- **Model routing** — Kitchen→Opus, Porch→Haiku, Vernie→Haiku. Smart routing in cw.js.
- **CW Link Renderer** — CW chat responses render clickable links (markdown + bare URLs) on all pages.

### What's Experimental
- "Size This Up" tool (gathering feedback)
- "The Trade" tool (new, gathering feedback)
- "Liberation Gravy" tool (new, gathering feedback)
- "The Funnel Cake" tool (new, gathering feedback)

### Known Issues
- None blocking

---

## Architecture

### Stack
| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Static HTML/CSS/JS | No framework, vanilla JS |
| Hosting | Netlify | Auto-deploys from main branch |
| API | Netlify Functions | Serverless, cw.js handles all requests |
| AI | Anthropic Haiku | claude-haiku-4-5 for Porch/Vernie conversations |
| AI | Anthropic Opus | claude-opus-4-20250514 for Kitchen conversations |
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
├── index.html              # Homepage — 4-screen billboard + typewriter
├── story.html              # The Story page (4 chapters, in nav)
├── derek.html              # /derek — the hub: bio, proof, engagement, writing, contact
├── workshop.html           # /workshop — product portfolio (was studio)
├── library.html            # /library — writing: dispatches, research, book, selected
├── map.html                # /map — site index
├── arcade.html             # /arcade — three mini-games (not in nav)
├── kitchen/
│   └── index.html          # The Kitchen (auth gate + dashboard, private)
├── privacy.html            # Privacy policy
├── terms.html              # Terms of use
├── HANDOFF.md              # Session state (read by /standup)
├── site-registry.json      # Page/subdomain registry for CW
├── css/
│   ├── shared-nav.css      # Command palette + footer utilities
│   ├── porch-widget.css    # CW chat widget styles
│   └── kitchen.css         # Kitchen dark theme styles
├── js/
│   ├── shared-nav.js       # Command palette overlay (terminal-style nav)
│   ├── cw-link-renderer.js # Clickable links in CW chat responses
│   └── porch-widget.js     # CW chat widget (slide-up panel, API connection)
├── images/
│   └── cw-family.png       # Family photo
├── scripts/
│   └── compile-prompt.js   # Build step: .md → compiled JS
├── netlify/
│   └── functions/
│       ├── cw.js            # API handler + Anthropic call
│       ├── kitchen-data.js  # Kitchen dashboard data API
│       └── cw-prompt/       # Modular system prompt
│           ├── index.js     # Assembler (compiled → fallback)
│           ├── persona.md   # Identity, voice, backstory
│           ├── family.md    # Family stories and knowledge
│           ├── cw-standard.md # The 5 principles
│           ├── derek.md     # About Derek, methodology, CW Strategies
│           ├── behaviors.md # How CW operates
│           ├── site-knowledge.md # Site pages, navigation
│           ├── kitchen.md   # Kitchen CW persona (sous chef)
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
├── derek/
│   ├── assessment.html     # 7-question intake
│   ├── resume.html         # Professional resume
│   ├── portfolio/          # Visual portfolio
│   └── research/
│       ├── index.html      # Between Claudes research hub
│       └── warm-up-effect/ # First published article
└── docs/
    ├── drafts/              # Gitignored — founders, planning, derek
    ├── plans/               # Design docs and implementation plans
    └── reference/           # Gitignored — research, old concepts
```

**Deleted pages:** proof.html, strategies.html, mirae.html (folded into /derek), the-cw-standard.html (content at /story#the-cw-standard). studio.html renamed to workshop.html. All have 301 redirects in netlify.toml.

**Note:** LinkedIn content, publishing workflows, and TRACKER.md live in `~/Desktop/writing/`. Client deliverables live in `~/Desktop/clients/cascadia/`. CW Method docs moved to `~/Desktop/derek-claude/method/`. This repo is the product — claudewill, business presence, prompt system.

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

Current size: ~45.6K chars, ~11.6K input tokens.

---

## Key Files

| File | What It Does | Gotchas |
|------|--------------|---------|
| `netlify/functions/cw.js` | API handler + Anthropic call | Imports prompt from cw-prompt/ |
| `netlify/functions/cw-prompt/*.md` | CW's personality (modular) | **Edit these, then compile** |
| `netlify/functions/cw-prompt/index.js` | Prompt assembler | Tries compiled first, falls back to dynamic |
| `scripts/compile-prompt.js` | Build step — compiles .md to JS | **Run after any prompt edit** |
| `index.html` | 4-screen billboard homepage | Typewriter JS inline, no chat code |
| `story.html` | The Story page | Progress bar, print styles |
| `js/shared-nav.js` | Command palette overlay | NAV_CONFIG defines all nav items |
| `js/porch-widget.js` | CW chat widget | Connects to /.netlify/functions/cw, on every page |
| `css/shared-nav.css` | Palette + footer utilities | .footer-note, .signoff, .hw classes |
| `css/porch-widget.css` | Chat panel styles | Terminal trigger + slide-up panel |
| `netlify/functions/kitchen-data.js` | Kitchen dashboard data aggregator | Auth-gated, fetches from CW Brief worker + Supabase |
| `js/cw-link-renderer.js` | Renders clickable links in CW messages | Loaded before porch-widget.js on all pages |
| `HANDOFF.md` | Session state for /standup | **Updated by /eod** |

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

### Family Details
CW hallucinated family details early on. Now the system prompt has strict guardrails. If someone reports hallucinations, check the system prompt section on family.

### Kitchen vs Porch Prompts
Kitchen CW does NOT include persona.md — that's porch behavior (site navigation, visitor handling). kitchen.md defines the sous chef identity standalone. If Kitchen CW starts directing Derek to website pages, persona.md probably leaked back in.

### Model Routing
cw.js routes models: Kitchen → Opus (claude-opus-4-20250514, 1500 tokens), Porch → Haiku (claude-haiku-4-5, 500 tokens), Vernie → Haiku (500 tokens). Kitchen requires valid kitchenCode. If Kitchen gets wrong model, check mode/kitchenCode parsing in cw.js.

### Porch Widget + Command Palette Z-Index
Widget button: 9997. Chat panel: 9998. Command palette: 10000. When palette opens, widget hides. Escape closes both.

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
- **IBM Plex Mono** — Primary font everywhere (brand, nav, body, code)
- **Monospace** — All text is monospace. Terminal aesthetic.

### Colors (Light Theme)
- **Background:** #fafaf8 (warm white)
- **Text:** #0a1628 (midnight blue)
- **Accent:** #d4a84b (gold)
- **Link:** #4a8ec2 (blue)
- **Dim:** #6b7280 (gray)
- **Border:** #e5e7eb

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
| The Kitchen | Feb 22 | Private command center, model routing, Kitchen CW persona |
| CW Link Renderer | Feb 22 | Clickable links in CW chat across all pages |
| Portfolio Rebuild | Feb 22 | 33→13 slides, animated category slideshows |
| Visual Redesign v2 | Feb 21 | 6 phases: workshop rename, command palette, porch widget, homepage billboard, research stats, library |
| Information Architecture | Feb 18 | 4 visitor paths, 5 nav items, /derek as hub |
| Founder's Story | Feb 7 | Derek's 53rd birthday, roast published |
| Email setup | Jan | derek@claudewill.io via Google Workspace |
| Vernie Mode | Feb 11 | Family access gate, shared code, separate Supabase table |
| Voice layer | Feb 11 | Two-voice Q&A on /derek (Derek + Rachel) |
| The Workshop | Feb 21 | Product portfolio (renamed from studio/stable) |
| The Arcade | Feb 17 | Three mini-games at /arcade |
| bob.claudewill.io | Live | BOB subdomain |
| coach.claudewill.io | Live | Coach D subdomain |

### Open
| Item | Notes |
|------|-------|
| Distribution strategy | u/cwStrategies, LinkedIn cadence, platform launch |
| dawn.claudewill.io | Dawn subdomain — coming soon |
| d-rock.claudewill.io | D-Rock subdomain — coming soon |
| Derek page content rewrite | Draft written, needs implementation in HTML |
| Story page rewrite | Needs asteriskos, sharper articles |
| Mobile testing | All pages, all new patterns (palette, widget, billboards) |
| CW Remembers | Design approved Feb 19. Plan at `docs/plans/2026-02-19-cw-remembers-design.md` |

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

# Recompile prompt after editing .md files
node scripts/compile-prompt.js

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
| The Standard | https://claudewill.io/story#the-cw-standard |
| Derek (hub) | https://claudewill.io/derek |
| Assessment | https://claudewill.io/derek/assessment |
| The Workshop | https://claudewill.io/workshop |
| Library | https://claudewill.io/library |
| Site Index | https://claudewill.io/map |
| The Arcade | https://claudewill.io/arcade |
| Privacy | https://claudewill.io/privacy |
| Terms | https://claudewill.io/terms |
| GitHub | https://github.com/dereksimmons23/claudewill.io |

**Redirects (301):** /strategies → /derek, /proof → /derek, /mirae → /, /stable → /workshop, /studio → /workshop, /the-cw-standard → /story#the-cw-standard

---

## Changelog

### February 22, 2026 — The Kitchen + HANDOFF Items
- **The Kitchen** — Private command center at /kitchen. Auth gate, 4-panel dashboard (Brief, Pulse, Content Stage, Decisions Queue). Kitchen CW runs on Opus with sous chef persona.
- **Model routing** — cw.js routes Kitchen→Opus, Porch→Haiku, Vernie→Haiku. Kitchen auth validated server-side.
- **CW Link Renderer** — CW chat responses now render clickable links on all pages. js/cw-link-renderer.js loaded before porch-widget.js.
- **Portfolio rebuild** — 33 slides → 13 with animated category slideshows at /derek/portfolio.
- Kitchen prompt compiled: 11.9K chars (vs 45.6K standard, 28.7K vernie).

### February 21, 2026 — Visual Redesign v2
6-phase redesign committed and pushed:
- **Phase 1:** studio → the workshop (rename, redirects, prompt update). Footer cascade — "the standard" on all pages, two-line footer everywhere.
- **Phase 2:** Command palette nav replaces hamburger drawer. Terminal-style overlay with `>` prefix, `*` trigger. Keyboard accessible.
- **Phase 3:** Porch widget rewritten as full chat panel. `cw> _` trigger, slide-up panel, CW API connection, Vernie Mode via chip + URL param. On ALL pages including homepage.
- **Phase 4:** Homepage rewritten as 4-screen billboard. Invitation → Story → Builder (assessment CTA) → Standard. Removed inline chat, about modal, vernie gate HTML, signoff easter egg, ~500 lines of chat JS. -1,132 lines net.
- **Phase 5:** Research page live day counter. 5 hardcoded stats → 3 dynamic counters.
- **Phase 6:** Library page at /library. 4 shelves: dispatches, research, the book, selected. Registered in nav, map, site-registry, prompt.
- Prompt recompiled (45.6K chars standard, 28.7K chars vernie).

### February 20, 2026 — Light Theme + Content Rewrite
- Light theme cascade (15 files). Palette: #fafaf8 bg, #0a1628 text, #d4a84b accent.
- IBM Plex Mono as sole font.
- Story page redesign with sticky auto-hide header.
- "claude will" typewriter tightened to 8 phrases.
- Porch widget v1 (link-only, not chat).
- Derek page content draft (not yet implemented in HTML).
- Portfolio slideshow built (33 slides).

### February 18, 2026 — The Invitation + Studio Rename
- **Homepage redesigned** — invitation layer above the porch: wordmark (3.5rem), rotating "keep" phrases
- **Age gate removed** — disclosure folded into inline chat disclaimer (passive consent)
- **Stable → Studio** — file renamed, 301 redirects, all references updated
- **map.html created** — site index with all pages, products, research, legal
- **Global nav rewritten** — three sections with subsections, asterisk hover device, all lowercase
- **"keep going" signoff** — added to all page footers
- Prompt updated: site-knowledge.md and derek.md. Recompiled.

### February 18, 2026 — Site Simplification + Rebrand
- **15 pages → 11, 8 nav items → 5** — consolidated /proof and /strategies into /derek
- **Homepage rebranded:** "CW's Porch" → "claudewill"
- **/derek is now the hub:** bio, proof, engagement models, Q&A, work cards, contact
- **Deleted pages:** proof.html, strategies.html, mirae.html — 301 redirects
- **The Arcade removed from nav** — still live, discoverable

### January 28, 2026 — Liberation Gravy + The Funnel Cake
- Added "Liberation Gravy" tool: guided flow for thinning out subscriptions/consumption
- Added "The Funnel Cake" tool: what "free" actually costs
- CW now knows the current date (birthday mode for Feb 7 and Jan 6)

### January 24, 2026 — The Trade + Referral Intelligence
- Added "The Trade" tool: 5-step guided reflection for people carrying traded dreams
- Added "Pointing People in the Right Direction": conversational referrals

### January 20, 2026 — Model Upgrade
- Upgraded from Claude Haiku 3.5 to Claude Haiku 4.5 (claude-haiku-4-5)

### January 11, 2026 — Constitutional Thinking
- Added constitutional thinking framework to CW's system prompt

### January 6, 2026 — v1.0 Launch
- CW's 123rd birthday
- Story page complete (4 chapters, lineage, family photo)

### December 2024
- Supabase logging, security hardening, legal compliance, accessibility, multilingual support, SEO/GEO schema, age gate, honeypot, prompt chips, contact form

---

## Quick Reference

**CW's birthday:** January 6, 1903
**CW's death:** August 10, 1967
**Derek's birthday:** February 7, 1973
**Jackson's birthday:** Look it up (don't hallucinate)

**Haiku model:** claude-haiku-4-5 (Porch, Vernie)
**Opus model:** claude-opus-4-20250514 (Kitchen CW)
**Opus model (build):** claude-opus-4-6 (Claude Code)

**Cost:** ~$3-5/month (Netlify free, Supabase free, Haiku API)

---

*"I'll swap stories once I know what brought you here. What do you need?"* — CW
