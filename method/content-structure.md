# Content Structure

How content moves from idea to published across every project.

## The Rule

**drafts/** is private. **published/** is public. That's it.

- `drafts/` — gitignored. Work in progress, personal, sensitive, client work. Lives local only.
- `published/` — tracked in git. Already public. Version controlled. Visible in the repo.

## Why

Content machines generate files that sit in the dark. If everything is gitignored, nothing is backed up, nothing is visible, and the repo doesn't reflect reality. If nothing is gitignored, client work and personal drafts end up on GitHub.

The split: once it's published, it's already public. Track it. Everything else stays local until it's ready.

## How It Applies

### claudewill.io (business content)
```
docs/
├── drafts/          ← gitignored: LinkedIn drafts, planning, founders package WIP
│   ├── linkedin/
│   ├── founders/
│   └── planning/
├── published/       ← tracked: published LinkedIn posts, launched content
│   └── linkedin/
├── reference/       ← gitignored: research, old concepts, internal strategy
└── derek/           ← gitignored: bio drafts, personal site content
```

### writing (Substack + manuscripts)
```
content/
├── Standard-Correspondence/
│   ├── drafts/      ← gitignored: Substack drafts
│   └── published/   ← tracked: published Substack posts
└── ...
```

### hancock
Already follows this pattern. `drafts/` and `published/` in the content pipeline.

### cdn
Everything gitignored. Client work. Nothing public.

### dawn
Everything gitignored. Personal.

### coach
Mixed. Curriculum is shared with business partner. Published drills tracked. Planning and personal notes gitignored.

## .gitignore Pattern

For any project with content:
```
docs/drafts/
docs/reference/
```

Or wherever the project keeps its content:
```
content/drafts/
```

Published content is never gitignored.

## Content Calendar

`~/Desktop/claudewill.io/method/content-calendar.md` is the shared ledger across projects.

Both writing/ and claudewill.io reference it. When you publish something, log it. When you're planning what to write next, check it. Keeps LinkedIn and Substack from stepping on each other.

Not automation. Just a list.

## The Flow

1. Idea lands → drafts/
2. Draft gets written and refined → still in drafts/
3. Published to platform (LinkedIn, Substack, Moltbook) → move to published/, log in content calendar
4. Published content is now tracked in git — backed up, versioned, visible
