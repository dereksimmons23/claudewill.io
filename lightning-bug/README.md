# /lightning/bug

The site surface for the film *lightning/bug*. Lives at `claudewill.io/lightning/bug`.

## What's here

```
lightning/bug/
├── index.html        the new experience — seven-scene scroll, ~23KB
├── notes/
│   └── index.html    the full original page, preserved — 1,716 lines
├── README.md         this file
└── OPUS.md           Opus session log (what ran, what's next)
```

## The page

Seven moments, top to bottom:

1. **Cursor (hero)** — looping wheat-storm MP4 fills the viewport. Amber DOS cursor types the title + tagline at center, dimming and brightening in sync with the storm's lightning bolts (10 s loop, strikes at 20% and 50%).
2. **Breath** — the logline, two lines, italic serif, lots of air.
3. **Field** — ten stills, full-viewport each, captions appear on scroll-in.
4. **Sequence** — the 12 names (Marco/Polo as bookends + 10 numbered acts).
5. **Crew** — director · studio · in memory of.
6. **Footer** — claudewill / notes / derek · "the absence of darkness."

## The archive

Everything the old page said still lives, unchanged, at `/lightning/bug/notes/`. The seven tabs (Story, Film, Song, Process, Places, Research, Inspo) and every image, coordinate, and reference remain. Linked from the new footer as `notes`.

## Design rules

- **Palette:** cobalt `#0a1628` (and deeper `#070d1a`), amber `#d4a84b`. No black.
- **Type:** IBM Plex Mono (ui), IBM Plex Serif 300 (body, italics).
- **Motion:** `prefers-reduced-motion` kills the typing animation, weather-pulse, and the hero video.
- **Units:** `dvh` not `vh` for mobile safari. `clamp()` on all scale.
- **No frameworks.** One HTML file. Inline CSS. ~40 lines of vanilla JS.
- **No CSS decoration on the film.** Grain, filters, synthetic overlays, fake letterboxes — all rejected (Apr 24). The film's images are shown as the film's images. Typography, layout, and restraint are the only intervention surfaces. Color grades belong baked into the asset (ffmpeg post-pass), not layered as CSS filter.

## When you edit

- The film is the subject. The page is the bookend. Restraint is the rule.
- If a section wouldn't survive a page weight audit (>30KB), cut it.
- New stills go in `/images/lightning-bug/` (site root).
- The notes archive is read-only. Don't patch it — it's the receipt of what the page was.

## Hero asset pipeline

The hero video at the top of the page is a real film-pipeline output, not a CSS composite:

```
FLUX Pro v1.1 Ultra (fal.ai)  →  /tmp/hero-flux-still.png    (still seed)
   ↓ image-to-video
Runway Gen-4.5 (api.dev.runwayml.com)  →  /tmp/hero-runway.mp4   (raw motion)
   ↓ ffmpeg single pass: scale + grade + extend + seamless loop
                              →  /video/lightning-bug-hero-storm.mp4
                              →  /images/lightning-bug/hero-poster-storm.jpg (frame 0)
```

API keys live in `~/Desktop/the-standard/.env` (`FAL_KEY`, `RUNWAYML_API_SECRET`). Kling 2.1 Pro is also available via the same `FAL_KEY` (`fal-ai/kling-video/v2.1/pro/image-to-video`) — used as a fallback when Runway resists animating something.

Type-sync (`@keyframes weather-pulse`) timings must match the lightning beats in the asset. If the MP4 changes, update the percentages.

## Deploy

`git push origin main` → Netlify auto-builds (~1 min) → live.

Build command (netlify.toml): `node scripts/build-articles.js && node scripts/compile-prompt.js`. Neither touches this directory; static HTML ships as-is.
