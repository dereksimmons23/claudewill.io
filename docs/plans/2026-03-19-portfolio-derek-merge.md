# Portfolio → /derek Merge Plan

**Date:** March 19, 2026
**Status:** Draft for Derek's review
**Context:** Portfolio at `/portfolio/index.html` was rebuilt March 19. Derek said it's "a pretty decent start on what could become the /derek page." This plan maps the merge.

---

## Summary

The portfolio is a standalone visual journalism showcase with three case studies (Prince, Denied Justice, Selected Work). The current /derek page is a broader personal page with the same two case studies plus claudewill.io project, Range tile grid, Practice, Writing, CW, Proof, and Contact sections. The merge means taking the portfolio's stronger visual treatment and folding it into /derek's fuller content scope, inside the main site's design system.

---

## Side-by-Side Comparison

### What Portfolio Has That /derek Needs

| Portfolio Element | Current /derek State | Recommendation |
|---|---|---|
| **Voice narration button in hero ("Hello")** | Has voice button too ("Hear my voice"), different narration text, no playbackRate boost | **Adopt portfolio's approach.** "Hello" is better UX than "Hear my voice." Portfolio sets `playbackRate = 1.15` (slightly faster). Use portfolio's narration text — it's more polished ("I made the transition from player to coach, but I still like to do both"). |
| **Hero intro paragraph** (hired 50 journalists, quarter of newsroom, teams still winning) | Different intro ("turned 'they will never go for this' into yes, they will...if after a few months you still need me") | **Derek decides.** Both are good. Portfolio's is more resume-oriented (hiring, scale). /derek's is more voice-oriented (coaching, iteration). /derek's fits the page better — the portfolio's reads like a cover letter. But the "teams still winning after I left the room" line from portfolio is load-bearing. |
| **Hero role line** ("Visual Journalism, Art Direction, Newsroom Leadership") | "Visual Editor, Art Director, Coach" | **Use /derek's.** It's tighter. "Coach" matters. |
| **Sticky header with hamburger menu + theme toggle** | Sticky header with inline nav links (Prince, Denied Justice, claudewill, Range, Writing, Contact) | **Use /derek's inline nav** — it's more useful at a glance. But adopt portfolio's dark-themed header background (#0b1a2e) since the hero is dark. Alternatively, adapt to main site's `page-header` component from shared-nav.css (see Design System below). |
| **Prince section hero image** (prince-illo-detail.png, eyes close-up, centered at 45%) | Uses prince-cover-2-carter-blue.png (full blue portrait) | **Adopt portfolio's hero image.** The eyes detail crop is more striking. The blue portrait is already in the gallery scroll. |
| **Prince section headline** ("Purple Majesty: Remembering a Minnesota Icon") | Just "Prince" with subtitle meta | **Adopt portfolio's headline approach.** Full headline in the hero overlay is more impactful. Keep the meta line too. |
| **Prince backstory structure** (Breaking News label → approach → gallery → impact → quote → video → links) | Gallery → backstory → quote → video → links | **Adopt portfolio's structure.** The labeled sections (Breaking News, Approach, Impact, Quote) are clearer. The backstory text is slightly different — merge best lines from both. |
| **Prince gallery: full-height with white background** (80vh scroll container, images fill height) | Percentage-width slides (36%), images fill width | **Adopt portfolio's gallery treatment.** Full-height scrolling of print pages looks dramatically better for newspaper work. White background container for the pages is correct. |
| **Denied Justice section hero** (survivors photo at Capitol) | A1 "RAPE CASES THAT GO NOWHERE" image | **Keep both.** Portfolio uses the survivors-at-Capitol image as section hero (more emotional). /derek uses the A1 as hero (more journalistic). Portfolio's approach is better for impact — the survivors image is the story. But /derek also has the section-break image with the survivors. Consolidate: use portfolio's survivors hero, drop /derek's section-break image (it's redundant). |
| **Denied Justice gallery: same white-bg full-height treatment** | Same images, percentage-width | **Adopt portfolio's gallery treatment** (consistent with Prince). |
| **Selected Work section** with 2-row horizontal scroll (~54 images total) | "Range" section with 3x4 tile grid (12 images) + lightbox | **This is the big decision.** Portfolio's marquee-style rows show the VOLUME of 30 years. /derek's tile grid shows a curated 12 with hover labels and lightbox. **Recommendation: use portfolio's scroll rows.** The volume is the point. The tile grid feels like a compromise. If Derek wants both, put the scroll rows first (impact) and the tile grid below (interactive detail). |
| **Joel Kimmel quote** (at the bottom of Selected Work) | Not present | **Add it.** Good quote, different voice than Carter and Pinkley. |
| **Scroll reveal animations** (IntersectionObserver, fade-up) | None | **Adopt.** Subtle, respects prefers-reduced-motion, adds polish. |
| **Theme toggle** (light/dark, localStorage persistence) | Uses prefers-color-scheme only, no manual toggle | **Adopt.** Manual toggle is better UX. |

