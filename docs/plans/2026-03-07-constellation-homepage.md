# Constellation Homepage

**Date:** March 7, 2026
**Status:** Approved concept, building prototype

---

## The Insight

Three things have been tangled since v1:

1. **The homepage** — the invitation, the thesis, the "what is this?"
2. **The navigation** — how you get around
3. **The porch** — CW's conversation, the product, the constant

The constellation untangles them.

## The Design

### 1. The Homepage is the Invitation

One star. The asterisk. "claudewill" beneath it.

Click the star — the meaning unfolds right there. Three meanings:
- **A farmer's name.** Claude William Simmons. 1903-1967. Oklahoma.
- **A future tense.** Claude will ___. Listen. Speak. Find a way. Keep going.
- **A question about agency.** Does the machine have will? The domain holds the tension without resolving it.

Why does it exist when Anthropic's north star is already there? It doesn't need to. "Building capacity is everywhere and willingness comes in a lot of forms." It's the little star, not the north star. A porch light, not the sun. Different job. Different scale.

### 2. The Constellation is the Map

Smaller labeled stars around the central one:
- **derek** → /derek
- **claude** → /claude
- **the standard** → /standard
- **the kitchen** → /kitchen
- **the story** → /story

Clickable. The navigation IS the sky. No hamburger menu needed on the homepage — the constellation is the menu.

Constellation lines (thin, low-opacity gold) connect related stars. The layout should feel organic, not gridded.

### 3. CW's Porch is the Constant

The `cw> _` trigger stays in the corner. Every page. Doesn't move. Doesn't grow. Doesn't shrink.

On the homepage, the porch widget appears after the constellation scrolls out of view (same IntersectionObserver pattern as current). Or it's always visible in the corner, smaller. The porch is NOT part of the constellation. It's the constant that outlives every redesign.

## Visual Direction

**Light mode (default):**
- Warm white background (#fafaf8)
- Central asterisk: large, gold (#d4a84b), glowing (text-shadow)
- Constellation stars: smaller gold dots, varying opacity (0.4-0.8)
- Labels: dim gray (#6b7280), appear near stars
- Constellation lines: 1px, gold at 0.15 opacity
- The "claudewill" wordmark below the central star

**Dark mode:**
- Deep navy/black background
- Stars become brighter, more dramatic
- The constellation gains contrast
- The porch light feels warmer against the dark

**Interaction:**
- Click central star → meaning content expands/reveals below it (smooth, not jarring)
- Hover constellation stars → labels brighten, subtle glow
- Click constellation stars → navigate to page
- Mobile: stars always labeled (no hover), tap to navigate, central star tap reveals meaning

## Technical Approach

CSS-first. Absolute-positioned elements within a flex container. No canvas.

```
.constellation {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star {
  position: absolute;
  /* positioned with top/left percentages */
}

.star-central {
  /* large, centered, the asterisk */
}
```

Constellation lines: SVG overlay or CSS borders. SVG is cleaner for arbitrary connections.

The meaning expansion: a div below the central star that grows from height 0. The constellation stars shift down gently to make room. Or: the meaning appears overlaid on the constellation, dimming the stars slightly.

## What This Replaces

Current homepage Screen 1:
- Porch light asterisk (48px) — KEEPS as central star
- "claudewill" wordmark — KEEPS beneath star
- Intro text ("named after my grandfather...") — MOVES into star-click expansion
- Typewriter ("claude will ___") — MOVES into star-click expansion or KEEPS as ambient element

Current homepage Screen 2 (the builder):
- "who is derek simmons?" — REPLACED by constellation (derek star)
- Bio list, typewriter, CTAs — REPLACED by direct navigation via stars

Current homepage Screen 3 (the standard):
- Five principles list — REPLACED by constellation (the standard star)
- Or: KEEPS as a lower section for scroll-past discovery

## Open Questions

1. Does the standard still get its own screen below the constellation, or is it just a star?
2. Should the constellation be the ENTIRE homepage (one screen, scroll for footer only)?
3. How does the typewriter fit? "claude will ___" is a strong ambient element. Maybe it runs inside the central star area.
4. Mobile layout: how do 5-6 stars + labels fit on a 375px screen without feeling cramped?

---

*"the honest answer is it doesn't need to exist. building capacity is everywhere and willingness comes in a lot of forms."* — Derek, March 7, 2026
