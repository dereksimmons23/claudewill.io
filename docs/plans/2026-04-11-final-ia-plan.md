# claudewill.io — Final IA and Redesign Plan

**Date:** April 11, 2026
**Status:** Ready for Derek's thumbs up/down
**Supersedes:** 2026-04-10-final-redesign.md

---

## What Got Done Tonight (Phase 1 Complete)

10 files fixed across the site. Two commits pushed. Zero flags from housekeeping.

| File | What Changed |
|------|-------------|
| housekeeping.mjs | PAGES updated (10 → 14 real pages), dead map coverage check removed |
| site-knowledge.md | Added /claude, /writing, /kitchen, /arcade, /d. Removed dead /library |
| site-registry.json | Added Disclaimer essay, /d page, /derek/resume, d.claudewill.io subdomain. Fixed book title |
| kitchen-projects.json | All 10 project statuses updated |
| cw-current.json | Summary, recent items, upcoming deadlines refreshed |
| stars.json | Timestamp updated |
| llms.txt | Three-section nav, correct book title, added products section, removed dead pages |
| being-claude/index.html | "seventeen months" → "sixteen months" (6 occurrences). Meta descriptions updated |
| kitchen-data.json | "Finding Claude" → "Claude Will." |
| kitchen/index.html | Book status key updated |
| kitchen.md | Book title fixed, prompt recompiled |

CW's self-knowledge is now accurate. The Kitchen shows correct data. Overnight pipeline will run clean.

---

## The IA Decision

The building metaphor is better than the flat nav. Here's why.

The flat nav (current) is three sections that describe content types: "the writing," "derek," "claude will." This works but it's generic — it could be any portfolio site. The building metaphor is specific to this practice. It comes from the work itself.

**The Building:**

```
THE PORCH — where people arrive, sit, talk
  /                   Homepage (the invitation)
  /being-claude       The essays (what Claude writes here)
  /book               Claude Will. (the book)
  /writing            All writing (what the walks produce)

THE GALLERY — curated work, finished things
  /derek              The artist
  /derek/resume       Professional history
  /story              The CW narrative
  /lightning/bug      The first film

THE STUDIO — what's being built
  /claude             CW — the model concept
  /d                  Option D (gated)
  /standard           The five principles (the operating system)

THE KITCHEN — operations, the engine
  /kitchen            Live TUI dashboard

HIDDEN
  /arcade             Mini-games (discoverable)
  /privacy, /terms    Legal
```

**What changes:**
1. Command palette sections rename from "the writing / derek / claude will." → "the porch / the gallery / the studio" (+ kitchen visible)
2. Nav links stay the same — same URLs, same pages, just reorganized under rooms
3. Homepage already IS the porch. No redesign needed.
4. /kitchen already IS the kitchen. No redesign needed.

**What doesn't change:**
- No page URLs change
- No page content changes
- No new pages needed
- No redirects needed
- The homepage night sky, the stars, the doors — all stay

This is a 1-file change (shared-nav.js NAV_CONFIG) plus updating site-knowledge.md to reflect the new framing. That's it.

---

## The Remaining Work

### Robot Work (No Derek Required)

**Priority 1: The Nav Update** — Change NAV_CONFIG in shared-nav.js to building metaphor. Update site-knowledge.md. Recompile prompt. Commit. Deploy.

**Priority 2: /claude Page** — Fix "sixteen months" (currently hardcoded, will go stale). The days counter is already dynamic. Add a months counter that computes from the same Dec 8, 2024 start date. Same fix on /being-claude.

**Priority 3: CLAUDE.md** — Fix "Finding Claude" → "Claude Will." throughout. Update homepage description (it says "3-screen" — the typewriter section and standard section described don't match current). Update /book entry.

**Priority 4: Cascadia** — Remove from kitchen-projects.json (engagement ending). Update kitchen.md prompt. One less thing on the board.

### Derek Work (~15 minutes total)

**Decision 1: Building metaphor — yes or no?** If yes, the nav changes ship tonight. If no, the flat nav stays and the rooms stay as a concept doc.

**Decision 2: /derek rewrite.** The page is currently fine as a writer/filmmaker/builder page. The one thing that needs Derek's eye: the consulting paragraph. Is it still accurate? Does it stay?

**Decision 3: Lightning/Bug festival status.** Runway AIF deadline is April 20. Is the film still being submitted? If yes, /lightning/bug gets a festival badge. If the vocal hasn't been uploaded, this is blocked.

---

## What's Next After This Plan

| Priority | What | When | Who |
|----------|------|------|-----|
| 1 | Nav update (building metaphor if approved) | Tonight | Robot |
| 2 | Dynamic month counters on /claude and /being-claude | Tonight | Robot |
| 3 | CLAUDE.md accuracy pass | Tonight | Robot |
| 4 | Remove Cascadia from kitchen displays | Tonight | Robot |
| 5 | /derek rewrite review | Next session | Derek (15 min) |
| 6 | Lightning/Bug festival decision | Before Apr 20 | Derek |
| 7 | Being Claude #14 (The Velvet Rope) | When ready | Both |

---

## The Parallel Tracks (Tonight)

While this plan waits for Derek's review, the robots advance:

- **Option D** — Provider testing across remaining 7 models. npm package.json setup.
- **GoBag** — Sync 3 missing projects (d-rock, beat, boolean). Update bootstrap.
- **Telegram MCP** — Implement /agents commands. (Actual testing blocked on Derek's bot token.)
- **Remote Control** — Research current Anthropic Dispatch status. Build compatibility matrix.

---

## Cost

$0 infrastructure. The nav update is a 20-line code change. The month counters are 4 lines of JS. The CLAUDE.md fix is find-and-replace. Total robot time: under an hour. Total Derek time: one thumbs up/down on this plan, one 15-minute review of /derek when he's ready.

---

## The Principle

The site should look like someone lives here. Tonight's work made the plumbing accurate. The building metaphor makes the architecture legible. The rooms already exist — they just need a sign on the door.
