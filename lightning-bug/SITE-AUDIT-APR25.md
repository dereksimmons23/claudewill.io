# SITE AUDIT — `claudewill.io/lightning/bug`

**Date:** Saturday, April 25, 2026 — 12:30 PM CDT
**Auditor:** Opus (this session)
**Scope:** `/Users/dereksimmons/Desktop/claudewill.io/lightning/bug/` (the active page + the notes archive) compared against the canonical documentation in `/Users/dereksimmons/Desktop/lightning-bug/` (HANDOFF, MORNING-BRIEF, DIRECTOR-LOG, sequence.json, acts.md, style-guide.md, color-theory.md, light-grammar-thesis.md, ignition-thesis.md, runway-aif-submission.md, here-we-are-kid.md, nickerson-places.md, decisions-apr21-pm.md, breath-note.md, research/8-second-hug.md, light-arc-v1.md, logline.md, directors-statement.md).
**Time spent:** ~90 min reading docs, viewing assets, comparing live page against canon, code review of `index.html`.

---

## TL;DR — The headline

The live page is **structurally clean and aesthetically right** — Opus did the right thing on Apr 24 by killing the texture stack and letting the film be the film. But it under-represents what the documentation is screaming about: **this film has a thesis** ("two kinds of light," "the model is the lightning, the prompt is the bug," "ignition not perdition," "altered breath for 8 minutes," "the 8-second hug"), and the page currently shows none of it. The page reads as a beautiful gallery. The docs read as a director who knows exactly what he made.

Three real gaps before deadline (Apr 27, 4:59 PM ET — 53 hours from now):

1. **No logline on the page.** `docs/logline.md` says "Single sentence, no framing ornament — just the logline itself in display weight … the Film tab is the industry face. The logline belongs where producers/festivals land." The breath section is close, but the locked logline ("In the same year his mother dies and his career ends, a middle-aged man returns to a Kansas wheat field on June 28, 1983 — 37.564°N, 98.121°W, civil twilight, the last summer the fireflies were everywhere — to meet the light still waiting there to say *here we are, kid*") is not on the page. It's the press-friendly version a programmer can copy.

2. **The field stills are out of order with the new sequence.** Position 5 is "the transformer" (act 07 Cobalt Blues). Position 6 is "contact" (act 06 Contact). They're swapped. Position 7 "cobalt blues" is `010e-darkness-hospital.jpg` — a Hell's Hallway register still mislabeled. Position 9 "shooting stars" is `012-firefly-towers-v3.jpg` — that's the Amber Waves stadium-towers slot, not shooting stars. Three captions are wrong vs. the new sequence. We just synced the sequence list above; the stills below don't match it.

