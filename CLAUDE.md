# CLAUDE.md — claudewill.io

**Last updated:** January 20, 2026
**Status:** v1.0 LAUNCHED
**Milestone:** CW's 123rd birthday — LIVE

> Pull up a chair. He's listening.

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

### What's Experimental
- "Size This Up" feature (new, gathering feedback)

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
| AI | Anthropic Haiku | claude-haiku-4-5-latest for conversations |
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
├── index.html           # Main chat interface
├── story.html           # The Story page (4 chapters)
├── about.html           # CW Strategies page
├── derek.html           # /derek professional bio
├── the-cw-standard.html # The 5 principles
├── privacy.html         # Privacy policy
├── terms.html           # Terms of use
├── css/                 # Stylesheets
├── js/
│   └── chat-prompts-artifact.js  # Stage-based prompt chips
├── images/
│   └── cw-family.png    # Family photo
├── netlify/
│   └── functions/
│       └── cw.js        # THE system prompt + API logic
├── docs/                # Gitignored working docs
├── CW-Strategies/       # Heritage content, frameworks
└── SESSION_CLOSEOUT.md  # Session history (check first!)
```

---

## Key Files

| File | What It Does | Gotchas |
|------|--------------|---------|
| `netlify/functions/cw.js` | System prompt + Anthropic API | **CW's personality lives here** — line 74+ |
| `index.html` | Chat interface + About modal | Modal content at bottom of file |
| `story.html` | The Story page | Noto Serif, progress bar, print styles |
| `js/chat-prompts-artifact.js` | Prompt chips | Changes by conversation stage |
| `SESSION_CLOSEOUT.md` | Session history | **Check this first each session** |
| `docs/STORY-PAGE-FINAL.md` | Editable story content | Gitignored — stays local |

---

## Known Gotchas

### System Prompt Location
CW's entire personality is in `netlify/functions/cw.js` starting at line 74. The `SYSTEM_PROMPT` constant is ~200 lines. Changes there affect everything CW says.

### Haiku vs Opus
- **Haiku** — Runs in production for user conversations (fast, cheap)
- **Opus** — Used in Claude Code for building (this conversation)
- Don't mix them up. Haiku can't do complex architecture. Opus is overkill for chat.

### docs/ Folder
The `docs/` folder is gitignored. Files there stay local for editing (like STORY-PAGE-FINAL.md). Don't expect them to deploy.

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
cd /Users/dereksimmons/Desktop/claudewill.io
claude
```

Then say: "cw" or provide more context ("cw - ready to work on X")

### Resuming Context
If context runs out, Claude Code can resume from stored conversations. The `/continue` command may help, or just start fresh with SESSION_CLOSEOUT.md as context.

### SESSION_CLOSEOUT.md Workflow
1. **Start of session** — Read SESSION_CLOSEOUT.md to see what's done
2. **During session** — Work normally
3. **End of session** — Update SESSION_CLOSEOUT.md with what was completed

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
- `SUPABASE_SERVICE_ROLE_KEY` (preferred) or `SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

---

## Roadmap

### Queued Work
| Item | Target | Notes |
|------|--------|-------|
| Information Architecture | 2 weeks | Nav hierarchy, "The Stable" concept |
| Founder's Story | Feb 7, 2026 | Derek's 53rd birthday |
| Technical deep dive | TBD | How CW's Porch was built |
| Email setup | TBD | Separate work/personal email; ImprovMX for @claudewill.io forwarding |
| bob.claudewill.io | TBD | BOB subdomain |
| coach.claudewill.io | TBD | Coach D persona |
| dawn.claudewill.io | TBD | Dawn's writing assistant |

### Post-MVP Ideas (see WISHLIST.md)
- Family Mode (richer genealogy for family members)
- Vernie agent (family historian)
- Voice interface
- Session memory

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

### January 20, 2026 — Model Upgrade
- Upgraded from Claude Haiku 3.5 to Claude Haiku 4.5 (claude-haiku-4-5-latest)
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

**Haiku model:** claude-haiku-4-5-latest
**Opus model:** claude-opus-4-5-20251101 (Claude Code)

**Cost:** ~$3-5/month (Netlify free, Supabase free, Haiku API)

---

*"I'll swap stories once I know what brought you here. What do you need?"* — CW
