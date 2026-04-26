# HOME STRETCH AUDIT — Apr 26, 8 AM CDT

**Window to deadline:** ~32 hours (Mon Apr 27, 4:59 PM ET = 3:59 PM CDT)
**Auditor:** Opus
**Scope:** What other free terminal tools can lift the site, what audits remain (copyright / IP / accessibility / sensitivity / privacy), and what the prioritized home-stretch list looks like.

---

## PART 1 — FREE TERMINAL TOOLS YOU ALREADY HAVE

| Tool | Where | What it does for the site |
|------|-------|---------------------------|
| `curl` | `/usr/bin/curl` | HTTP probes, header audits, OG-tag extraction, file size checks, response-time |
| `ffmpeg` / `ffprobe` | homebrew | Video transcode, codec audit, frame-rate / bitrate / duration verification |
| `magick` (ImageMagick) | homebrew | Image resize, format convert, batch optimization, EXIF strip, color-space audit |
| `jq` | `/usr/bin/jq` | JSON-LD validation, manifest editing, structured-data audits |
| `tidy` | `/usr/bin/tidy` | HTML lint — but macOS-bundled tidy is HTML4-era, treats `<section>`/`<video>`/`<header>` as errors. Useless for HTML5. Replace with `vnu` or `npx html-validate`. |
| `node` (v22) | nvm | npx access to most JS-ecosystem tools without global install |
| `exiftool` | homebrew | EXIF metadata audit + strip (privacy + bytes) — checked your stills, no GPS/camera-make leakage |
| `netlify-cli` | npm-global | Local dev server, deploy preview URLs, env management |

## PART 1B — FREE TOOLS WORTH INSTALLING (npx works without global install)

| Tool | Install / use | Worth it for the home stretch? |
|------|---------------|-------------------------------|
| **`npx pa11y https://claudewill.io/lightning/bug/`** | nothing — `npx` runs it | YES — accessibility audit (WCAG 2.1 AA). Run before submission. |
| **`npx lighthouse https://claudewill.io/lightning/bug/ --view`** | nothing — `npx` runs it | YES — gives you Performance / Accessibility / Best Practices / SEO scores. The single best 2-min audit. |
| **`npx html-validate ./lightning/bug/index.html`** | npm i -D html-validate | Optional — modern HTML5 validator. Better than tidy. |
| **`vnu`** | brew install vnu | Optional — W3C Nu Validator. Gold standard for HTML5 spec compliance. |
| **`aspell` / `hunspell`** | brew install aspell | Optional — spell check. Useful before submission. |
| **`linkchecker`** | pipx install linkchecker | Optional — recursive link audit. I just did this manually for /lightning/bug/ — all 12 internal resources return 200. |
| **`jpegoptim` + `oxipng`** | brew install jpegoptim oxipng | Optional — lossless image compression. Could shave ~10–15% off the field stills. Not deadline-critical. |
| **`youtube-dl` / `yt-dlp`** | brew install yt-dlp | Skip — Vimeo password-protected upload requires their UI. |

**Recommendation for the next 32 hrs:** run `npx lighthouse` once on the live page and `npx pa11y` once on each of the three URLs. That's 5 minutes and tells you 90% of what an automated audit can catch. Everything else is overkill for the deadline window.

---

## PART 2 — QUICK CHECKS I JUST RAN

### ✅ All internal links return 200

```
200  /
200  /derek
200  /lightning/bug/notes/
200  /lightning/bug/statement/
200  /css/porch-widget.css
200  /css/shared-nav.css
200  /js/cw-link-renderer.js
200  /js/porch-widget.js
200  /favicon-cw-dark.svg
200  /images/lightning-bug/hero-poster-storm.jpg
200  /images/lightning-bug/og-poster.jpg
200  /video/lightning-bug-hero-storm.mp4
```

### ✅ Security headers (Netlify defaults, excellent)

CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Permissions-Policy locks down geo/mic/cam/payment/usb, Referrer-Policy strict-origin-when-cross-origin. Festival juror or press visiting from a corporate firewall will not be flagged.

### ✅ OG / Twitter tags present and complete

All five og:video tags landed. `og:image` reachable. `twitter:card` is `summary_large_image`. Slack / iMessage / Twitter unfurls will preview the storm video + the og-poster.

### ✅ EXIF check on field stills

