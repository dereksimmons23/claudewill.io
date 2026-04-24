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

1. **Cursor** — amber DOS cursor on cobalt, types the title + tagline, blinks.
2. **Poster** — D28-boy-exits-can, full bleed, fades in on load.
3. **Breath** — the logline, two lines, italic serif, lots of air.
4. **Field** — ten stills, full-viewport each, captions appear on scroll-in.
5. **Sequence** — the 12 names (Marco/Polo as bookends + 10 numbered acts).
6. **Crew** — director · studio · in memory of.
7. **Footer** — claudewill / notes / derek · "the absence of darkness."

## The archive

Everything the old page said still lives, unchanged, at `/lightning/bug/notes/`. The seven tabs (Story, Film, Song, Process, Places, Research, Inspo) and every image, coordinate, and reference remain. Linked from the new footer as `notes`.

## Design rules

- **Palette:** cobalt `#0a1628` (and deeper `#070d1a`), amber `#d4a84b`. No black.
- **Type:** IBM Plex Mono (ui), IBM Plex Serif 300 (body, italics).
- **Motion:** `prefers-reduced-motion` kills the typing + poster fade.
- **Units:** `dvh` not `vh` for mobile safari. `clamp()` on all scale.
- **No frameworks.** One HTML file. Inline CSS. ~40 lines of vanilla JS.

## When you edit

- The film is the subject. The page is the bookend. Restraint is the rule.
- If a section wouldn't survive a page weight audit (>30KB), cut it.
- New stills go in `/images/lightning-bug/` (site root).
- The notes archive is read-only. Don't patch it — it's the receipt of what the page was.

## Deploy

`git push origin main` → Netlify auto-builds (~1 min) → live.

Build command (netlify.toml): `node scripts/build-articles.js && node scripts/compile-prompt.js`. Neither touches this directory; static HTML ships as-is.
