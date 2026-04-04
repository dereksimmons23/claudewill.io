# Mobile Readability Audit — claudewill.io
**Date:** March 30, 2026
**Scope:** Kitchen TUI, Homepage, /derek, Being Claude index, The Dimmer Switch essay, shared-nav.css, porch-widget.css
**Trigger:** Kitchen page shown on mobile — too small to read

---

## The Short Version

The Kitchen is broken on small phones. Everything else is mostly fine with a few fixable gaps. The Kitchen's problems are structural — a desktop TUI squished into a mobile viewport — and need a deliberate mobile layout strategy, not just bumped font sizes.

---

## 1. Text Sizes Below 14px — By File

All sizes converted from `rem` assuming the page's declared base font size (`html { font-size: }`) unless inline px is used directly.

### Kitchen (`kitchen/index.html`)

The Kitchen sets `html { font-size: 14px }` at desktop. At `max-width: 800px` it drops to **13px**. At `max-width: 520px` it drops to **12px**. Every `rem` value below compounds off that shrunken base.

| Element | CSS Size | Computed px (at 520px viewport) | Line |
|---------|----------|----------------------------------|------|
| `html` base | `14px` → `12px` | 12px | 50, 549 |
| `.tui-section-header` | `0.7rem` | **8.4px** | 128 |
| `.m-label` (metric labels) | `0.65rem` | **7.8px** | 205 |
| `.m-sub` (metric sub-text) | `0.7rem` | **8.4px** | 209 |
| `.spark-tf .tf-label` | `0.6rem` | **7.2px** | 279 |
| `.spark-tf .tf-value` + text | `0.7rem` | **8.4px** | 285 |
| `.check-row` (site checks) | `0.75rem` | **9px** | 471 |
| `.check-row .ck-path` | `0.72rem` | **8.6px** | 478 |
| `.check-row .ck-code` | `0.7rem` | **8.4px** | 479 |
| `.check-row .ck-ms` | `0.68rem` | **8.2px** | 482 |
| `.tui-bottom-nav` | `0.7rem` | **8.4px** | 509 |
| `.tui-refresh-note` | `0.65rem` | **7.8px** | 516 |
| `.status-cell .s-detail` | `0.7rem` | **8.4px** | 174 |
| `.work-item .wi-status` | `0.7rem` | **8.4px** | 332 |
| `.principle-row .p-num` | `0.7rem` | **8.4px** | 362 |
| `.agent-row .ag-time` | `0.7rem` | **8.4px** | 406 |
| `.agent-row .ag-status` | `0.7rem` | **8.4px** | 406 |
| `.stack-row .sk-role` | `0.7rem` | **8.4px** | 432 |
| `.spark-label` | (inherits `0.78rem`) | **9.4px** | 237 |

**Summary:** On a 375px iPhone, the Kitchen is rendering section headers at ~9px and metric labels at ~8px. This is not a readability problem — it's a legibility problem. 8px text in a dark terminal on a phone screen is invisible.

### Homepage (`index.html`)

Base font: `16px`. No base-size reduction on mobile.

| Element | CSS Size | Computed px | Note | Line |
|---------|----------|-------------|------|------|
| `.ground-built-by` | `0.8rem` | **12.8px** | "built by" label | 396 |
| `.site-footer` | `0.75rem` | **12px** | Footer text | 419 |
| `.book-countdown` | `0.8rem` | **12.8px** | Countdown timer | 437 |
| `.name-hook` (mobile) | `0.7rem` | **11.2px** | "it's all practice." | 328 |
| `.sky-writing a` (mobile) | `0.8rem !important` | **12.8px** | Floating title links | 537 |

These are metadata/decoration, not body text, so they're defensible — but the footer at 12px and the name-hook at 11.2px on mobile are borderline. The countdown timer is in the user's face; at 12.8px it's too small for comfortable reading while moving.

### `/derek` (`derek.html`)

Base font: `17px`. Solid foundation.

| Element | CSS Size | Computed px | Note | Line |
|---------|----------|-------------|------|------|
| `.section-label` | `0.7rem` | **11.9px** | Section eyebrows | 123 |
| `.case-label` | `0.7rem` | **11.9px** | Case study labels | 141 |
| `.hero-text .role` | `0.75rem` | **12.75px** | Role descriptor in hero | 82 |
| `.gallery-hint` | `0.65rem` | **11.05px** | "scroll →" hint | 152 |
| `.link-btn` | `0.72rem` | **12.24px** | Link buttons | 163 |
| `.site-footer` | `0.72rem` | **12.24px** | Footer | 173 |

