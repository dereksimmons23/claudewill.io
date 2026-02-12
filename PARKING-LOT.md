# Parking Lot — claudewill.io

**Last updated:** February 11, 2026

Ideas that aren't tied to a session. They sit here until we build them, queue them, or kill them.

---

## Raw Ideas (just dumped, needs shaping)

### CMS in Reverse — Content Library on claudewill.io
claudewill.io should be the canonical home for all content. Every piece lives here first (SEO, domain authority), then gets syndicated to Substack (email), LinkedIn (network), Reddit (community). Typefully ($12.50/month) for distribution scheduling when volume hits 3x/week.

**Architecture decisions (Feb 12):**
- Content library is NOT a new top-level URL — too many slashes already
- Likely lives under /derek (his thinking, his writing) but exact structure TBD
- /the-cw-standard should shorten to /standard (every URL = /oneword)
- Existing identity pages (/story, /derek, /strategies) stay as-is — they're not articles
- /stable stays as product portfolio — content is thinking, not products
- Markdown → HTML build step (like compile-prompt.js) to convert .md files to site pages
- Netlify redirect from /the-cw-standard → /standard so existing links don't break

**Open question:** What's the right relationship between /derek and the content? Not fully resolved. Conversation for another session.

**Status:** Architecture in progress. Not building yet. `/publish` handles generation at ecosystem level. Paste-and-go for now.

### AI Editor Agent
A skill or agent that edits generative text from other AI agents. Quality control layer between AI output and publishing. Could be a Claude Code skill. Could be a standalone tool. The question: is this a CW Strategies product, a personal workflow tool, or both?

### Dev Server / Brand Playground
BOB has a dev server built into the site — good for iterating on branding, layouts, visual identity without touching production. Build something similar on The Stable for the asterisk mark, OG images, page layouts, visual experiments.

### Mirae + EA Concept
Executive assistant concept for the site. Potentially useful but also potentially feature bloat. Needs a scope decision: is Mirae a widget, a page, a mode, or a product? What does "EA" actually mean for a visitor vs. for Derek?

---

## Under Evaluation (thinking about it, needs more shape)

### ~~Vernie Mode~~ — SHIPPED (Feb 11)
Built and deployed. Shared family code, "Family?" link in footer, server-side validation, separate `family_conversations` Supabase table, warmer CW posture with `vernie-mode.md` overlay. Needs: `VERNIE_CODE` env var set in Netlify, then text Randall the code.
**Status:** Shipped. Pending activation (env var).

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
Remember returning visitors across sessions. Parked — CW is a porch conversation, not a daily assistant. Vernie Mode shipped (Feb 11) — family visitors now get a warmer CW, but no cross-session memory yet.
**Status:** Parked. Vernie Mode shipped — revisit if family wants continuity between visits.

### Multi-Agent Family
CW for practical advice. Vernie for family history. Others TBD. Vernie Mode shipped (Feb 11) — CW in family mode, not a separate Vernie agent yet. This is the next step if family usage proves the concept.
**Status:** Parked. Watch family usage first.

### CW Standard as Framework
Package the five principles into a reusable framework for other AI implementations. Could be a product, could be open source, could be a consulting deliverable.
**Status:** Idea. No urgency.

### Voice Interface (CW)
Let people talk to CW instead of typing on the Porch. Phase 4 of voice roadmap (after Derek voice on /derek, CW voice on /story, Mirae widget).
**Status:** Parked. Cost model unclear at scale.

---

## Queued (decided yes, waiting for the right time)

### ~~CW Strategies Positioning Rewrite~~ — DONE (Feb 11)
Builder language now consistent across strategies.html, derek.html, llms.txt, and LinkedIn company page. All "consultant/coaching/fractional COO" language replaced with "builds operational infrastructure."
**Status:** Complete.

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
