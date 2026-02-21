# claudewill.io Light Redesign

**Date:** February 20, 2026
**Status:** Approved
**Inspiration:** micasa.dev — lighter, brighter, terminal-native, minimal

---

## Design Decisions

1. **Everything goes light** — full redesign, no dark mode, no split treatment
2. **Gold stays as brand accent** (#d4a84b) — porch light, *, wordmark moments
3. **All monospace** — IBM Plex Mono everywhere, drop Noto Sans and Noto Serif
4. **Near-white background** (#fafaf8) with dark navy text (#0a1628)
5. **Light blue as interactive color** (#4a8ec2) — links, hover, secondary buttons
6. **Approach:** Homepage first, extract to shared CSS, cascade to all pages

---

## Palette

| Token | Value | Role |
|-------|-------|------|
| --bg | #fafaf8 | Near-white background (barely warm) |
| --text | #0a1628 | Dark navy (not black) — text, headings, structure |
| --accent | #d4a84b | Gold — *, porch light, brand moments, active states |
| --link | #4a8ec2 | Light blue — links, hover, secondary interactive |
| --dim | #6b7280 | Gray — secondary text, labels, timestamps |
| --border | #e5e7eb | Light gray — hairlines, dividers |
| --input-bg | #f3f4f6 | Slightly darker than bg — input fields |
| --hover-bg | #f0f1f3 | Subtle hover background states |

## Color Hierarchy

- **Gold** = brand identity (*, porch light, wordmark accent, active/primary CTA)
- **Blue** = interaction (links, nav hover, secondary buttons, clickable things)
- **Navy** = structure (text, headings, primary buttons, borders)

---

## Typography

**One font family: IBM Plex Mono**

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Wordmark | 3rem | bold | navy, gold * |
| Rotating phrase | 1rem | regular | dim, gold * |
| Headers | 1.2rem | bold | navy |
| Body/chat | 0.95rem | regular | navy |
| Labels (CW, YOU) | 0.7rem | uppercase, letterspaced | dim |
| Buttons | 0.85rem | uppercase, letterspaced | navy |
| Footer/signoff | 0.75rem | regular, letterspaced | dim |

---

## Homepage Structure

Two sections (invitation + porch), both light:

### Invitation
- Full viewport centered
- Wordmark: 3rem bold navy, gold *
- Rotating phrases with typewriter cursor blink (_)
- Nav: stories · derek · studio · standard (navy text, blue hover)
- Porch pointer: "whatcha need? ↓"

### Porch (Chat)
- "cw's porch" header, smaller
- CW messages: gold left-border
- User messages: light gray left-border
- Input: slightly off-white bg, navy border, gold border on focus
- Prompt chips: navy border, gold border + text on hover
- Send button: navy border, gold on hover

---

## Porch Light (Reimagined)

- Default: 2px solid gold line, ~120px, top-left fixed
- On focus (typing): extends to full width smoothly
- Vernie mode: brighter, wider
- No glow/shadow — solid gold line IS the warmth on light bg

---

## Shared Nav (Drawer)

- Background: near-white or slightly darker (#f0f1f3)
- Wordmark: dark navy, gold *
- Section labels: dark navy, blue on hover
- Active page: gold * prefix
- Burger icon: navy lines

---

## Interactive Patterns

- **Links:** light blue, underline on hover
- **Primary buttons:** navy border, gold border + gold text on hover
- **Secondary buttons:** light blue border + text
- **Chat prompt chips:** navy border, gold on hover
- **Signoff *:** navy default, gold on hover, cycles phrases on click
- **Typewriter cursor:** blinking _ at end of rotating phrase

---

## What Stays

- All HTML structure and semantic markup
- Schema.org / SEO / accessibility (WCAG 2.1 AA)
- Chat JS logic, conversation history, prompt stages
- Vernie Mode (colors inverted to match new palette)
- Signoff easter egg, contact form, all interactions
- The * brand device behavior

---

## Implementation Sequence

1. Redesign homepage (index.html) — nail palette, type, interactions
2. Extract shared design tokens to css/porch.css
3. Cascade to content pages: derek, story, studio, standard, map
4. Update shared-nav.css (drawer + burger)
5. Update sub-pages: arcade, assessment, resume, research, privacy, terms
6. Verify Vernie Mode, modals, all interactive states
7. Test responsive (mobile, tablet, desktop)
