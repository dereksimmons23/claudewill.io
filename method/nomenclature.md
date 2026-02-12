# CW Strategies Nomenclature

Three decisions that govern what everything is called.

---

## 1. Tools and Skills Are Different Things

**Tools** = what CW offers visitors on the Porch (conversation features)
- Size This Up, The Trade, Liberation Gravy, The Funnel Cake, Recalibrate

**Skills** = what Derek runs in Claude Code (workflow commands)
- /standup, /eod, /tracker, /status, /housekeeping, /publish, /brief

Tools live in `cw-prompt/tools/`. Skills live in `.claude/skills/`.

---

## 2. One Name Per Thing

| Instead of | Say |
|-----------|-----|
| CW's Porch / claudewill.io / the mothership | **claudewill.io** (the site) or **CW's Porch** (the chat) |
| /eod + /handoff | **/eod** (one skill, end of session) |
| HANDOFF.md / current-state.md | **HANDOFF.md** (everywhere) |
| overnight workers / workers / automation | **workers** (async tasks, Cloudflare Workers) |
| The Stable / apps / products / Active Products | **The Stable** (public) or **apps/** (folder) |
| The Loop / Session Loop / Core Loop | See #3 |

---

## 3. Method, Session, Chat

Three layers. No overlap.

```
┌─────────────────────────────────────────────────┐
│                    METHOD                        │
│          How you think about work.               │
│         Start. Work. Finish. Decide.             │
│                                                  │
│   ┌─────────────────────────────────────────┐    │
│   │              SESSION                     │   │
│   │        What you do each day.             │   │
│   │       Standup. Work. /eod.               │   │
│   │                                          │   │
│   │   ┌─────────────────────────────────┐    │   │
│   │   │            CHAT                  │   │   │
│   │   │     Where the work happens.      │   │   │
│   │   │    Derek + Claude, working.      │   │   │
│   │   └─────────────────────────────────┘    │   │
│   └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

**Method** = the thinking framework. Start (know where you are), Work (do it together), Finish (leave it clean), Decide (look from multiple angles via the crew). Governed by the CW Standard. Lives in `method/`.

**Session** = the daily practice. Open with /standup, do the work, close with /eod. Each session reads HANDOFF.md to pick up where you left off. Every project follows this pattern.

**Chat** = a conversation between Derek and Claude where the actual work gets done. That's it.

### What's killed

| Dead term | Why |
|-----------|-----|
| The Loop | Too vague. Say "the method." |
| The Core Loop | Same thing, different project. Dead. |
| Session Loop | Just "the session." |
| Pair processing | It's a chat. |
| The dance | It's a chat about creative work. |
| Stay in the room | A principle, not a named thing. |
| The mothership | claudewill.io has a name already. |
| Overnight workers | They're workers. They run async. |
| /handoff (skill) | Absorbed by /eod. |

---

## The Full Picture

```
CW Strategies
│
├── The Method (how you think)
│   ├── Start ─── Read. Check. Pick. Say.
│   ├── Work ──── Chat with Claude. Get it done.
│   ├── Finish ── What happened. What's decided. What's next.
│   └── Decide ── The Crew (Earn, Connect, Sharpen, Challenge)
│
├── The Session (what you do)
│   ├── /standup ─ Open. Read HANDOFF.md. Set priorities.
│   ├── work ──── Chats. Skills. Tools. Builds.
│   └── /eod ──── Close. Update HANDOFF.md. Queue tomorrow.
│
├── The Site (claudewill.io)
│   ├── CW's Porch ─── The chat (index.html)
│   ├── /derek ──────── Personal homepage
│   ├── /strategies ─── Consulting
│   ├── /stable ─────── The Stable (products)
│   └── subdomains ──── bob, coach, dawn, d-rock
│
├── The Stable (products)
│   ├── BOB ──────── Battle o' Brackets
│   ├── Coach D ──── Basketball fieldhouse
│   ├── Hancock ──── AI storyteller
│   ├── D-Rock ───── AI DJ
│   └── Dawn ─────── Health challenge
│
├── The Work (earning)
│   └── CDN ─────── Cascadia Daily News ($10K/month)
│
├── The CW Standard (five principles)
│   ├── Truth over comfort
│   ├── Usefulness over purity
│   ├── Transparency over reputation
│   ├── People over systems
│   └── Agency over ideology
│
├── Tools (CW conversation features)
│   ├── Size This Up
│   ├── The Trade
│   ├── Liberation Gravy
│   ├── The Funnel Cake
│   └── Recalibrate
│
├── Skills (Claude Code workflows)
│   ├── /standup, /eod ─── Session bookends
│   ├── /tracker ────────── Work tracking
│   ├── /status ─────────── Health check
│   ├── /housekeeping ───── Repo hygiene
│   ├── /publish ────────── Content distribution
│   └── /brief ──────────── Morning analytics
│
├── Workers (async tasks)
│   └── Hancock heartbeat (Cloudflare Worker + cron)
│
└── The Crew (decision lenses)
    ├── /earn ────── Business: revenue, ROI
    ├── /connect ─── Cross-project: patterns, synergies
    ├── /sharpen ─── Quality: voice, CW Standard
    └── /challenge ─ Pushback: simplify, question
```

---

## Where Things Live

| What | Where |
|------|-------|
| Method docs | `~/Desktop/claudewill.io/method/` |
| Content structure | `~/Desktop/claudewill.io/method/content-structure.md` |
| Content calendar | `~/Desktop/claudewill.io/method/content-calendar.md` |
| CW Standard | Everywhere (governs all projects) |
| Tools (CW features) | `claudewill.io/netlify/functions/cw-prompt/tools/` |
| Skills (workflows) | `.claude/skills/` per project |
| Crew commands | `~/.claude/commands/` (global) |
| Session state | `HANDOFF.md` at every project root |
| Project identity | `CLAUDE.md` at every project root |
| LinkedIn content | `claudewill.io/docs/drafts/linkedin/` → `docs/published/linkedin/` |
| Substack content | `writing/content/Standard-Correspondence/` |

## Folder Names

All lowercase. Short. No redundant suffixes.

| Folder | What |
|--------|------|
| `cdn` | Cascadia Daily News client work |
| `claudewill.io` | CW Strategies engine + CW's Porch |
| `apps/` | Products container (The Stable) |
| `writing` | Substack + manuscripts (personal voice) |
| `method` | The methodology (the lambo) |

---

*Established February 6, 2026. Derek's birthday eve.*
*Three decisions. One map. Everything has one name.*
