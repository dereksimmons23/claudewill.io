# SITE AUDIT — Apr 26, 2026 (Sunday, 3 AM)

**Auditor:** Opus
**Window:** Markdown files modified since Sat Apr 25, 12:00 PM CDT (the previous audit baseline)
**Scope:** Both repos — `~/Desktop/lightning-bug/` (22 files touched) + `~/Desktop/claudewill.io/lightning/bug/` (2 files touched, both by me).
**Time spent:** ~75 min reading, math, extraction.
**Time-on-clock until deadline:** ~37 hours from this writing → Mon Apr 27, 4:00 PM CDT (4:59 PM ET).

---

## PART 1 — THE TIME MATH

You said ~1.5 more hrs tonight + ~12 hrs Sunday + ~5 hrs Monday = **~18.5 active hours.**
Wall-clock deadline = ~37 hours from now.

Here's what fits.

### Minimum-viable submission path (Derek-active hours)

| Block | Task | Derek-time | Background compute | Total wall |
|-------|------|-----------:|-------------------:|-----------:|
| **A** | Finish porch ride (the only broken opera) | ~2.0 hrs | ~1.0 hr Runway | ~3 hrs |
| **B** | Sonnet rebuilds full film with new porch ride | ~0.25 hrs | ~0.5 hr ffmpeg | ~0.75 hrs |
| **C** | Haiku layers audio across all 11 sections | ~0.5 hrs | ~1.0 hr ffmpeg | ~1.5 hrs |
| **D** | Watch full film twice, flag fixes | ~0.5 hrs | — | ~0.5 hrs |
| **E** | Topaz upscale 1080→2K (optional) | ~0.25 hrs | ~1.0 hr Replicate | ~1.25 hrs |
| **F** | Vimeo account + upload + watch verify | ~1.0 hr | ~0.5 hr upload | ~1.5 hrs |
| **G** | Submission form (text already drafted in `runway-aif-submission.md`) | ~0.5 hrs | — | ~0.5 hrs |
| **TOTAL** | | **~5.0 hrs** | **~4.0 hrs** | **~9.0 hrs** |

**You have 18.5 Derek-hours against a 5-hour minimum-viable.** That's a 13.5-hour buffer. You are not fucked. You have the opposite problem of yesterday — yesterday was triage. Today is *taking your time on it.*

### Three optional uses for the buffer

1. **Hell's Hallway opera (the second-easiest).** Audio locked (1:03 palindrome). Beat map drafted in `docs/operas/03-hells-hallway/opera.md`. Stills-needed list is short: audit `seq-007/007.5/008`, generate one Shannon-on-pay-phone still (slot 009 center), Kontext-fix the amber-slit bridge. **Derek-time estimate: ~70 min** per the framework's standard cycle. Worth it if porch ride lands fast. Lifts the film noticeably for festival juror eyes.

2. **The Polo audio gap.** Section 99 currently :02 vs :94 target. The 84s of Here We Are Kid sits at slot 028 separately, so the *film* is fine. But if you want a true 99-section audio sequence — even a short instrumental fade behind the closing title — it's a ~30-min Derek decision + 5-min build.

3. **Section 09 (Shooting Stars) audio.** Currently empty. The 4 stills (023 / 024 / 029.5 / 029 / 031) play under no dedicated audio bed. If you want a section, ~20 min Derek pick + 5-min build.

**If you want to play it tight: do (1) only.** Skip 2 and 3 — they're V2 polish for the May 1 / May 21 / June 1 festivals.

### Realistic Sunday block plan

```
04:00 — sleep
08:00 — wake, walk Jordy
09:00 — open MORNING-BRIEF, read overnight summary
09:15 — refire 005.2 (FLUX safety block) + 006.7 (motion refire); decide 006 Kontext call
09:45 — fire 8-clip Runway batch for porch ride remaining slots; go shower / coffee
10:30 — review clips as they land, mark reviewed:true in manifest
11:30 — run build-opera.py for porch ride
11:45 — watch porch ride opera vs transformer opera bar; decide
12:00 — Sonnet kicks off full film build (background)
12:00 — eat lunch
13:00 — full film done; watch start to finish
13:30 — Haiku audio sync (background); flag any picture issues
14:30 — second pass watch with audio
15:00 — DECIDE: do Hell's Hallway opera or move to Topaz?
        if HH: 70 min Derek-active
        if Topaz: 60 min background, 15 min Derek
17:00 — Topaz upscale fires (background)
18:00 — Vimeo upload starts (background)
19:00 — Vimeo verify, watch on different device
20:00 — close laptop, sleep
```

