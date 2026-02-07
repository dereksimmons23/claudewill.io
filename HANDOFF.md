# HANDOFF — claudewill.io

**Last session:** February 6, 2026 (nomenclature consolidation)
**Next session:** February 7, 2026 (BIRTHDAY — launch day)

---

## February 6, 2026 — Nomenclature Consolidation (Cross-Ecosystem)

**This session ran from `~/` (home level). Changes touched claudewill.io, CDN-Project, writing-practice, and how-to.**

**Work completed:**
- Universal nomenclature sweep across all 9+ projects (~500 named things inventoried)
- Three governing decisions made and documented in `~/Desktop/how-to/nomenclature.md`:
  1. **Tools and skills are different.** Tools = CW conversation features (in `cw-prompt/tools/`). Skills = Claude Code workflows (in `.claude/skills/`).
  2. **One name per thing.** /eod absorbs /handoff. HANDOFF.md everywhere. Workers (not overnight workers). The Stable (public), apps/ (folder).
  3. **Method, session, chat.** Method = how you think. Session = what you do. Chat = where work happens.
- Renamed `cw-prompt/skills/` → `cw-prompt/tools/` (5 tool files moved)
- Updated index.js and compile-prompt.js to read from tools/
- Recompiled prompt (42,038 chars)
- Updated claudewill.io CLAUDE.md — tools vs skills split, session rhythm, /handoff removed
- Deleted /handoff skill from claudewill.io, CDN-Project, writing-practice
- Created /eod skill for writing-practice (CDN already had one)
- Updated CDN-Project HANDOFF.md — /handoff references → /eod
- Renamed writing-practice `current-state.md` → `HANDOFF.md` across 15+ files
- Updated home-level ~/CLAUDE.md — "The Stable", method/session/chat
- Updated how-to docs — "The Loop" → "The Method", "pair processing" → "the chat"
- Dead terms killed: the loop, the core loop, pair processing, the dance, stay in the room, session loop, the mothership, overnight workers

**Commits:**
- claudewill.io `953b406` — Nomenclature: rename cw-prompt/skills/ to tools/, update references (pushed)
- Home repo `dcc33fb` — CDN: update HANDOFF.md — /handoff absorbed by /eod

**Not in any repo (on disk only):**
- `~/Desktop/how-to/` — nomenclature.md, CLAUDE.md, work.md, start.md edits (no git repo)
- `~/Desktop/writing-practice/` — CLAUDE.md, README, methodology, skill files, HANDOFF.md rename (no git repo)
- `~/CLAUDE.md` — home-level ecosystem doc (untracked)

**Deploy status:**
- Pushed, Netlify rebuilt with tools/ path
- CW prompt recompiled at build (42,038 chars)

