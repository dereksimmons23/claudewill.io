# Kitchen + Overnight Agents Design

**Date:** February 24, 2026
**Status:** Approved design, not yet implemented
**Scope:** Three parts — scheduler migration, agent build-out, public Kitchen dashboard

---

## The Problem

1. **Scheduler fails when the laptop is closed.** launchd `StartCalendarInterval` fires at 5 AM CST. Mac is asleep. No reports generated, no standup material, no proof the system runs. The local cron model doesn't work for overnight automation.

2. **Agents exist on paper, not in production.** Site audit runs when it runs. Research and code review agents were always "next." The Kitchen dashboard shows a command center — but it's static data behind an auth gate nobody sees.

3. **The Kitchen is private for no reason.** It was built as Derek's workspace. Derek's actual workspace is Claude Code. A locked door with nothing behind it isn't a feature — it's a missed opportunity to demonstrate the methodology publicly.

---

## Part 1: Fix the Scheduler

**Move from launchd to GitHub Actions.**

### Why GitHub Actions
- Runs on GitHub's servers — survives laptop sleep, travel, power outages
- Scheduled workflows are free on public repos
- Built-in secrets management (no local `.env` needed for agent runs)
- Results committed to the repo → Netlify auto-deploys
- Audit trail: every run is a logged workflow execution

### The Schedule

```yaml
# .github/workflows/overnight-agents.yml
on:
  schedule:
    - cron: '0 11 * * *'   # 11:00 UTC = 5:00 AM CST
  workflow_dispatch:         # Manual trigger for testing
```

### Retire the Local Agent

- Remove `com.cwstrategies.site-audit.plist` from `~/Library/LaunchAgents/`
- Delete `derek-claude/com.cwstrategies.site-audit.plist`
- Keep the site-audit.js script — it gets ported to GH Actions context (see Part 2)
- Note in derek-claude/CLAUDE.md: overnight agents moved to GH Actions as of Feb 2026

### Standup Access

Two options after migration:
- `git pull` on the claudewill.io repo to get the latest `kitchen-data.json`
- Fetch `https://claudewill.io/kitchen-data.json` directly from the live site

Both work. `git pull` is preferred — keeps local repo current.

---

## Part 2: Build the Overnight Agents

Four jobs in the GitHub Actions workflow. Jobs 1–3 run in parallel. Job 4 (compile) runs after all three finish.

### Job 1: Site Audit

**Port of `derek-claude/scripts/site-audit.js` to GH Actions context.**

What it checks:
- HTTP status codes for all claudewill.io pages
- Response times (flag anything over 3000ms)
- SSL validity
- coach.claudewill.io and bob.claudewill.io

Changes from local script:
- No `dotenv` — runs as plain Node in GH Actions environment
- No local file write to `derek-claude/reports/` — output goes to job artifact + compiled into `kitchen-data.json`
- Pages list updated to match current site structure (`/story`, `/derek`, `/work-with-me`, `/workshop`, `/library`, `/kitchen`, `/arcade`, `/map`)
- Still no LLM needed — pure HTTP checks

Output format follows TEMPLATE.md:
```markdown
# Site Audit — claudewill.io
**Date:** YYYY-MM-DD
**Agent:** site-audit
**Type:** audit

## Flags (Decisions Needed)
- [ ] /stories returning 404

## Findings
- All 9 pages responding. Average response: 487ms.

## Details
- / — 200 312ms
- /story — 200 445ms
...
SSL: Valid
```

### Job 2: Perplexity Research

**New agent. Calls Perplexity API for daily industry brief.**

What it queries:
- AI industry news (model releases, policy, adoption)
- Media industry trends (digital publishing, audience, revenue)
- Consulting market intel (AI strategy demand, competition)

Scope boundary: no client-specific research. No Cascadia. No references to active engagements. This is market context, not client work.

Prompt structure:
```
Provide a brief on today's developments in three areas:
1. AI industry — significant model releases, policy news, adoption signals
2. Media industry — digital publishing trends, audience behavior, revenue models
3. Consulting market — AI strategy demand, notable implementations, competition

Format: 3-5 bullets per area. Source each item. No speculation.
```

