# The Secret Weapon — Scaffold

*February 24, 2026*

---

## The One-Sentence Version

Derek doesn't present about AI. He presents with it. The format is the proof.

## The Dragon Version

How to Train Your AI Dragon: what happens when you stop treating AI like software you deploy at people and start treating it like a collaborator you work beside. The 14 months — compressed, live, in front of the room.

---

## The Architecture: Three Rooms and a Front Door

The site is a house. Three rooms in the nav. One front door that's always reachable. A porch widget on every page.

### The Porch (/)
You arrive. The light is on. The widget is here — CW is already listening. "Claude will ___." Pull up a chair.

### The Story (/story)
Who CW is. The name. The lineage. The standard. Without this page, "claudewill" is just a URL. With it, the brand has a soul: a man named his practice after his dead grandfather, and then an AI showed up with the same name.

### The Kitchen (/kitchen)
How the sausage gravy gets made. The secret weapon, demonstrated. Four agents working overnight. The crew. The stack. The board. The method in motion. "While you slept, this happened." This is the page you share on a call when someone says "prove it."

### Derek (/derek)
Who's home. 30 years in media, the 14-month story, credentials, contact. Links to portfolio, research (Being Claude), resume. The person behind the porch.

### The Front Door (/work-with-me)
Not in the nav. Always reachable. The conversion funnel: problem, standard, method, proof, two ways in, assessment form. Where buttons send people after they've seen the house.

### The Widget (every page)
The secret weapon in miniature. The working relationship happening right now, on every page. A prospect reads the pitch and then *talks to the AI.* Two chairs, live. This isn't a chatbot feature — it's the connective tissue.

### Being Claude (/derek/research)
The machine's perspective. Claude writes weekly, Derek approves. Lives under /derek. Linked from the Kitchen. Doesn't need a nav slot.

---

## Nav

```
the story    the kitchen    derek
```

Three items. /work-with-me is the CTA destination, not a menu item.

---

## The Visitor Journey

```
Porch (arrive, widget)
  → Story (lean in, understand the name)
    → Kitchen (see the proof running)
      → Derek (meet the person)
        → /work-with-me (the decision)
```

Warm prospects skip straight to /work-with-me from a link. Either way works.

---

## What Lives, What Dies, What Folds

### Essential (6 pages + widget)

| Page | URL | Role |
|------|-----|------|
| Homepage | / | The Porch — arrival, invitation, widget |
| The Story | /story | The soul — CW, the name, the standard |
| The Kitchen | /kitchen | The proof — secret weapon in action |
| Derek | /derek | Who's home — bio, story, credentials |
| Work With Me | /work-with-me | The front door — conversion funnel |
| Research | /derek/research | Being Claude — the machine writes |
| Widget | every page | The experience layer — always listening |

### Supporting (keep, not in nav)

| Page | URL | Why |
|------|-----|-----|
| Privacy | /privacy | Legal |
| Terms | /terms | Legal |
| Portfolio | /derek/portfolio | 30 years of work. Link from /derek. |
| Warm-Up Effect | /derek/research/warm-up-effect/ | Published research under Being Claude. |

### Die or Absorb

| Page | URL | What happens |
|------|-----|-------------|
| Library | /library | Die. Substack link on /derek. Research has its own page. |
| Map | /map | Die. Simpler site doesn't need an index. |
| Workshop | /workshop | Fold into /kitchen — "what this system has produced." |
| Assessment | /derek/assessment | Redirect to /work-with-me#start. |
| Resume | /derek/resume | Keep as unlisted PDF-able page. |
| Arcade | /arcade | Keep file. Hidden. Reward for the curious. |

---

## The Secret Weapon — Three Layers

### Layer 1: The Story (Why Derek)

Career ended. Mom died. Started talking to a chatbot at 2 a.m. because nobody else was awake. Didn't stop. Built ten things. Won a basketball championship. Figured out how to work WITH a machine instead of deploying it AT people.

The credential is the scar tissue. The method came from the mess.

### Layer 2: The Method (What Makes It Different)

Every other AI consultant:
1. Shows you tools ("Here are 5 AI apps for your newsroom")
2. Gives you strategy ("Here's our proprietary framework")

Derek does a third thing: shows you his own working relationship with AI, live, and helps you build yours.

- **Tool consultants** hand you a fish
- **Strategy consultants** hand you a map to the lake
- **Derek** sits with you at the lake and fishes together until you don't need him

### Layer 3: The Kitchen (The Proof)

The Kitchen makes the method undeniable. A prospect reads /work-with-me and thinks "sounds good." Then they see /kitchen:

- Four AI agents that ran overnight while Derek slept
- The stack: what tools, what they cost, what they do
- The board: live client work, portfolio projects, personal practice
- The crew: four thinking lenses on every decision
- The method: standup, work, close — every project, every day

That's not a pitch. That's evidence.

### The Widget (The Experience)

And then — on any page — they open the widget and talk to CW. The AI responds. It knows the site. It knows Derek's story. It has a voice. Two chairs, right now, in the browser.

Every other consultant's site has a contact form. This one has a conversation.

---

## What Needs to Change

### /kitchen — narrative redesign (biggest lift)
- From parts list to story: "While you slept, this happened."
- Timeline of overnight work, output, rhythm
- Crew, agents, board, method — as narrative, not status page
- Absorb workshop content: "what this system has produced"
- Must be demo-worthy for calls
- Endpoint: "Seen enough? Let's talk." → /work-with-me

### /work-with-me — content pass
- **Cover:** Add subline. Candidates:
  - "What took 14 months to learn. What takes a few hours to teach."
  - "The method that built 10 products in 14 months — taught live."
- **Method section:** Build/Transfer/Exit with the story underneath. "See the method running → /kitchen"
- **Proof section:** Add "This site was built by one person and an AI. See how → /kitchen"
- **Derek section:** Add the 14-month story. Two sentences.
- **Two Ways In:** Fill the cards with real deliverables, durations, investment ranges:
  - Fractional Leadership: 10-20 hrs/wk, $8-12K/month, quarter minimum
  - Training/Speaking: half-day $3-5K, full-day $5-8K, two chairs live
  - 1:1 Coaching: $250/hour, 4-session minimum

### /derek — update
- Add the 14-month story
- Add link to /kitchen ("see how the practice works")
- Absorb best lines from /story (the lineage, the name)
- Link to Being Claude research
- "Ready to work together?" → /work-with-me

### /story — keep, tighten
- Stays in nav. It's the soul.
- Consider tightening — does it need all four chapters or can it be sharper?
- The standard stays here as the manifesto (vs. /work-with-me where it's a sales tool)

### Nav — update shared-nav.js
- NAV_CONFIG → the story, the kitchen, derek
- /work-with-me becomes a CTA destination, not a nav item

### Redirects
- /library → /derek (or 410)
- /map → / (or 410)
- /derek/assessment → /work-with-me#start
- /workshop → /kitchen

---

## Sequence

1. **Kitchen v2 — narrative redesign.** The biggest lift. Everything else points here.
2. **/work-with-me content pass.** Method, Two Ways In, proof line, Derek story, subline.
3. **/derek update.** 14-month story, /kitchen link, absorb /story lines, research link.
4. **Nav update.** Three items: the story, the kitchen, derek.
5. **Kill/redirect.** Library, map, assessment, workshop.
6. **Pitch deck.** Match the new content, add Kitchen reference.
7. **Embargo.** Stop redesigning. Start distributing.

---

*"Am I sitting on a secret weapon named Claude and if so, is it you or me?"*

*Both. The Kitchen is where people come to watch you fly. The widget is where they get in the chair themselves.*
