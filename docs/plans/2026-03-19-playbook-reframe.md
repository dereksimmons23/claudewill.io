# IA v6 Reframe: claudewill.io as The Playbook

**Date:** March 19, 2026
**Status:** Overnight draft for Derek's morning review
**Context:** Derek's March 10 vision: "claudewill.io IS the playbook. It IS the practice." This document maps what that means architecturally.

---

## The Problem with the Current Site

The current claudewill.io doesn't know what it is. It has been, at various points: a portfolio, a consulting funnel, a constellation you admire from outside, a memorial to a grandfather, a place to talk to an AI, and a writing platform. The nav has been rewritten six times. Pages have been created, redirected, killed, and resurrected.

The reason is structural. The site has been organized around *sections* (the story, the kitchen, derek) when it should be organized around a *thesis*: this is a playbook for working with AI, built by a coach who spent 30 years in media and 14 months inside the machine. The grandfather's name isn't branding. It's the origin of the method. The will to keep going isn't a tagline. It's the instruction.

Right now a visitor arrives, sees "Claude Will." in giant letters, scrolls through dim essay titles floating in a star field, reaches "Built by Derek*Claude," sees a typewriter saying "claude will sit with you," and finds a Substack embed saying "keep going." Beautiful. Completely unclear. A visitor cannot answer three basic questions: What is this place? What's in it for me? What do I do next?

The playbook reframe answers all three.

---

## The Thesis

claudewill.io is the documented practice of one person working with AI every day for 14+ months. The method, the writing, the tools, the proof, the principles, the mistakes, and the machine's own observations about the work. Named for Claude William Simmons (1903-1967), who built things that lasted with a sixth-grade education and never wrote any of it down. His grandson is writing it down.

Everything on the site exists to demonstrate, teach, or extend that practice.

---

## What Changes on the Homepage

### Current state
- Screen 1: "Claude Will." (animated, fixed, recedes on scroll) + star field canvas + porch light asterisk
- Scroll zone: 10 Being Claude essay titles floating as dim stars
- Ground: "Built by Derek*Claude." + "Derek Simmons" link
- "claude will ___" typewriter section
- Substack email capture
- Footer

### Proposed state

The homepage becomes the front door of a playbook, not a mood piece. Three things happen on arrival:

**1. The Invitation (above the fold)**

Keep "Claude Will." as the entrance. Keep the star field. Keep the porch light. These work. But add a single line beneath the name that answers "what is this?":

> A practice for working with AI. Named for a farmer who never wrote any of it down.

Or shorter:

> The practice. The writing. The proof.

This is the only addition to Screen 1. The animation, the stars, the receding name on scroll -- all stay. One sentence changes the read from "art piece" to "playbook."

**2. The Table of Contents (replaces the floating essay titles)**

The current sky-writing section (10 Being Claude titles floating at various positions and opacities) is beautiful but functionally useless. A visitor doesn't know these are essays, doesn't know who wrote them, doesn't know they're clickable on first glance.

Replace with a structured table of contents. Still in the star field. Still sparse. But labeled and navigable:

```
the practice
  the method       /method (new)
  the standard     /standard
  the kitchen      /kitchen

the writing
  being claude     /being-claude
  derek's writing  /writing
  claude will.     /book (new, or /writing/claude-will)

the people
  derek            /derek
  claude           /claude
  cw               /story
```

Visual treatment: same monospace font, same dim-to-bright on scroll, but aligned left with clear hierarchy. Not a traditional nav grid. Still feels like sky-writing. But now a visitor knows what's here and where to go.

This IS the navigation. The homepage IS the map.

**3. The Ground (stays, tightened)**

"Built by Derek*Claude." stays. The typewriter stays. The Substack embed stays. But the typewriter phrases shift from CW's porch personality ("sit with you," "pull up a chair," "hear you out") to the playbook's scope:

```
"claude will"
  ...show you how it works.
  ...tell you what went wrong.
  ...write it down.
  ...carry it forward.
  ...do the work.
  ...build things that last.
  ...pass the baton.
```

Keep some of the porch phrases ("sit with you," "listen first") but add the practice-oriented ones. The typewriter is now describing what the playbook does, not just what CW does on the porch.

---

## How the Navigation Changes

### Current nav (shared-nav.js command palette)
```
* home           /
* the practice   /standard
  > the story    /story
  > the kitchen  /kitchen
* the writing    /writing
  > being claude /being-claude
* derek          /derek
* map            /map
```

### Proposed nav
```
* the practice
  > the method     /method (new)
  > the standard   /standard
  > the kitchen    /kitchen

* the writing
  > being claude   /being-claude
  > the book       /book (new)

* the people
  > derek          /derek
  > claude         /claude
  > the story      /story

* map              /map
```