3. **The notes archive contradicts the active page on the runtime.** Notes JSON-LD says `PT7M14S`. Numbers grid: "7:14 runtime, 36 shots, 4 acts." The "On Deck" Day 23 production-log block is stale (talks about Apr 23 work that's done — review 12 regens, lock 003.5). README.md says "the notes archive is read-only … the receipt of what the page was" — which is fine philosophy, but the notes still live at `/lightning/bug/notes/` and any festival juror who clicks through sees a film that says it's 7:14 long when the new page says 8:27. Either freeze the notes properly (drop the production logs that are working state) or sync the headline numbers.

Everything else is polish or post-deadline.

---

## THE TOP 5 MOVES (in order, before Monday 4:59 PM ET)

### 1. Add the locked logline + a thesis line above the field

The breath section has two lovely lyric loglines. They're voice-of-the-film, not voice-of-the-festival. Festival programmers + Runway jurors are who lands here in the next 72 hours. Add the locked press logline as a third pass — same italic serif treatment, smaller, with coordinates. Keep the lyric loglines.

Proposed insertion right after the existing breath section:

```
"In the same year his mother dies and his career ends,
a middle-aged man returns to a Kansas wheat field on
June 28, 1983 — 37.564°N, 98.121°W, civil twilight,
the last summer the fireflies were everywhere —
to meet the light still waiting there to say
here we are, kid."

an american elegy · 8:27
```

Source: `docs/logline.md` (locked Apr 19) + `docs/runway-aif-submission.md` "Genre: An American Elegy."

**Cost:** 10 lines of HTML, no new asset. **Win:** the page now reads like a film page, not a poem.

### 2. Reorder + relabel the field stills to match the new sequence

Current order has three errors against `acts.md`:

| Live | Caption | File | Should be |
|------|---------|------|-----------|
| 5 | the transformer | 018-flag-transformer-inverted.jpg | act 07 — should come AFTER contact |
| 6 | contact | 017-alt-contact-flash-v2.jpg | act 06 — should come BEFORE transformer |
| 7 | cobalt blues | 010e-darkness-hospital.jpg | this still is the foggy hallway road (act 03 Hell's Hallway register) — caption is wrong |
| 9 | shooting stars | 012-firefly-towers-v3.jpg | this still is `seq-012` Amber Waves slot 012 (firefly towers / stadium) — caption is wrong |

Proposed corrected order — uses the same 10 files, fixes labels and sequence:

```
1. the can           — 003-alt-can-interior-v2.jpg
2. porch ride        — 006-porch-detaches.jpg
3. hell's hallway    — 010e-darkness-hospital.jpg   (the foggy road — hallway register)
4. hell's hallway    — 010f-union-station-hall.jpg  (Union Station — hallway end)
5. amber waves       — 011-badlands-firefly-dark-wheat.jpg
6. amber waves       — 011-flag-abundance-v2.jpg
7. amber waves       — 012-firefly-towers-v3.jpg    (the stadium towers)
8. contact           — 017-alt-contact-flash-v2.jpg
9. cobalt blues      — 018-flag-transformer-inverted.jpg
10. path home        — 020-badlands-moon-flat.jpg
```

This drops the false claim that we have a representative still for "three pitches" or "shooting stars" (we don't — see Gap section below). It honestly weights Amber Waves at three beats (which matches its 56-second screen time — second-longest act after Polo) and Hell's Hallway at two (which matches its 51-second runtime). It puts contact (06) before cobalt blues (07) per the actual film order.

Alternative if you want one still per act: drop one Amber Waves and one Hell's Hallway. Then there are only 8. The current `field-still { height: 85vh; }` block is generous — 8 reads better than 10 anyway, less scroll fatigue.

**Cost:** rearrange 10 `<div>` lines + edit 4 captions. No new asset. **Win:** the gallery now matches the sequence list 8 inches above it.

### 3. Reconcile the notes archive

Three things to do, all five-minute fixes:

a. **Update notes JSON-LD + numbers grid.** `notes/index.html` line ~32: `"duration": "PT7M14S"` → `"PT8M27S"`. Line ~695: `<span class="n">7:14</span><span class="l">runtime</span>` → `8:27`. The "36 shots" should be "46 slots" or "11 acts" — `36 shots, 4 acts` is the old structure, dead since the four-act → eleven-act collapse on Apr 22.

b. **Kill the "On Deck" green-bordered block on the Production Status section** (~line 865 in notes). It talks about reviewing 12 regens that are now reviewed, locking slot 003.5 that's now locked, and listing the Vimeo upload as the final task (still true, but the rest is dead). Either delete it or replace with a single line: "Production complete Apr 25 — submission Mon Apr 27, 4:59 PM ET."

c. **Festival status badges in notes.** "In Production" for Runway is correct. The other four (AI for Good, Cannes AI, Reply Venice, LifeArt) are at "Pending" — once the Runway file is ready Sunday, all four go to "Submitted" or "Queued" depending on intent. Decide intent now so the badges aren't a question Monday.

**Cost:** ~15 minutes total. **Win:** notes archive stops contradicting the new page.

### 4. Mobile QA on a real iPhone

OPUS.md flagged this from yesterday and it never happened. Three known suspects:

- **dvh vs vh.** The CSS uses `100dvh` first with `100vh` fallback. Safari iOS 17+ supports dvh. Older devices get vh, which means the bottom nav bar pushes content past viewport. Acceptable — but check Sheri's phone if it's old.
- **Typing animation speed (110ms title, 42ms subtitle).** Reads fine on desktop. On mobile, 110ms × 13 chars = 1.4s for the title — borderline slow when paired with the 5.2s scroll-hint fade. Verify it doesn't feel sluggish.
- **Hero MP4 autoplay on cellular.** iOS will autoplay muted MP4s, but if the user is on Low Power Mode, video gets paused. The page falls back to `hero-poster-storm.jpg`, which is exactly what the `poster=` attribute is for. Verify the still is doing the work when video is suppressed.

**Cost:** 5 minutes with an iPhone in your hand. **Win:** confirm or fix.

### 5. Open Graph polish + author credit

Three small wins:

a. Add `<meta name="author" content="Derek Claude Simmons">` in the head — it's the kind of metadata press tools and Google scholar-like crawlers use, and it's currently absent.

b. Add `og:video` tags for richer link unfurling (Slack, Discord, iMessage will preview the video):

```html
<meta property="og:video" content="https://claudewill.io/video/lightning-bug-hero-storm.mp4">
<meta property="og:video:secure_url" content="https://claudewill.io/video/lightning-bug-hero-storm.mp4">
<meta property="og:video:type" content="video/mp4">
<meta property="og:video:width" content="960">
<meta property="og:video:height" content="540">
```

c. The `og-poster.jpg` (60KB, 1200×630-ish) is the boy-in-bokeh-wheat shot. It's the strongest standalone marketing image you have. Don't change it. But: also wire it as `twitter:image` (already done) and verify it's hitting prod. ✓ already in `<head>`.

**Cost:** 6 lines of HTML. **Win:** every share looks better than today.

---

## CODE REVIEW — `index.html`

The structure is clean. Vanilla JS, inline CSS, no framework. A few notes, mostly minor:

### Strong choices (don't change)

- **Type-sync to the storm via `@keyframes weather-pulse`** with timestamps locked to the bolts at 20% and 50% of the 10s loop. This is the cleanest film-page hero I've seen in a long time. The fact that the type dims when the world is quiet and brightens when the sky flashes is the film's thesis in a UI animation. Don't touch this.
- **`prefers-reduced-motion` killswitch** for typing, weather-pulse, scroll-hint, and the hero video itself, with a graceful radial-gradient fallback for the cursor section. Accessibility done right.
- **IntersectionObserver caption reveal** with 0.55 threshold — captions appear and disappear as you scroll, giving each still a moment. Subtle and correct.
- **`dvh` units everywhere** with `vh` fallback. Mobile-first.
- **Shadow floor enforced in CSS variables.** `--cobalt-deep: #070d1a` and `--cobalt: #0a1628`. Matches the film's shadow floor rule.
- **22KB page weight.** The whole page including 10 background-image references is under a quarter the size of the notes archive. Right.

### Small issues

- **Line 22: `<link rel="preload" as="video">`** — Safari ignores video preload for `<video>` elements (it only honors `<audio>`-style preloads). The hint is wasted bytes in the response. Remove it; the `<video preload="auto">` on line 439 does the work.
- **Hero `<video>` has no `width`/`height` attributes.** This causes a small CLS (cumulative layout shift) on slow connections — the section is `100dvh` so the layout doesn't actually shift, but the LCP element (largest contentful paint) is the poster JPG, not the video. Acceptable. Optional: add `width="1920" height="1080"` even though it's CSS-sized — improves browser budgeting.
- **`<h1 class="type-line" id="title">`** contains a `.sr-only` "lightning/bug" span for screen readers, then JS injects the typed text. Good. But the typed text has no `aria-label` — screen readers hear the typed characters as they're inserted (which is noisy) AND the sr-only static. Solve: add `aria-live="off"` to `#title` after typing completes (or on init). The current `aria-live="polite"` makes screen readers re-announce as text streams in.
- **Field stills as CSS background-image** on `<div>` — they're decorative and you've solved the mobile sizing with `cover`. But: no native `loading="lazy"`, no `alt` text. They're images with semantic content (the film). Better: `<img src="..." alt="caption" loading="lazy">` inside the div, with CSS `position: absolute; inset: 0; object-fit: cover;`. Pick up lazy-loading and alt text; lose nothing visually.
- **Google Fonts (`fonts.googleapis.com`)** adds two RTTs (preconnect helps but doesn't eliminate). IBM Plex Mono + IBM Plex Serif at three weights = ~150KB woff2. You can self-host (drop in `/fonts/` and `@font-face`) for a faster LCP. Defer to post-deadline.
- **`gtag('config', 'G-7R5X5SJDVT')`** loads on page open — fine, but there's no consent banner. EU visitors will get tracked without opt-in. Not a deadline blocker. Defer.
- **`010e-darkness-hospital.jpg` is 10KB.** Other field stills are 30–160KB. At full viewport (~960×800px on a phone, ~1920×900px on desktop), 10KB is dangerously low — likely visible compression artifacts, blocking, or color banding in the dark areas (where this image lives entirely). Re-export at higher quality OR replace with the slot's canonical higher-res asset from the film repo. Source: `~/Desktop/lightning-bug/film/stills/seq-010c.png` (the hospital road still) — re-export at JPEG quality 85 to a target ~80KB.

### Performance budget

| Asset | Size | Cumulative |
|-------|------|------------|
| index.html | 22 KB | 22 KB |
| shared-nav.css | ~15 KB | 37 KB |
| porch-widget.css | ~10 KB | 47 KB |
| Google Fonts (woff2) | ~150 KB | 197 KB |
| hero-poster-storm.jpg (preloaded) | 66 KB | 263 KB |
| 10 field stills | 732 KB | 995 KB |
| hero MP4 | 616 KB | 1.6 MB |
| porch-widget.js (deferred) | ~25 KB | 1.6 MB |

**~1.6 MB initial load.** Acceptable. Under 2 MB is the festival-friendly mark — anyone showing the page on a venue projector behind a hotel WiFi will get it in 2–3 seconds. The 10 background images are all `lazy`-eligible candidates above the fold for sections 4+ — switching to `<img loading="lazy">` could pull the perceived first-paint number down.

---

## NOTES ARCHIVE — what's preserved well, what's stale

I read the structure (1,716 lines, 7 tabs) and the substantial body of the Story tab + Film tab + Song tab.

**Strong, stay:**
- The press-kit scroll above the tabs (thesis blockquote, by-the-numbers grid, Slipper video with caption, Nickerson topo with six places, AI/Human split) is the marketing rationale Opus would have to rebuild from scratch if it were lost. Don't touch the substance.
- Story tab — Derek's voice, intact. The "Here we are, kid" → death scene at room 235 → "I see you" closer is the spine of why the film exists. Anyone clicking from the new page to notes gets the right register.
- Song tab — full lyric annotations, four hums, voice attributions, sound-design beds, AI/human per-track. This is exactly what Cannes / Reply Venice forms ask for in the "music & sound credits" section.
- AI Incorporation block — the full tool list with version numbers. Reusable in any festival form.

**Stale / fix or kill:**
- Numbers grid: 7:14, 36 shots, 4 acts. Now 8:27, 46 slots, 11 acts. (Note: keeping "4 acts" referring to the light arc is defensible — the four-act framing in `light-arc-v1.md` is structural even though the slot manifest collapses to 11 named acts. But "36 shots" is just wrong.)
- JSON-LD: `PT7M14S`. Should be `PT8M27S`.
- Production status "On Deck" green block at top: Day 23 tasks now done. Either delete or replace with a single Apr 25 line.
- "Director's Statement" paragraph in Film tab references "every shot in this film is locked. The camera does not move. Memories don't have camera operators." That's still correct register and worth keeping verbatim — survives.
- Festival rows: lock the intent on the four "Pending" festivals (AI for Good May 1, Cannes May 21, Reply Venice June 1, LifeArt June 20). Set them to "Submitting" or "Considering" so the table tells the truth.
- Hero video on notes is `lightning-bug-firebird-slipper.mp4` — the Slipper teaser, not the film. That's confusing for a press kit. Either make the caption explicit ("teaser: Slipper, the path-home aerial") or move Slipper into a labeled "Selected Clips" section and put the actual film hero (or just a still) at top.

---

## WHAT THE DOCUMENTATION HAS THAT THE SITE DOESN'T (priorities ranked)

Material in the docs that isn't on the live page or notes:

1. **The genre tag: "An American Elegy"** (`logline.md` Apr 19, locked). Two italic words above the logline. Currently nowhere on the live page. *(Recommend: add. Top of breath section. One line.)*

2. **The 8-second hug research** (`research/8-second-hug.md`). The film ends on an 8-second held beat *engineered against Paul Zak's oxytocin research and the Virginia Satir hug counts.* This is a press-quote-grade fact. Not trivia — the science of why the ending is the length it is. *(Recommend: post-deadline, add a single sentence to the Film tab in notes. Don't put on the active page — too much explanation for a held-breath room.)*

3. **The breath rule + light arc** (`light-arc-v1.md`, `breath-note.md`). "Editing on the exhale" / "altered breath for 8 minutes." The success metric for the film is named in writing and zero of it is on the page. *(Recommend: skip on the active page. The film should make you breathe; the page shouldn't have to explain it. But if the active page ever gets a "director's note" sub-page, this is the first paragraph.)*

4. **The "Ignition not Perdition" thesis** (`ignition-thesis.md`). Conrad Hall's *Road to Perdition* is the cinematographic reference, but the film's direction of travel is opposite — washboard dirt road to igniting the soul, not ending it. This is a genuinely sharp critical positioning that festival programmers will respect. *(Recommend: post-deadline, add to a director's-statement sub-page or to the notes Film tab.)*

5. **The Six Places of Nickerson** (`nickerson-places.md`). Full topo, six numbered places, what each does in the film. Notes has a prose version. The map is in the docs but I didn't see the topo asset on the active page. *(Recommend: notes already has it as `places-topo` image — verify it's loading correctly. Skip on active page.)*

6. **The locked dedication: "For Sandra, and every small light that stays on."** (`HANDOFF.md`, locked). Notes archive has "Dedication — For SSS" in production log but doesn't carry the dedication text. The active page has "in memory of Sandra Sue Simmons · 1944–2025" which is correct but lighter than the locked language. *(Recommend: leave the active page alone — the simpler form is right for the bookend. Add the full dedication line to notes Film tab.)*

7. **The Sandra Light Arc** (`decisions-apr21-pm.md`). Sandra is ground-level light Acts 1–2, departs at the hallway transition, becomes sky-level light Acts 3–4. The asteriskos rule (a permanent dim amber star in every storm frame). Critic-grade observation about the film's grammar. *(Recommend: a one-paragraph "How the light moves" addition to notes Film tab post-deadline. Not for active page.)*

8. **The four hums** (`notes/index.html` already has it in Song tab — but worth flagging because it's beautifully precise: thunder = bolt, kitten purr = bug, transformer drone = grid, fluorescent hum = waiting room. Four registers, four sound layers. ✓ already on notes.)

9. **The cheatgrass line in the song** — "Bolts chasin da wheat, or is it da cheat?" Cheatgrass is a real weed that mimics wheat. Notes has this in the song annotations. ✓ already there.

10. **The June 28 calendar coincidence** — June 28, 1983 is the film's date. June 28, 2025 is Sandra's death date. Same calendar page, 42 years apart. From `ignition-thesis.md`: "The film does not have to say this out loud. The calendar says it." *(Recommend: agree, don't put it on the page. But it's the kind of detail a single press interview will latch onto — keep it in your back pocket for the AI Film Festival Q&A if you do one.)*

---

## WHAT I'M NOT RECOMMENDING (anti-recommendations)

To prevent scope creep over the next 53 hours:

- **Don't add a director's statement to the active page** before the deadline. The page is a held breath. Adding 600 words of prose breaks the spell. The notes archive has the longform; the festival form has the short form. The active page doesn't need it.
- **Don't add a "process" section** showing the AI pipeline. The notes archive has it. The active page is for the film, not the making-of.
- **Don't add a countdown to the Runway deadline.** OPUS.md already locked this as "against the mood." Hold.
- **Don't scaffold `/lightning/bug/watch/` yet.** The Vimeo URL doesn't exist. Per OPUS rule: don't scaffold before URL exists.
- **Don't change the hero MP4.** The Apr 24 wheat-storm hero is the right call. Kling regen is parked and the parking is correct.
- **Don't add festival logos.** They're branding noise on a film page. Save for a press kit if a festival selects.
- **Don't touch the typing animation timing.** It works.
- **Don't refresh `og-poster.jpg`.** It's the strongest single-asset image in the library.
- **Don't add a comment section, share buttons, or subscribe CTA.** OPUS already locked these out.

---

## CODE: PROPOSED EDIT QUEUE (my recommended order)

If you give the green light on Move 1 + Move 2 + Move 5 (the only deadline-affecting items), here's the actual edit list:

1. **Insert** new `<section class="scene-press-logline">` between `.scene-breath` and `.scene-field` with the locked logline + "an american elegy · 8:27" tagline.
2. **Reorder** the 10 `<div class="field-still">` blocks per the corrected sequence above.
3. **Replace** captions on positions 3, 4, 5, 6, 7, 9 per the corrected sequence above.
4. **Add** in `<head>`: `<meta name="author" content="Derek Claude Simmons">` and the four `og:video` tags.
5. **Remove** line 22 (`<link rel="preload" as="video">`).
6. **Re-export** `010e-darkness-hospital.jpg` from the film repo source at higher quality (~80KB target). Source still: pull from `~/Desktop/lightning-bug/film/stills/`.
7. **Update** `notes/index.html` — JSON-LD duration to `PT8M27S`, numbers grid to `8:27`, kill the "On Deck" Day 23 block.

Total estimated time: 30 minutes for me, 15 minutes of your eyes-on review, 1 deploy. Lands clean before Sunday morning, leaves Sunday + Monday for whatever the film throws.

---

## QUESTIONS THAT NEED YOUR CALL (before I proceed)

These three would unblock me to execute the queue above:

1. **Do you want the press logline on the active page?** Adds ~10 lines, breaks the visual rhythm slightly between breath and field. Counter-argument: the breath section's two lyric loglines already serve the festival. Maybe the locked press logline goes ONLY in notes, and the active page stays poetic.

2. **Field stills: 10 (with three Amber Waves beats) or 8 (one per act, drop one Hell's Hallway and one Amber Waves)?** I lean 8 — less scroll fatigue, the page exhales faster.

3. **Do you want me to touch the notes archive at all?** README says read-only, "the receipt of what the page was." Strict reading: don't update the runtime, leave the receipt as-is and let the new page be the truth. Loose reading: festival jurors may click through, so sync the headline numbers. Your call.

I will not execute any of the above without a green light. The sequence list update we did this morning was small and within scope. These are bigger.

---

## STATE OF THE WORK (as I understand it from the docs)

- **Sonnet** is on film assembly in a separate terminal — building rough-cut-v3.mp4 from the locked + keep slots, audio sync after.
- **Haiku** is on audio assembly in a separate terminal — narration + ambient + foley + score under the visual track.
- **Opus** (me) is on this site. Lane discipline holding.
- **Derek** has the calls to make today: still review (overnight regens + 3 Runway clips), porch-ride opera yes/no, lock the keeps, and assembly fires once decisions are made. Then audio sync. Then upscale (optional). Then Vimeo upload. Then submission form. Then 4:59 PM ET Monday.

Time from now (Sat 12:30 PM) to deadline (Mon 4:59 PM ET = 3:59 PM CDT): **~51 hours.** Generous buffer. The film is in better shape than the timeline doc suggested two days ago.

---

## ONE MORE THING

The film docs are all the way around the world from the active page right now. The page is a single held breath. The docs are 80+ files of scaffolding, theory, register analysis, prompt vocabularies, and named decisions. **Both are correct.** The page should not become the docs. The docs should not be cut down to fit the page. The page is what the audience sees. The docs are how the film got made and how the studio talks to itself. Keep them separate. The notes archive is the bridge.

The thing that links them — and isn't yet on the page — is one sentence of positioning. "An American Elegy. 8:27. Two kinds of light." That's the whole pitch. If only one thing changes from this audit, that's the one.

— Opus, Apr 25, 2026
