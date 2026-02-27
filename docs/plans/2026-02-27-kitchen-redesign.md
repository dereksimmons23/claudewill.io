# Kitchen Redesign — The Live Terminal

**Date:** February 27, 2026
**Status:** Approved
**Page:** claudewill.io/kitchen

---

## Problem

The Kitchen page is 8 text-heavy sections that nobody reads. All tell, no show. Paragraphs explaining what the overnight agents do instead of showing what they did. The question was: do people want to read about the kitchen or see how it works?

## Decision

Show how it works. A single-page terminal view — pixel art header, TUI-style collapsible sections, data rendered as terminal output with sparklines, status dots, and progress bars. No explanatory text.

---

## Visual Design

### Header: Pixel Art Wood-Burning Stove

A cast-iron wood-burning stove rendered in warm browns using Unicode braille characters or CSS dot grid (halftone/stipple texture). Smoke rising from the chimney = the overnight agents ran. ~60-80px tall on desktop, scales proportionally on mobile.

Below the stove:
```
t h e   k i t c h e n
```

One line. No tagline. The art does the talking.

Reference: Claude Code CLI splash screen (pixel art mascot rendered with colored half-block characters), plus the halftone house reference image.

### Typography

IBM Plex Mono throughout (already in use on current Kitchen page).

### Color System

Semantic, not decorative:
- `●` green — ok/healthy
- `⚑` amber — flags/attention needed
- Red — errors (rare, only if agents fail)
- Dim gray — timestamps, secondary info
- Default text — data, names, values

### Light / Dark Mode

`prefers-color-scheme: dark` media query. Same pattern as shared-nav.css. No hardcoded dark override (current page hardcodes dark via `.kitchen-page` — this gets removed).

**Dark mode:**
- Background: #0a0a0a
- Text: #e5e5e5
- Dim: #737373
- Accent (ok): #34d399
- Flag: #f59e0b
- Error: #f87171
- Borders: #262626

**Light mode:**
- Background: #fafaf9
- Text: #1a1a1a
- Dim: #737373
- Accent (ok): #059669
- Flag: #d97706
- Error: #dc2626
- Borders: #e5e5e5

Pixel art stove adjusts — warm browns on light, muted warm tones on dark.

---

## Layout: TUI-Style Collapsible Sections

Every section: **label + count** (always visible) → **expandable list** (click/tap).

Tree connectors (`├ └ │`) for visual hierarchy within expanded sections.

### Default State on Load

- **Overnight:** Expanded (hero section — "what happened while you slept")
- **Now:** Always visible (not collapsible)
- **Projects, Stack, Method:** Collapsed to label + count

### Terminal Output

```
        [pixel art wood-burning stove]

        t h e   k i t c h e n


Overnight  9                      Feb 27, 05:01 CST
├ site-audit       ● 8 pages         276ms
├ code-review      ● clean
├ research-brief   ● quiet
├ analytics        ● 163 conversations
│ └ ░░▂▃▅▇█▆▃▁░░▂▃▅▇█▆▄▂▁▃▅▇  30d
├ content-scan     ⚑ 19 issues
├ social-draft     ⚑ 3 drafts
├ pipeline-scan    ● 3 items
├ research-status  ⚑ 1 blocked
└ industry-brief   ● 3 items

─── now ─────────────────────────────────────

  derek × claude   opus 4.6   14.5h / 8 sessions
  75,922 messages  ████████░░░░░░░░  day 54/151

Projects  8
├ ● cascadia       active        $10K/mo
├ ● coach d        live          157 drills
├ ● claudewill.io  live          8 pages
├ ● bob            live          v2.9.6
├ ◉ hancock        autonomous
├ ◐ dawn           54/151        ██████░░░░ 36%
├ ● finding claude active        32 ch
└   derek claude   live          v1.0

Stack  10                         ~$125/mo
├ claude code      the engine     $100/mo
├ haiku 4.5        porch + memory
├ gemini flash     industry brief
├ perplexity       research brief
├ mistral          code review
├ netlify          hosting + functions
├ supabase         database + logging
├ cloudflare       workers + DNS
├ github actions   overnight scheduler
└ elevenlabs       voice

Method
  start → work → finish → decide
```

---

## Data Visualization Elements

### Sparklines (block characters)

Replace sentences about trends with visual bars:
```
conversations  ░░▂▃▅▇█▆▃▁░░▂▃▅▇█▆▄▂▁  30d
```

Built from Unicode block elements: `░ ▁ ▂ ▃ ▄ ▅ ▆ ▇ █`

### Progress Bars (block characters)

Replace fractions with visual progress:
```
dawn  ██████░░░░  54/151  36%
```

### Status Indicators

- `●` — healthy/active/live
- `◉` — autonomous (running independently)
- `◐` — in-progress/tracking (has endpoint)
- `⚑` — flags/attention needed

