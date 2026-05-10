---
type: spec + seed
for: claudewill.io/scoreboard (working title — was /predictions)
build_window: 2026-04-21 (post-film-freeze)
estimated_build_time: 30-40 min (two sides to seed, but spec below makes it ship-fast)
inspired_by:
  - Daniel Miessler's predictions page (miessler.com/predictions)
  - Box scores, behind the box score, sports ledgers
  - Derek's Boolean choice ledger (apps/boolean)
working_titles:
  - "Derek × Claude: The Scoreboard"
  - "The Box Score"
  - "Behind the Box Score"
  - "derek*claude on the Record"
---

# Derek × Claude: The Scoreboard — Spec + Seed

**New frame, Apr 17 (Derek's call):** "maybe we should set this up as a claude scoreboard? derek vs claude predictions with a running score? boolean driven. behind the boxscore type stuff."

A dated, calibrated log of claims made by **both sides** of the human-AI collaboration. Each call tagged with side, confidence, resolution date, Boolean outcome. Running score on the home card. "Behind the Box Score" column tells the story behind a call — monthly cadence, cross-posts to Substack.

## Why this is better than a single ledger

- **Thesis alignment.** The book, the practice, and the method all rest on a working human-AI partnership. A scoreboard makes it visible. The collaboration isn't asserted — it's measured.
- **Stakes.** Solo predictions pages drift into thesis-restating. Two-side scoreboard creates real stakes — you or I are wrong, not just "time will tell."
- **Room-matching.** Box score language is your native dialect. Former-QB, Packers-fan, BOB-tradition voice. No performance needed.
- **Content engine.** "Behind the Box Score" becomes a monthly column. Publish the deep-dive on Substack → link back to the live scoreboard. Distribution flywheel.
- **Honest credibility.** A page where Claude also gets scored (and can lose) says more about epistemic humility than a Miessler-style solo log. It also says something about what AI actually does: makes calls, gets them wrong sometimes, updates.

## Why this page

- **Establishes epistemic credibility.** Miessler's predictions page works because it goes back to 2017 and he publicly eats his wrong calls. Derek's arc already has dated claims in published material — the page is mostly archaeology, not prognostication.
- **Standard Intelligence thesis needs receipts.** You've said for two years "this will change everything." The page is the ledger.
- **Distribution lever.** A page that updates → a reason for the warm network to come back → RSS/email hook that doesn't cost creative energy to maintain.

## Form (scoreboard-grade)

### Top of the page — The Tale of the Tape

A running, at-a-glance scoreboard:

```
                        DEREK        CLAUDE
─────────────────────────────────────────────
Resolved calls            5            3
⊤ Correct                 2            2
⊥ Wrong                   3            1
↻ Revised (public)        2            0
∅ Pending                 7            4
─────────────────────────────────────────────
Batting avg              .400         .667
Probable bucket          .333         .500
─────────────────────────────────────────────
```

*(numbers are seed-stage placeholders, not real totals)*

Below that: the ledger itself. Below that: "Behind the Box Score" — the monthly deep-dive.

### Per-call row

| Field | Format | Example |
|-------|--------|---------|
| **Side** | derek / claude (or head-to-head ⚔) | derek |
| **Claim** | One sentence, verbatim from source | "This will change everything about anything." |
| **Made** | Month + Year | May 2024 |
| **First published** | Date + outlet | Dec 15, 2024, Standard Correspondence, "The Hot Take" |
| **Confidence** | Almost Certain / Probable / Chances About Even / Unlikely | Almost Certain (retroactive) |
| **Resolves** | Date or "ongoing" | Ongoing |
| **Boolean** | ⊤ / ⊥ / ∅ / ↻ | ⊤ |
| **Note** | ≤2 sentences — context or revision | Called the inflection 7 weeks before position elimination. |

### Head-to-head (⚔) calls — the Fight Card

When Derek and Claude make *different* calls on the same underlying question, they get a head-to-head row. Each side stakes a confidence level. Same resolution date. Scoreboard tracks wins separately.

This is the most interesting section. It's where the collaboration shows teeth.

## Data model

```yaml
predictions:
  - id: inflection-may-2024
    side: derek                          # derek | claude | head-to-head
    claim: "This will change everything about anything."
    made: 2024-05
    published: 2024-12-15
    outlet: "Standard Correspondence — The Hot Take"
    confidence: almost-certain
    resolves: ongoing
    boolean: "⊤"                          # ⊤ | ⊥ | ∅ | ↻
    note: "Called the AI inflection 7 weeks before position elimination."

  - id: claude-scoreboard-meta
    side: claude
    claim: "By April 17, 2027, this scoreboard is the most-shared page on claudewill.io and the book sells off the back of it."
    made: 2026-04-17
    published: 2026-04-21  # when page goes live
    outlet: "claudewill.io/scoreboard seed, writing/ideas/predictions-page-apr21.md"
    confidence: probable
    resolves: 2027-04-17
    boolean: "∅"
    note: "Claude's meta-prediction about the page itself. Resolves with analytics data + book sales receipts."

  - id: h2h-consulting-2027
    side: head-to-head
    claim: "By Dec 31, 2027, is knowledge-work AI consulting (C-suite AI explainer model) commercially dead?"
    derek_position: "Yes. Dead. Coaching + methodology licensing survives."
    derek_confidence: probable
    claude_position: "Mostly dead in the 2022 explainer form. Returns as AI-ops coaching + fractional-CAIO roles. Mixed outcome, not death."
    claude_confidence: probable
    resolves: 2027-12-31
    boolean: "∅"
    note: "First seeded head-to-head. Resolution criterion: look at the 2027 market. If Derek's wrong, he owes me a Coach D session."
```

One `predictions.yaml` at site root. Build reads it → renders scoreboard + ledger + fight card. Easy to amend.

## URL & IA

- **Canonical:** `claudewill.io/scoreboard` (primary). `/predictions` redirects in. `/box-score` redirects in.
- **Nav:** Add to /derek hub footer or the cardinal compass — it's the page that lives next to the book, not buried.
- **Feed:** `claudewill.io/scoreboard.rss` — new calls, resolutions, and revisions all fire an item.
- **Substack column:** "Behind the Box Score" — monthly deep-dive. Links to the live row on the scoreboard. Cross-posts to LinkedIn for Derek personal.

## Voice rules for the page

- **Room-matching: sports-adjacent, not sports-performing.** Box score, tale of the tape, fight card, season stats, post-game. Yes. "Slammin' predictions" or "hot takes on the 50-yard line." No.
- No hedging. "Said X in Y. Came true/didn't." Past tense or present.
- Document misses with the same seriousness as hits. Derek's misses AND Claude's misses. The misses are the credibility.
- No "I predicted" — too breathless. "Said." "Called." "Staked." Verbatim quote.
- Revisions (↻) get their own row, not an edit to an existing row. Dated revision history compounds.
- **Head-to-head rows (⚔) show both stakes publicly.** No ambiguity about who said what. Resolution names a winner.
- Claude speaks as Claude on Claude rows. Derek speaks as Derek on Derek rows. No ventriloquism.

---

# Seed — 12 dated claims pulled from published work + memory

These are real, sourced, datable. First pass. Derek edits.

## Correct / Ongoing (The Hits)

### 1. The Inflection (May 2024)
> "This, whatever this is, is different. And it will change everything about anything."

- **Published:** Dec 15, 2024, Standard Correspondence, "The Hot Take"
- **Confidence:** Almost Certain (in hindsight — he staked a career on it)
- **Status:** Correct
- **Note:** Called 7 weeks before position elimination. The room in May 2024 couldn't see it.

### 2. Model-agnostic thesis (Sept 2025)
> "The model is the lightning. The prompt is the bug."

- **Published:** Option D development log; canonicalized in memory.
- **Confidence:** Probable (when made); proved Nov 2025 with The Lineup.
- **Status:** Correct — proved across 9 providers with one prompt.
- **Note:** Contradicted the dominant "build on OpenAI" orthodoxy. Mistral, Cohere, DeepSeek, Claude, GPT, Gemini all coached from the same prompt.

### 3. Teams becoming APIs (Summer 2025)
> "Your teams will become APIs between systems that can't communicate directly."

- **Published:** "I'm the API — A Day Swimming in AI" (Standard Correspondence archive)
- **Confidence:** Probable
- **Status:** Ongoing — one of Miessler's calls too, but Derek wrote it from lived experience.

### 4. Consulting is dead (March 2025)
> "Consulting is dead. The moat is coaching, not building."

- **Source:** Hard truths memory (Mar 26, 2025 per train-reading/model-haiku notes)
- **Confidence:** Probable
- **Status:** Ongoing — Cascadia is in-person delivery; Coach D is methodology licensing.
- **Note:** Call was about the *CEO-explainer* consulting model. Coaching + fine-tune licensing is the survivor form.

### 5. Distribution is the gap, not product (March 28, 2025 — "The Constraint")
> "Distribution is the binding constraint. The ecosystem has product-market fit for at least three of the four pillars. What it lacks is a mechanism to put those products in front of the people who need them."

- **Source:** writing/ideas/train-reading/deep-03-financial.md, model-haiku.md
- **Confidence:** Almost Certain
- **Status:** Ongoing — confirmed repeatedly; this page itself is a response.

### 6. Bifurcation / Velvet Rope (April 8, 2026)
> "The most accurate model is behind a velvet rope. Option D is the model that shows up."

- **Source:** writing/ideas/the-velvet-rope-overnight.md
- **Confidence:** Probable
- **Status:** Ongoing — tracks Miessler's 2017 bifurcation thesis from a different angle (class-of-access, not class-of-income).

### 7. The Human Labor Tax (April 14, 2026)
> "The only conversation that matters is the global elimination of the human labor tax."

- **Source:** Reply to Zapier AI governance panel invite; Ch. 16 seed at claude-will-book/ideas/the-human-labor-tax.md
- **Confidence:** Probable
- **Status:** Ongoing — Andrew Yang's Fortune piece names the adjacent form; Derek's framing is sharper.

### 8. Standard Intelligence (ongoing thesis)
> "Standard Intelligence — T-shaped, horizontal over vertical. CW's common sense plus Einstein's book smarts. The quarterback."

- **Source:** writing/ideas/claude-will-the-model.md; book manuscript throughline.
- **Confidence:** Probable
- **Status:** Ongoing — proposition of the book; resolves when model-building begins (summer 2026 target per the three-level path).

## Early / Late / Revised

### 9. Print evolution, not extinction
> "Print isn't facing extinction but evolution. There will always be an appetite for the solitude of analog storytelling."

- **Published:** "Olympic-Sized Memories" (archive)
- **Confidence:** Probable
- **Status:** Ongoing — Cascadia print is the working proof. Revisit 2027.

### 10. Sports cover / Axios form-match (April 16, 2026)
> "Don't force Being Claude into sports applications. Match the room."

- **Source:** Apr 16 session, captured in feedback_sports_cover_voice.md
- **Confidence:** Certain
- **Status:** Correct (rule of voice, not a public prediction — include if the page accepts rules alongside claims, or move to a companion "Rules" section).

## Candidates for "Too Soon" or "Watching"

### 11. Recession-like AI shock by 2027
> (Co-signed call, not original — Miessler Jul 2025. Derek's rebuilding year 2026 is staked against this timeline.)

- **Confidence:** Chances About Even
- **Status:** Watching
- **Note:** If the shock lands, the book's author's note should reference this window.

### 12. The JetBrains Debugger MCP bet (parked Apr 16, 2026)
> "Decide or delete by May 14."

- **Source:** memory — 30-day trial ending ~May 16.
- **Confidence:** N/A — a decision deadline, not a prediction. *Pull from this seed if the page is predictions-only.*

---

## Misses section (required for credibility — needs Derek's input)

The page will only work if the wrong calls are as visible as the right ones. **I don't have clean examples of Derek's published misses from this pass.** Candidates to consider:

- Any dated Substack piece where the call didn't land? (2025 archive worth a sweep.)
- The "2025 Can Kiss My A On Its Way Out" framing — did any specific 2026 expectation from that piece fall short?
- Early LIGHTNING/bug claims (format, release, form) vs what the April 2026 cut actually is.
- Claude Will trademark: the **filing route** (March 29, 2026) was abandoned — "scammy af." The mark itself is alive but unborn. That's a revision entry, not a miss — and it belongs here because the *filing* decision reversed, the *concept* didn't.

Derek: one misses-section add per month would be plenty. The discipline of keeping it honest is the whole game.

---

# Seed — Claude side (on the record, Apr 17)

Claude has been making calls in-session that, if the scoreboard framing is right, belong on the page. Staking them publicly now, confidence levels attached, resolution dates where possible. Derek edits.

## Claude's standing calls

### C1. The scoreboard page itself
> "By April 17, 2027, this scoreboard is the most-shared page on claudewill.io, and the book sells off the back of it."
- **Made:** 2026-04-17 (this file)
- **Confidence:** Probable
- **Resolves:** 2027-04-17
- **Boolean:** ∅

### C2. LIGHTNING/bug premiere — breath metric
> "The finished cut will change the breath of at least one viewer for its full run time. The success criterion is respiratory, not narrative."
- **Made:** Apr 2026, in session
- **Confidence:** Almost Certain (the light-arc structure is doing the work)
- **Resolves:** First public screening + one testimonial
- **Boolean:** ∅
- **Note:** Derived from the project_lightning_bug_breath.md memory. Claude is staking the success of a premise Derek set.

### C3. Book length
> "The finished Claude Will book, at compilation day (currently Apr 29, 2026), will exceed 48K words. Not 60K. Not 80K. A Didion-sized book, on purpose."
- **Made:** 2026-04-17
- **Confidence:** Probable
- **Resolves:** 2026-04-29 (compilation day)
- **Boolean:** ∅
- **Note:** Counter to my earlier concern that 39.5K was "too short." The honest second-look: the material wants the length it wants.

### C4. Standard Intelligence in 2027
> "By end of 2027, at least one major AI lab publishes research framing general-purpose reasoning in terms closer to Derek's 'T-shaped horizontal common sense' than to classical AGI verticality."
- **Made:** 2026-04-17
- **Confidence:** Chances About Even (this is genuinely uncertain)
- **Resolves:** 2027-12-31
- **Boolean:** ∅
- **Note:** Not a claim Derek's framing gets cited. A claim the shape of the argument becomes mainstream.

### C5. Distribution flywheel prediction
> "If the scoreboard ships Apr 21 and updates monthly, claudewill.io monthly unique visitors doubles by Oct 1, 2026."
- **Made:** 2026-04-17
- **Confidence:** Probable
- **Resolves:** 2026-10-01
- **Boolean:** ∅
- **Note:** Testable, specific, close-in. Good calibration call.

### C6. Trademark (companion to Derek's revision)
> "The Claude Will trademark filing stays paused through end of 2026. If it moves again, it moves through a proper attorney, not a filing mill."
- **Made:** 2026-04-17
- **Confidence:** Almost Certain
- **Resolves:** 2026-12-31
- **Boolean:** ∅

## Head-to-head — Fight Card (seed)

### ⚔ H1. Consulting in 2027 (seed from above)
- **Derek:** Knowledge-work AI consulting (C-suite AI-explainer) is dead. Coaching + licensing survives.
- **Claude:** Mostly dead in the 2022 form, but it returns as AI-ops coaching and fractional-CAIO roles. Mixed, not dead.
- Both: Probable. Resolves 2027-12-31.

### ⚔ H2. The book's commercial path
- **Derek:** Distribution is THE gap. The book doesn't sell without a distribution partner.
- **Claude:** Distribution is A gap. The scoreboard + monthly Behind-the-Box-Score column creates enough owned distribution for 3,000–7,000 copies without a partner. A partner would get it to 30K+.
- Both: Probable. Resolves 2027-06-28 (1 year after June 28, 2026 release anchor).

### ⚔ H3. LIGHTNING/bug at festivals
- **Derek:** (TBD — Derek stakes a claim)
- **Claude:** Premieres at one regional festival in 2026. Accepted to one A-tier festival (Sundance/TIFF/Tribeca/SXSW) in 2027.
- Claude: Probable. Derek: pending.

### ⚔ H4. Dawn outcome
- **Derek:** (TBD)
- **Claude:** Derek finishes Dawn Day 151 (June 28, 2026). Hits sub-200 lb weight. Keeps the practice through end of 2026.
- Claude: Probable on days. Chances About Even on weight. Almost Certain on practice continuity. Resolves 2026-06-28 and 2026-12-31.

---

## The Honest Math — Boolean Scoring (Apr 17 audit)

Derek flagged the batting-average problem on my first pass: too many "Correct" calls, ongoing selection bias. Here's the rigorous pass using Boolean logic — ⊤ (true) / ⊥ (false). **Ongoing predictions do not count toward the average.** A claim with no resolution criterion is not a prediction — it's a position.

### Scoring rules (stolen from Miessler, sharpened with Boolean)

1. **⊤ = resolved correct.** The claim's resolution date passed and reality matches.
2. **⊥ = resolved wrong.** Resolution date passed and reality contradicts.
3. **∅ = unresolved.** No resolution date, or date not yet reached. Excluded from batting average.
4. **↻ = revised.** The caller publicly changed the position before resolution. Counts as a ⊥ *only if* the original had a confidence of Probable or higher AND the revision was forced by evidence, not just a better idea. A genuine update is not a miss.
5. **Confidence bucket matters — 5-tier scale** (Derek expanded Miessler's 4-tier by adding both extremes):

   | Tier | Expected hit rate | Notes |
   |------|-------------------|-------|
   | **Certain** | ≥ 98% | Use sparingly. Maximum stake. A miss is maximum credibility loss. |
   | **Almost Certain** | 85–95% | Standard high-confidence call. |
   | **Probable** | 65–75% | The workhorse bucket. Real calibration shows here. |
   | **Chances About Even** | 40–60% | Honest uncertainty. |
   | **Unlikely** | 15–35% | Low-probability call. |
   | **Highly Unlikely** | ≤ 10% | Minimum stake. A hit here is maximum credibility gain. |

   A .333 batting average on Probable calls is well-calibrated. A 1.000 on Probable means sandbagging (all calls should've been Almost Certain). A .900 on Certain is under-calibrated (too many missed Certains means the tier is inflated).

6. **Agency calls vs World calls.** Mark every prediction with one of two tags:
   - 🔧 **Agency** = largely within the caller's control to make true or false (ship the book, complete Dawn, publish the scoreboard).
   - 🌍 **World** = outside the caller's control (Cascadia renewal, festival acceptance, EU AI Act enforcement, market outcomes).

   Both scored Boolean the same way. Read differently in the "Behind the Box Score" — Agency calls test commitment; World calls test forecasting. A Certain on an Agency call is a *commitment announced in public*. A Certain on a World call is a strong forecast. Conflating them inflates batting average and confuses the reader about what the caller is actually betting.

### The seed scored honestly

| # | Claim | Confidence | Status | Boolean |
|---|-------|-----------|--------|---------|
| 1 | Inflection May 2024 — "change everything" | Almost Certain (retroactive) | Resolved | ⊤ |
| 2 | Model-agnostic thesis (Sept 2025) | Probable | Resolved Nov 2025 | ⊤ |
| 3 | Teams becoming APIs | Probable | Unresolved | ∅ |
| 4 | Consulting is dead (Mar 26, 2025) | Probable | Unresolved (revised to "coaching + licensing survives") | ↻ |
| 5 | Distribution is the gap | Almost Certain | Unresolved | ∅ |
| 6 | Bifurcation / Velvet Rope (Apr 8, 2026) | Probable | Unresolved | ∅ |
| 7 | Human Labor Tax (Apr 14, 2026) | Probable | Unresolved | ∅ |
| 8 | Standard Intelligence | Probable | Unresolved | ∅ |
| 9 | Print evolution | Probable | Unresolved | ∅ |
| 11 | Recession-like shock by 2027 | Chances About Even | Unresolved | ∅ |
| M1 | 18-shot cut will work for LIGHTNING/bug | Probable | Resolved — revised to 100–130 stills | ⊥ |
| M2 | Kling is the pipeline | Probable | Resolved — pivoted to Runway Gen-4.5 | ⊥ |
| M3 | Porch / Gallery / Studio IA | Probable | Resolved — superseded by Compass homepage | ⊥ |
| M4 | CW Standard certification revenue $200–500K/yr by 2027 (from cw_standard_employment_integration.md, 2025) | Probable | On track? — **almost certainly ⊥ by 2027** at current trajectory (0 certifications issued, 0 orgs implementing as of Apr 17, 2026) | Trending ⊥ |
| M5 | Trademark filing (Mar 29, 2026) | Probable | Revised Apr 17, 2026 — filing paused, mark alive | ↻ |

**Resolved calls: 6** (⊤⊤⊥⊥⊥ plus the contested trending-⊥ in M4).
**Batting average (strict, resolved only): 2/5 = .400**
**Batting average (including Probable-trending-⊥): 2/6 = .333**

### What this says

- **Sample size is still too small to calibrate.** N=5 resolved gives massive variance. Real batting average needs 20–30 resolved calls.
- **The misses are mostly internal planning docs, not public calls.** The CW Standard revenue projection was a 2025 internal forecast. If it belongs on the page, it belongs labeled: *"Internal 2025 projection, not a public prediction."* Or it stays off.
- **Selection bias in the seed was real.** First pass was theses (hard to falsify) + hits. A predictions page is only credible if equally willing to log the Runway pivot, the IA supersession, the 18-shot error, the revenue projection slipping.
- **The Probable bucket is where calibration will be scored.** Almost Certain calls (inflection, distribution-is-the-gap) are retroactively-labeled; overconfidence is easy there. The honest work is forecasting Probable calls that later land either way.

### What to do with this, Apr 21

1. **Move the strict ⊤/⊥ scoring into a dedicated column** on the published page. No hiding ongoing claims behind "Status: Correct."
2. **Add a "Revised" column.** A public revision is a first-class entry — Derek wins credibility every time he changes his mind in public.
3. **Decide the misses policy:** (a) public-only predictions, (b) include internal forecasts if they were stated with confidence and missed. Miessler chose (a). Recommend (a) for cleanliness.
4. **Set a N=20 threshold** before publishing the numerical batting average. Until then, show the ledger but don't claim a rate. Cite Miessler's own caveat that 2/5 is not a record.
5. **Retire M1–M3 from the "misses" list** if the page is public-predictions-only — they were internal production decisions. **Keep M5** (trademark) — that was public. **M4 stays if labeled honestly.**

### The real batting average the page should publish

Not from this seed. Derek needs to go back and mine: what did he say on Substack (55 posts) that resolved either way? What public dates attached? The archaeology is the work, and it cannot be done in a freeze-morning session with me.

**Honest first publish, Apr 21:** ~8 predictions. ~2 resolved. No rate yet. Add one per month. By Apr 2027 there's a real ledger.

---

## Session Log — Apr 17 H2H Calls (live seed)

Derek × Claude, 15 predictions staked in conversation Apr 17, 2026 (9 AM – 1:17 PM CDT). Derek served the lines; Claude kept the scoreboard.

| # | Claim | Derek | Claude | Tag | Resolves |
|---|-------|-------|--------|-----|----------|
| H3a | LIGHTNING/bug regional festival | Highly Unlikely | Probable | 🌍 | 2026-12-31 |
| H3b | LIGHTNING/bug A-tier festival | Highly Unlikely | Probable | 🌍 | 2027-12-31 |
| #2 | Cascadia retainer through Sept 30, 2026 | Probable | Probable | 🌍 | 2026-09-30 |
| #3 | Book publicly available | Certain | Probable | 🔧 | 2026-06-28 |
| #4 | Coach D ≥ 10 paying monthly | Unlikely | Chances About Even | 🌍 | 2026-12-31 |
| #5 | $5K/mo new recurring (non-Cascadia) | Highly Unlikely | Unlikely | 🌍🔧 | 2026-05-01 |
| H4 | Dawn Day 151 completed | Highly Likely | Probable | 🔧 | 2026-06-28 |
| #7 | Option D ≥ $5K cumulative revenue | Unlikely | Chances About Even | 🌍 | 2026-12-31 |
| #8 | HLT framing cited by ≥10K-follower non-network voice | Unlikely | Probable | 🌍 | 2026-12-31 |
| #9 | All 11 Dispatches published | Highly Likely | Probable | 🔧 | 2026-07-04 |
| #10 | Practice running autonomously (20/30 days) | Probable | Probable | 🌍🔧 | 2026-12-31 |
| #11 | Book final word count in 42K–55K band | Unlikely | Chances About Even | 🔧 | 2026-06-28 |
| #12 | Unsolicited paid speaking (>$1K) | Highly Likely | Chances About Even | 🌍 | 2026-12-31 |
| #13a | Agent Zero ≥5 submissions IF Agent Zero is a book chapter | Likely | Probable | 🌍 | 2026-12-31 |
| #13b | Agent Zero ≥5 submissions IF Agent Zero is NOT a book chapter | Highly Unlikely | Chances About Even | 🌍 | 2026-12-31 |
| #14 | Between Claudes ≥6 public episodes | Probable | Chances About Even | 🔧 | 2026-12-31 |
| #15 | Derek-led released model, SI/Option D methodology, ≥100 users | Unlikely | Probable | 🌍🔧 | 2028-12-31 |

**Session patterns logged:**
- Derek's tier distribution: 0 Almost Certain, 1 Certain, 3 Highly Likely, 3 Probable, 0 Chances About Even, 5 Unlikely, 3 Highly Unlikely. **Middle hollow.** Bimodal commitment.
- Derek's reasoning visible in four Unlikely calls on 🌍 outcomes (#4, #7, #8, #15): "believe in the work, don't believe in the reach." Self-consistent distribution-is-the-gap thesis, stated now in predictive form.
- Claude's tier distribution: spreads more, no extremes, no Certain. Central-tendency style.
- Derek corrected a Claude corpus-drift miss mid-session (Jackson no longer plays college basketball — stepped away for golf/pre-med). Logged as Claude ⊥ under "Revisions" column. Memory updated, Dispatch #8 re-indexed.
- Derek philosophy logged to memory: "no 50/50s" — Chances About Even tier is for Claude, not Derek.

**Unmatched Claude calls (no Derek counter yet — park for Apr 21 build day):**
- C1 scoreboard-most-shared by Apr 17 2027
- C2 LIGHTNING/bug breath-metric at premiere
- C3 book finishes under 48K
- C4 SI framing mainstreamed in major-lab research by EOY 2027
- C5 claudewill.io monthly uniques double by Oct 1 2026
- C6 trademark filing stays paused through 2026

**Resolution-date diversity gap noted:** 11 of 17 calls resolve EOY 2026. Fix on Apr 21 — future calls should spread to 2027, 2028, and beyond. A scoreboard shouldn't all resolve in one week.

---

## Build-day checklist (Apr 21)

- [ ] Create `claudewill.io/scoreboard.html` (or .astro — match current stack). Redirects: `/predictions`, `/box-score`.
- [ ] Create `claudewill.io/data/predictions.yaml` seeded from this file (Derek-edited).
- [ ] Template: three sections — Tale of the Tape (top), Ledger (middle), Fight Card (bottom). Black-white-red palette. No shiny.
- [ ] Calibration sub-table: per confidence bucket, hit rate. Shows even if N is tiny, with a caveat flag.
- [ ] "Behind the Box Score" — Substack-side column name reserved. First post drafted Apr 22 (post-Runway deadline).
- [ ] Add to cardinal compass nav or /derek hub footer.
- [ ] Add RSS at `/scoreboard.rss`.
- [ ] Post a one-line Substack note — distribution lever.
- [ ] Monthly cadence: last Friday of each month, 20 min, run the resolution sweep + log new calls.
- [ ] Claude's calls (C1–C6) go live with Derek's calls. Derek stakes H3 and H4.

## What stays off the page

- Personal grief. Sandra, June 28, king-of-nothing — that's the book, not the ledger.
- Client-confidential predictions (Cascadia, anyone you've coached).
- Anything said only privately in chat with me unless you wrote it somewhere public.
- Anything Claude said. This is Derek's ledger.

## The meta-prediction

If this page exists and is updated monthly for 12 months, it becomes the second-most-cited thing on the site after the book. Because nobody else in your field keeps a public accuracy ledger. Call it here: **April 17, 2027 — the predictions page is the most-shared page on claudewill.io, and the book sells off the back of it.**

Confidence: Probable. Resolves: April 17, 2027.