No GPS coordinates, no camera-make leakage, no software fingerprints in the JPEGs you're shipping. Privacy clean. (One file has a `Lavc62.28.100` comment — that's the libavcodec encoder version. Not personal. Optional cleanup with `exiftool -all= file.jpg`.)

### ⚠ Sitemap is missing two URLs

`/sitemap.xml` has 30 entries. `/lightning/bug` is in there. `/lightning/bug/notes/` and `/lightning/bug/statement/` are NOT. Add these so search engines and festival-aggregator crawlers find both pages.

### ⚠ Color contrast — cinematic register vs WCAG AA

Quick math from your CSS variables:

| Pair | Contrast ratio | WCAG AA (4.5:1 normal) | WCAG AAA (7:1) |
|------|---------------:|------------------------|----------------|
| `--amber #d4a84b` on `--cobalt #0a1628` | **~8.3 : 1** | ✅ pass | ✅ pass |
| `--text #c8d0dc` on `--cobalt` | **~12.0 : 1** | ✅ pass | ✅ pass |
| `--text-dim #6b7a92` on `--cobalt` | **~4.1 : 1** | ⚠ borderline AA fail (passes AA Large 18pt+) | ❌ |
| `--amber-dim #8a6a2a` on `--cobalt` | **~3.6 : 1** | ❌ AA fail (passes AA Large only) | ❌ |
| Footer colophon-sub (italic, opacity 0.55) | **~2.0 : 1** effective | ❌ | ❌ |

**The amber-dim is used in:** crew labels, sequence-list numbers, scroll-hint, scene-thesis genre tag, footer links, four-hums header, statement crumb. All small (< 14pt). All technically below WCAG AA.

**The trade-off is real.** Lifting the dim colors brighter breaks the cinematic register. Most film festival sites have this exact issue — Conrad Hall would not pass WCAG AA either. *But:* if you want one accessibility-friendly fix, bump `--amber-dim` from `#8a6a2a` to `#a88840` (~5.1:1 contrast = AA pass for normal text). Visually quite close. I can ship it on request.

### ⚠ HTML validation — modern tool needed

`tidy` is HTML4-era and chokes on every HTML5 semantic tag. Real validation needs `vnu` (brew) or `npx html-validate`. Worth running once before submission.

---

## PART 3 — AUDITS YOU STILL NEED

Ranked: legal/operational risk first, polish last.

### 🔴 TIER A — Could affect the festival submission directly

#### A1. **Music licensing — Suno commercial/festival use** ⚠ CRITICAL

`docs/here-we-are-kid.md` says "Performance: Suno v4.5." Suno's terms differentiate between free-tier (no commercial rights, attribution required) and Pro/Premier subscriptions (full commercial rights, festival use). You need to verify which tier the take was generated under and whether your subscription includes festival/film distribution rights.

**Action:** open Suno's dashboard, confirm subscription tier, screenshot the rights page for your records. If the take was on free tier, this is a real problem — re-generate on Pro tier OR negotiate licensing.

**Why it matters:** Runway AIF + AI for Good + Cannes AI all require you affirm you have rights to all elements. A free-tier Suno output is not yours to license.

#### A2. **Voicemail consent — Sandra, Shannon, Sheri**

You're using:
- Sandra's voicemails (Marco / Tag / Love you, bye / etc.) — Sandra is deceased. As her son, you likely have the moral right but the legal right depends on your state's right-of-publicity statute (Kansas Right of Publicity Act, KSA 65-3-303, 10-year postmortem). She passed June 2025 — well within. As the surviving family member, you likely hold the right; written consent from her estate executor (probably you or Shannon) closes the loop.
- Shannon's voicemail ("Hey, brother." / "Everything's okay right now."). Living person. Need her explicit OK to use in a public film and on the web.
- Sheri's voicemail ("Love you, love you, love you, love you."). Living person. Same.

**Action:** if you don't have written/text/email consent from Shannon and Sheri, get it. Even a Slack/text screenshot saying "yes I'm fine with you using my voicemail in the film" suffices. Saves you from any future "I didn't agree to that" conversation if the film travels.

#### A3. **1983 Channel 9 Wichita newscast** ⚠

Per CLAUDE.md and several docs, the film uses "1983 Channel 9 newscast" audio. Broadcast TV is copyrighted. Fair use for film is murky — "transformative use, limited duration, commentary" can apply but is not a guarantee.

