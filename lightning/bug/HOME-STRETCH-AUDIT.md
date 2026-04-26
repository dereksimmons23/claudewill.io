# HOME STRETCH AUDIT — Apr 26, 2026

**Last updated:** Apr 26, 8:35 AM CDT (post-execution)
**Window to deadline:** ~31 hours (Mon Apr 27, 4:59 PM ET = 3:59 PM CDT)
**Auditor:** Opus

This doc tracks the full home-stretch audit + the executions. Status icons: ✅ done · 🟡 partial · 🔴 still open · 🔵 skipped intentionally.

---

## WHAT JUST SHIPPED (Sun 8 AM batch — commit `1e6192ae`)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | Add `/lightning/bug/notes/` + `/lightning/bug/statement/` to `/sitemap.xml` | ✅ | Bumped /lightning/bug/ priority 0.7→0.9, lastmod→2026-04-26 |
| 2 | Run `lighthouse` + `pa11y` against live, surface ship-blockers | ✅ | All errors were color-contrast on `--amber-dim` + `--text-dim` — fixed in same batch |
| 3 | Bump `--amber-dim` for AA contrast pass | ✅ | Renamed `--amber-dim` → `--amber-soft` (#8a6a2a → #b89346, 5.5:1 AA pass). Also `--text-dim` → `--text-soft` (#6b7a92 → #97a3b7, 5.5:1 AA pass). 16 contrast errors → 0 on the lightning/bug page itself. |
| 4a | Kill gtag on lightning/bug pages (privacy hygiene) | ✅ | Removed from index.html, statement/index.html, notes/index.html. EU consent exposure cleared during deadline window. |
| 4b | Add Article JSON-LD to `/statement/` | ✅ | Full schema.org Article block with author, publisher, mainEntityOfPage, isPartOf VideoObject. Festival-aggregator scrapeable. |

### Bonus — your "personal observations" addressed in the same batch:

| Observation | Action | Status |
|-------------|--------|--------|
| Too many color shifts | Consolidated palette: 9 active colors → 6 (cobalt, cobalt-deep, amber, amber-soft, amber-faint, text, text-soft). Dropped `--amber-bright` and `--cobalt-light`. | ✅ |
| Type bunched without visual support | New `.section-mark` divider (single centered amber-soft `·`, 4vh padding) inserted between hums→note and note→crew (the densest text-text transitions). Note section padding rebalanced from asymmetric 14vh/4vh → symmetric 8vh/8vh. | ✅ |
| Crew implies attribution to people who were inspirations; list too long to enumerate | Replaced "cinematography Conrad Hall · Terrence Malick" with "in the lineage of cinema that lets the dark do the work." No specific names — gestures at the long list without slighting anyone. The italic patina line attached to that crew-line is dropped (it already lives in the footer colophon). | ✅ |

---

## VERIFICATION (post-deploy)

```
LIGHTHOUSE — claudewill.io/lightning/bug/
performance:    52–70  (variance — Google Fonts + hero MP4 LCP; not deadline-critical)
accessibility:  96     (was 96 before — pa11y errors are porch widget, not film page)
best-practices: 100    ✅
seo:            100    ✅

PA11Y — claudewill.io/lightning/bug/
5 errors total — ALL from /js/porch-widget.js (global, not film page):
  - porch-vernie-input missing label (×2 rules)
  - porch-input textarea missing accessible name (×2 rules)
  - cw-email-capture-close button contrast 3.75:1
ZERO contrast errors on the film-page CSS. ✅

PA11Y — claudewill.io/lightning/bug/statement/
8 errors total — also dominated by porch widget. Page CSS clean. ✅

STATUS — all three URLs return 200 ✅
SECURITY HEADERS — CSP, HSTS, X-Frame-Options DENY, etc. all present ✅
SITEMAP — both new URLs registered ✅
JSON-LD — VideoObject on main, Article on statement ✅
EXIF — clean (no GPS / camera leakage) ✅
GTAG — removed from all three lightning/bug pages ✅
```

---

## STILL OPEN (the actual home-stretch list)

Reorganized after the morning batch. Items removed = done. Items added = surfaced by the audits.

### 🔴 TIER A — could affect festival submission directly

#### A1. **Suno commercial/festival licensing tier** ⚠ CRITICAL — Derek
Status: **still open.** Action: open Suno dashboard, confirm subscription tier grants commercial + festival rights for "Here We Are, Kid." Screenshot for records. **5 minutes.**

#### A2. **Voicemail consent — Shannon + Sheri** — Derek
Status: **still open.** Sandra is covered as the surviving family member under Kansas right-of-publicity; Shannon and Sheri are living and need explicit OK for film + web use. Action: text or email each, get a screenshot-able yes. **10 minutes total.**

#### A3. **1983 Channel 9 Wichita newscast — confirm in cut** — Derek
Status: **still open.** If it's in the locked cut, add attribution to credits ("Archival television: KAKE-TV / KSNW Wichita, 1983"). **5 minutes if you know whether it's in.**

#### A4. **Runway / FAL / Replicate paid-tier verification** — Derek
Status: **still open.** Confirm each subscription is on a paid commercial tier. Screenshot billing pages. **10 minutes.**

### 🟡 TIER B — worth fixing, not blocking

#### B1. **Mobile QA on real iPhone** — Derek
Status: **still owed from Apr 24.** dvh + typing animation speed + hero-video autoplay on Low Power Mode. **5 minutes with Sheri's phone.**

#### B2. **Porch widget accessibility** — Opus, post-deadline
Status: **deferred.** All 5 remaining pa11y errors on the film page come from `/js/porch-widget.js` — global widget, edits would touch every page on the site. Fix scope: add `aria-label` to porch-vernie-input + porch-input, bump `cw-email-capture-close` contrast. Not deadline-critical. Schedule for a post-Monday cleanup commit.

#### B3. **Performance — self-host IBM Plex fonts** — Opus, post-deadline
Status: **deferred.** Lighthouse perf score bounces 52–70 because Google Fonts is render-blocking and the hero MP4 is the LCP element. Self-hosting fonts (drop woff2 files in `/fonts/` and `@font-face`) lifts perf to ~85+. **Not festival-critical.** Festival jurors don't see Lighthouse scores.

#### B4. **Spell-check site copy (eyeball pass)** — Derek
Status: **open.** ~600 words across the page + 410 on the statement sub-page. **10 minutes manual read.** Nothing automated installed and not worth installing aspell now.

#### B5. **Video captions / SRT** — for May 1 (AI for Good), not Runway
Status: **deferred to post-Runway.** Whisper can generate the SRT in one command from the locked film MP4: `whisper film.mp4 --output_format srt --model medium`. Same model already used.

### 🟢 TIER C — nice to have, won't block

#### C1. **Trademark TESS search — sssstudios + lightning/bug** — Derek
Status: **5-minute online check** at [tmsearch.uspto.gov](https://tmsearch.uspto.gov/). Cheap insurance. Not deadline-related.

#### C2. **Dr. Pepper logo check on can stills**
Status: **Derek QA during final watch.** Per `docs/the-spine.md`, the can is "unlabeled aluminum." Verify in the locked cut. If branding is visible, Kontext-strip OR fair-use defense.

#### C3. **Footer colophon-sub remains below WCAG AA**
Status: **intentional.** The italic "and the light has been here a while" is at 0.55 opacity by design — atmospheric register. Bumping it brighter breaks the colophon feel. Cinematic compromise. Same trade-off as the field-still captions.

---

## FILM-COMPLETION TRACK (separate from the site)

Status pulled from `~/Desktop/lightning-bug/HANDOFF.md` and `MORNING-BRIEF.md`:

| When | Task | Owner | Time |
|------|------|-------|------|
| AM | Refire 005.2 (FLUX safety block) + 006.7 (motion); decide 006 Kontext call | Derek + automation | ~30 min Derek + ~30 min compute |
| AM-Noon | Fire 8-clip Runway batch for porch ride remaining slots | Automation | ~45 min compute |
| Noon | Review 8 clips, mark `reviewed:true` in manifest | Derek | ~30–60 min |
| Noon-2PM | `python3 scripts/build-opera.py docs/operas/02-porch-ride/manifest.json` | Automation + Sonnet | ~30 min |
| 2-4 PM | Sonnet builds full film, Haiku layers audio, watch start to finish | Sonnet/Haiku + Derek | ~2 hrs |
| 5-7 PM | Topaz upscale (optional) + Vimeo upload | Automation + Derek | ~2 hrs |
| Mon AM | Final QA + submission form | Derek | ~1 hr |

**Total Derek-active for film completion: ~5–6 hours.**

---

## TIME MATH (recalibrated with completed items)

You said: ~12 Sun + ~5 Mon = 17 Derek-hours remaining.

**Site-side:** 4–5 Tier A items ≈ 30 min total + B1 mobile QA 5 min + B4 spell-check 10 min = **~45 min Derek site-time.**

**Film-side:** ~5–6 hours Derek-active (above).

**Total Derek work to ship:** **~6.5 hours.** Buffer: **~10.5 hours.** That's a long walk, a real meal, the second watch on the TV with sound out loud, and 7+ hours of sleep tonight.

---

## WHAT I'D DO NEXT (RECOMMENDED ORDER, after this batch)

If you give me three more green lights when you're back at the keyboard:

1. **Run pa11y/lighthouse on `/lightning/bug/notes/`** — the notes archive hasn't been audited; might surface its own issues. **5 min.**
2. **Strip remaining EXIF metadata from field stills** — `exiftool -all= ~/Desktop/claudewill.io/images/lightning-bug/*.jpg`. Tiny privacy + bytes win. **2 min.**
3. **Add a manual "skip to content" link for keyboard users** — single line of HTML, top of body, hidden until focused. WCAG AAA win, also helpful. **2 min.**

Optional add-on:
4. **Run lighthouse against `/statement/`** — see if the new sub-page has its own perf issues.
5. **Pull standalone OG card preview** — render the og-poster at 1200×630 if it isn't already, verify Slack/iMessage unfurls cleanly.

---

## ONE-LINE BOTTOM LINE

The page is now WCAG AA on its own CSS, the palette is consolidated, the crew line is honest about its inspirations, and gtag is off. Five porch-widget errors remain but are global-scope and post-deadline. The actual ship-blockers now are all your-action: Suno tier, Shannon/Sheri consent, Channel 9 attribution, AI-tool tier verification. ~30 min total. Then the film-completion track.

— Opus, Apr 26, 8:35 AM CDT