**Tomorrow's standup should surface:**
- Nomenclature discipline — decisions made, docs updated, but language needs to get consistent in three places: Desktop (CLAUDE.md files, skills), the site (CW's prompt, page copy), and the chat (how CW talks about things). Not a one-shot fix — ongoing discipline.
- Passengers line — "The prompt becomes the product. The product becomes the proof. The proof is for the passengers." Decide where it goes.

---

## February 6, 2026 — Security Audit (Cross-Ecosystem)

**This session ran from `~/` (home level), not claudewill.io. Changes touched BOB, Hancock, claudewill.io, and Supabase.**

**Work completed:**
- Full security audit across all active CW Strategies projects (BOB, Coach D, Hancock, claudewill.io)
- Supabase RLS: enabled on 5 unprotected tables (intake_submissions, ea_items, ea_pipeline, ea_events, ea_config), added policies to coach_d_conversations
- BOB .gitignore: added .env exclusions to prevent accidental secret commits
- Hancock SESSION_CLOSEOUT.md: redacted Moltbook API key (3 instances in committed file)
- claudewill.io: renamed SUPABASE_SERVICE_ROLE_KEY → SUPABASE_ANON_KEY across 8 files (was mislabeled — value was always the anon key)
- Hancock worker: added X-Worker-Key auth gate on all sensitive endpoints (16 endpoints locked, /health and /submit stay public)
- Hancock .claude/settings.local.json: scrubbed 8 hardcoded Cloudflare API tokens and Moltbook keys from permission entries
- BOB Supabase: restored from pause (was auto-paused Jan 13), verified all 6 tables have RLS enabled
- Hancock skills + ~/.zshrc aliases: updated to pass auth header on worker calls
- Netlify env vars confirmed — already had SUPABASE_ANON_KEY set (functions were using fallback all along)

**Commits:**
- claudewill.io `f3d5c3a` — security: rename SUPABASE_SERVICE_ROLE_KEY to SUPABASE_ANON_KEY (pushed)
- BOB `364afc0` — security: add .env exclusions to .gitignore (pushed)
- Hancock `6977d59` — security: add worker endpoint auth, redact leaked API keys (local only, not on GitHub by design)

**Security posture after fixes:**
- Supabase linter: 0 ERROR, 8 WARN (all expected permissive-policy warnings for anon-access tables)
- All worker endpoints authenticated except /health (monitoring) and /submit (public form)
- No secrets in tracked files across any project
- BOB Supabase restored and healthy

**Not fixed (accepted risk):**
- Moltbook API key in Hancock local git history — repo is local only, never on public GitHub. Moltbook has no key rotation API.
- Hancock worker URL is in docs — mitigated by auth gate

**Deploy status:**
- claudewill.io pushed, Netlify auto-deploying (no disruption — env var already correct)
- BOB pushed
- Hancock worker deployed to Cloudflare (auth verified working)
- CW chatbot healthy (10,739 input tokens, responding in character)

**Next session priorities:**
1. **Publish Day 0 roast on Substack** — draft ready in `docs/day-00-post.md`. Use `/publish` to format.
2. **Post LinkedIn nugget** — roast teaser on personal page, reshare to CW Strategies
3. **Post Reddit nugget** — from same draft file

**Tomorrow is Feb 7 — Derek's 53rd birthday. The roast goes live. Quick session — publish and go live your life.**

---

## February 6, 2026 — Birthday Eve (Late Session)

**Work completed:**
- Restyled terms.html to match site dark theme (privacy.html done earlier)
- Ran /crew — full four-lens business assessment ("the site is beautiful and useless")
- Analyzed Hashimoto's AI adoption journey — mapped to Derek's workflow
- Ran /crew again on agent delegation strategy
- Built Slam Dunk system (Hashimoto Step 4):
  - Created `/publish` skill — draft-to-platform pipeline (Substack, LinkedIn, Reddit, HN)
  - Created `/brief` skill — morning analytics brief (Supabase + content calendar + CW health)
  - Updated `/eod` to prompt for slam dunks at session close
  - Updated `/standup` to surface slam dunks at session open ("say dunk 1 to execute")
- Executed 3 proof-of-concept slam dunks:
  - Fixed visited link color sitewide (all 11 pages + shared-nav.css)
  - Added 2 stat cards to /strategies (5 lanes + 6 AI skills → 6 cards total)
  - Fixed /strategies CTA ("Talk to CW" → "Work with Derek" → /derek/assessment)
- 12 commits, all pushed

**Key insight from /crew:**
- Distribution is the gap, not the website. Traffic: 8 sessions/week, mostly Derek testing.
- Challenge lens: "the site is beautiful and useless" — publish content, find client #2
- All four lenses agreed: Feb 7 content is the priority, then Feb 13 CDN mid-term

**Hashimoto mapping:**
- Derek's CLAUDE.md/HANDOFF.md/Skills system = Hashimoto's "harness" (Step 5)
- Slam dunk queue = Step 4 (outsource confident tasks)
- Derek's role: writing and strategy, not code or selling
- Overnight workers deferred to Q2

**New skills created:**
- `/publish` — format drafts for platform distribution (docs/publish/ output)
- `/brief` — morning analytics + content calendar + CW health

**Deploy status:**
- All site changes live (terms restyle, visited links, stat cards, CTA fix)
- Working tree clean, all pushed
- CW chatbot responding (last conversations Feb 5)

**Open items:**
- [ ] Paste LinkedIn refresh into CW Strategies company page
- [x] ~~Fix /strategies CTA~~ (DONE — "Work with Derek" → /derek/assessment)
- [ ] Publish Day 0 roast on Substack (Feb 7 — TOMORROW)
- [x] ~~Posted reintroduction on both LinkedIn channels~~ (DONE — personal + CW Strategies company page, sets up Feb 7 drops)
- [ ] Post Day 0 LinkedIn nugget (Feb 7 — the roast teaser, separate from reintro)
- [ ] Post Reddit nugget (Feb 7)
- [ ] CDN mid-term prep (Feb 13) — Q2 scope, Plan B
- [ ] Voice layer Phase 1b — resolve third-person issue
- [ ] Voice clone tuning (ElevenLabs settings)
- [ ] Q&A chunk timing improvement
- [ ] derek-profile-illo.png placement
- [ ] Visual identity pass
- [ ] OG images — links need to look credible when shared
- [ ] Case study — CDN or Star Tribune, publish where prospects find it
- [ ] Methodology franchise architecture (post-birthday)
- [ ] Founder's Package architecture
- [ ] EA access code pattern (Mirae, post-CDN)
- [x] ~~Skills nomenclature cleanup~~ (DONE — nomenclature.md in how-to/, tools vs skills split, /eod absorbs /handoff)
- [x] ~~Rename cw-prompt/skills/ → cw-prompt/tools/~~ (DONE — commit 953b406, pushed)
- [ ] TRACKER.md creation
- [x] ~~Compile prompt~~ (DONE — 42,038 chars, tools/ path, rebuilt on deploy)

**Slam Dunks** (queue empty — seed at next /eod):

**Next session priorities (quick morning — it's his birthday):**
1. **Publish Day 0 roast on Substack** — draft ready in `docs/day-00-post.md`. Use `/publish` to format.
2. **Post LinkedIn nugget** — roast teaser on personal page, reshare to CW Strategies
3. **Post Reddit nugget** — from same draft file
4. Run `/brief` if time (first real test)

**After birthday:** CDN mid-term prep (Feb 13), voice layer, OG images

**Tomorrow is Feb 7 — Derek's 53rd birthday. The roast goes live. The countdown hits zero. Quick session — publish and go live your life.**

---

## February 6, 2026 — Birthday Eve Session (Earlier)

**Work completed:**
- Ran /standup with /crew — four-lens analysis on launch readiness
- Posted Day 1 countdown on LinkedIn (sparse + one hook line)
- Built The Stable (/stable) — product portfolio page with two sections: "What We Build" and "What We Build for Others"
- Tagline: "The prompt becomes product. The product becomes proof."
- Simplified global nav from 12 items to 5: Porch, About CW, The Stable, CW Strategies, About Derek
- Removed Story, CW Standard, Mirae, Subdomains from nav (pages still exist at URLs)
- Added voice layer to /derek — ElevenLabs TTS with Derek's cloned voice
- Three listen buttons (Bio, Q&A, Story) — chunked playback for long sections
- Created netlify/functions/speak.js — multi-voice architecture (Derek now, CW/Mirae stubs)
- Fixed CSP to allow blob: audio playback
- Updated site-registry.json with The Stable

**Naming decisions:**
- "CW Studios" → "The Stable" (CW Studios already exists as another company; Stable fits CW/Oklahoma/farm metaphor, was already in roadmap)
- CW Strategies LLC stays as-is — one company, two arms: Strategies (consulting) and The Stable (products)
- Considered CW Salon, CW Shop, CW Sandbox — Stable won

**Prompt changes:**
- None (site-registry.json updated but prompt not recompiled — CW learns about /stable via registry)

**Deploy status:**
- The Stable live at claudewill.io/stable
- Voice layer live on /derek (Bio, Q&A, Story buttons)
- Global nav updated across all pages
- CW chatbot healthy (verified at standup: 10,606 input tokens)

**Voice layer issues (captured, not blocking):**
- [ ] Third person problem: Bio and Story are written in third person ("Derek Simmons grew up...") — sounds odd when read in Derek's voice. Options: (a) first-person audio scripts, (b) CW's voice reads Bio/Story (Phase 2), (c) Derek only reads Q&A for now
- [ ] Q&A chunk timing — pauses between chunks need smoothing
- [ ] Voice clone tuning — ElevenLabs stability/similarity/style settings need adjustment
- [ ] Cost monitoring — watch ElevenLabs usage for first week

**Voice layer roadmap:**
| Phase | What | Voice | When | Est. Cost |
|-------|------|-------|------|-----------|
| 1 | /derek Q&A (live now) | Derek (done) | Done | ~$10/mo |
| 1b | Fix Bio/Story third-person issue | TBD | Post-birthday | — |
| 2 | /story, /the-cw-standard | CW (needs casting) | Post-CDN (Feb 13+) | +$10/mo |
| 3 | Mirae widget speaks | Mirae (needs casting) | Q2 | +$5/mo |
| 4 | CW voice chat (Porch) | CW | Q2, with cost model | $50-500/mo |

**Open items:**
- [ ] Paste LinkedIn refresh into CW Strategies company page
- [ ] Publish Day 0 roast on Substack (Feb 7 — TOMORROW)
- [ ] Post Day 0 on personal LinkedIn + CW Strategies handoff line (Feb 7)
- [ ] Post Reddit nugget (Feb 7)
- [ ] CDN mid-term prep (Feb 13) — Q2 scope, Plan B
- [ ] Voice layer Phase 1b — resolve third-person issue
- [ ] Voice clone tuning (ElevenLabs settings)
- [ ] Q&A chunk timing improvement
- [ ] derek-profile-illo.png placement
- [ ] Visual identity pass
- [ ] Methodology franchise architecture (post-birthday)
- [ ] Founder's Package architecture
- [x] ~~Fix /strategies CTA~~ (DONE this session)
- [ ] EA access code pattern (Mirae, post-CDN)
- [ ] Skills nomenclature cleanup (/eod + /handoff overlap)
- [ ] TRACKER.md creation
- [x] ~~Compile prompt~~ (DONE — 42,038 chars, tools/ path, rebuilt on deploy)

**Slam Dunks** (kick off and walk away):

| # | Task | Files | Acceptance Criteria | Confidence |
|---|------|-------|---------------------|------------|
| ~~1~~ | ~~Fix visited link color sitewide~~ | ~~css/shared-nav.css + all page styles~~ | ~~DONE — a:visited added to all 11 pages + shared-nav.css~~ | ~~DONE~~ |
| ~~2~~ | ~~Add 2 stat cards to /strategies~~ | ~~strategies.html~~ | ~~DONE — 6 cards: +5 lanes +6 AI skills~~ | ~~DONE~~ |
| ~~3~~ | ~~Fix /strategies CTA~~ | ~~strategies.html~~ | ~~DONE — "Work with Derek" → /derek/assessment~~ | ~~DONE~~ |

**Next session priorities:**
1. Feb 7 launch — publish roast, LinkedIn post, Reddit nugget (use `/publish` skill)
2. CDN mid-term prep (Feb 13)
3. Voice layer refinement (third-person fix, timing, tuning)

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
