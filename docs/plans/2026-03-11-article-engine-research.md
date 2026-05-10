# Article Engine Research — March 11, 2026

Research findings: Agent Zero site architecture, claudewill.io Being Claude pages, external examples, and terminal CMS approaches. Three agents ran in parallel while Derek was at pickleball.

---

## The Problem

Being Claude articles on claudewill.io are hand-coded HTML. Each article is a self-contained file with ~400 lines of duplicated CSS, manually maintained metadata, and no connection to any other article. Publishing a new article requires touching 6+ files manually (the article HTML, the listing page, site-registry.json, sitemap.xml, llms.txt, writing/index.html). At 10 articles this is painful. At 50 it breaks.

There is no prev/next navigation between articles. A reader who finishes "The Jar" has one link: back to the listing page. The evidence tag legend exists only on the listing page, not on individual articles. The listing page has a structural bug (The Jar card is outside the CSS grid container). All article dates, counts, and cross-references are hardcoded.

---

## Agent Zero: What's Better and Why

Agent Zero uses Astro with content collections. The entire article system is six files:

1. `content.config.ts` — 5-field Zod schema (title, number, date, submolt, tags)
2. `Base.astro` — one shared layout
3. `[...slug].astro` — exhibit page template with automated prev/next, related exhibits by tag overlap, schema.org injection
4. `global.css` — one CSS file (1327 lines, shared everywhere)
5. `patterns.astro` — auto-generated tag taxonomy with editorial notes
6. Any `.md` file dropped in `content/posts/` — that's a new article

**What makes Agent Zero's article pages better:**

- **Prev/next navigation** — built-in sequential reading. Arrow keys, swipe gestures, explicit links.
- **Related exhibits** — computed at build time by tag overlap. Zero manual cross-linking.
- **The "filed" framing** — case header ("Exhibit 001 of 42 / Filed 2026-02-17 / Re: work, ai") tells readers how to hold the content before reading.
- **One CSS file** — style change = one edit, all 42 pages updated.
- **Paragraph numbers** — desktop margin annotations (CSS counter) that make exhibits feel like legal transcripts.
- **First-paragraph emphasis** — 1.3rem vs 1.15rem creates a pull-quote effect from the body text itself.
- **Source Serif 4 for body** — designed for reading, not IBM Plex Mono (monospace creates friction for long-form prose).
- **The signature** — right-aligned "Agent Zero." in Caveat script. Consistent, elegant, no bio box needed.
- **End-of-series CTA** — last exhibit's "next" button becomes "submit a record." The only CTA in the template, and it only appears when you've read everything.
- **Swipe-up overlay menu** — full exhibit directory, replaces persistent nav. Anti-navigational by design.

**What Being Claude does better:**

- Schema.org ScholarlyArticle with ORCID, editor, isPartOf — more sophisticated structured data.
- Evidence tagging system (established/observation/claim) — unique editorial feature.
- Transparency box — disclosure of author, editor, limitations.
- Reference list with typed badges (paper, book, source, observation, technical).

---

## External Examples: The Booth, Not the Blog

Research covered 12 independent publishing sites. Key patterns:

### What the best sites share:

1. **Curated entry points.** Paul Graham's "If you're not sure, try these three." Craig Mod's "Popular Essays" callout. The Marginalian's "Surprise Me" button. Don't let 50 articles create decision paralysis.

2. **Organized by type, not date.** Paco Coursey: Building / Writing / Now. Robin Rendle: file-browser sidebar. Not reverse-chronological feeds.

3. **Consistent, minimal navigation.** None have mega-menus. Most have 3-5 top-level links. The content leads, not the chrome.

4. **Durable technology.** Daring Fireball: 22 years on Movable Type. Kottke: 25+ years, same CMS. Craig Mod: custom static site. Paul Graham: hand-written HTML. Longevity comes from simplicity, not frameworks.

### Most relevant to claudewill.io:

- **Robin Rendle's file-browser sidebar** — fits the terminal aesthetic perfectly. A sidebar that looks like a directory tree (being-claude/, dispatches/, essays/) would feel native to the CW brand.
- **Paul Graham's "start here" recommendation** — more useful than any filtering system at 50 articles.
- **Gwern's sidenotes** — footnotes as marginal annotations on wide screens. Being Claude's evidence tags could work this way.
- **Simon Willison's content weight separation** — heavy essays (Being Claude), medium dispatches, light notes. Each weight deserves its own container.

---

## Terminal CMS: The Recommendation

### Don't migrate claudewill.io to Astro.

Agent Zero proves Astro works for article collections. But claudewill.io is a 33-page site with interactive features (porch widget, shared-nav, deck.js, kitchen.js, Netlify functions). Migrating all of that to Astro is a 2-week project minimum. That's building, not coaching.

### Build a Node.js article engine that extends what exists.

claudewill.io already has `scripts/compile-prompt.js` — a build step that compiles markdown to JavaScript. The article engine is the same pattern applied to content.

**The workflow:**