### What /derek Has That Should Stay

| /derek Element | In Portfolio? | Recommendation |
|---|---|---|
| **Schema.org structured data** (Person, BreadcrumbList, FAQPage) | Not present | **Keep.** Essential for SEO/GEO. Portfolio has none. |
| **shared-nav.css + porch-widget.css** (main site design system) | Not loaded | **Keep.** This is the whole point — /derek is part of the main site. |
| **Porch widget** (cw> _ terminal, slide-up chat) | Not present | **Keep.** Every main site page has it. |
| **shared-nav.js** (command palette overlay) | Not present | **Keep.** |
| **claudewill.io section** (platform case study with screenshots) | Not present | **Keep.** This is the third case study. Shows the AI-native work, not just the legacy journalism. Position it after Denied Justice, before the broad Selected Work section. |
| **"The Practice" section** (how I work) | Not present | **Keep.** This is the coaching identity. But tighten it — it's currently 3 paragraphs, could be 2. |
| **"The Writing" section** (Being Claude, Substack, book) | Not present | **Keep.** Writing is a core identity element. |
| **"CW" section** (Claude William Simmons, the porch) | Not present | **Keep.** The origin story belongs on /derek. |
| **"Proof" section** (3 quotes + credential lines) | Has quotes inline within case studies | **Merge.** Move the quotes from the Proof section into their respective case study sections (Carter is already in Prince, Pinkley in Denied Justice). The "LA Times" quote and Cascadia quote need a home — either a combined proof section or inline. The credential proof-lines are strong — keep them, but move below the Selected Work section where they serve as a summary. |
| **Contact section** with Substack embed | Footer only (no Substack embed) | **Keep.** Contact section with Substack embed is the conversion point. |
| **Section break image** (Denied Justice survivors at Capitol) | Used as Denied Justice section hero | **Drop from /derek.** Portfolio uses this image better as the section hero itself. |
| **Range tile grid** (12 images with lightbox) | Replaced by 2-row scroll (~54 images) | **Derek decides.** See above. |
| **Lightbox JS** (for tile grid) | Not present | **Keep only if tile grid stays.** |
| **Credential line** ("3 Pulitzer finalists, 4 Pulitzer-winning teams...") | Not present in hero (similar content in backstory) | **Keep in hero.** The credential line in dim mono is a good design pattern. |
| **Footer** (derek*claude, Minnesota, copyright, standard/privacy/terms) | Simpler footer (resume, LinkedIn, GitHub, email) | **Keep /derek's footer.** It's the main site footer with the asterisk device. |

### What Should Die

| Element | Why |
|---|---|
| **Portfolio's standalone CSS** (`system-ui` font, own dark mode, own header) | Replaced by main site design system (IBM Plex Mono, shared-nav.css). |
| **Portfolio's sticky header** (hamburger menu, theme toggle in header bar) | Replaced by /derek's nav or the shared page-header component. Keep the theme toggle concept but integrate it differently. |
| **Portfolio's `<title>`** ("Derek Simmons -- Portfolio") | Keep /derek's title ("derek \| claudewill"). |
| **Portfolio's meta description** (visual journalism portfolio) | Keep /derek's broader description. |
| **/derek's section-break div** (survivors image between Prince and Denied Justice) | Redundant with portfolio's section hero approach. |
| **/derek's `hero-text .credentials`** line positioning | The credential text is good but the styling is too dim (0.45 alpha). Bump to 0.55-0.6. |
| **Portfolio's Google Analytics duplicate** | /derek already has it. |

---

## Design System Adaptation

The merge means converting portfolio's visual patterns into the main site's system. Key translations:

### Fonts
- **Portfolio:** `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` for body, `'SF Mono', 'Cascadia Code', 'Consolas'` for mono
- **Main site (/derek):** Same CSS variables but shared-nav.css forces `'IBM Plex Mono'` for all nav/palette elements
- **Action:** Keep the current /derek approach. The portfolio's system-ui body font actually reads better for long-form content than mono, and /derek already uses `system-ui` for body (not IBM Plex Mono for body text — that's only in the nav/palette). No change needed.

