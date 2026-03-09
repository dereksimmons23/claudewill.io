# Substack as Mailman — Content Strategy

*March 10, 2026. The mailman, not the house.*

## The Decision

All writing lives on claudewill.io. Substack is the weekly newsletter that delivers links back home. The Substack site becomes an archive of newsletters — never the canonical home for any piece.

## What This Means

### claudewill.io is home
- King of Nothing, Being Claude essays, Dispatches, one-offs — all live as pages on the site
- Canonical URLs are claudewill.io, always
- Robots index the site, not Substack
- SEO/GEO value accrues to the domain Derek owns

### Substack is delivery
- Weekly newsletter (one send per week)
- Roundup format: here's what happened this week, with links back to claudewill.io
- The newsletter itself is original writing (a short letter, not just a link dump)
- Archive at standardderek.substack.com is a byproduct, not a destination
- Free forever — discovery, not revenue

### dereksimmons.com
- Redirects to claudewill.io (301)
- No subdomain needed for Substack
- One purchase, one redirect, done

## What Needs to Happen

### Phase 1: Build the writing home on claudewill.io

1. **Create /writing or /letters section** — index page for all written pieces (not Being Claude, which has its own section)
2. **Move King of Nothing to the site** — first piece to live on claudewill.io as its canonical home. Format: same as Being Claude articles (standalone page, schema.org, OG tags)
3. **Decide URL structure:**
   - Option A: `claudewill.io/writing/king-of-nothing` (clean, organized)
   - Option B: `claudewill.io/king-of-nothing` (flat, every piece is a star)
   - Option C: `claudewill.io/standard/king-of-nothing` (Standard Correspondence branding)
   - **Recommendation: Option A.** /writing is the section. Being Claude has /being-claude. Derek's writing has /writing. Parallel structure.
4. **Template the page** — reusable layout for written pieces: title, date, body, bio block, email capture, back to /writing link
5. **Add email capture** — Substack embed on article pages and /writing index. This is the signup funnel. Read a piece, subscribe to the weekly letter.

### Phase 2: Set up the weekly newsletter

6. **Define the newsletter format:**
   - Short personal intro (2-3 sentences, written by Derek, the "letter" part)
   - Links to new pieces on claudewill.io with 1-line descriptions
   - Optional: one line about what's coming next week
   - Sign-off
   - Total length: under 300 words. The newsletter is the menu, not the meal.
7. **Pick the send day** — Friday afternoon or Saturday morning. Weekend reading. Not competing with Tuesday/Wednesday business email.
8. **Name it** — "Standard Correspondence" is already the name. The newsletter is the correspondence. The site is the standard.

### Phase 3: Migrate existing content

9. **Being Claude cross-posts** — still follow the cross-post plan (2026-03-09), but the Substack version links back to claudewill.io as canonical. Substack post = teaser + link, not full repost.
10. **Existing Substack posts** — leave them. They're the archive. No need to delete or move. New posts going forward follow the mailman model.
11. **Update Substack profile** — bio points to claudewill.io. "Read the full archive at claudewill.io/writing."

### Phase 4: Wire the domain

12. **Point dereksimmons.com to claudewill.io** — 301 redirect at registrar or Netlify level
13. **No Substack custom domain needed** — standardderek.substack.com stays as-is

## What NOT to Do

- Don't duplicate full articles on both Substack and the site (SEO cannibalization)
- Don't try to make the Substack site look good (it's an archive, not a destination)
- Don't paywall anything (discovery mode, not revenue mode)
- Don't send more than once a week (the letter is weekly, the writing happens whenever)
- Don't automate the newsletter (the personal intro is the point — it should sound like Derek sat down and wrote a letter)

## The Weekly Workflow

1. Derek writes whenever the walk produces something
2. Pieces go live on claudewill.io as they're ready (could be 0-3 per week)
3. Friday/Saturday: Derek writes a short letter, links to whatever went up that week, sends via Substack
4. Done

## What This Replaces

- ~~Substack as primary publishing platform~~
- ~~Cross-posting full articles to Substack~~
- ~~Managing a Substack site design/layout~~
- ~~Custom domain for Substack~~
- The old cross-post plan (2026-03-09) is partially superseded — the Being Claude essays still get teased on Substack but as links, not full reposts

## The Metaphor

The mailman doesn't write the letters. He delivers them. The letters come from the house. The house is claudewill.io. Standard Correspondence is the envelope.
