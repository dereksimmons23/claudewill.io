# Site Architecture Plan

**Created:** January 21, 2026
**Status:** Draft for Review
**Scope:** claudewill.io + all subdomains

---

## Current State Summary

### Main Domain (claudewill.io) — LIVE

| Page | URL | Purpose |
|------|-----|---------|
| CW Chat | / | Main conversational interface |
| The Story | /story | CW's history, 4 chapters |
| Derek | /derek | Professional bio (expanding Feb 7) |
| The CW Standard | /the-cw-standard | 5 principles |
| About | /about | Welcome modal, CW Strategies intro |
| Intake | /intake | Assessment form |
| Privacy | /privacy | Legal |
| Terms | /terms | Legal |

### Subdomains — PLANNED

| Subdomain | Name | Status | Purpose |
|-----------|------|--------|---------|
| bob.claudewill.io | BOB | Concept | Battle o' Brackets, games |
| coach.claudewill.io | Coach D | Philosophy drafted | Athletic development |
| dawn.claudewill.io | Dawn | Concept | Writing assistant |
| d-rock.claudewill.io | D-Rock | Active (separate repo) | AI DJ agent |
| recalibrate.claudewill.io | Recalibrate | Decision pending | Career clarity tool |

---

## The Problem

1. **No clear hierarchy** — Visitors don't know what this ecosystem is
2. **Subdomains are disconnected** — No navigation between establishments
3. **Derek is undersold** — Current /derek is a resume, not a founder's hub
4. **Recalibrate has no home** — Skill exists but no landing page
5. **"The Stable" never got built** — Content archive concept stalled
6. **CW Strategies positioning unclear** — Is it Derek's business or CW's wisdom?

---

## The Rewiring Plan

### Concept: The BRC Building & Loan

Not a corporation. A community. Each establishment stands alone but belongs to the same circle.

| Establishment | Host | URL | Status |
|---------------|------|-----|--------|
| **The Porch** | CW | claudewill.io | ✅ LIVE |
| **The Founder's Office** | Derek | claudewill.io/derek | 🚧 Expanding Feb 7 |
| **The Fieldhouse** | Coach D | coach.claudewill.io | 📋 Q2 2026 |
| **The Arcade** | BOB | bob.claudewill.io | 📋 TBD |
| **The Record Store** | D-Rock | d-rock.claudewill.io | 🚧 Active |
| **The Writing Desk** | Dawn | dawn.claudewill.io | 📋 TBD |

---

## Phase 1: Main Domain Cleanup (By Feb 7)

### 1.1 Expand /derek → Founder's Hub

**Current:** Resume page
**New:** Full founder's hub with sections

```
/derek
├── Hero (name, tagline, quick links)
├── The Short Version (bio, highlights)
├── The Long Version (full profile) — expandable or anchor link
├── The Stories (Day 18, 2017 Lesson, Shapeshifter)
├── The Work (case studies)
├── The Methodology (Recalibrate frameworks preview)
└── Contact (form, assessment, booking)
```

**Implementation options:**
- A) Single long page with anchor sections
- B) Tabbed interface (stays on /derek but content switches)
- C) Sub-pages (/derek/stories, /derek/work) — more complex

**Recommendation:** Option A (single page with anchors). Simpler, works for Feb 7.

### 1.2 Navigation Update

**Current nav:** Back to CW (that's it)
**New nav (footer or header):**

```
CW's Porch | The Story | The Standard | Derek | Contact
```

Add subtle "Other Establishments" section in footer:
```
Coming soon: Coach D · D-Rock · BOB
```

### 1.3 Recalibrate Decision

**Options:**
- A) **Embed in /derek** — "My Methodology" section, links to intake
- B) **Standalone /recalibrate** — Main domain page (not subdomain)
- C) **Subdomain recalibrate.claudewill.io** — Separate product identity

**Recommendation:** Option A for Feb 7, revisit B/C later. Keeps it simple, ties it to Derek's consulting identity, avoids subdomain sprawl.

### 1.4 Clean Up Redundancy