The `17px` body and `1.7` line-height are good. The section eyebrows at 11.9px are below the 12px floor but tolerable since they're uppercase, high-contrast, and decorative. The gallery hint at 11px is the lowest on this page and also the least critical.

### Being Claude Index (`being-claude/index.html`)

Base font: `16px`.

| Element | CSS Size | Computed px | Note | Line |
|---------|----------|-------------|------|------|
| `.article-card-status` | `0.65rem` | **10.4px** | Live/Coming badge | 178 |
| `.data-bar-item` | `0.85rem` | **13.6px** | Stats bar | 143 |
| `.card-meta` | `0.8rem` | **12.8px** | Date/sources metadata | 215 |
| `.section-label` | `0.75rem` | **12px** | Section headers | 226 |
| Footer `font-size` | `0.85rem` | **13.6px** | Footer text | 292 |

The article cards themselves (title at `1.2rem`, subtitle at `0.9rem`) are fine. The status badge at 10.4px is the lowest — it's six characters of uppercase text in a colored border. Technically below the absolute floor.

### The Dimmer Switch Essay (`being-claude/the-dimmer-switch/index.html`)

Uses `article.css`. Base: `18px`. This is the best-tuned page in the set.

| Element | CSS Size | Computed px | Note | Line (article.css) |
|---------|----------|-------------|------|--------------------|
| `.series-label` | `0.75rem` | **13.5px** | "Being Claude · Essay 13" | 58 |
| `.byline` | `0.85rem` | **15.3px** | Author line | 89 |
| `.dateline` | `0.8rem` | **14.4px** | Date | 97 |
| `.observation-tag`, `.claim-tag` | `0.65rem` | **11.7px** | Evidence badges | 150 |
| `.footnote-ref` | `0.75rem` | **13.5px** | Footnote superscripts | 173 |
| `.back-link` | `0.9rem` | **16.2px** | Back navigation | 45 |
| `.article-nav a` | `0.85rem` | **15.3px** | Prev/next nav | 305 |
| `.share-label` | `0.75rem` | **13.5px** | Share bar label | 389 |
| `.share-btn` | `0.75rem` | **13.5px** | Share buttons | 401 |
| `.porch-panel-disclaimer` | `0.65rem` | **11.7px** | Widget disclaimer | porch-widget.css:269 |

Body text at `18px` with `1.8` line-height is excellent. The `18px` base with the monospace font means even the metadata reads better than comparable pages.

### Shared Nav (`css/shared-nav.css`)

Base inherits from page.

| Element | CSS Size | Note | Line |
|---------|----------|------|------|
| `.cw-palette-item` | `0.9rem` | Nav overlay sub-items | 85 |
| `.cw-palette-index` | `0.85rem` | "site index" link | 104 |
| `.signoff` | `0.75rem` | Footer signoff | 347 |
| `.page-header-center` (mobile) | `0.8rem` | Page title in header | 393 |
| `.page-header-right` (mobile) | `0.8rem` | "menu" trigger | 397 |
| `.page-dropdown a` | `0.8rem` | Dropdown items | 311 |

These all compute above 12px on pages with a 16px+ base. The palette overlay (`max-width: 400px`) has good sizing but no explicit mobile size reduction.

### Porch Widget (`css/porch-widget.css`)

| Element | CSS Size | Computed px | Note | Line |
|---------|----------|-------------|------|------|
| `.porch-panel-textarea` (mobile) | `1rem` (mobile override) | 16px | Chat input — correct | 343 |
| `.porch-chip` (mobile) | `0.7rem` | 11.2px | Prompt chips | 349 |
| `.porch-panel-disclaimer` | `0.65rem` | 10.4px | Disclaimer below input | 269 |
| `.porch-widget` (mobile) | `0.8rem` | 12.8px | Trigger button | 325 |

The textarea correctly sets `1rem` on mobile to prevent iOS Safari's auto-zoom (which triggers below 16px on inputs). Everything else is fine or minor. The chips at 11.2px on mobile are the only structural concern.

---

## 2. Touch Targets Below 44px

Apple HIG and WCAG 2.5.5 require 44x44px minimum for interactive elements. WCAG 2.5.8 (AA, 2023) relaxes to 24x24px with adequate spacing — but 44px is still the gold standard for mobile-first design.

### Kitchen (`kitchen/index.html`)

| Element | Estimated Size | Issue |
|---------|---------------|-------|
| `.tui-bottom-nav a` links | ~20px tall | Small text, no padding specified — tap target is text height only |
| `.tui-wordmark` (top bar) | Decorative only | N/A — not interactive |
| Status dots (7x7px) | 7x7px | Visual only — not interactive, but they signal state |

