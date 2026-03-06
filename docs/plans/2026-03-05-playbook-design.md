# The Playbook — Product Design

**Date:** March 5, 2026
**Product:** The CW Standard Playbook
**Price:** $5,000 (self-serve)
**Audience:** Organizations deploying AI who need a values layer wired into infrastructure
**Deliverable:** Comprehensive documentation + templates + implementation guide

---

## What This Is

Every organization deploying AI has usage policies in a shared drive and hope. No principles wired into the systems that do the work. The Playbook is the documentation of a working system — five principles from a farmer in Oklahoma, built into infrastructure that actually runs on them.

The buyer gets: the philosophy, the architecture, the patterns, the templates, and the operational practices. Everything Derek built with $100/month, documented so their team can build their own.

## What This Is Not

- Not a consulting engagement (that's the $20K/month option)
- Not a software product (no code to install)
- Not a generic AI governance framework (this is specific, built from practice)
- Not theory (came from 22,000 messages across 8 projects in 32 days)

---

## Structure

### Part 1: The Standard (Why)
Why values need to be in the infrastructure, not on the wall. The five principles. How they came from a farmer who never called it a methodology. What changes when the machine actually runs on them.

### Part 2: The Method (How You Work)
Start, Work, Finish, Decide. The daily session structure. How one human and one AI work together — not supervision, not delegation, partnership. The four lenses (Earn, Connect, Sharpen, Challenge).

### Part 3: The Infrastructure (What You Build)
The three hooks (SessionStart, SessionEnd, PermissionRequest). Memory injection. Auto-memory write. The permission gate. The live floor. The dimmer switch. How memories fade like human memory. Cross-project awareness.

### Part 4: The Prompt Architecture (How You Talk)
Modular prompt design. Identity → Behavior → Tools → Guardrails. Mode routing. The compile step. How to build an AI personality that's consistent, bounded, and useful.

### Part 5: The Operational Layer (How You Run It)
Overnight agents. Report structure. Content pipeline. Nomenclature. CLAUDE.md and HANDOFF.md as session continuity. The stale detection system.

### Part 6: The Practices (How You Govern)
Informed by the Guardian editorial code analysis. Operational specificity beneath each principle. Correction protocols. AI transparency framework. Vulnerability protocols. What to document, what to publish, what to keep.

### Appendices
- A: Templates (CLAUDE.md, HANDOFF.md, SKILL.md, Report)
- B: Supabase schema
- C: Hook configuration reference
- D: Scoring algorithms (degradation, memory)
- E: Cost model ($100/month breakdown)
- F: Glossary (tools vs skills vs method vs session)

---

## Design Decisions

**Format:** Markdown source files, compilable to PDF via Pandoc or web-based guide. Each part is a standalone chapter. Appendices are reference material.

**Voice:** Direct, specific, opinionated. Derek's voice, not corporate. "Here's what we built. Here's why. Here's how you build yours." No hedging.

**Length:** ~15,000-20,000 words total. Each part 2,000-4,000 words. Appendices as needed.

**Code examples:** Real code from the actual system. Not pseudocode. Not sanitized beyond removing secrets.

**What to genericize:** Derek's personal details (Dawn, family). What to keep specific: the principles, the architecture, the costs, the patterns.

**Guardian influence:** Part 6 operationalizes the principles. Each of the five gets: the principle, what it means in practice, the infrastructure that enforces it, the operational protocol, and what to document. This is where the Guardian's specificity model lands.

---

## File Structure

```
docs/drafts/playbook/
├── 00-cover.md
├── 01-the-standard.md
├── 02-the-method.md
├── 03-the-infrastructure.md
├── 04-the-prompt-architecture.md
├── 05-the-operational-layer.md
├── 06-the-practices.md
├── appendix-a-templates.md
├── appendix-b-schema.md
├── appendix-c-hooks.md
├── appendix-d-algorithms.md
├── appendix-e-costs.md
└── appendix-f-glossary.md
```

---

## Open Questions for Derek

1. How much of the actual code goes in? (Full scripts vs. annotated excerpts?)
2. Should the principles be presented as "write your own" or "adopt these five"?
3. Does the buyer get a repo template or just documentation?
4. PDF only, or web-based guide with code highlighting?
5. License: can they redistribute internally? Externally?