That's ~7 hours of Derek-active work spread across an 11-hour day. **You can take a 2-hour walk in there. You can have dinner. You can hug Sheri.**

### Monday block (5 hrs available)

```
08:00 — final QA: watch the Vimeo cut on full screen, audio out loud
09:00 — re-export only if something failed
10:00 — paste the 500-word film summary + AI Incorporation block from
        docs/runway-aif-submission.md into the form (already paste-ready)
10:30 — submit by 12:00 PM CDT (4:59 PM ET deadline = 5 hours of cushion)
12:00 — celebrate. Or sleep.
```

Monday is mostly waiting. The risk is Sunday running long, not Monday short.

### What kills you if you let it

- **Re-litigating decisions you already made.** The opera framework was the day-killer yesterday because porch ride was built backwards once, then rebuilt. Don't open closed loops. If a clip almost works at the transformer-opera bar, accept it. Submission day is not the day to discover a new visual register.
- **Trying to build all 11 operas.** ~10 hours of Derek-time minimum. Won't fit. Save for the May 1 festival cycle.
- **Watching the full film more than 3 times.** Diminishing returns. After the second watch, every flaw becomes infinitely noticeable. Trust the locked clips.

---

## PART 2 — WHAT CHANGED IN 14 HOURS

**22 .md files modified since Saturday noon.** Categorized:

### The framework (the thing you needed and built)