The Kitchen has almost no interactive elements other than the bottom nav links. The bottom nav sits at `0.7rem` (`8.4px` on mobile) with no specified padding that would expand the hit area. A user trying to tap "claudewill.io" or "being-claude" in the bottom bar on a phone is tapping a thread.

### `/derek` (`derek.html`)

| Element | Declared Size | Issue |
|---------|--------------|-------|
| `.hero-btn` | `padding: 7px 16px` | ~32px tall — below 44px |
| `.voice-btn` | `padding: 7px 16px` | ~32px tall — below 44px |
| `.section a.cta` | `padding: 6px 16px` | ~30px tall — below 44px |
| `.link-btn` | `padding: 6px 14px` | ~30px tall — below 44px |
| `.page-header .menu-trigger` | `padding: 0` | Inherits no padding — text only |

The hero buttons have visual padding but total height with the `0.75rem` font lands around 30-32px. Below the threshold, and these are the primary call-to-action elements on a profile page.

### Being Claude Index (`being-claude/index.html`)

| Element | Declared Size | Issue |
|---------|--------------|-------|
| `.article-card` | `padding: 28px` | Full card is a link — large target, fine |
| `.page-dropdown a` | `padding: 0.4rem 1.2rem` | ~22-24px tall — marginal |
| `.section-label` (non-interactive) | N/A | Not a target |

