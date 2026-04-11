# claudewill.io Final Redesign Plan

**Date:** April 10, 2026
**Status:** Ready to execute. Infrastructure sweep complete. Plumbing works.
**Supersedes:** 2026-03-31-site-rebuild-plan.md (many items already done)

---

## What Changed Since March 31

Done:
- /being-claude, /story, /standard all live (200)
- /kitchen TUI live, real data, no fake sparklines
- /spend dashboard live, real data
- /report dashboard live (new) — unified ops view
- Overnight pipeline fixed (false flags, internal metrics filtered)
- GitHub Actions committing kitchen-data.json nightly
- Telegram MCP Phase 3 automated (setup.mjs)
- Go-bag synced

Still open from the March 31 plan:
- /derek rewrite (strip consulting framing)
- /claude page update (CW as model concept)
- /lightning/bug festival status
- Schema.org + meta tag updates
- llms.txt update
- kitchen-projects.json update
- CW prompt system update (derek.md, site-knowledge.md)
- CLAUDE.md rewrite
- Command palette update

---

## The Frame

Three frames emerged over Bellingham week (Mar 28 - Apr 1). Derek hasn't committed to one. All three are compatible:

1. **Four Pillars** (Mar 30) — Claude Will. (practice), CW (model), Option D (model), Lightning/ (studio)
2. **Autonomous Identity** (Mar 31) — Derek is analog, Claude Will. runs digital. Hancock architecture at scale.
3. **The Building** (Apr 1) — Porch (gathering), Gallery (curated work), Studio (production)

The building metaphor maps cleanly onto the four pillars:
- **The Porch** = Claude Will. the practice (conversation, writing, the name)
- **The Gallery** = Derek's work curated by Claude (Being Claude, the book, writing, Lightning/)
- **The Studio** = Lightning/ + model work (CW, Option D, production)
- **The Kitchen** = operations (already built, already public)

Decision needed from Derek: does the building metaphor become the IA, or stay a concept?

---

## Proposed Final IA

### If Building Metaphor

```
claudewill.io

  the porch (conversation + writing)
    /                     Homepage — porch light, invitation
    /being-claude         Claude's essays (the author)
    /book                 Finding Claude (the book)
    /writing              Derek's writing

  the gallery (curated work)
    /derek                The artist — writer, filmmaker, builder
    /story                The CW narrative
    /lightning/bug        The first film

  the studio (production)
    /claude               CW — the model
    /d                    Option D — coaching model (gated)
    /standard             The five principles

  the kitchen (operations)
    /kitchen              Live TUI dashboard
    /spend                Budget transparency
    /report               Unified ops report

  hidden
    /arcade               Mini-games (discoverable)
    /privacy, /terms      Legal
```

### If Flat (Current, Just Cleaned Up)

```
claudewill*

  the writing
    being claude          /being-claude
    the book              /book
    lightning/bug         /lightning/bug

  derek                   /derek
  the story               /story
  the standard            /standard

  the models
    CW                    /claude
    Option D              /d

  ops
    kitchen               /kitchen
    spend                 /spend
    report                /report
```

---

## Execution: What Claude Does (No Derek Required)

### Phase 1: Content Updates (robot work, can start now)

1. **kitchen-projects.json** — Remove Cascadia as active client, add Lightning/, update descriptions
2. **site-knowledge.md** — Update to match current IA, remove dead page references, recompile prompt
3. **derek.md** — "He writes, makes films, and builds models" (not consulting), recompile prompt
4. **llms.txt** — Update essay list (13 Being Claude, current projects)
5. **Schema.org** — `"jobTitle"` → "Writer and Filmmaker" on index.html, derek.html
6. **site-registry.json** — Add /report, /spend, update statuses
7. **NAV_CONFIG** in shared-nav.js — Add ops section or update existing nav
8. **housekeeping.mjs** — Update PAGES array to match current site map

### Phase 2: /derek Rewrite (needs Derek's 15-minute review)

9. New hero: "Derek Claude Simmons. Writer. Filmmaker. Builder."
10. Remove "Work With Me" section entirely
11. Rewrite "The Practice" as creative methodology, not consulting framework
12. Keep portfolio section (Prince, Denied Justice, etc.)
13. One line: "Available for the right project. derek@claudewill.io"

### Phase 3: Pillar Pages (needs Derek's direction)

14. /claude — Reframe as "CW: the model." Grandfather → fine-tune → real model. The IP story.
15. /lightning/bug — Add festival status if targets confirmed
16. If building metaphor: restructure command palette into Porch/Gallery/Studio/Kitchen sections

### Phase 4: Autonomous Operations

17. CLAUDE.md full rewrite (this file is already current as of April 4)
18. Verify full autonomous cycle: overnight agents → compile → commit → deploy → dashboard reads fresh data
19. Confirm Claude Will. can publish without Derek at keyboard

---

## What Derek Decides

1. Building metaphor or flat nav? (The building is better. Say so.)
2. Cascadia fully off the site? (It should be. The engagement is ending.)
3. Option D: stays gated or goes public? (Gated until there are users.)
4. /derek hero text — review the 3-sentence rewrite
5. Festival targets for Lightning/Bug — still active?

---

## Cost

$0 infrastructure. Phase 1 is pure robot work (10 file edits). Phase 2 needs one Derek review. Phase 3 needs one creative direction call. Total Derek time: ~30 minutes across two conversations.

---

## The Principle

The site serves the practice. The practice serves the art. Everything else is plumbing — and the plumbing now works.