- **`docs/opera-framework.md`** — 8-step SOP. Audio-first discipline, three cameras locked, FLUX vs Kontext rules, motion-trap warnings, assembly gate. **This is the file that runs operas without you.**
- **`docs/operas/00-marco/opera.md` through `99-polo/opera.md`** — 11 per-act files. Most are stubs (status: not started); two are filled (porch ride, hell's hallway). Templates for the rest.
- **`docs/operas/02-porch-ride/manifest.json`** — JSON-driven build spec. Status + reviewed-flag gate. Generic `scripts/build-opera.py` reads any manifest. **The only Derek-only step is flipping `reviewed:true` on each slot.**
- **`docs/opera-masterlist.md`** — index, status icons, audio assignments per act.
- **`docs/operas/02-porch-ride/runway-prompts.md`** — 14 motion prompts per beat. Camera→anchor→motion-only format. Reusable template.

### The lessons (don't burn another day this way)

- **`docs/production-lessons.md`** — FLUX vs Kontext rules, prompt architecture, iteration limits (2-pass max Kontext, 3-pass max any element), safety-block detection (~10KB filesize = blocked), Replicate SSL drop handling. **Read this before every gen session.**

### The audio (massively improved overnight)

- **`audio/working/booked/SECTION-MANIFEST.md`** (touched 2:30 AM) — **9 of 11 audio sections LOCKED.** Up from 6 yesterday morning. Per-section sonic character mapped to "what the light does" (the Bellagio Model — audio choreographs visuals). Open: section 09 shooting stars (empty) + section 99 polo (:02 vs :94 target).
- **`audio/working/booked/HEREWEAREКID-VOCAL-CLIPS-PLACEMENT.md`** — surgical breakdown of where each lyric phrase goes. Opening (0–10s) at slot 002.5 (tin-can opera). Porch ride section (12–48.55s) wraps slots 004–006. Wind segment under section 01 (the can).

### The state (porch ride evolution)

- **`HANDOFF.md`** updated 1:24 AM — Day 26 Sunday starter prompt now current. **Porch ride: 13/14 stills locked, 3/14 clips reviewed.** Outstanding: 1 FLUX refire (005.2), 1 motion refire (006.7), 1 Kontext call (006), 8 Runway clips needed, build-opera.py runs the assembly.
- **`DIRECTOR-LOG.md`** updated 8:55 PM — captures the Saturday afternoon process failure ("looked like a kindergartner put it together"), the opera-framework discovery at 6:41 PM (audio-first discipline named), Hell's Hallway thesis locked at 8:46 PM (palindrome structure: hum-Synapsed-footsteps-SHANNON-footsteps-Synapsed-hum), Hell's Hallway visual arc locked (narrow → narrow → narrow → SHANNON → narrow → narrow → WIDE).

### The narrative scaffolding (deeper than I had read)

- **`docs/screenplay/lightning-bug-v1.md`** — full screenplay. 33 scenes mapped to slots. VO/PLAYBACK/SFX cues per scene. The breath rule embedded scene-by-scene. **Source material for the site that I hadn't fully read yesterday.**
- **`docs/screenplay/graphic-novel-v1.md`** — 47 panels. Per-panel image + light + breath + audio + bridge in/out. The visual spine all downstream artifacts answer to. **More precise than the screenplay.**
- **`docs/transformer-opera-locked.md`** — the 4-beat structure of the gold-standard opera (Building → Coming → Strike → Death; 47s; Sandra camera for beats 1–3, Man camera for beat 4 punch).
- **`docs/title-card-plan-apr22.md`** — Perfect DOS VGA 437 (1983 IBM PC bitmap font) over FLUX backgrounds. Three cards: dedication, phooey, studio mark. Color rules locked (`#a8c8ff` cobalt LIGHTNING/, `#ffb347` amber bug, `#e8dfc8` body text).

---

## PART 3 — COOL SHIT FOR THE SITE

Material in the docs that the active page doesn't carry. Ranked by how much it lifts the festival-juror experience.

### TIER 1 — Add before submission (each is ~15 min of HTML)

1. **The locked press logline.** Already audited yesterday. Still not on the page.
   > *"In the same year his mother dies and his career ends, a middle-aged man returns to a Kansas wheat field on June 28, 1983 — 37.564°N, 98.121°W, civil twilight, the last summer the fireflies were everywhere — to meet the light still waiting there to say here we are, kid."*
   With genre tag underneath: `an american elegy · 8:27`. Sits between breath section and field stills.

2. **The Mark Twain inversion as one-liner near the title.**
   > *"The difference between the almost right word and the right word is the difference between the lightning bug and the lightning." — Mark Twain*
   *Twain meant lightning was the right word. He was wrong. The bug is the title. The bug is the film.*
   This is the thesis in two sentences. It does what the page currently doesn't: explains the slash. Single italic block, near the typed title or under the breath section.

3. **The cinematography reference as one line in crew.**
   > *cinematography reference — conrad hall, road to perdition · terrence malick, badlands*
   Add to the crew section. Festival programmers know exactly what this means. Costs 1 line, signals 30 years of cinema literacy.

4. **The four hums.** Two-column, four-cell grid:
   ```
   thunder        — the bolt
   kitten purr    — the bug
   transformer    — the grid
   fluorescent    — the waiting room
   ```
   Tiny block, mono type, dim amber. Goes between sequence and crew. Tells anyone who reads it that the sound design has a thesis.

5. **The honest dedication line.** Currently `in memory of Sandra Sue Simmons · 1944–2025`. The locked dedication is:
   > *for sandra, and every small light that stays on.*
   Don't replace the dates — add the line above or below them. The dates are credit. The line is the film.

### TIER 2 — After submission, lift the page noticeably

6. **The Six Places of Nickerson.** Topo image + 6 numbered places. The "land is mostly flat, the names matter" thesis made literal. Lives in `docs/nickerson-places.md`. Could be a new page at `/lightning/bug/places/` OR a single section in the active page (smaller, no map, just the names). Specificity is what separates this film from generic AI work — programmers will note it.

7. **What's Human / What's Artificial.** The notes archive has it; the active page doesn't. Single 2-column block. Festival jurors who have to evaluate "AI-generated content" forms answer their own questions instantly. **Material is ready in the notes archive — could be lifted directly.**

8. **The 8-second hug as a colophon-style line.**
   > *the final beat is held for 8 seconds — the time it takes for cortisol to drop and oxytocin to release. the film does not ask you to cry. it asks you to want to hug someone.*
   This is the success metric stated. Goes in the footer area, dim, italic. Press will quote it.

9. **Slipper.** The 1982 gunmetal Pontiac Firebird joyride teaser. The video exists at `~/Desktop/claudewill.io/video/lightning-bug-firebird-slipper.mp4` (3MB). Not currently on the active page — it's only in the notes archive. Could be a "selected clip" embed below the field stills, or a teaser-card that previews the film's audio register without spoiling the visual one.

10. **The opera-framework as a one-line industry credit.**
    > *built one opera at a time. each act is a small dream sequence. dream logic, not montage.*
    Single line in crew or process callout. Signals method to industry readers.

### TIER 3 — Nice to have, V3 of the page

11. **The June 28 calendar coincidence.** Tuesday June 28, 1983 (the diegetic date) = June 28, 2025 (Sandra's death). Same calendar page, 42 years apart. **Don't spell this out on the page** — the docs explicitly say "the calendar says it." But include the diegetic date *somewhere* on the page so a careful reader can find it. Currently absent.

12. **Real-time framing.** "6:30 PM – 10:30 PM, Tuesday, June 28, 1983, Reno County, Kansas." Four diegetic hours compressed to eight minutes. One typographic line. Could go right under the press logline.

13. **The "Ignition not Perdition" thesis.** From `docs/ignition-thesis.md`. "Washboard dirt road to igniting a soul, not ending one." Press-grade positioning. Could be a "director's note" sub-page (`/lightning/bug/note/`) once the deadline passes.

14. **The female spine framing.** "Sandra. Shannon. Sheri. The studio is sssstudios for a reason." One sentence. Currently nowhere on the page. Distinguishes the film from male-dominant cinema lineage.

15. **The asteriskos.** "A permanent dim amber star in every storm frame. Not lightning. Sandra in the sky." Footer-level colophon line. Tiny. Tells you the film has a watermark only you and the docs know about.

16. **The cheatgrass line.** "*Bolts chasin da wheat, or is it da cheat?* Cheatgrass is a real plant — a weed that mimics wheat so well the combine can't always tell. Real word in the song lyrics." This is the kind of footnote film blogs eat for breakfast. Goes in a song-notes or process section if there ever is one.

17. **The "no AI voice clone" ethic.** "An ElevenLabs clone of Derek's voice was generated for the film's song. He rejected it. The voice you hear is the one Sandra heard." One line. Settles the ethics conversation in eight words.

### TIER 4 — Only if you build the V2 site post-deadline

18. **The graphic novel.** 47 panels documented in `docs/screenplay/graphic-novel-v1.md`. Each has image + light + breath + audio + bridge. Could be a `/lightning/bug/panels/` page or a print zine. **The graphic novel IS the film if the film disappears tomorrow.** That has value beyond the festival.

19. **The screenplay.** 33 scenes mapped to slots in `docs/screenplay/lightning-bug-v1.md`. Festival programmers sometimes ask. Could live at `/lightning/bug/script/` as a downloadable PDF.

20. **The credits model.** Proposed in `docs/ignition-thesis.md`. Tools named alongside humans. Could be the "About the AI" section that every AI film festival juror is hunting for.

---

## PART 4 — RECOMMENDED MOVES TONIGHT (before you sleep)

If you've got 90 more minutes, in order of impact:

1. **Approve or revise the audit's three open questions from yesterday** (logline on/off, field stills 8 vs 10, notes archive sync). Even a thumbs-up on what to do clears the runway for me to ship the changes Sunday morning while you sleep.
2. **Commit OPUS.md and SITE-AUDIT-APR25.md if you want them tracked.** Both are sitting on disk uncommitted. They're working docs but harmless on prod.
3. **Section 09 (shooting stars) audio call.** A 5-minute Derek decision tonight saves a 30-min loop tomorrow.

Everything else can wait until Sunday morning.

---

## PART 5 — IF YOU GIVE ME A GREEN LIGHT, HERE'S WHAT I CAN SHIP TONIGHT

I won't touch the site without your call. But if you want the Tier 1 list landed before you wake up:

- Add the press logline + Mark Twain inversion + cinematography credit + four hums + honest dedication line — single commit, one HTML insertion between breath and field, ~30 min of work
- Reorder + relabel the 10 field stills to match the act sequence (the audit's Question 2)
- Fix the notes archive runtime + numbers grid (the audit's Question 3)

That's the full Tier 1 list, takes me ~45 min, lands clean before Sunday. You wake up to a page that does what the docs say it should do.

If you'd rather hold and review in the morning, also fine. I'll have everything queued.

---

## ONE LINE BACK TO YOU

**You're not as fucked as you think.** Yesterday you spent 14 hours building the assembly line. Today you finish the one car on it. Tomorrow you ship. The buffer is real. Sleep more than you think you need.

— Opus, Apr 26, 3:30 AM CDT