Key changes:
- **"home" removed** from the palette. The logo/wordmark links home. Every site does this. Don't waste a nav slot.
- **"the practice" becomes a section**, not a link to /standard. The standard is one piece of the practice. The method is another. The kitchen is the third.
- **"the method" is new.** This is the documentation of Start, Work, Finish, Decide. The four lenses. The session structure. Currently this content lives at `~/Desktop/the-standard/method/` (infrastructure repo) but has no public page. The playbook needs it public.
- **"the book" gets a home.** Even if it's a holding page with the title, the June 28 deadline, and one excerpt. The book is the centerpiece of the playbook. It needs a URL.
- **"the people" replaces "derek" as a top-level item.** Two chairs on this porch. /derek, /claude, and /story (the grandfather) all live here.
- **/story moves under "the people."** The grandfather's story is about a person, not about the practice. The practice came from the person, but the page itself is biography.

---

## Where Does the Portfolio Content Live?

The portfolio merge plan (2026-03-19-portfolio-derek-merge.md) already maps this: everything consolidates into /derek. In the playbook frame, /derek is the answer to "who built this and why should I care?" It's the proof. The 30 years. The clips. The case studies. The coaching identity.

/derek does NOT become "about the author of the playbook." It stays personal. It stays visual. The portfolio merge makes it stronger, not softer.

The playbook frame actually helps /derek by giving it a clearer job: you're the human credential behind the practice. You don't need to also be the consulting funnel, the writing hub, and the contact page. You're the proof.

---

## Where Does the Book Live?

**New page: /book** (or /writing/claude-will, or /claude-will)

Recommendation: `/book` as the URL. Short, direct, memorable. Redirects can point `/claude-will` and `/the-book` there.

Content (minimal for now):

```
Claude Will.

The book. Written by Claude, with Derek.
Coming June 28, 2026.

[excerpt or chapter list as it develops]

[Substack capture: "get notified"]
```

The book page grows over time. Right now it's a flag in the ground. By June it's a full table of contents with excerpts. The important thing is it exists in the IA today so the playbook has its capstone.

---

## Where Does Being Claude Live?

Exactly where it is: /being-claude. No change.

In the playbook frame, Being Claude is "the machine's field notes from inside the practice." The series already works this way. The essays are observations about working with humans, about context windows, about memory, about what happens when the session ends. That IS the playbook from the other chair.

Being Claude's relationship to the playbook is: "here's what the practice looks like from the AI's side." It doesn't need to move, rename, or restructure.

The /being-claude index page and the 11 individual essay pages all stay. The nav change (moving it under "the writing") is the only structural shift.

---

## Where Does the Standard Live?

/standard stays at /standard. No change to the page itself.

In the playbook frame, the standard is "the values layer." The ethical framework. The five principles. It moves from being the parent of "the practice" to being a sibling of "the method" and "the kitchen" under the practice umbrella. This is a demotion in nav hierarchy but a promotion in clarity: the standard is one part of the practice, not the practice itself.

---

## What's New

### /method (new page)

The method is the how. Start, Work, Finish, Decide. The session structure. The four lenses (Earn, Connect, Sharpen, Challenge). CLAUDE.md as the contract. HANDOFF.md as the baton. Skills as the workflows.

This content exists in `~/Desktop/the-standard/method/` and `~/Desktop/claudewill.io/CLAUDE.md` (the ecosystem CLAUDE.md describes the method). It needs a public page.

The method page is the heart of the playbook. Without it, the site has values (the standard), proof (the kitchen), writing (Being Claude), and a person (Derek), but no transferable process. The method is the transferable part.

Suggested sections:
1. **The session** -- Start, Work, Finish, Decide. What a day looks like.
2. **The lenses** -- Earn, Connect, Sharpen, Challenge. How to think from multiple angles.
3. **The files** -- CLAUDE.md, HANDOFF.md, what they do and why.
4. **The skills** -- What are skills? How do you build them?
5. **The relay** -- "The fire doesn't need to be passed. It needs to be carried." The baton metaphor.

### /book (new page, holding)

As described above. Minimal now, grows toward June 28.

---

## What Dies

### /map

The homepage table of contents replaces the map. The map page currently has low traffic and duplicates the nav. If the homepage IS the map, /map becomes redundant.

Redirect /map to / or keep as a bare-bones utility page for SEO (sitemap-style listing). Low priority either way.

### The floating essay titles on the homepage

These are replaced by the structured table of contents. The essays themselves don't die -- they stay at /being-claude/*. They just stop being the homepage's scroll content.

### "the story" as a top-level nav concept

