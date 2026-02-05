# HANDOFF — claudewill.io

**Last session:** February 5, 2026
**Next session:** —

---

## February 5, 2026

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

**Deploy status:**
- Pushed and verified: strategies page, derek page, CW chatbot all working
- CW health confirmed: 10.5K input tokens, responding in character
- Prompt compiles to 41,494 chars

**Prompt changes:**
- `cw-prompt/derek.md` — added methodology section, voice DNA, differentiator language
- `cw-prompt/index.js` — now tries compiled-prompt.js first, falls back to dynamic reading

**Open items:**
- [ ] Founder's Package (target: Feb 7 — Derek's birthday)
- [ ] Information Architecture / "The Stable" nav hierarchy
- [ ] TRACKER.md not yet created — run `/tracker add` to start
- [ ] Update CLAUDE.md session workflow to reference skills instead of SESSION_CLOSEOUT.md

**This week:**
- Feb 7 is Derek's 53rd birthday / Founder's Package launch target
- Skills framework operational — start using standup → work → eod rhythm

---