### Header
- **Portfolio:** Custom sticky header (dark bg #0b1a2e, hamburger menu, theme toggle)
- **/derek current:** Custom sticky header (--bg background, inline nav links)
- **Main site standard:** `page-header` from shared-nav.css (cw* brand left, page title center, menu trigger right)
- **Action:** Convert to the shared `page-header` component. This gives /derek the `cw*` → `claudewill*` hover animation, the command palette trigger, and the section dropdown. Drop the inline nav links in favor of the dropdown (Prince, Denied Justice, claudewill.io, Range, Practice, Writing, CW, Proof, Contact). This is a bigger refactor but makes /derek consistent with story.html and other main site pages.
- **Alternative (simpler):** Keep /derek's current inline nav header. It works. Just add the theme toggle from portfolio.

### Gallery Treatment
- **Portfolio:** `gallery-scroll` is `height: 80vh; max-height: 900px; background: #fff; border-radius: 4px; padding: 1rem;` — images fill height
- **/derek current:** `gallery-scroll` has no fixed height, images sized by percentage width
- **Action:** Adopt portfolio's gallery CSS for the Prince and Denied Justice sections. The full-height scroll with white background is the correct treatment for newspaper page scans. Keep /derek's existing gallery CSS as a fallback for the claudewill.io screenshots section (those are screen-height, not page-height).

### Dark Mode
- **Portfolio:** CSS custom property override via `prefers-color-scheme` + manual class toggle (`html.dark`, `html.light`)
- **/derek current:** `prefers-color-scheme` media query only, different dark values (`--bg: #111` vs portfolio's `--bg: #0b1a2e`)
- **Action:** Adopt portfolio's dark mode values (#0b1a2e is more refined than #111, consistent with the hero card background). Add the manual theme toggle.

### Scroll Reveals
- **Portfolio:** IntersectionObserver, `.reveal` class, `translateY(24px)` entry, `0.7s ease`
- **/derek current:** None
- **Action:** Add. Same approach as portfolio. Target galleries, backstory blocks, pull quotes, video embeds.

---

## Proposed Section Order for Merged /derek

```
1. Hero Card (photo, name, role, intro, credentials, buttons, voice)
2. Sticky Header / Page Header
3. Prince (section hero → labeled subsections → full-height gallery → impact → quote → video → links)
4. Denied Justice (section hero → labeled subsections → full-height gallery → impact → quote → video → links)
5. claudewill.io (platform case study → screenshots gallery → backstory → links)
6. Selected Work (section hero with team photo → 2-row marquee scroll → Kimmel quote → optional tile grid)
7. The Practice (how I work — prose)
8. The Writing (Being Claude, Substack, book — prose)
9. CW (Claude William Simmons — prose)
10. Proof (combined quotes + credential lines — summary section)
11. Contact (email, links, Substack embed)
12. Footer (derek*claude, main site footer)
```

Changes from current /derek:
- Prince and Denied Justice upgraded to portfolio's visual treatment
- Section break (survivors image) removed (absorbed into Denied Justice hero)
- Range tile grid replaced or augmented by scroll rows
- Proof section reorganized (quotes distributed to case studies, credentials kept)
- Scroll reveals added throughout

Changes from portfolio:
- claudewill.io section added (case study #3)
- Practice, Writing, CW, Proof, Contact sections added (identity content)
- Porch widget, command palette, shared nav added
- Schema.org structured data retained
- Footer upgraded to main site footer

---

## Implementation Steps

### Phase 1: CSS Prep (no visual changes)
1. Add portfolio's gallery height treatment as a new class: `.gallery-scroll--pages` (full-height, white bg, for newspaper scans)
2. Add portfolio's scroll-gallery styles (`.scroll-gallery`, `.scroll-row`, `.scroll-img`) to derek.html's `<style>` block
3. Add scroll reveal CSS (`.reveal`, `.reveal.visible`)
4. Update dark mode values from `#111` to `#0b1a2e`

### Phase 2: Hero Card Tune
1. Move voice button above name (portfolio's "Hello" placement)
2. Keep /derek's intro text but steal "the teams still winning after I left the room" from portfolio
3. Bump credential line alpha from 0.45 to 0.55
4. Add `playbackRate = 1.15` to voice JS

### Phase 3: Case Study Upgrades
1. **Prince hero:** Swap image from `prince-cover-2-carter-blue.png` to `prince-illo-detail.png`. Add `style="object-position: center 45%;"`. Change gradient from bottom-up to top-down (portfolio's overlay is at top, /derek's is at bottom — portfolio's is better for the eyes crop).
2. **Prince headline:** Change from "Prince" to "Purple Majesty: Remembering a Minnesota Icon" (or let Derek pick).
3. **Prince gallery:** Add `gallery-scroll--pages` class. Add `height: 80vh; max-height: 900px; background: #fff; border-radius: 4px; padding: 1rem;`. Make slides `height: 100%; flex: 0 0 auto;` instead of `flex: 0 0 36%`.
4. **Prince backstory:** Add labeled subsections (Breaking News, Approach, Impact). Keep /derek's stronger backstory text. Use portfolio's `case-label` class.
5. **Denied Justice:** Remove section-break div above it. Use `section-break-denied-justice-survivors.png` as the section hero (replacing the A1). Update gradient direction (portfolio's is top-down). Add labeled subsections. Apply same gallery upgrade.
6. **Both sections:** Ensure the portfolio's `impact` class is available for bold impact lines.

### Phase 4: Selected Work Replacement
1. Add portfolio's `scroll-gallery` section after claudewill.io
2. Copy the two `scroll-row` divs with all ~54 images
3. Add Joel Kimmel quote below
4. **Decision needed from Derek:** Keep tile grid (Range) below the scroll rows, or kill it? If keeping, it becomes a "Featured" subset with lightbox. If killing, remove lightbox JS.

### Phase 5: Polish
1. Add scroll reveal JS (IntersectionObserver) targeting `.gallery`, `.backstory`, `.pull-quote`, `.links`, `.video-wrap`, `.scroll-gallery`
2. Add theme toggle (button in header or floating)
3. Test dark mode with new values
4. Verify porch widget still works (z-index conflicts with lightbox if both present)

### Phase 6: Cleanup
1. Verify all portfolio images exist in `/images/gallery/work/` (they should — portfolio references them)
2. Update `site-registry.json` if needed
3. Update sitemap.xml if /portfolio was listed
4. Add redirect: `/portfolio` → `/derek` in netlify.toml (once portfolio content is fully merged)
5. Remove or archive `portfolio/index.html`

---

## Open Questions for Derek

1. **Hero intro text:** Portfolio's (hiring/scale/teams) or /derek's (coaching/iteration/"if you still need me")? Or a hybrid?
2. **Selected Work:** Scroll rows only, tile grid only, or both? The scroll rows show volume. The tile grid shows curation with hover detail.
3. **Header approach:** Adopt shared `page-header` component (consistent with rest of site) or keep /derek's custom inline nav (more functional for this page)?
4. **Prince hero image:** Portfolio's eyes detail crop, or /derek's full blue portrait?
5. **Theme toggle:** Worth adding? The rest of the main site doesn't have one (relies on prefers-color-scheme).
6. **Denied Justice section hero:** Portfolio's survivors-at-Capitol image, or /derek's A1 image? (Can put the other in the gallery.)
7. **Portfolio URL:** After merge, redirect `/portfolio` → `/derek`? Or keep as a stripped-down version for specific use cases (job applications)?

---

## Files Involved

| File | Action |
|---|---|
| `/Users/dereksimmons/Desktop/claudewill.io/derek.html` | Primary edit target — receives portfolio content |
| `/Users/dereksimmons/Desktop/claudewill.io/portfolio/index.html` | Source — read-only during merge, archive after |
| `/Users/dereksimmons/Desktop/claudewill.io/css/shared-nav.css` | No changes needed (already correct) |
| `/Users/dereksimmons/Desktop/claudewill.io/css/porch-widget.css` | No changes needed |
| `/Users/dereksimmons/Desktop/claudewill.io/js/shared-nav.js` | No changes needed |
| `/Users/dereksimmons/Desktop/claudewill.io/js/porch-widget.js` | No changes needed |
| `/Users/dereksimmons/Desktop/claudewill.io/netlify.toml` | Add `/portfolio` → `/derek` redirect |
| `/Users/dereksimmons/Desktop/claudewill.io/site-registry.json` | Remove /portfolio entry if present |
| `/Users/dereksimmons/Desktop/claudewill.io/images/gallery/work/*.jpg` | Verify all ~54 images exist |

---

## Estimated Effort

- Phase 1 (CSS): 20 min
- Phase 2 (Hero): 15 min
- Phase 3 (Case Studies): 45 min
- Phase 4 (Selected Work): 30 min
- Phase 5 (Polish): 20 min
- Phase 6 (Cleanup): 10 min

**Total: ~2.5 hours of Claude Code work**, plus Derek's decision time on open questions.

---

## The Bottom Line

The portfolio nails the visual treatment of the journalism work — full-height page galleries, strong section heroes, labeled structure, scroll reveals. /derek nails the identity — who Derek is beyond the clips, the writing, the practice, the origin story, the contact funnel. The merge takes portfolio's visual muscle and puts it inside /derek's fuller frame. The result is one page that does both jobs: shows the work AND tells the story.