---

## Expandable Agent Lines

Each agent line in the Overnight section is expandable via `<details>/<summary>`. Clicking reveals the agent's full detail — flags list, sources, detailed metrics.

Example collapsed:
```
├ content-scan     ⚑ 19 issues
```

Example expanded:
```
├ content-scan     ⚑ 19 issues
│ ├ derek/research/being-claude: redirect chain (301)
│ ├ derek/research/comprehension-problem: redirect chain (301)
│ ├ derek/research/index.html: 3 stale links
│ ├ derek/research/the-bright-line: redirect chain (301)
│ ├ derek/research/warm-up-effect: redirect chain (301)
│ └ map.html: /library redirects to /derek (301)
```

Native `<details>/<summary>` HTML elements — no JavaScript framework needed. Touch-friendly on mobile.

---

## Mobile

- Single column, full width below 720px
- Horizontal padding reduces to 16px
- Pixel art stove scales down (smaller font-size on the rendering element)
- Tree connectors preserved
- Timestamps can stack above content at < 400px if needed
- `<details>` expand/collapse is touch-native
- No horizontal scroll — lines truncate with `...`, expand on tap

---

## Data Sources (Unchanged)

Three fetches, same as current page:

1. `kitchen-data.json` — agents, projects, stack, method (committed by overnight bot)
2. `/.netlify/functions/island-data` — session memories from Supabase
3. `/data/message-stats.json` — conversation counts

No new APIs. No new dependencies.

---

## What Gets Cut

- All 8 section intro paragraphs (~200 lines of HTML)
- The pulse animation section
- The crew visual (4-lens card layout)
- The compulsion counter section (becomes one line under "now")
- Card-based layouts for projects and stack
- ~600 lines of section-specific CSS
- ~400 lines of section-specific JS renderers

## What's New

- Pixel art wood-burning stove header (Unicode/CSS, warm browns, halftone stipple)
- TUI-style collapsible sections (label + count → expandable list)
- Sparkline data visualization (Unicode block elements)
- Progress bars from block characters
- Status dot system (●, ◉, ◐, ⚑)
- Tree connectors for visual hierarchy (├ └ │)
- Light mode support (currently hardcoded dark)
- `<details>/<summary>` for expand/collapse
- `── now ──` temporal divider

## What Stays

- IBM Plex Mono font
- Same three data sources
- Same data — agents, projects, stack, method, island, messages
- Vanilla JS (no framework)
- Shared nav/footer

---

## Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the Kitchen page as a TUI-style live terminal with pixel art header, collapsible sections, sparklines, and light/dark mode support.

**Architecture:** Full rewrite of kitchen/index.html (707→~200 lines) and css/kitchen.css (802→~200 lines). Same three data sources, same nav/footer integration, vanilla JS only. The HTML becomes a minimal shell with a `<div id="terminal">` container; JS renders all content from fetched data. CSS handles the terminal aesthetic and light/dark theming.

**Tech Stack:** HTML, CSS (custom properties + media queries), vanilla JS, IBM Plex Mono, Unicode block/braille characters

---

### Task 1: Rewrite kitchen.css — Terminal Foundation

**Files:**
- Rewrite: `css/kitchen.css` (802 lines → ~200 lines)

**Step 1: Replace the entire CSS file**

Delete all 802 lines. Write new CSS with:

1. Light-mode-first CSS custom properties on `.kitchen-page` (bg, text, dim, accent-ok, accent-flag, accent-error, border, stove-primary, stove-shadow)
2. `@media (prefers-color-scheme: dark)` block overriding those variables
3. `.kitchen-page` base styles: font-family IBM Plex Mono, font-size 14px, line-height 1.6
4. `.terminal` container: max-width 720px, margin auto, padding 0 24px 80px
5. `.stove-art` wrapper: text-align center, line-height 1.0, font-size 10px, margin-bottom 1.5rem, user-select none
6. `.kitchen-title`: letter-spacing 0.3em, text-align center, font-size 1rem, margin-bottom 2rem, color dim
7. `.section-header`: cursor pointer, display flex, justify-content space-between, padding 0.5rem 0, border-top 1px solid border var, color text, font-weight 600
8. `.section-header .count`: color dim, font-weight 400
9. `details.tui-section` styles: no default marker (`summary { list-style: none; }`, `summary::-webkit-details-marker { display: none; }`)
10. `details[open] > .section-body`: padding-left 0
11. `.tui-line`: display grid, grid-template-columns `2ch auto 1fr auto`, gap 0 0.75ch, align-items baseline, padding 2px 0
12. `.tui-line .tree`: color dim (for `├ └ │`)
13. `.tui-line .name`: white-space nowrap
14. `.tui-line .status`: class-based color (`.ok { color: var(--accent-ok) }`, `.flag { color: var(--accent-flag) }`, `.error { color: var(--accent-error) }`)
15. `.tui-line .value`: color dim, text-align right, overflow hidden, text-overflow ellipsis
16. `.tui-sub`: padding-left 4ch (nested detail lines)
17. `.divider`: border-top 1px solid border var, margin 1.5rem 0, position relative (for the `── now ──` label)
18. `.divider-label`: position absolute, top -0.7em, left 0, background var(--bg), padding-right 1ch, color dim, font-size 0.85rem
19. `.now-section`: padding 0.5rem 0
20. `.sparkline`: color dim
21. `.progress-bar .filled`: color var(--accent-ok); `.empty`: color var(--border)
22. Dark-mode overrides for shared-nav header/footer (same as current but using new variable names)
23. Mobile: `@media (max-width: 700px)` — padding 0 16px, stove font-size 7px; `@media (max-width: 400px)` — `.tui-line` grid collapses to flex-wrap