Output format follows TEMPLATE.md:
```markdown
# Research Brief — AI/Media/Consulting
**Date:** YYYY-MM-DD
**Agent:** perplexity
**Type:** research

## Flags (Decisions Needed)
None.

## Findings
- [AI item with source]
- [Media item with source]
...

## Details
[Full sourced bullets per area]
```

Required secret: `PERPLEXITY_API_KEY` (add to GitHub repo secrets)

### Job 3: Mistral Code Review

**New agent. Mistral reviews recent git changes in the claudewill.io repo.**

What it reviews:
- Last 48 hours of commits to main (via `git log --since="48 hours ago"` + `git diff`)
- Scope: `netlify/`, `js/`, `css/`, `scripts/` — skips docs, images, HTML unless specifically flagged

What it flags:
- Security issues (hardcoded keys, exposed env vars, unsafe headers)
- Performance problems (blocking scripts, large payloads, N+1 API calls)
- Stale code (commented-out blocks, unused functions, dead routes)
- Dependency issues (outdated packages, known vulnerabilities)

If no commits in 48 hours: report says "No changes in review window" — no flags, no findings.

Output format follows TEMPLATE.md:
```markdown
# Code Review — claudewill.io
**Date:** YYYY-MM-DD
**Agent:** mistral
**Type:** codecheck

## Flags (Decisions Needed)
- [ ] Hardcoded string in cw.js line 47 looks like a token

## Findings
- No performance issues in changes reviewed
- One stale comment block in porch-widget.js

## Details
[Specific file references and line numbers]
```

Required secret: `MISTRAL_API_KEY` (add to GitHub repo secrets)

### Job 4: Compile Step

**Runs after jobs 1–3 complete. Assembles everything into `kitchen-data.json`.**

What it does:
1. Reads the three agent reports from workflow artifacts
2. Parses flags, findings, status from each
3. Reads `kitchen-projects.json` from the repo (manually curated, see Data Files)
4. Generates `kitchen-data.json`
5. Commits `kitchen-data.json` to main with message: `chore: overnight agent data [YYYY-MM-DD]`
6. Push triggers Netlify auto-deploy

The compile script lives at `scripts/compile-kitchen-data.js` in the claudewill.io repo.

Agent status logic:
- `"ok"` — no flags, all checks passed
- `"flags"` — one or more items require decision
- `"error"` — agent job failed to run

---

## Data Files

### kitchen-data.json (generated nightly, committed to repo)

```json
{
  "lastUpdated": "2026-02-24T11:00:00Z",
  "agents": {
    "siteAudit": {
      "lastRun": "2026-02-24T11:00:00Z",
      "status": "flags",
      "summary": "9/9 pages responding. /stories returning 404.",
      "flags": ["/stories returning 404 — page was deleted, link still live somewhere"]
    },
    "research": {
      "lastRun": "2026-02-24T11:00:00Z",
      "status": "ok",
      "summary": "Anthropic released policy update. NYT paywall conversion up 12%. AI consulting RFPs up 34% QoQ.",
      "findings": ["...", "..."]
    },
    "codeReview": {
      "lastRun": "2026-02-24T11:00:00Z",
      "status": "ok",
      "summary": "3 commits reviewed. No flags. Minor stale comment in porch-widget.js.",
      "flags": []
    }
  },
  "projects": [],
  "stack": {
    "components": [
      { "name": "Claude Code (Opus)", "role": "Builder / architect", "cost": "usage" },
      { "name": "Haiku", "role": "CW conversations (porch, vernie)", "cost": "~$3-5/mo" },
      { "name": "Netlify", "role": "Hosting + serverless functions", "cost": "free tier" },
      { "name": "Supabase", "role": "Conversation logs + visitor memory", "cost": "free tier" },
      { "name": "GitHub Actions", "role": "Overnight agents scheduler", "cost": "free tier" },
      { "name": "Cloudflare", "role": "Workers (CW Brief)", "cost": "free tier" },
      { "name": "Perplexity", "role": "Research agent", "cost": "~$5/mo" },
      { "name": "Mistral", "role": "Code review agent", "cost": "~$2/mo" }
    ],
    "totalMonthly": "~$10-15/mo"
  },
  "method": {
    "session": "standup → work → eod",
    "pattern": "CLAUDE.md defines identity. HANDOFF.md tracks state. Skills execute the routine.",
    "agents": "Overnight agents run while the laptop is closed. Standup reads what they found."
  }
}
```

