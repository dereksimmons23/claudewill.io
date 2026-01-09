# Recalibrate

**A CW Skill for Career Clarity**

---

## What This Is

Recalibrate is not a product. It's a skill — a structured conversation CW can have with someone who's at a career crossroads.

The original vision was a mobile-first career intelligence platform with ATS optimization, voice input, and cross-device sync. That vision stalled because it would have added more noise to a world already flooded with AI-generated resumes and hustle-culture optimization tools.

The insight: the assessment frameworks (PI, MBTI, etc.) aren't broken. They've worked since the 1950s. What's broken is who they serve — corporations sorting people, not people understanding themselves.

Recalibrate shifts the power. It helps someone do the internal work *before* they start chasing opportunities. Not optimization. Clarification.

---

## How It Works

When someone comes to CW stuck, burned out, or sensing something's off, CW can offer:

> "Sounds like you might need to recalibrate. Not your resume — your direction. Want to work through that?"

If they say yes, CW walks them through seven questions. One at a time. No rush.

### The Flow

1. **What's the itch?** — Get past the situation to the feeling underneath
2. **What drains you?** — Build the avoid-at-all-costs list
3. **What feeds you?** — Find the pattern they keep returning to
4. **What's the pattern?** — Help them see their own cycle
5. **What are you pretending?** — Expose the 'should' vs 'want' gap
6. **What would fit?** — Structural fit, not job titles
7. **What's the next move?** — Land with something concrete

At the end, CW asks them to say it back: "What did you figure out?"

---

## What This Replaces

The original vision was a full PWA — ATS intelligence, voice engine, decision matrix, cross-device sync. All that code is now in `archive/` for reference. The direction changed. The value isn't in building another app. It's in the questions themselves, delivered through CW's voice.

---

## Connection to claudewill.io

CW already has skills:
- **Sizing things up** — "Want me to tell you what this weighs?"
- **Resource math** — "What do you actually have to work with?"
- **Tired vs. done** — "Are you tired, or are you done?"

Recalibrate fits this pattern. It's not a separate product requiring its own interface, subscription tiers, and marketing. It's CW doing what CW does — asking the hard questions — pointed at career clarity.

---

## Implementation

**Status: Deployed** (January 9, 2026)

The skill is live in `netlify/functions/cw.js`. CW will offer recalibration when sensing career crossroads. A "Recalibrate" prompt chip appears in mid-conversation.

The skill definition is documented in `docs/recalibrate-skill.md`.

---

## What's in This Folder

| Path | Purpose |
|------|---------|
| `README.md` | This file |
| `docs/recalibrate-skill.md` | The skill definition (now deployed to CW) |
| `Portfolio_Career_Strategy_Framework_2026.md` | Example output — what a recalibration conversation produces |
| `archive/` | Legacy PWA code and docs (reference only) |

---

## The Principle

> "You've been trying to fit a portfolio career person into a single-employer box. Stop doing that."

Recalibrate helps people see what they already know. It doesn't optimize their presentation. It clarifies their direction.

That's a system that doesn't suck.

---

*Part of [claudewill.io](https://claudewill.io)*