**Step 2: Verify the file is saved**

Run: `wc -l css/kitchen.css`
Expected: ~150-200 lines

**Step 3: Commit**

```bash
git add css/kitchen.css
git commit -m "kitchen: rewrite CSS as terminal foundation with light/dark mode"
```

---

### Task 2: Rewrite kitchen/index.html — Terminal Shell

**Files:**
- Rewrite: `kitchen/index.html` (707 lines → ~120 lines)

**Step 1: Replace the entire HTML file**

Keep: `<head>` (meta, fonts, CSS links, OG tags), shared nav header, footer, porch widget scripts.

Remove: All 8 `<section>` blocks, all inline `<script>` (530+ lines of render functions), the hero, the CTA.

New `<main>` contains only:

```html
<main>
  <!-- Pixel art stove — static, rendered by CSS/Unicode -->
  <div class="stove-art" id="stove-art" aria-hidden="true"></div>
  <div class="kitchen-title">t h e &nbsp; k i t c h e n</div>

  <!-- Terminal output — JS renders everything below -->
  <div id="terminal">
    <div class="loading-state">loading...</div>
  </div>
</main>
```

The nav header center text changes from dropdown to just `the kitchen` (no section dropdown — there are no sections to jump to).

New `<script>` at bottom: a single `kitchen.js` file reference (or inline IIFE if keeping current pattern).

**Step 2: Verify the file is saved**

Run: `wc -l kitchen/index.html`
Expected: ~100-120 lines

**Step 3: Commit**

```bash
git add kitchen/index.html
git commit -m "kitchen: rewrite HTML as minimal terminal shell"
```

---

### Task 3: Build the Terminal Renderer (JS)

**Files:**
- Create: `js/kitchen.js` (~250 lines)

This is the core logic. One IIFE that:

1. **Fetches all three data sources** in parallel (`Promise.all`)
2. **Renders the stove pixel art** into `#stove-art` (a pre-built string of colored spans using half-block characters — `▀ ▄ █` — wrapped in a `<pre>`)
3. **Renders the Overnight section** as an open `<details>` element:
   - Summary line: `Overnight  {count}` + timestamp right-aligned
   - Body: one `.tui-line` per agent with tree connector, name, status dot, summary value
   - Agents with flags get a nested sub-list of flag items
   - Analytics agent gets a sparkline row (conversation data as block chars)
4. **Renders the Now divider** — `─── now ───` + island data below (derek x claude, hours, sessions, message count + Dawn progress bar)
5. **Renders Projects section** as a closed `<details>`:
   - Summary: `Projects  {count}`
   - Body: `.tui-line` per project with status dot (● ◉ ◐), name, status, note
   - Dawn gets a progress bar
6. **Renders Stack section** as a closed `<details>`:
   - Summary: `Stack  {count}  ~$125/mo`
   - Body: `.tui-line` per stack item with name, role, cost (if any)
7. **Renders Method section** as a closed `<details>`:
   - Summary: `Method`
   - Body: single line `start → work → finish → decide`

**Helper functions needed:**

```javascript
// Sparkline from array of numbers
function sparkline(values) {
  var chars = ' ░▁▂▃▄▅▆▇█';
  var max = Math.max.apply(null, values);
  if (max === 0) return chars[0].repeat(values.length);
  return values.map(function(v) {
    return chars[Math.ceil((v / max) * (chars.length - 1))];
  }).join('');
}

// Progress bar from current/total
function progressBar(current, total, width) {
  width = width || 10;
  var filled = Math.round((current / total) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// Tree connector for item at index i of length n
function tree(i, n) {
  return i < n - 1 ? '├' : '└';
}

// Status dot from project status string
function statusDot(status) {
  if (status === 'Autonomous') return '◉';
  if (/day|\//.test(status)) return '◐';
  return '●';
}

// Agent status indicator
function agentStatus(s) {
  if (s === 'ok') return { char: '●', cls: 'ok' };
  if (s === 'flags') return { char: '⚑', cls: 'flag' };
  return { char: '○', cls: 'error' };
}

// Format timestamp from ISO string to "Feb 27, 05:01 CST"
function fmtTime(iso) { ... }
```

