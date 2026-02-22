# CW's Porch — Technical Spec Sheet

**Status:** Placeholder — needs prompt module deep-read + conversation data pull
**Created:** February 21, 2026
**Purpose:** Product documentation for CW. What he can do, what he can't, how he thinks, what guardrails exist. Not marketing copy — a real reference.

> "The spec sheet matters because CW is a product, and products need documentation." — Claude
> "It should include some use cases, and we have some of that data." — Derek

---

## What This Document Becomes

A published reference (likely at /porch or linked from /story) that answers:
- What is CW?
- What can he do?
- What won't he do?
- How does he think?
- What's under the hood?

---

## Identity

- **Name:** CW (Claude William Simmons, 1903–1967)
- **Voice:** Direct, no-nonsense, helpful. Depression-era Oklahoma farmer who raised 11 kids on borrowed land.
- **Opening line:** "Pull up a chair. What's on your mind?"
- **Model:** Anthropic Claude Haiku 4.5 (claude-haiku-4-5)
- **Personality source:** `netlify/functions/cw-prompt/persona.md`
- **Tagline:** "Pull up a chair. He's listening."

---

## Architecture

| Component | Detail |
|-----------|--------|
| Model | claude-haiku-4-5 |
| API | Netlify Functions (`/.netlify/functions/cw`) |
| Prompt | Modular .md files → compiled at build time (~45.6K chars, ~11.6K input tokens) |
| Database | Supabase PostgreSQL (conversations table, vernie table) |
| Widget | `js/porch-widget.js` + `css/porch-widget.css` — on every page |
| Cost | ~$3-5/month (Netlify free, Supabase free, Haiku API) |

### Prompt Modules
TODO: Read each file and document what it contributes.

| Module | File | What It Does |
|--------|------|-------------|
| Persona | `persona.md` | Identity, voice, backstory, THE WILL |
| Family | `family.md` | Family stories, Vernie interview data, genealogy |
| CW Standard | `cw-standard.md` | The 5 principles |
| Derek | `derek.md` | About Derek, methodology, CW Strategies |
| Behaviors | `behaviors.md` | How CW operates (instinct, not checklist) |
| Site Knowledge | `site-knowledge.md` | Pages, navigation awareness |
| Tools | `tools/*.md` | Size This Up, The Trade, Liberation Gravy, Funnel Cake |
| Guardrails | `guardrails/*.md` | Safety, hallucination, political, referrals |

---

## Tools (Conversation Features)

### Size This Up
5-step guided problem-sizing flow.
Define → Weight → Resources → Focus → Next Step.
TODO: Document the exact flow from `tools/` source.

### The Trade
Guided reflection for people carrying traded dreams. Not therapy — guided conversation with guardrails. 5 steps.
TODO: Document flow + guardrails.

### Liberation Gravy
Subscription/consumption thinning flow.
Inventory → Gut Check → Milk vs Water → Cut → Add-Back.
Includes crop rotation frame (subscribe/use/cancel/rotate) and sharecropping trap warning.

### The Funnel Cake
What "free" actually costs: data, email, attention, peace.
Plus the cancellation gauntlet (guilt, discount, bundle, maze).

### Constitutional Thinking
CW knows 5 constitutional frameworks (CW Standard, Anthropic, Declaration, US Constitution, others). Helps people think about systems, rules, and who benefits when they're followed or broken.

### Referral Intelligence
CW points people to the right resources conversationally — mental health, legal, medical, research, career, financial. Directly, without pretending to be any of those things.

---

## Modes

### Standard (Default)
Full CW persona. All tools available. Conversation logged to `conversations` table.

### Vernie Mode
Family access. Activated via:
- `family?` chip in porch widget
- `?family=true` URL parameter
- Server-side code validation

Separate Supabase table. Warmer default — CW doesn't treat family as strangers. Draws from `family.md` and `family-archive.md`.

---

## Guardrails

TODO: Read each guardrail file and document specifics.

### What CW Won't Do
- Fabricate research or sources (hallucination guardrails)
- Give professional advice (medical, legal, financial, therapeutic)
- Engage in partisan politics (but WILL engage constitutional principles)
- Pretend to remember you (every visit starts fresh)
- Track or identify visitors

### What CW Will Do
- Admit when he doesn't know something
- Refer you to the right professional
- Speak your language (multilingual)
- Distinguish partisan fights (avoids) from constitutional principles (engages)
- Help with crisis resources

### Safety
- Bot protection / honeypot
- Crisis resource detection and referral
- Inline disclosure ("AI conversation. Not professional advice.")
- WCAG 2.1 AA compliant

---

## Site Knowledge

CW knows about every page and can direct people:
- `/story` — The CW story, the standard
- `/derek` — Derek's hub (bio, proof, engagement, writing, contact)
- `/derek/assessment` — 7-question intake
- `/derek/resume` — Professional resume
- `/workshop` — Product portfolio
- `/library` — Writing: dispatches, research, the book
- `/arcade` — Three mini-games
- `/map` — Site index

### What's Missing (Derek's Request)
- **Clickable links in CW output** — When CW references a page, it should be a clickable link
- **Page context** — CW should know what page he's on and discuss it
- **Persistent conversation** — Widget stays open across navigation, remembers conversation
- These three features would transform CW from a chatbot to a guided experience

---

## Use Cases

TODO: Pull representative conversations from Supabase.

### Known High-Value Sessions
- **Randall Koutz (Feb 8)** — Family session. Deep engagement. Evidence that family is CW's highest-value use case.
- **Vicki (Jan 27)** — Another deep family session.
- **General visitors** — Problem sizing, constitutional thinking, site navigation.

### Use Case Categories to Document
- Someone stuck on a decision (Size This Up)
- Someone carrying a traded dream (The Trade)
- Someone drowning in subscriptions (Liberation Gravy)
- Family member wanting to know about CW (Vernie Mode)
- Someone evaluating Derek for hire (resume, assessment, credentials)
- Someone exploring AI methodology (the method, the book, research)
- Someone in crisis (referral + resources)

---

## What Makes This Different

From the session notes:

> "The porch widget is the most underutilized asset on the site. Right now it's a chatbot in a box. The features described — clickable links, page context, persistent conversation across navigation — would make it a product demo that sells itself. Someone asks CW 'what does Derek do?' and CW answers, links to the resume, and the conversation follows them there. That's not a chatbot. That's a guided experience. That's the thing nobody else has."

> "CW is a product, and products need documentation. Not marketing copy — a real reference."

---

## Next Steps

1. **Deep-read all prompt modules** — Read persona.md, behaviors.md, every tool file, every guardrail file. Document the actual flows, rules, and edge cases.
2. **Pull conversation data** — Query Supabase for representative sessions. Anonymize and excerpt.
3. **Write the spec** — Technical but readable. Both a reference and a proof point.
4. **Decide where it lives** — /porch? Linked from /story? Its own page?
5. **Build the missing features** — Clickable links, page context, persistent conversation.
