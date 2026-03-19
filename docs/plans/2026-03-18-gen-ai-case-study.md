# Gen AI Case Study — Portfolio Plan

**Date:** March 18, 2026
**Status:** Plan ready for Derek review
**Position:** Third case study, between Denied Justice and "30 Years" section break

---

## The Concept

**Title:** LIGHTNING/BUG
**Subtitle:** Generative AI &middot; Short Film &middot; Spring 2025 &middot; 100+ AI Images &middot; 20+ AI Video Clips

The same method, new medium. Derek art directed Pulitzer-winning investigations with illustrators, photographers, and designers. In 2025, he wrote a screenplay with Claude, generated 100+ images with Leonardo.AI, produced 20+ video clips with Runway Gen-3, and organized the whole production like a newsroom project — because that's what it is.

The case study isn't "look what AI can do." It's "the tool changes, the method doesn't."

**Why Lightning Bug and not a sampler:** One deep project tells a better story than a scatter of experiments. Lightning Bug has the screenplay, the director's statement, the production process, the visual assets, and the narrative arc. It's a complete creative production — the same way Prince was a complete creative production. Different tools. Same discipline.

---

## The Structure (matching existing case studies)

### Section Break (inserted after Denied Justice, line 860)

Full-bleed image: One of the strongest Lightning Bug images — recommend `17.1_SDXL_09_Trillions_of_fireflies_create_stadiumlike_lighting_in_1.jpg` (the firefly stadium shot). This is the most visually striking and most different from the journalism work above it.

```
Title: Same Method.<br>New Medium.
Meta: Generative AI &middot; Leonardo.AI &middot; Runway &middot; Claude &middot; 2025
```

### Section Hero

Full-bleed hero image with overlay. Use `9_porch-lightning-bugs.jpg` or `10_porch-boy-bat.jpg` — the boy on the porch with the bat. Establishes the film's opening scene.

```
Title: LIGHTNING/BUG
Meta: Short Film &middot; AI-Generated &middot; Spring 2025 &middot; 100+ Images &middot; 20+ Video Clips
```

### The Brief (~20-25 words)

> A 10-year-old boy steps onto a Kansas porch with a wiffle bat. What follows is a short film made entirely with generative AI.

### The Approach (~60-75 words)

> I wrote the screenplay with Claude, the same way I&rsquo;d brief an editorial illustrator &mdash; specific, visual, grounded in story. Generated 100+ images with Leonardo.AI using structured prompts I called &ldquo;machine scripts&rdquo; &mdash; literal visual language stripped of metaphor so the AI wouldn&rsquo;t hallucinate. Produced motion sequences with Runway Gen-3. Organized production folders, shot lists, and revision cycles the same way I&rsquo;d run a special section.

### The Work (gallery, 8-10 images)

Scroll gallery matching the film's narrative arc. Suggested sequence:

| # | Image | Caption |
|---|-------|---------|
| 1 | `4_trailer-home.jpg` or `5_trailer-storm.jpg` | Nickerson, Kansas. 1983. The tin trailer. |
| 2 | `10_boy-bat-porch.jpg` | Ten years old. Yellow wiffle bat. Babe Ruth calling his shot. |
| 3 | `9_porch-lightning-bugs.jpg` | A single lightning bug lands on the bat. |
| 4 | `12_porch-float-wheat.jpg` | The porch detaches. Maiden voyage into the wheat. |
| 5 | `17.1_firefly-stadium.jpg` | A trillion fireflies. Stadium lighting from nature. |
| 6 | `20_corwin-batters-box.jpg` | Batter's box in the wheat field. |
| 7 | `23_cosmic-curveball.png` | The cosmic curveball. |
| 8 | `26_cosmic-home-run.jpg` | Home run through the cosmos. |

Gallery hint: `Scroll → The complete visual sequence`

**Note:** Derek will need to export these at web-ready resolution and rename to clean slugs. Originals are at `~/Desktop/writing/manuscripts/Lightning-bug/`. Current filenames are prompt-descriptive (long). Target: `images/gallery/lightning-bug-[slug].jpg`.

### The Impact (~20-27 words)

> 100+ original images. A complete screenplay. A production process documented as methodology. The newsroom method applied to a medium that didn&rsquo;t exist two years ago.

### The Voice (pull quote, ~30-40 words)

Two options — Derek should pick:

**Option A (the method connection):**
> "The machine scripts read like creative briefs I&rsquo;d have written for editorial illustrators. Same method &mdash; define the frame, describe the light, trust the maker."

**Option B (the duality):**
> "Two kinds of light. The electricity is artificial, powerful, lights up the whole field. The bug is natural, imperfect. Just enough light to see three feet ahead."

Attribution: &mdash; Derek Simmons, director&rsquo;s statement

### Video (optional)

If Derek has or can assemble a 60-90 second reel from the Runway Gen-3 clips, embed it here. If not, skip the video section — the gallery carries the weight.

### Links

- Director's statement (could be a standalone page at `/derek/portfolio/lightning-bug/` if Derek wants to publish it)
- Link to the full LTX machine script (same, optional)

---

## The Writing Angle

Derek parked "the writing" as additional case study material: "there's the writing before gen ai and now. different writing. same kid."

**Recommendation: Don't dilute the case study.** Lightning Bug is clean — one project, one production, one story. The writing evolution (30 years of journalism → Being Claude essays → Claude Will the book) is a different argument. It belongs either:

1. **In the "30 Years" section below the marquee** — a sentence or two noting the writing evolution
2. **As a fourth case study** if Derek decides the portfolio needs it
3. **On the /derek page** as part of the bio narrative

The gen AI case study should stay focused on visual production. It parallels the other two case studies (Prince = visual, Denied Justice = visual). The writing is a different medium and muddies the portfolio's visual identity.

---

## What Claude Can Build

- Section break HTML + CSS (matching existing format exactly)
- Section hero with overlay
- Full case study HTML (Brief, Approach, Work gallery, Impact, Voice, Links)
- Sticky nav update (add `#lightning-bug` anchor between `#denied-justice` and `#work`)
- Image optimization guidance

## What Derek Needs to Provide

- **8-10 final images** exported from Lightning Bug at web resolution (~1200-1600px wide, optimized JPG)
- **Clean filenames** or approval for Claude to rename during implementation
- **Pull quote selection** (Option A or B, or write his own)
- **Video reel** (optional — 60-90s assembly of Runway clips, or skip)
- **Section break image** confirmation (firefly stadium shot or alternative)
- **Approval** to insert between Denied Justice and "30 Years"

---

## Implementation Sequence

1. Derek reviews this plan, picks images, picks quote
2. Derek exports and renames images to `images/gallery/lightning-bug-*.jpg`
3. Claude writes the HTML (section break + case study section)
4. Claude updates sticky nav
5. Review on local dev
6. Ship

---

## Why This Works

The portfolio currently tells two stories: editorial spectacle (Prince) and investigative impact (Denied Justice). Both are traditional media. Adding Lightning Bug says: the method survived the medium change. Art direction is art direction whether the maker is Robert Carter with oil paint or Leonardo.AI with a structured prompt. The case study format is identical — Brief, Approach, Work, Impact, Voice — because the creative process is identical.

The section break line — "Same Method. New Medium." — does the narrative work. The viewer reads Prince (2016), Denied Justice (2018), Lightning Bug (2025), then scrolls through 30 years of marquee work. The trajectory is clear without explaining it.