**Step 1: Write js/kitchen.js with all rendering logic**

The file should be a single IIFE. All DOM generation uses `document.createElement` (same pattern as current cw.js). No template literals (ES5 compat for older browsers).

**Step 2: Update kitchen/index.html to reference the new script**

Replace the inline `<script>` block with:
```html
<script src="/js/kitchen.js"></script>
```
Keep the shared-nav.js and porch-widget.js script tags.

**Step 3: Test locally**

Run: `netlify dev` or open kitchen/index.html
Expected: Terminal renders with overnight data expanded, now section, projects/stack/method collapsed

**Step 4: Commit**

```bash
git add js/kitchen.js kitchen/index.html
git commit -m "kitchen: add terminal renderer with sparklines and TUI sections"
```

---

### Task 4: Build the Pixel Art Stove

**Files:**
- Modify: `js/kitchen.js` — the `renderStove()` function

**Step 1: Design the stove as a grid of colored half-block characters**

The stove should be:
- ~20 chars wide, ~12 rows tall (using half-blocks = ~24 pixel rows)
- Warm browns: `#8B4513` (saddle brown), `#A0522D` (sienna), `#D2691E` (chocolate), `#CD853F` (peru)
- Dark accents: `#3E2723` (dark brown), `#1a1a1a` (near-black for stove door/grate)
- Smoke: `#9e9e9e` (gray), rising from chimney (2-3 rows of braille dots `⠁⠂⠄` or half-blocks)
- Transparent background (uses page bg)

Structure: a `<pre>` element containing `<span>` elements with inline `color` and `background-color`. Each row is a line of half-block characters.

Light mode: same brown tones on light background.
Dark mode: same brown tones on dark background (browns are warm enough to work on both).

**Step 2: Encode the stove as a compact data structure**

Instead of raw HTML strings, store as a 2D pixel grid where each cell is a color index:

```javascript
var STOVE_COLORS = ['transparent', '#8B4513', '#A0522D', '#D2691E', '#3E2723', '#9e9e9e', '#CD853F'];
var STOVE_PIXELS = [
  // Each row is pairs: [fg_index, bg_index] for each half-block character
  // Row 0 (smoke): mostly transparent with a few gray smoke dots
  ...
];
```

Then render with a loop that maps each pixel pair to a `▀` char with foreground = top pixel, background = bottom pixel.

**Step 3: Add CSS animation for smoke (optional, `prefers-reduced-motion` respected)**

A subtle opacity pulse on the smoke spans (0.4 → 1.0, 4s cycle). Only if `prefers-reduced-motion: no-preference`.

**Step 4: Verify it looks good on both themes**

Run: `netlify dev`, toggle system dark/light mode
Expected: Stove visible on both, smoke subtle

**Step 5: Commit**

```bash
git add js/kitchen.js
git commit -m "kitchen: add pixel art wood-burning stove header"
```

---

### Task 5: Mobile Polish + Final Testing

**Files:**
- Modify: `css/kitchen.css` (mobile breakpoints)
- Modify: `js/kitchen.js` (truncation behavior)

**Step 1: Test at 375px width (iPhone SE)**

Check: stove scales down, no horizontal scroll, tree connectors visible, details expand/tap works, text doesn't overflow.

**Step 2: Test at 400px width**

If timestamps cause overflow, add CSS to stack them above the line on narrow screens.

**Step 3: Test light and dark mode**

Toggle system preference. Verify: bg colors, text colors, status dot colors, stove colors, shared nav/footer all match.

**Step 4: Test with kitchen-data.json edge cases**

What if an agent is missing? What if `projects` is empty? What if island-data returns error? Each should degrade gracefully — missing sections just don't render, no error shown.

**Step 5: Commit**

```bash
git add css/kitchen.css js/kitchen.js
git commit -m "kitchen: mobile polish and edge case handling"
```

---

### Task 6: Push and Verify Production

**Step 1: Final commit with all changes**

```bash
git status
git push origin main
```

**Step 2: Wait for Netlify deploy**

Check deploy status at Netlify dashboard or `netlify status`.

**Step 3: Verify production**

Visit https://claudewill.io/kitchen — confirm:
- Stove art renders
- Overnight section expanded with live data
- Projects/Stack/Method collapsed
- Light/dark mode works
- Mobile works
- Porch widget still loads
- No console errors

**Step 4: Update HANDOFF.md**

Add Kitchen redesign to completed items.
