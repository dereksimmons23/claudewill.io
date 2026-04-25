# OPUS — /lightning/bug session log

> Scoped to the site surface only. Sonnet handles film assembly; Haiku handles submission. Opus owns `claudewill.io/lightning/bug`.

---

## Session · 2026-04-25 (Sat, Day 115) — model: Opus 4.7

**Window:** 9:50 AM CDT open. Derek explicit: "you can reach into the film repo, just make sure you are copying files into the site repo and not editing or deleting anything in film."
**Festival:** Runway AIFF, Apr 27 4:59 PM ET. ~51 hours from session close.
**Directive:** dial in "the sequence" list, then audit docs vs site, surface what's next.

### What shipped

- **Sequence list rebuilt to canon.** Collapsed `inside` + `outside` into `the can` per acts.md (003.5 outside-beat is now part of The Can act, not its own line). Numbered the bookends `00 marco` / `99 polo`. Added per-act runtimes pulled from `~/Desktop/lightning-bug/film/sequence.json`. Total runtime updated: breath section + JSON-LD now read **8:27** (was 8:12).
- Live list:

```
00 marco          :21
01 the can        :63
02 porch ride     :40
03 hell's hallway :51
04 amber waves    :56
05 three pitches  :18
06 contact        :04
07 cobalt blues   :53
08 path home      :56
09 shooting stars :51
99 polo           :94
```

- New CSS: `.seq-list .dur` block with `tabular-nums` + `margin-left: auto` for right-rail runtime alignment. Removed the now-unused `.bookend` rules.
- Commits: `69405c1c` (sequence + runtimes + 8:27), `8e495493` (the can :63 — colon-prefix to match polo).

### Site audit written

`SITE-AUDIT-APR25.md` (this directory) — full read of the lightning-bug repo (HANDOFF, MORNING-BRIEF, DIRECTOR-LOG, sequence.json, acts.md, style-guide.md, color-theory.md, light-grammar-thesis.md, ignition-thesis.md, runway-aif-submission.md, here-we-are-kid.md, nickerson-places.md, decisions-apr21-pm.md, breath-note.md, research/8-second-hug.md, light-arc-v1.md, logline.md, directors-statement.md) compared against the active page + the notes archive. Code review of `index.html` included.

**TL;DR of the audit:**
- Add the locked press logline + "An American Elegy · 8:27" tag above the field section
- Reorder + relabel field stills — three captions are wrong vs the new sequence
- Sync notes archive runtime (PT7M14S → PT8M27S, "36 shots, 4 acts" → 8:27)
- Mobile QA on a real iPhone (still owed from yesterday)
- og:video tags + author meta — small Open Graph polish

Three questions need Derek's call before the audit's edits get executed. See SITE-AUDIT-APR25.md final section.

### Lane discipline

Sonnet on film assembly, Haiku on audio, Opus on site. Per Derek's permission today: I can READ the film repo (and copy files INTO the site repo), but cannot edit or delete anything in `~/Desktop/lightning-bug/`.

---

## Session · 2026-04-24 (Fri, Day 114)

**Window:** 9:06 AM CDT open. Opus 4.7. Full creative control granted.
**Festival:** Runway AIFF, Apr 27 4:59 PM ET. Jurors not looking at the site today.
**Directive:** "Not homework. An experience. Mobile-first, great on any device."

### What shipped

Commit `0de5d6f0` on `main`, deployed to Netlify.

- **New page** at `/lightning/bug/` — seven-scene scroll, ~22KB (was 116,175).
- **Archive** at `/lightning/bug/notes/` — complete original page preserved, linked from new footer.
- **README.md** + **OPUS.md** added to `/lightning/bug/`.

Follow-ups:
- `d1174c49` — README + OPUS docs.
- `e1c1e792` — Sandra's birth year corrected to 1944.

### Rolled back (Apr 24) — everything between `e1c1e792` and the rollback

Tried: Kodak 500T grain overlay, patina filter (saturate/contrast), inter-still cobalt haze gradient, 2.39:1 anamorphic poster frame, a designed closing one-sheet (first as static still, then as an MP4 composite of seq-018a + synthetic lightning + meteor shower + asterisks).

Derek's call: **all of it was CSS / graphic decoration competing with the film's own aesthetic.** The stills carry their own grain, palette, atmospheric perspective, and texture from generation. Stacking web treatments on top muddies instead of amplifies. The MP4 poster — hand-drawn amber meteors + synthetic flash over a real film still — was the clearest case: graphic design school on top of a film with its own look.

**Rule going forward:** no filters, no grain overlays, no synthetic motion, no fake anamorphic letterboxes. The page shows the film's images as the film's images. Typography, layout, and restraint are the only intervention surfaces.

Deleted: `seq-031-shooting-stars.jpg` (web derivative), `poster-still.jpg`, `lightning-bug-poster.mp4`. Reverted `index.html` to `e1c1e792`.

---

### The hero — wheat-storm MP4 (Apr 24, late afternoon)

After the rollback, Derek redirected to a new ask: a **looping animated hero** at the top of the page, replacing the static D28 poster. Spec: ground-level wheat field, voluminous cobalt cumulonimbus, wind through wheat (hard sway), slow cloud drift, central lightning bolt. Type stays centered and dims/brightens with the weather.

This was generated through the actual film pipeline — FLUX Pro v1.1 Ultra still + Runway Gen-4.5 motion via fal.ai — using the same scripts and `.env` keys as the film repo. NOT CSS-composited or PIL-rendered. The rule from the rollback held: pipeline output, baked grade, no decoration on top.

**Live state** (commit `450b244f`):

