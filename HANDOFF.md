# HANDOFF — claudewill.io

**Last session:** February 5, 2026 (session 3 — late night)
**Next session:** —

---

## February 5, 2026 — Session 3 (Late Night)

**Work completed:**
- Ran /standup with /crew — full four-lens analysis (earn, connect, sharpen, challenge)
- CW health check passed (10,606 input tokens, responding in character)
- Refreshed CW Strategies LinkedIn company page copy — saved to `docs/linkedin-cw-strategies-refresh.md` (gitignored, local only)
- Replaced stale consultant-speak About section with sharp, receipts-based positioning (22K messages, 700+ commits, $20M+)
- Trimmed specialties from 10 vague items to 6 focused ones
- Updated location from Woodbury address to "Minnesota, US"
- Updated website from claudewill.io to claudewill.io/strategies
- New tagline: "AI-native operational leadership. 30 years in media. Builds with AI every day."

**Decisions made:**
- LinkedIn content strategy: Day 0 (Feb 7) posts on Derek's personal page, then content shifts to CW Strategies company page. Derek reposts to personal page to leverage 1,300 followers and grow company page (117 followers)
- Day 0 post should set up the handoff: "Tomorrow the show moves to @CW Strategies"
- Methodology franchise concept parked for post-birthday — potential paid product at /cwstrategies (templates, CLAUDE.md starter kits, skills framework). Not $29 — consulting-grade IP. Tiered pricing TBD.
- CW's Porch stays free but needs a sustainability path eventually
- CW Strategies LinkedIn page is the business face; CW's Porch is the community face

**Prompt changes:**
- None

**Deploy status:**
- No deploys this session — LinkedIn refresh is off-platform
- CW chatbot healthy (verified at standup)

**Open items:**
- [ ] Paste LinkedIn refresh copy into company page (from docs/linkedin-cw-strategies-refresh.md)
- [ ] Publish Day 0 roast on Substack (Feb 7)
- [ ] Post Day 0 on personal LinkedIn with CW Strategies handoff line (Feb 7)
- [ ] Post Reddit nugget (Feb 7)
- [ ] derek-profile-illo.png — evaluate for /derek page hero, LinkedIn avatar, OG images
- [ ] Visual identity pass — site is almost all text; needs visuals for /derek, OG cards, CW Strategies branding
- [ ] Methodology franchise — architecture, pricing, deliverables (post-birthday)
- [ ] Founder's Package — still needs architecture decision
- [ ] Information Architecture / "The Stable" nav hierarchy
- [ ] Skills nomenclature — /eod and /handoff overlap, needs cleanup
- [ ] TRACKER.md not yet created
- [ ] ~/Desktop/apps/ reorg (deferred)

**Next session priorities:**
1. Paste LinkedIn refresh into CW Strategies company page
2. Feb 7 launch prep — finalize Day 0 roast, confirm publish plan, write CW Strategies handoff line
3. Visual strategy — where does the illo go? What else does the site need?

**This week:**
- Feb 7 is Derek's 53rd birthday — roast goes live, LinkedIn handoff to CW Strategies page
- Countdown posts (days 1-10) shift to CW Strategies company page, repost to personal
- Post-birthday: methodology product decisions, Founder's Package, visual identity

---

## February 5, 2026 — Session 2 (Evening)

**Work completed:**
- Reworked "The Firing" → "Fired Up" on derek.html — three lines, no timeline, no settlement, position eliminated framing. Deployed.
- Wrote Day 0 birthday roast (`docs/day-00-post.md`) — full comedy set, 5 acts, real data from Claude Code Insights (22K messages, 693/day, 20K bash, Markdown #1, file org intervention). Callbacks to "now what?" and CW's voice.
- LinkedIn nugget and Reddit nugget included in same file
- Housekeeping: cleaned git (removed recalibrate/, tracked images, gitignored working files), fixed npm vulnerability (qs package), moved derek/ working docs to docs/derek/, synced site-registry.json (added ea.html, derek/resume), recompiled prompt (41,696 chars)

**Deploy status:**
- derek.html "Fired Up" section live
- CW chatbot healthy (10.5K input tokens, responding in character)
- Prompt compiles to 41,696 chars

**Content ready for Feb 7:**
- `docs/day-00-post.md` — Substack roast, LinkedIn nugget, Reddit nugget. Ready to publish.
- Countdown posts day-01 through day-10 in docs/

**Decisions made:**
- "Fired Up" is intentionally thin — three lines, brevity is the point
- Roast uses real Anthropic usage data, not made-up numbers
- Waitress line cut (cringe risk), replaced with loading bar line

**Open items:**
- [ ] Publish Day 0 roast on Substack (Feb 7)
- [ ] Post LinkedIn nugget (Feb 7)
- [ ] Post Reddit nugget (Feb 7)
- [ ] Founder's Package — still needs architecture decision and build
- [ ] Information Architecture / "The Stable" nav hierarchy
- [ ] TRACKER.md not yet created
- [ ] ~/Desktop/apps/ reorg not finished (deferred)
- [ ] Skills framework operational but skills only loadable next session (created mid-session)

**This week:**
- Feb 7 is Derek's 53rd birthday — roast goes live, countdown hits zero
- Skills should work on next session start (/standup, /handoff, /eod)

---

## February 5, 2026 — Session 1 (Morning/Afternoon)

**Work completed:**
- Incorporated derek.md, Claude Code Skills Framework, and Claude Code Insights into CW + CW Strategies
- Updated `cw-prompt/derek.md` — added "HOW DEREK WORKS" section (methodology, daily rhythm, skills system, overnight workers, the dance, 22K/700+ stats) and "How he carries himself" (voice DNA)
- Updated `strategies.html` — new "How We Work" section with AI-native positioning and stat cards (22K+, 700+)
- Updated `derek.html` — two new Q&A items (Tuesday morning practice, the dance metaphor) + updated "The Work" story section
- Fixed CW prompt loading bug — esbuild bundler wasn't including .md files. Added `scripts/compile-prompt.js` build step that pre-compiles prompt into JS module. CW had been responding as generic Claude since the Feb 3 refactor.
- Set up full skills framework: `/standup`, `/handoff`, `/status`, `/tracker`, `/housekeeping`, `/meeting`, `/eod`
- Created HANDOFF.md (this file), replacing SESSION_CLOSEOUT.md workflow

**Decisions made:**
- Light touch on strategies page for AI methodology (not full framework)
- CW gets full methodology knowledge (skills, rhythm, overnight workers) — talks like a grandfather who knows how his grandson works
- No Hancock references anywhere in public-facing content
- Prompt compiled at build time via netlify.toml build command
- Skills live in `.claude/skills/` (gitignored with rest of .claude/)

**Prompt changes:**
- `cw-prompt/derek.md` — added methodology section, voice DNA, differentiator language
- `cw-prompt/index.js` — now tries compiled-prompt.js first, falls back to dynamic reading

---