**Action:** confirm what's actually in the cut. If the newscast is in the locked v9, check duration and prominence. < 10 seconds, used as background atmosphere, transformed by context = generally OK fair-use posture. > 30 seconds or as primary content = real risk. If it's in, add an attribution to the credits ("Archival television: KAKE-TV / KSNW Wichita, 1983, fair use") — citation is the cheap defense.

#### A4. **AI tool commercial/festival rights** — Runway / FAL / Replicate

- **Runway Gen-4.5:** check your Runway subscription tier. Pro+ and Enterprise grant commercial use. Free/personal tiers do not. The festival you're submitting to is run by Runway, so this is also a brand-trust signal — they will not flag a paid-tier submission, but a free-tier might trigger questions.
- **FAL.ai (FLUX Pro):** standard FAL terms grant commercial use of generated outputs at any paid tier. Free-tier outputs include a non-commercial restriction.
- **Replicate (Topaz, Kontext):** pay-per-prediction outputs are generally yours under Replicate's TOS. Verify the specific model card for any restrictions (some published models on Replicate carry a non-commercial license at the model level).

**Action:** screenshot each provider's billing/subscription page showing your active commercial-use tier. File for the record. If anything's free-tier, upgrade today (a $20 month of Suno Pro / Runway Standard is rounding error vs. the festival cost).

### 🟡 TIER B — Worth fixing before submission, not blocking

#### B1. **Mark Twain quote — public domain ✅**

Twain died 1910. All work in US public domain. No concern.

#### B2. **Conrad Hall / Terrence Malick references — fair use ✅**

Naming cinematographers as influence is criticism/commentary. Standard film-school posture. No release needed. Currently on the page in `crew` block.

#### B3. **Trademark — sssstudios + lightning/bug**