| Current | Action |
|---------|--------|
| /about | Keep — explains CW's Porch concept |
| /story | Keep — CW's history |
| /the-cw-standard | Keep — core philosophy |
| /intake | Keep — funnels to Supabase |
| /pages/* (legacy) | Already gitignored — leave archived |

---

## Phase 2: Subdomain Strategy (Q1-Q2 2026)

### 2.1 D-Rock (Active)

**Status:** Separate repo, active development
**URL:** d-rock.claudewill.io
**Next steps:**
1. Create Netlify site for d-rock repo
2. Configure subdomain in Netlify DNS
3. Build Phase 1 (PWA shell + voice test)

**Architecture:** Completely separate from main site. Links back to claudewill.io in footer.

### 2.2 Coach D (Q2 2026)

**Status:** Philosophy drafted in CW-Strategies
**URL:** coach.claudewill.io
**Content ready:**
- `coach_d_manifesto.md`
- `coaching-auto-blueprint.md`
- `coach_claude_method_framework.md`

**Decision needed:** Is this a chat agent like CW, or a content site?

**Options:**
- A) Chat agent (Coach D persona) — requires new system prompt
- B) Content site (methodology, packages) — simpler, faster
- C) Hybrid (content + chat)

**Recommendation:** Start with B (content site), add chat later if needed.

### 2.3 BOB (TBD)

**Status:** Concept only
**URL:** bob.claudewill.io
**Purpose:** Brackets, games, March Madness chaos

**Note:** Low priority unless there's a seasonal hook (March Madness 2026 would need Feb build).

### 2.4 Dawn (TBD)

**Status:** Concept only
**URL:** dawn.claudewill.io
**Purpose:** Writing assistant

**Note:** Unclear use case. Park this until there's a specific need.

---

## Phase 3: The Stable (Archive/Wiki)

### The Concept

A place for documentation, case studies, frameworks — the "library" of the community.

**Options:**
- A) Section on main site (/stable or /docs)
- B) Subdomain (stable.claudewill.io)
- C) Integrated into /derek as "The Work"
- D) Don't build — use CW-Strategies folder as internal archive

**Recommendation:** Option D for now. The CW-Strategies folder is the archive. If public documentation is needed later, add /docs to main site.

---

## Navigation Architecture

### Main Site Navigation

```
┌─────────────────────────────────────────────────────┐
│  CW's Porch                                         │
│  ───────────                                        │
│  [CW] [The Story] [The Standard] [Derek] [Contact]  │
└─────────────────────────────────────────────────────┘
```

### Footer (All Sites)

```
┌─────────────────────────────────────────────────────┐
│  CW's Porch · The Story · The Standard · Derek      │
│  ─────────────────────────────────────────────────  │
│  Other Establishments:                              │
│  D-Rock (coming soon) · Coach D (coming soon)       │
│  ─────────────────────────────────────────────────  │
│  © 2026 · Privacy · Terms                           │
└─────────────────────────────────────────────────────┘
```

### Cross-Site Linking

Each subdomain should have:
1. Its own branding/identity
2. A "Part of CW's Porch" badge or footer link
3. Link back to main claudewill.io

---

## Technical Implementation

### DNS/Netlify Configuration

```
claudewill.io          → main site (current)
www.claudewill.io      → redirect to claudewill.io
d-rock.claudewill.io   → d-rock Netlify site (separate repo)
coach.claudewill.io    → TBD (could be same repo, different deploy)
bob.claudewill.io      → TBD
dawn.claudewill.io     → TBD
```

### Repo Strategy

| Site | Repo | Rationale |
|------|------|-----------|
| Main (claudewill.io) | claudewill.io | Current |
| D-Rock | d-rock | Already separate — different tech stack |
| Coach D | TBD | Could be folder in main repo if simple |
| BOB | TBD | Depends on complexity |

**Recommendation:** Keep D-Rock separate (different stack). Consider adding Coach D as `/coach/` folder in main repo with Netlify branch deploy, or separate repo if it needs its own system prompt.

---

## Timeline

### Phase 1: Feb 7, 2026 (Founder's Launch)

- [ ] Expand /derek page (single page with anchors)
- [ ] Update navigation (add Derek to main nav)
- [ ] Add footer with "Other Establishments" teaser
- [ ] Recalibrate as section in /derek (not separate page)
- [ ] Social campaign launches (Jan 22)

### Phase 2: Q1 2026 (Post-Launch)

- [ ] D-Rock subdomain configured and Phase 1 deployed
- [ ] Coach D content site planned
- [ ] Evaluate traffic/engagement on /derek expansion

### Phase 3: Q2 2026

- [ ] Coach D launches (coach.claudewill.io)
- [ ] D-Rock full launch
- [ ] BOB evaluation (March Madness timing?)

### Parking Lot (No Timeline)

- Dawn subdomain (needs use case)
- The Stable/docs section (use CW-Strategies internally for now)
- Recalibrate as standalone product (revisit after Feb 7 data)

---

## Decision Points for Derek

1. **Recalibrate placement:** Embed in /derek (recommended) or standalone?
2. **Coach D format:** Chat agent, content site, or hybrid?
3. **Navigation style:** Minimal (current) or full nav bar?
4. **Footer approach:** Simple or "establishments" teaser?
5. **D-Rock timeline:** When to configure subdomain?

---

## Summary

**The rewiring is mostly conceptual, not technical.**

The architecture is sound. What's missing is:
1. A fuller /derek (content ready, needs HTML build)
2. Clear navigation between pieces
3. Subdomain configuration for D-Rock
4. Decision on Coach D approach

The BRC Building & Loan metaphor holds. Each establishment is autonomous. The main site (The Porch) is the front door. Derek is the founder's office. The others are neighbors.

Ship /derek expansion Feb 7. Configure D-Rock subdomain when ready. Plan Coach D for Q2. Park everything else.