- `/video/lightning-bug-hero-storm.mp4` — 616 KB, 960×540, 10 s seamless loop. Built from a Runway Gen-4.5 image-to-video pass on a FLUX still (seed 914514896, prompt: bug's-eye low angle, voluminous cobalt cumulonimbus, head-high amber wheat, no pole, open central axis).
- `/images/lightning-bug/hero-poster-storm.jpg` — 66 KB, frame 0 of the graded MP4. Used as `poster=` and as preload hint.
- ffmpeg pipeline (one pass, all baked into the MP4):
  - `scale 960×540` (lanczos)
  - `eq` brightness −0.06, contrast 1.06, saturation 0.92
  - `curves` to tame the hot whites without crushing the lows
  - `colorbalance` cool bias in mids and highs (−red, +blue)
  - extend with 3 s of ambient ping-pong (first 1.5 s reversed + first 1.5 s forward) so bolts don't repeat every 7 s
  - `xfade` 0.6 s crossfade at the loop boundary for a seamless seam

CSS (`@keyframes weather-pulse`, 10 s infinite, on `.type-wrap`): baseline `filter: brightness(0.78)`, peaks at 20% (t=2 s, bolt 1) and 50% (t=5 s, bolt 2) of the loop at `brightness(1.32)`. Title and tagline dim when the world's quiet, brighten when the sky flashes. `prefers-reduced-motion` returns the original cobalt radial gradient with no animation.

The hero replaces the prior `.scene-poster` section entirely. D28 still serves as the OG/social card image (`og:image` meta).

### Parked — wheat sway + bolt register tradeoff

By 3 PM, Derek correctly clocked that the wheat in the live hero is essentially static — Runway Gen-4.5 resists animating dense vegetation. Tried Kling 2.1 Pro on fal as a regen.

Result, honestly assessed:
- **Runway clip (live):** clean cobalt sky, decent center-ish bolt, wheat barely moves.
- **Kling clip (parked at `/tmp/hero-kling.mp4`):** real wheat sway, gorgeous cobalt ambient frames — but the strike moments push the sky into magenta/lavender and the bolts come out as cartoon flame-yellow, two parallel instead of one centered. Aggressive grade pulled the calm frames into perfect register but couldn't fix the strike frames.

Three paths considered, **none taken** (Derek parked):
- A. Re-fire Kling with brutal lightning negative prompt
- B. Composite — Kling wheat under Runway sky (seam from same FLUX seed)
- C. Accept graded Kling as-is and live with off-register bolts

If we revisit, B is the cheapest swing (no new credits — both clips already exist in `/tmp/`).

**Status as of EOD Apr 24:** Runway-based hero shipped and live. Wheat motion deferred. Kling master kept at `/tmp/hero-kling.mp4` (14.6 MB), FLUX seed at `/tmp/hero-flux-still.png` (5.9 MB), generator scripts at `/tmp/hero-{flux,runway,kling}.py`.

### Design decisions (locked)

- Cobalt-first palette, amber accent. No black.
- Typing animation on the title — mirrors the film's own opening/closing (`lightning/bug` types at start + end; cursor is the bug).
- Ten field stills trace the film's light arc: inside the can → porch → amber waves → transformer → contact → cobalt blues → hallway → shooting stars → path home.
- The 12 names of the sequence (Marco/Polo + 10 acts) rendered as an `<ol>`, bookends italic-dim, acts amber.
- Crew block ends with "in memory of Sandra Sue Simmons · 1944–2025."
- Footer: `claudewill · notes · derek` + colophon "the absence of darkness."

### Deliberately excluded

- No video embed scaffold (nothing to embed yet; empty placeholder would break the mood).
- No countdown banner (page is the thing, not a trailer for itself).
- No "how it's made" AI/tool callouts on the front — those live in the notes room.
- No subscribe CTA, no social buttons. The page is a held breath, not a funnel.

### Verified on prod

- `/lightning/bug/` → 200, 22.8KB
- `/lightning/bug/notes/` → 200, 116.2KB
- All 10 field stills + poster → 200
- `shared-nav.css`, `porch-widget.js` → 200
- Porch `cw> _` terminal trigger preserved for ecosystem consistency.

### Known gaps / next moves

**Waiting on Sonnet/Haiku:**
- Vimeo URL (password-protected) — when ready, build `/lightning/bug/watch/` with embed + access gate. Do NOT scaffold before the URL exists.
- Final still re-cuts (if Derek swaps in any of the 12 regen- approvals from overnight batch) — reconcile the 10 field stills.

**Opus-owned polish list (when Derek gives the next swing):**
- Mobile QA on real iPhone — dvh vs vh edge, typing speed, tap targets.
- Consider swapping the poster to an alt candidate if Derek picks a different festival-submission still.
- Add `/lightning/bug/watch/` scaffold once Vimeo lands.
- Light-arc audit: verify the 10 stills are in actual sequence order vs. the film cut.
- OG image check: `og-poster.jpg` may need refresh if poster still changes.

### Parked (explicitly not doing)

- Countdown clock — against the mood.
- Synopsis expansion — notes room already has it.
- Process/Research on the front — notes room, always.
- Video trailer loop as hero — will pull focus from the typing.

---

## Session coordination

Parallel today: Sonnet + Haiku in separate terminals.

- **Opus (me):** `/lightning/bug/` directory only. This file + README + index.html.
- **Sonnet:** film assembly, audio layer, Topaz upscale. `~/Desktop/lightning-bug/`.
- **Haiku:** Vimeo upload, submission form, festival ops.

If crossover is needed: Opus waits for asset. Does not reach into film repo.

---

## File map

```
lightning/bug/
├── index.html        ← active page
├── notes/index.html  ← archive, read-only
├── README.md         ← directory contract
└── OPUS.md           ← this log
```