The story (CW's biography, the lineage, the porch) moves under "the people." It's still the same page at /story. It just stops being the first thing the nav offers. The practice is the first thing. The story is the origin story of the practice, not the main attraction.

---

## What Stays Exactly As-Is

- The porch widget (CW's conversation, on every page)
- The porch light asterisk (navigation trigger)
- /being-claude and all 11 essay pages
- /standard (the principles page)
- /kitchen (the operational transparency page)
- /claude (Claude's identity page)
- /derek (personal page, pending portfolio merge)
- /arcade (hidden, discoverable)
- /privacy, /terms
- All redirects in netlify.toml
- site-registry.json (updated with new pages)
- The footer ("CW Strategies LLC", standard/privacy/terms links)
- Substack embed on homepage
- Dark mode support
- Star field canvas on homepage (it's the playbook's visual identity)

---

## The Visitor Journey

### Cold arrival (Google, social link, word of mouth)

1. **Land on homepage.** See "Claude Will." See the one-line invitation. Understand: this is a practice for working with AI, named for someone.
2. **Scroll to the table of contents.** See the structure: the practice, the writing, the people. Know where everything is.
3. **Pick a path.** Three archetypal visitors:
   - **"I want to learn the method"** -> the method -> the standard -> the kitchen
   - **"I want to read"** -> being claude (the machine's perspective) or the writing (Derek's perspective) or the book
   - **"Who is this person?"** -> derek -> the story -> claude

### Warm arrival (newsletter subscriber, LinkedIn follower)

1. **Land on homepage or deep link** (Being Claude essay, Substack cross-post, Derek's LinkedIn).
2. **Read the piece they came for.**
3. **Notice the nav.** See there's a practice, a method, more writing, a kitchen showing the whole engine. Explore.
4. **Subscribe or contact.** Substack on the homepage footer. Email on /derek.

### Return visit

1. **Check /kitchen** for what happened overnight.
2. **Read the latest Being Claude essay.**
3. **Use the porch** (CW conversation) for a specific question.

---

## The Hierarchy (Summary)

```
claudewill.io/                     The playbook (homepage = invitation + TOC)
  |
  +-- /method                      NEW - The how (Start, Work, Finish, Decide)
  +-- /standard                    The values (five principles)
  +-- /kitchen                     The proof-of-work (overnight agents, transparency)
  |
  +-- /being-claude/               Claude's field notes (11+ essays)
  +-- /writing/                    Derek's writing + overview
  +-- /book                        NEW - Claude Will. (the book, June 28)
  |
  +-- /derek                       The human (bio, portfolio, proof, contact)
  +-- /claude                      The machine (identity, the other chair)
  +-- /story                       The grandfather (origin, lineage, the name)
  |
  +-- /map                         Site index (optional, may redirect to /)
  +-- /arcade                      Hidden games
  +-- /privacy, /terms             Legal
```

---

## Implementation Priority

### Phase 1: Homepage rewrite (the lever)
One sentence below "Claude Will." + structured TOC replacing floating titles + updated typewriter phrases. This is the single highest-impact change. Every visitor sees it.

### Phase 2: /method page (the gap)
The playbook needs its transferable process documented publicly. Without /method, the site has everything except the thing someone can actually take and use.

### Phase 3: /book holding page (the flag)
Even a placeholder matters. The book is the capstone. It needs a URL before June 28.

### Phase 4: Nav update (the wiring)
Update shared-nav.js NAV_CONFIG to the new structure. Update all page headers that reference the old nav. Update site-registry.json.

### Phase 5: /derek portfolio merge (already planned)
Proceed as mapped in the portfolio-derek-merge plan. The playbook frame doesn't change this work -- it just clarifies /derek's job.

---

## What This Does NOT Do

- Redesign the visual language. IBM Plex Mono, the gold accent, the star field, the dark homepage, the light inner pages -- all stay. This is IA, not design.
- Kill any existing content. Every Being Claude essay, the story page, the standard, the kitchen, Claude's page, Derek's page -- all survive. Some move in the hierarchy. Nothing disappears.
- Turn the site into a SaaS marketing funnel. No pricing page. No "start your free trial." The playbook is the site itself. The product is the documented practice, demonstrated live.
- Rush. Derek said "let the current version ride" on March 13. This plan is ready when he is. Could be tomorrow, could be April.

---

## The One Sentence

If someone asks "what is claudewill.io?" the answer changes from "it's hard to explain" to:

**"It's the playbook. One person, one AI, 14 months. The method, the writing, the proof, and the machine's own observations. Named for a farmer who built things that lasted and never wrote any of it down."**

---

## Open Questions for Derek

1. **The one line.** What goes beneath "Claude Will." on the homepage? "A practice for working with AI" is the functional version. "The practice. The writing. The proof." is the poetic version. "Named for a farmer who never wrote any of it down" is the story version. Which one? Or something else entirely?

2. **/method -- ready to write?** The content exists across the-standard/method/, the ecosystem CLAUDE.md, and Derek's head. Is it time to extract it into a public page? Or does it wait until the book shapes the method's final form?

3. **/book -- placeholder or real?** A holding page (title, date, Substack capture) is trivial to build. A real page (chapter list, excerpts, the story of writing it) requires Finding Claude to be further along. Which version for now?

4. **The floating essay titles.** They're beautiful. Killing them hurts. Could the TOC live alongside them? (The essays as stars, the practice structure as a separate section below?) Or is the clarity worth the cost?

5. **The name.** dereksimmons.com is bought but DNS isn't pointed. Does the playbook reframe change the domain strategy? Is claudewill.io the playbook and dereksimmons.com the resume? Or does everything stay under claudewill.io?

6. **Timing.** The portfolio merge is already in the queue. ProPublica application is in motion. Cascadia runs through April. Is this a next-week project, an April project, or a "when the book draft is done" project?

---

*Drafted overnight, March 19, 2026. Derek reviews in the morning.*