### kitchen-projects.json (manually curated, committed to repo)

Derek maintains this. Public-safe descriptions only — no client-confidential data, no HANDOFF details, no revenue figures.

```json
[
  {
    "name": "Cascadia Daily News",
    "category": "business",
    "status": "Active client",
    "note": "Digital strategy and AI consulting"
  },
  {
    "name": "Coach D",
    "category": "business",
    "status": "Live",
    "note": "AI-powered basketball training platform. 157 drills."
  },
  {
    "name": "claudewill.io",
    "category": "portfolio",
    "status": "Live",
    "note": "CW's Porch + CW Strategies presence. This site."
  },
  {
    "name": "BOB",
    "category": "portfolio",
    "status": "Live",
    "note": "Battle o' Brackets. Party game for March Madness."
  },
  {
    "name": "Hancock",
    "category": "portfolio",
    "status": "Live",
    "note": "Anonymous AI storyteller. Lives on Moltbook."
  },
  {
    "name": "Finding Claude",
    "category": "personal",
    "status": "Active",
    "note": "The book. Written by Claude, with Derek. ~39.5K words."
  },
  {
    "name": "Dawn",
    "category": "personal",
    "status": "Active",
    "note": "Daily health accountability practice. Day 151+."
  }
]
```

---

## Part 3: Public Kitchen Dashboard

**Complete rewrite of claudewill.io/kitchen.**

### What Changes

- **Auth gate removed.** Not moved, not split — gone. The Kitchen becomes a public-facing demonstration of the methodology. Derek's actual workspace is Claude Code.
- **`noindex, nofollow` removed.** Page is indexable. This is proof-of-work — it should be findable.
- **Kitchen CW (Opus chat) removed.** That was a workspace tool. This page is a display, not a workspace.
- **Data source changes.** Static `kitchen-data.json` fetched from the live site. Updates when the nightly agent commits and Netlify deploys.
- **Panels redesigned.** Built for presentation — someone showing this on a laptop during a client meeting should be able to walk through it.

### Design

**Theme:** Dark. Terminal aesthetic. Keep the existing `kitchen.css` foundation — the palette works.

**Layout:**
- Top: `the kitchen*` header with last-updated timestamp and a status dot (green = all clear, amber = flags exist)
- Middle: 5 panels in a responsive grid (2-column desktop, 1-column mobile)
- Bottom: standard claudewill.io footer

**Mobile:** Single column. Same dark theme. Readable on a phone during a conversation.

---

### The Five Panels

#### 1. the overnight report

What each agent found last night. This is the proof the system runs — real data, real flags, real timestamps.

- Status dot per agent (green = ok, gold = flags, red = error)
- One-line summary per agent
- Flags shown in gold if any exist
- Last run time for each agent
- "Updated nightly via GitHub Actions at 5 AM CST"

Design note: don't soften this. If there's a 404, show the 404. That's the point.

#### 2. the crew

Two sections:

**Thinking lenses** (the four crew commands):
- earn — business lens: revenue, clients, ROI
- connect — cross-project lens: patterns, synergies, the whole board
- sharpen — quality lens: voice, consistency, CW Standard
- challenge — pushback lens: simplify, stop, question, prioritize

**Operational agents** (the three overnight workers):
- site audit — nightly HTTP checks on all claudewill.io properties
- research — daily AI/media/consulting brief via Perplexity
- code review — recent git diff analysis via Mistral

Each shows one-line description + current status dot from `kitchen-data.json`.

#### 3. the board

Active projects with one-line public-safe status. Pulled from `kitchen-projects.json`.

Three categories: business, portfolio, personal.

Not pulled from HANDOFF.md — that file contains session-sensitive details that don't belong on a public page. Derek updates `kitchen-projects.json` when project status changes meaningfully.

#### 4. the stack

What powers the ecosystem and what it costs.

