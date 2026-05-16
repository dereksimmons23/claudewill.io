# Homepage IA Diagnosis — May 15, 2026

> Captured at end of a long session. Derek's read: "a lot of great content and things to surface but fragments of similar things in multiple locations." Same pattern as the 200-resume archive — proliferation without a single source of truth.

## The pattern

claudewill.io has three navigation layers that don't agree:

1. **Homepage compass (simple mode)** — four doors: library · studio · derek · kitchen
2. **Homepage compass (sky-explore mode)** — four constellations, each with a hub + 3-5 stars
3. **Command palette** — three sections: THE WORK · DEREK · CLAUDE WILL.

Plus orphan pages (`/sss`, `/lexicon`, `/report`, `/spend`, `/vikings`) and gated/hidden pages (`/adams`, `/d`, `/arcade`, `/propublica`).

## Current state of the four compass doors

| Door (simple → target) | Sky-mode cluster contains | Problem |
|---|---|---|
| **library** → /being-claude | being claude · the jar · three rooms · the dimmer switch · the book | Door points to one author's essays; cluster correctly treats library as a collection. Cluster is right, door is wrong. |
| **studio** → /lightning-bug | claude · the story · standard | Door points to one film. Cluster has no studio content at all — it's Claude Will. content (story, standard, claude). |
| **derek** → /derek | writing · the standard · resume | Door correct. Cluster mostly right except "the standard" is duplicated (also appears in studio cluster). |
| **kitchen** → /kitchen | arcade · option d · claude | Door correct. Cluster contains hidden game (arcade), gated product (option d), and a duplicate "claude" star. Not a kitchen. |

Two stars appear twice: "the standard" (studio + derek), "claude" (studio + kitchen).

## Same architectural bug, twice

- **Library = Being Claude** is a single work standing in for a collection
- **Studio = lightning/bug** is a single work standing in for a collection

Both confuse "the room" with "what's in the room." sssstudios is the studio; lightning/bug is one film. The library should hold all reading; Being Claude is one author's shelf.

## Same compositional logic as the lightning/bug film

The film's rule: features never legible. You sense the figure; the face doesn't resolve. Silhouette as emotional language. The homepage runs the same rule on its IA — doors are *labels* you approach. Aurora + starfield is the film's no-black palette extended into the IA's mood.

Where film and homepage diverge: the film *uses* the unresolved gap as art. The homepage *suffers* from misaligned label/contents as a bug. Fix isn't to remove the silhouette technique. Fix is to make each door point at a real silhouette that resolves when you walk closer.

## Proposed final state (DRAFT — not implemented)

```
LIBRARY (north) → /library [Derek owns; separate work]
  ├── library (hub)
  ├── being claude
  ├── the book
  └── the standard?       [open Q: standard here, or its own surface?]

STUDIO (east) → /sss
  ├── sssstudios (hub)
  ├── lightning/bug   → /lightning-bug
  └── here we are, kid → /lightning-bug (song lives on same page as film)
  [parked: loglines (not built), d-rock (not deployed)]

DEREK (west) → /derek
  ├── derek (hub)
  ├── writing  → /writing
  └── resume   → /derek/resume

KITCHEN (south) → /kitchen [needs separate overhaul — see HANDOFF]
  ├── kitchen (hub)  → /kitchen
  ├── bob    → bob.claudewill.io
  ├── coach  → coach.claudewill.io
  ├── hancock → hancock.us.com
  └── option d → /d
```

## What this requires beyond the index.html edit

- `netlify/functions/cw-prompt/site-knowledge.md` — CW's IA description. Must be updated and recompiled (`node scripts/compile-prompt.js`) or CW will tell visitors the old layout.
- `site-registry.json` — page/subdomain registry. Sync.
- `js/shared-nav.js` — NAV_CONFIG (command palette). Likely wants a sssstudios section to mirror the new homepage taxonomy.
- Constellation coordinates — `(x, y)` in 0-1 normalized space. Cluster contents change → coordinates may need rebalancing.

## Open questions paused on

1. **Where does `/standard` live?** — Reading/principles fit with library. Or it's its own surface. Currently appears in two clusters (studio + derek). Should appear in one or none.
2. **`/spend`** — tech budget transparency page. Keep (transparency-over-reputation principle made operational) or axe (unfinished experiment).
3. **Library hub itself** — Derek's separate work. Library cluster wiring depends on what that page becomes.
4. **D-Rock surfacing** — when it deploys, it goes in studio cluster.
5. **Loglines** — when ported from the-standard branch to /loglines, it goes in studio cluster.

## Don't restart from scratch when picking this up

The diagnosis is the work. The cluster reorg is straightforward once the open questions resolve. The harder work is the broader consolidation question Derek raised: stop building fragments in multiple locations, start treating the site like a single canonical source.