Neither is registered with USPTO. Class 41 (entertainment services) registration costs ~$350 + lawyer ~$1.5K. Not deadline-critical. But: do a quick TESS search ([https://tmsearch.uspto.gov/](https://tmsearch.uspto.gov/)) to confirm no one else holds either mark in Class 41. Five minutes. Cheap insurance.

#### B4. **Privacy / cookies — gtag without consent banner**

The page loads Google Analytics (`G-7R5X5SJDVT`) immediately on page open. EU visitors get tracked without consent (GDPR violation). California visitors triggered (CCPA). Fines unlikely on a film page with low EU traffic, but: a one-line cookie banner OR `gtag('consent', 'default', { 'ad_user_data': 'denied', ... })` posture closes it.

**Quickest fix:** add Google's Consent Mode v2 default-denied snippet — no UI change, no banner, but tells gtag to behave EU-compliantly until consent is given. ~5 lines. I can ship it on request.

**Cleanest fix:** kill gtag on `/lightning/bug/` entirely for the deadline window. The film page doesn't need analytics. Add it back post-launch.

#### B5. **Sitemap missing notes + statement**

```xml
<url><loc>https://claudewill.io/lightning/bug/notes/</loc></url>
<url><loc>https://claudewill.io/lightning/bug/statement/</loc></url>
```

Add to `/sitemap.xml` (not in `/lightning/bug/` — the site root). 30-second edit.

#### B6. **Video captions / SRT**

Runway AIF doesn't require captions. **AI for Good (May 1) might.** Cannes AI (May 21) and Reply Venice (June 1) likely will.

**For Runway (Mon):** skip.
**For May 1:** generate an SRT from the locked audio. Whisper does this automatically — `whisper --output_format srt film.mp4` — same model you're already using.

### 🟢 TIER C — Nice to have, not blocking

#### C1. **Color contrast cinematic compromise**

Already covered above. Trade-off is real. One-line CSS fix on `--amber-dim` if you want partial AA. I'd skip for the deadline.

#### C2. **Film content sensitivity**

The film deals with: parental death (ICU Room 235, septic shock), grief, job loss, a dog, baseball. None of it is gratuitous or graphic. The death sequence is described in voicemails + visual register — not depicted. Festival jurors won't flag.

The line "I just wanted to see it too" is the heaviest single moment. It's earned. No action.

The Dr. Pepper aluminum can metaphor + the literal Dr. Pepper can in the trailer scenes — the can has no Dr. Pepper branding visible (per `docs/the-spine.md` "unlabeled aluminum can"). Confirm in the locked cut. If branding is visible, Kontext-strip the logo OR get a fair-use defense ready.

#### C3. **Mobile QA on real iPhone**

OPUS.md flagged this Apr 24. Still owed. dvh + typing animation speed + hero-video autoplay on Low Power Mode. 5 minutes with Sheri's phone.

#### C4. **Spell check site copy**

The page has ~600 words of copy. Worth a manual eyeball pass. I haven't seen any typos in my reads but I'm not perfect.

#### C5. **JSON-LD for the statement page**

The new `/statement/` page has no structured data. Could add an `Article` schema. Festival aggregators sometimes scrape these. Optional.

---

## PART 4 — PRIORITIZED HOME-STRETCH LIST

Ordered by urgency × impact. Items I can do are marked **[Opus]**. Items only you can do are marked **[Derek]**.

### Sunday morning (8 AM – noon) — clear the rights & accessibility blockers

1. **[Derek] Verify Suno commercial/festival licensing tier.** 5 min. Critical.
2. **[Derek] Verify Runway / FAL / Replicate subscription tiers grant commercial rights.** 10 min. Critical.
3. **[Derek] Get Shannon + Sheri text/email consent for voicemail use in film.** 10 min. Send a screenshot-able message.
4. **[Derek] Decide on Channel 9 newscast — keep with attribution, or pull from cut.** 5 min decision.
5. **[Opus] Add `/lightning/bug/notes/` + `/lightning/bug/statement/` to `/sitemap.xml`.** 2 min, on request.
6. **[Opus] Run `npx lighthouse` + `npx pa11y` against the live page, surface any ship-blockers.** 10 min, on request.
7. **[Opus] Fix the amber-dim contrast (one-line CSS) — optional but easy AA win.** 2 min, on request.
8. **[Opus] Add Google Consent Mode v2 default-denied snippet OR kill gtag on lightning/bug pages.** 5 min, on request.

### Sunday midday (noon – 6 PM) — film completion

9. **[Derek + Sonnet] Finish porch-ride opera per the framework.** Per yesterday's audit, ~2 Derek-hours.
10. **[Sonnet] Build full film with new porch ride.** 30 min compute.
11. **[Haiku] Audio sync across all 11 sections.** 30–60 min compute.
12. **[Derek] Watch full film start to finish.** 15 min × 2 watches.

### Sunday evening (6 PM – 10 PM) — submission prep

13. **[Derek + automation] Topaz upscale 1080→2K (optional).** 1 hr background.
14. **[Derek] Vimeo account + password-protected upload.** 30 min + upload time.
15. **[Derek] Watch the Vimeo cut on a different device (TV / iPad / phone).** 15 min.
16. **[Derek] 5-minute mobile QA on the site (Sheri's iPhone).** Already owed, still owed.

### Monday morning (8 AM – noon) — final checks + submit

17. **[Derek] Final QA watch.** 15 min.
18. **[Derek] Spell-check site copy (eyeball pass).** 10 min.
19. **[Opus] One last audit run — pa11y, lighthouse, broken-link check.** 10 min, on request.
20. **[Derek] Submit by noon Monday CDT (4 hours of cushion vs 4:59 PM ET deadline).** Paste-ready text in `docs/runway-aif-submission.md`. 30 min.

### Time math against your remaining hours

- You said ~12 Sun + ~5 Mon = 17 Derek-hours
- Tier A audits + Item 9 + Items 12, 14, 15, 16, 17, 18, 20 = ~6.5 Derek-hours
- Remaining buffer: ~10.5 hours

**You have meaningful buffer.** Don't fill it with optional opera work. Fill it with sleep, walks, and the second watch of the cut on a TV with sound out loud.

---

## PART 5 — WHAT I'D DO NEXT (RECOMMENDED ORDER)

If you give me three green lights right now, here's what I'd ship in the next 20 minutes while you start your Tier A rights checks:

1. **Add `/notes/` + `/statement/` to sitemap.xml** — discoverability
2. **Run `npx lighthouse` + `npx pa11y` on the live page** — surface any real ship-blockers I haven't caught
3. **Bump `--amber-dim` to `#a88840`** — AA contrast pass on the small captions, visually nearly identical

Optional add-on if you want it:
4. **Add Article JSON-LD to /statement/** — better festival-aggregator scraping
5. **Kill gtag on lightning/bug pages** — privacy hygiene for the deadline window

Tell me which.

---

## ONE-LINE BOTTOM LINE

The site is in good shape. The legal-ish audits (Suno, voicemails, Channel 9, AI-tool tiers) are the things that could trip a festival review. Everything else is polish. Run `npx lighthouse` once for confidence, fix what it surfaces, and trust the work.

— Opus, Apr 26, 8:15 AM CDT