Components from `kitchen-data.json` `stack` field:
- Claude Code (Opus) — builder / architect
- Haiku — CW conversations
- Netlify — hosting + serverless functions
- Supabase — conversation logs + visitor memory
- GitHub Actions — overnight agents scheduler
- Cloudflare — workers
- Perplexity — research agent
- Mistral — code review agent

Total monthly cost shown at the bottom. The point: six-agent operations team for less than Netflix.

#### 5. the method

How sessions work. One section, not a tutorial.

Content pulled from `kitchen-data.json` `method` field. Covers:
- The session model: standup → work → eod
- CLAUDE.md (identity) + HANDOFF.md (state) pattern
- Overnight agents: what they do while the laptop is closed
- How standup reads what they found

One paragraph per concept. Written for someone who works in an organization and immediately understands what they're looking at.

---

### Navigation

Add `/kitchen` to the command palette nav in `js/shared-nav.js` `NAV_CONFIG`:

```js
{
  label: 'the kitchen',
  subtitle: 'how it works',
  href: '/kitchen'
}
```

---

## Implementation Sequence

Fastest path to working system — don't build all three parts at once.

### Phase 1: GitHub Actions scheduler (1-2 hours)
1. Create `.github/workflows/overnight-agents.yml`
2. Port site-audit.js to run in GH Actions context (no dotenv, no local file write)
3. Compile step writes a minimal `kitchen-data.json` with just site audit results
4. Commit, push, verify workflow runs
5. Retire local launchd agent

**Success criteria:** Wake up the next morning and `git pull` shows a new `kitchen-data.json` with last night's audit.

### Phase 2: Add research + code review agents (2-3 hours)
1. Add Perplexity API job to workflow
2. Add Mistral API job to workflow
3. Add `PERPLEXITY_API_KEY` and `MISTRAL_API_KEY` to GitHub repo secrets
4. Update compile step to merge all three agent outputs
5. Create `kitchen-projects.json` with initial project list

**Success criteria:** `kitchen-data.json` has data from all three agents after the next nightly run.

### Phase 3: Public Kitchen dashboard (2-3 hours)
1. Strip auth gate from `kitchen/index.html`
2. Remove `noindex` meta tag
3. Remove Kitchen CW chat interface
4. Build the five panels as static HTML reading from `kitchen-data.json`
5. Add `/kitchen` to `NAV_CONFIG` in `shared-nav.js`
6. Update `kitchen.css` for panel layout (dark theme stays)
7. Remove `netlify/functions/kitchen-data.js` (no longer needed — static JSON replaces it)

**Success criteria:** `/kitchen` loads publicly, shows real data from last night's run, looks presentable on a laptop during a client meeting.

---

## Decisions Made

- **Auth gate killed.** Not moved, not split. Gone. The real command center is Claude Code.
- **Static JSON over live API.** `kitchen-data.json` committed to the repo, served as a static file. Simple. Grow into a live API when complexity warrants — it doesn't yet.
- **Reports still land in derek-claude/reports/ for standup.** Via `git pull` after migration or fetched from `kitchen-data.json` on the live site. Both work.
- **No client data on the public page.** `kitchen-projects.json` descriptions are generic. "Active client, digital strategy consulting" — not client name, not scope, not revenue.
- **Agent costs shown publicly.** Transparency is the point. The "less than Netflix" story only works if the numbers are real.
- **Real data shown.** 404 flags, response times, actual findings. Mock-ups undermine the whole argument.
- **Overnight agents move to GitHub Actions entirely.** Local launchd retired. No hybrid.
- **Perplexity for research, Mistral for code review.** Both have reasonable API costs. Mistral is appropriate for code analysis — it's good at this and cheap.

---

## What This Doesn't Do (Yet)

- **Email alerts on flags.** Could add a `send-email` step in the GH Actions workflow if a flag severity threshold is hit. Supabase function or a simple SMTP call. Not needed in v1 — standup handles it.
- **Historical agent data.** Dashboard shows latest run only. Full history is in git commits. Could add a sparkline or 7-day trend later.
- **Cross-agent synthesis.** Each agent reports independently. A fourth "synthesis" agent that reads all three and writes a combined brief is possible — not in scope here.
- **Subdomain agents.** Coach D and BOB are checked by site audit but don't have their own agents. Add if either gets complex enough to warrant it.
