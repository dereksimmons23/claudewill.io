# Parking Lot — claudewill.io

**Last updated:** February 10, 2026

Ideas that aren't tied to a session. They sit here until we build them, queue them, or kill them.

---

## Raw Ideas (just dumped, needs shaping)

### CMS in Reverse — Automation
The drafts → post → track → commit workflow has too many manual steps. "Write it, post it, done" is the goal. Currently: write in docs/drafts, copy to platform, move to published, update TRACKER.md, commit. That's 5 steps for one post. Needs to get closer to 2.

### AI Editor Agent
A skill or agent that edits generative text from other AI agents. Quality control layer between AI output and publishing. Could be a Claude Code skill. Could be a standalone tool. The question: is this a CW Strategies product, a personal workflow tool, or both?

### Dev Server / Brand Playground
BOB has a dev server built into the site — good for iterating on branding, layouts, visual identity without touching production. Build something similar on The Stable for the asterisk mark, OG images, page layouts, visual experiments.

### Mirae + EA Concept
Executive assistant concept for the site. Potentially useful but also potentially feature bloat. Needs a scope decision: is Mirae a widget, a page, a mode, or a product? What does "EA" actually mean for a visitor vs. for Derek?

---

## Under Evaluation (thinking about it, needs more shape)

### Vernie Mode
Access code via text. Family history collection. Warmth-first posture. Derek texts the code directly — "If they know me, they have my phone number." Family-archive.md is the data source. Frontend gate needed. Randall Koutz is the first user when he comes back.
**Status:** Concept clear, not built. Blocked on: frontend access code pattern.

### Asterisk Brand Mark
The asterisk (asteriskos, "little star") as CW's brand mark. Birth notation in typography. See `docs/drafts/brand-asterisk.md` for full notes. Needs: typeface decision, placement decision, whether it replaces or supplements current visual identity.
**Status:** Research done, design not started.

### Visual Identity
Site is almost all text. Needs OG images, illustrations, visual energy. The asterisk work feeds into this. derek-profile-illo.png exists but is underused. LinkedIn thumbnails (about-derek.png, cw-strategies-how.png, the-stable.png) are committed but not on the site.
**Status:** Ongoing gap. No single fix — needs a design pass.

### Product Hunt / Platform Launches
CW's Porch and The Stable are launchable products. Product Hunt, Hacker News, Reddit. Draft launch posts exist in docs/drafts/linkedin/. Need: launch timing, which product to lead with, what the "Show HN" angle is.
**Status:** Drafts exist. Strategy not decided.

### Analytics Dashboard
Visual dashboard for conversation insights instead of raw SQL queries. CW Brief worker covers some of this via Slack, but no visual UI.
**Status:** Low priority while traffic is low.

### Session Memory
Remember returning visitors across sessions. Parked — CW is a porch conversation, not a daily assistant. May revisit for Family Mode / Vernie Mode.
**Status:** Parked. Revisit when Vernie Mode ships.

### Multi-Agent Family
CW for practical advice. Vernie for family history. Others TBD. Related to Vernie Mode but bigger scope.
**Status:** Parked until Vernie Mode proves the concept.

### CW Standard as Framework
Package the five principles into a reusable framework for other AI implementations. Could be a product, could be open source, could be a consulting deliverable.
**Status:** Idea. No urgency.

### Voice Interface (CW)
Let people talk to CW instead of typing on the Porch. Phase 4 of voice roadmap (after Derek voice on /derek, CW voice on /story, Mirae widget).
**Status:** Parked. Cost model unclear at scale.

---

## Queued (decided yes, waiting for the right time)

### CW Strategies Positioning Rewrite
"Builder, not consultant" language needs to flow through all copy — strategies page body text is partially done (tagline updated Feb 10), but derek.html, llms.txt, and other references still say "consulting practice" or "fractional COO."
**Status:** In progress. Strategies page updated. Others pending.

### Reddit Strategy
u/cwStrategies needs karma before posting links. Comment on other posts first. Too new to post links directly — spam filter blocks them.
**Status:** Queued. Needs regular Reddit participation, not a one-time fix.

### Google Search Console
Property added, verified, sitemap submitted Feb 10. Now wait for data and monitor.
**Status:** Done — monitor.

### LinkedIn Company Slug Fix
`/cw-stategies` (missing the 'r'). LinkedIn won't let you change it until ~30 days after creation. Target: early March 2026.
**Status:** Waiting. Calendar reminder.

---

## Killed (decided no, and why)

### Standalone Recalibrate PWA
Original concept was a standalone progressive web app for career recalibration. Killed — the 7-question flow works better as a CW conversation tool and a Claude Code skill. No need for a separate app.

### Overnight Workers (Q1)
Automated background processes running overnight. Deferred to Q2. The CW Brief worker covers the most important use case (daily analytics). Everything else can wait.

---

*This is not a roadmap. This is where ideas wait until they earn a spot on one.*