Article cards are fine (they're block links). The dropdown items are marginally small.

### The Dimmer Switch Essay (`article.css`)

| Element | Declared Size | Issue |
|---------|--------------|-------|
| `.back-link` | `0.9rem`, inline-flex | ~24px tall with no explicit height — below 44px |
| `.article-nav a` | `0.85rem` text | ~22-24px tall — below 44px |
| `.share-btn` | `padding: 4px 12px` | ~24px tall — below 44px |
| `.pq-share-btn` | `padding: 3px 10px` | ~22px tall — below 44px |
| `.footnote-ref` | `font-size: 0.75rem` | Superscript — impossible to tap |

The back link, prev/next nav, and share buttons all miss the 44px standard. The footnote refs are the most egregious — superscript text with no padding is effectively untappable on mobile.

### Shared Nav (`css/shared-nav.css`)

| Element | Declared Size | Issue |
|---------|--------------|-------|
| `.cw-palette-close` | `padding: 0.5rem`, `font-size: 2.2rem` | ~44px+ — fine |
| `.cw-palette-section` | `padding: 0.5rem 0` | ~30px — below 44px |
| `.cw-palette-item` | `padding: 0.3rem 0` | ~24px — below 44px |
| `.page-dropdown a` | `padding: 0.4rem 1.2rem` | ~22-24px — below 44px |
| `.cw-palette-trigger` | `padding: 0.25rem 0.5rem` | ~24px — below 44px |

The command palette (`.cw-palette`) is the primary mobile navigation mechanism. Section links are close at 30px. Sub-items at 24px are hard to tap precisely. The palette is dark, full-screen, monospace — the aesthetic is right, the tap targets are not.

### Porch Widget (`css/porch-widget.css`)

| Element | Declared Size | Issue |
|---------|--------------|-------|
| `.porch-widget` (mobile) | `padding: 8px 14px`, `0.8rem` font | ~30-32px tall — below 44px |
| `.porch-panel-send` | `padding: 8px 14px` | ~32px — below 44px |
| `.porch-chip` (mobile) | `padding: 5px 10px` | ~26px — below 44px |
| `.porch-panel-close` (mobile) | `padding: 8px 12px`, `1.6rem` font | ~42px — close, probably fine |

The porch widget trigger and send button are both below 44px on mobile. These are the two most-used controls in the entire chat interface.

---

## 3. Kitchen TUI — Specific Assessment

The Kitchen was the trigger for this audit. Here is what's actually happening.

### What's broken

**The scale cascade.** The Kitchen sets `html { font-size: 14px }` — already below the standard 16px default. Then it reduces further: 13px at 800px wide, 12px at 520px wide. Every rem-based size compounds down from 12px on a phone. Section headers (`0.7rem`) land at 8.4px. Sparkline labels (`0.6rem`) land at 7.2px. These are not "small" — they are below legibility threshold on any screen in any lighting condition.

**The grid system.** The metrics row uses `repeat(6, 1fr)` — six equal columns on any width. On a 375px phone with 0.5rem padding, each metric cell is ~54px wide with a `1.6rem` value (`~19px` at 12px base) and an `0.65rem` label (`~7.8px`). The value is readable. The label explaining what it means is not.

**The sparklines.** Spark bars with `min-width: 3px` and `height: 24px` are fine visually. The labels and timeframe annotations are at `0.6-0.7rem` computed to 7-8px. The sparklines become art, not data.

**The status dots.** At 7x7px, the dots are visible but small. Not the main problem — the text next to them at 0.8rem/9.6px (mobile) is the problem.

**The two-column layout.** On mobile (`max-width: 800px`), the Kitchen correctly stacks to single column. But content density stays the same — same number of rows, same amount of text, just narrower. Nothing deprioritizes on small screens.

**The top bar.** At 520px, the topbar stacks to column with `flex-direction: column`. This is good. But `font-size: 0.8rem` on the topbar center computes to 9.6px. "minneapolis, mn" and "the kitchen" as navigation context become invisible.

### What works

- Dark terminal aesthetic is appropriate for a dashboard — no light mode needed
- Two-column stacks to single on mobile (correct breakpoint behavior)
- Top bar wraps with `flex-wrap` — avoids overflow
- `padding: 0.5rem 0.5rem` on the frame at 520px reduces wasted space
- The stove pixel art (if present) is visual and doesn't depend on text legibility

### What to do (recommendations, not implementation)

**Option A: Scale the base, not the breakpoints.** Remove the base font reduction at breakpoints. Instead, set `html { font-size: 16px }` across the board and adjust individual element sizes down from there. The TUI aesthetic doesn't require tiny type — terminals have readable text.

**Option B: Mobile-first simplified layout.** At `max-width: 480px`, show a stripped-down Kitchen: status dots + labels (readable), the three most important metrics (large), one sparkline, and a "full dashboard →" link. The dense TUI becomes a summary card on mobile. Collapsible sections via accordion pattern would let users drill in if they want.

**Option C: Mobile-specific orientation prompt.** If the Kitchen is genuinely meant to be a desktop dashboard, say so: a tasteful full-screen message at portrait widths under 600px — "the kitchen is best on a wider screen. rotate or visit on desktop." One tap to continue anyway. Honest about the constraint rather than serving broken UI.

**Recommendation:** Option B. The Kitchen's value is the data, not the layout. A mobile-first summary view — big numbers, clear status, fewer rows — serves someone showing it on their phone better than a miniaturized terminal. The aesthetic can remain TUI. The density doesn't have to.

---

## 4. Other Notable Issues

### iOS Auto-Zoom (inputs below 16px)

**Porch widget — PASS:** The textarea correctly sets `font-size: 1rem` (16px) on mobile. iOS will not auto-zoom. This was handled correctly.

**Vernie gate input (`.porch-vernie-input`):** Font size is `0.85rem` — 13.6px at 16px base. **This will trigger iOS auto-zoom.** The Vernie gate is rarely used, but when it is, the page will jerk and zoom on tap. Fix: `font-size: 1rem` or `font-size: 16px` for that input on mobile.

### Horizontal Scroll at 320px

The Kitchen at 320px (oldest iPhones, some Androids): with `padding: 0.5rem` and the metrics grid at `repeat(2, 1fr)`, the layout stays within bounds. No observed overflow risk.

The homepage: the sky-writing links are positioned absolutely with percentage-based placement. On very narrow screens, `white-space: nowrap` on these links can cause horizontal overflow if a link is placed near the right edge. The JS clamps placement to `margin + random * (100 - margin * 2)` which reduces but doesn't eliminate risk. Low priority.

### Line Height

| Page | Declared Line Height | Status |
|------|---------------------|--------|
| Kitchen | `1.5` on body | Minimum pass |
| Homepage | `1.6` on body | Pass |
| /derek | `1.7` on body | Pass |
| Being Claude index | `1.8` on body | Pass |
| Essay (article.css) | `1.8` on body, `1.9` on intro | Excellent |
| Porch widget messages | `1.6` | Pass |

No failures. The Kitchen is at exactly 1.5 — the floor. Given the monospace font and dense terminal layout, 1.6 would improve readability.

### Contrast

All pages use sufficient contrast for primary text. The dim text color (`#6b7280`) on white/light backgrounds computes to approximately 4.6:1 contrast ratio — passing AA (4.5:1 minimum). On the Kitchen's dark background (`#0a0e17`), `--text-dim: #6b7280` computes to approximately 3.8:1 — **failing AA** for normal text. This is a low-priority issue that's endemic to the dim text aesthetic, but it's worth noting. The Kitchen uses `--text-dim` extensively for labels at already-small sizes.

---

## 5. Proposed Claude Will. Mobile Standard

These are the minimums that should apply to every site Derek builds — claudewill.io, PAPJ, Coach D, anything new.

### Typography

| Element Type | Minimum Size | Recommended | Notes |
|-------------|-------------|-------------|-------|
| Body text | 16px | 17–18px | 18px for long-form reading (essays) |
| Secondary text (metadata, captions) | 14px | 14–15px | Date lines, bylines, card metadata |
| Labels / eyebrows | 12px (absolute floor) | 13px | Section labels, badges — uppercase only |
| UI controls (buttons, inputs) | 14px | 16px | Always 16px for inputs (iOS auto-zoom) |
| Input fields | **16px minimum** | 16px | Non-negotiable — iOS auto-zoom below this |
| html base | 16px | 16px | Never reduce base size at mobile breakpoints |

**The one rule that overrides everything:** `html { font-size }` should not decrease on mobile. If the desktop TUI requires 13px or 12px to fit the layout, the layout needs to change, not the base size.

### Touch Targets

| Element Type | Minimum | Recommended | Notes |
|-------------|---------|-------------|-------|
| Primary buttons (CTAs, submit) | 44x44px | 48x44px | Width can vary; height minimum is 44px |
| Secondary buttons (share, nav) | 44x44px | 44px height | Add padding to reach target, not font size |
| Navigation links (header, footer) | 44px height | 44px | Padding expands hit area without changing layout |
| Command palette items | 44px height | 48px | Users reach for these under navigation stress |
| Footnote / inline references | 44px height via padding | 44px | Superscripts need explicit padding or block display on mobile |
| Status dots / icons (decorative) | N/A | N/A | Not interactive — exempt |

**Practical method:** If the visual size can't be 44px (design constraint), use `padding` to expand the hit area, and `margin` to ensure spacing between targets. A 24px-tall button with `padding: 10px 0` reaches 44px without changing the visual.

### Line Height

| Context | Minimum | Recommended |
|---------|---------|-------------|
| Body / long-form | 1.5 | 1.7–1.8 |
| UI / dense layouts | 1.4 | 1.5 |
| Headings | 1.1 | 1.2 |

### Viewport

- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` on every page — already present on all audited pages
- No `maximum-scale=1` or `user-scalable=no` — these prevent accessibility zoom and violate WCAG 1.4.4
- Test at 320px width — the minimum iOS viewport still in regular use
- No deliberate horizontal scroll on any content page

### Contrast (minimum)

| Context | Minimum Ratio | Standard |
|---------|--------------|---------|
| Body text | 7:1 | WCAG AAA |
| Secondary / dim text | 4.5:1 | WCAG AA |
| Labels, badges, UI chrome | 3:1 | WCAG AA (large text/UI) |
| Dark-on-dark (Kitchen TUI) | 4.5:1 for any meaningful text | WCAG AA |

### The Mobile Kitchen Specifically

When the Kitchen gets its mobile treatment, these are the specific minimums:

- Base font: `16px` at all breakpoints (not 12px or 13px)
- Section headers: minimum `14px` rendered
- Metric values (the big numbers): minimum `24px` rendered
- Metric labels: minimum `12px`, uppercase only
- Sparkline labels: minimum `12px` or omit on smallest screens
- Touch targets for any links: 44px height via padding
- Status dots: minimum `10px` diameter (currently 7px — visible but small)

---

## 6. Priority Order for Fixes

When Derek approves direction, this is the suggested sequence:

**Critical (Kitchen is broken on mobile):**
1. Kitchen: Remove base font reduction. Set `html { font-size: 16px }` at all breakpoints. Redesign layout rather than shrinking type.
2. Kitchen: Decide on mobile strategy — simplified summary vs. orientation prompt vs. full reflow (see Section 3 recommendations).

**High (touch targets on primary UI):**
3. Derek page: Hero buttons, voice button, CTA links — `min-height: 44px` via padding
4. Porch widget: Trigger button and send button — `min-height: 44px`
5. Command palette: Section items and sub-items — `padding: 0.75rem 0` minimum

**Medium (below-floor text sizes, non-primary):**
6. Homepage: Name-hook on mobile (`0.7rem`) — raise to `0.85rem`
7. Homepage: Footer text — raise from `0.75rem` to `0.8rem`
8. Being Claude index: Status badge (`0.65rem`) — raise to `0.75rem`
9. Vernie gate input — set `font-size: 16px` on mobile (iOS auto-zoom fix)

**Low (aesthetic / contrast):**
10. Kitchen: Status dot diameter — increase from 7px to 10px
11. Kitchen: `--text-dim` contrast on dark background — consider lightening to `#8b949e` for AA compliance
12. Essay pages: Footnote refs — add `padding: 0 4px` minimum on mobile for tap area

---

*Audit produced by Claude Code. No fixes applied — assessment only.*