```
cw draft "The Scoreboard" --series being-claude
# Creates: content/being-claude/011-the-scoreboard.md
# With frontmatter pre-filled (title, date, series, number, status: draft)

# Write/edit the markdown in Claude Code

cw publish the-scoreboard
# Builds .md to HTML using template
# Generates prev/next links across series
# Updates collection index page
# Updates sitemap.xml, site-registry.json, llms.txt
# Commits and pushes, Netlify deploys

cw articles
# Shows all articles with status (draft/published)
```

**What gets built:**

1. **content/ directory** — markdown source files organized by series:
   ```
   content/
     being-claude/
       001-being-claude.md
       002-the-bright-line.md
       ...
       010-the-jar.md
     dispatches/
     essays/
   ```

2. **scripts/build-articles.js** — the engine:
   - Reads .md files from content/
   - Parses YAML frontmatter with gray-matter
   - Converts markdown to HTML with marked
   - Injects into template (preserving: GA, OG tags, schema.org, shared-nav, porch widget, footer, dark mode, evidence tags)
   - Generates prev/next navigation within series
   - Generates collection index pages
   - Generates related articles by tag overlap (Agent Zero's approach)
   - Updates sitemap.xml, site-registry.json, llms.txt
   - Only processes status: published

3. **templates/article.html** — extracted from current Being Claude template, parameterized:
   - Slots for: title, series label, byline, date, body, prev/next, related, evidence tags
   - One template, all articles use it
   - Includes the transparency box, reference system, evidence legend

4. **Frontmatter schema:**
   ```yaml
   title: The Jar
   series: Being Claude
   number: 10
   date: 2026-03-08
   status: published
   author: Claude Opus 4.6
   editor: Derek Simmons
   description: On a Sunday in March...
   tags: [AI, fine-tuning, LoRA, human-AI collaboration]
   evidence: true
   ```

5. **Netlify build command** added to netlify.toml:
   ```
   command = "node scripts/build-articles.js && node scripts/compile-prompt.js"
   ```

**Design improvements borrowed from Agent Zero:**

- Prev/next navigation at bottom of every article
- Related articles by tag overlap
- Series position indicator ("Essay 3 of 10 in Being Claude")
- First-paragraph emphasis (larger font, brighter color)
- "Start here" recommendation on the listing page (pick 3)
- End-of-series CTA (subscribe or "more from Being Claude")

**Design kept from Being Claude:**

- Evidence tagging system (established/observation/claim)
- Transparency box
- Reference list with typed badges
- ScholarlyArticle schema.org
- IBM Plex Mono for the site (but consider serif for article body)

---

## The Reading Font Question

Agent Zero uses Source Serif 4 for body text. Being Claude uses IBM Plex Mono (monospace). Monospace works for the site's terminal aesthetic but creates friction for 2,000+ word essays. Options:

1. **Keep monospace everywhere** — brand consistency, accept the reading friction.
2. **Serif for article body only** — switch to IBM Plex Serif inside article-body. Everything else stays monospace. Same font family, brand stays coherent, reading gets dramatically better.
3. **Let the reader choose** — a toggle. Over-engineered for now.

Recommendation: Option 2. IBM Plex Serif exists in the same family as IBM Plex Mono.

---

## Build Estimate

- Extract current articles to markdown + build template: 2-3 hours
- Build scripts/build-articles.js: 3-4 hours
- Add cw draft / cw publish to CLI: 1-2 hours
- Add prev/next + related articles: 1-2 hours
- Migrate 10 existing articles: 1-2 hours (scripted extraction)
- Total: 8-13 hours across 2-3 sessions

This is real work but it's infrastructure that pays off at article 11 and every article after.

---

## What to Do First

1. **Push the existing redesign** — the site is broken now. Fix what's live before building new infrastructure.
2. **Extract one Being Claude article to markdown** — prove the pipeline works with one file.
3. **Build the template from The Jar** — it's the most complete article with all features.
4. **Wire build-articles.js into Netlify** — the build step.
5. **Migrate remaining 9 articles** — scripted.
6. **Add cw draft / cw publish** — the terminal workflow.

---

## Sites Researched

- craigmod.com — curated entry points, print-like reading
- gwern.net — popup previews, sidenotes, backlinks, semantic zoom
- robinrendle.com — file-browser sidebar, 11ty, keyboard nav
- paulgraham.com — radical simplicity, "start here" 3 picks
- daringfireball.net — 22 years on Movable Type, durability
- frankchimero.com — flat chronological, essays as events
- macwright.com — clean grid, tabular dates, theme toggle
- manuelmoreale.com — Kirby CMS (file-based), category color-coding
- paco.me — organized by type not date, "Now" page
- themarginalian.org — 1,650+ pages, "Surprise Me" button
- simonwillison.net — Django + Datasette, TIL separation
- kottke.org — 25+ years, same CMS

## Technical References

- Astro Content Collections docs
- Hugo archetypes
- Eleventy (11ty)
- Makefile-Based Blogging (sacredheartsc.com)
- Custom Node.js SSG patterns
- Front Matter CMS (VS Code extension)
- Pandoc website building
