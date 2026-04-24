# OPUS — /lightning/bug session log

> Scoped to the site surface only. Sonnet handles film assembly; Haiku handles submission. Opus owns `claudewill.io/lightning/bug`.

---

## Session · 2026-04-24 (Fri, Day 114)

**Window:** 9:06 AM CDT open. Opus 4.7. Full creative control granted.
**Festival:** Runway AIFF, Apr 27 4:59 PM ET. Jurors not looking at the site today.
**Directive:** "Not homework. An experience. Mobile-first, great on any device."

### What shipped

Commit `0de5d6f0` on `main`, deployed to Netlify. Subsequent commits:
- `d1174c49` — README + OPUS
- `e1c1e792` — Sandra's birth year fix (1944)
- (next) — texture stack: grain + patina + inter-still cobalt haze + 2.39:1 poster

- **New page** at `/lightning/bug/` — seven-scene scroll, ~26KB (was 116,175).
- **Archive** at `/lightning/bug/notes/` — complete original page preserved, linked from new footer.
- **README.md** + **OPUS.md** added to `/lightning/bug/`.

### Texture stack (Apr 24, post-first-ship)

Four levers, each traced directly to project docs:

1. **Kodak Vision 500T grain** — inline SVG `feTurbulence` fractal noise, grayscale, opacity 0.09, overlay blend-mode. Layered via `::before` on `.field-still` and `.poster-frame`. Data URI ~350 bytes, reusable tile 240×240. Source: style-guide.md texture stack + color-theory.md "the grain itself is gray particles across both registers."
2. **Patina grade** — `filter: saturate(0.94) contrast(1.03)` on field stills and poster img. Source: color-theory.md post pass — "desaturate highlights 10-15% (amber loses its sharpness, gains patina)."
3. **Inter-still cobalt haze** — vertical gradient on `::before` of `.field-still`, cobalt at top (55% → 0 over 14%) and bottom (0 → 60% over last 8%). Source: style-guide.md composition rule 5 — "atmospheric perspective: depth via haze between planes."
4. **2.39:1 anamorphic poster frame (desktop ≥900px only)** — `aspect-ratio: 2.39/1` on `.poster-frame`, cobalt-deep letterbox bars on `.scene-poster` via flex-center. Mobile keeps full-bleed. Source: hall-prompt-vocabulary.md — "Panavision C-Series anamorphic."

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
