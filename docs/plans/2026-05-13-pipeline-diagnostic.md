# Overnight Pipeline Diagnostic — Why the Markdown Reports Stopped

**Author:** Claude, evening of May 13, 2026
**Scope:** `reports/morning-edition.md`, `reports/housekeeping.md`, `reports/pipeline-scan.md` haven't updated since ~April 10–12 even though the overnight workflow reports success daily.
**Status:** Diagnostic only. No fixes applied. Fixes recommended at the bottom; Derek's call.

---

## TL;DR

Two distinct bugs, one structural, one operational.

1. **Structural (housekeeping.md, pipeline-scan.md):** Both are gitignored. `.gitignore` has `reports/*` blanket-ignore with un-ignore exceptions only for `reports/pipeline.json`, `reports/social-drafts/`, and `reports/morning-edition.md`. The bot couldn't commit these files even if it tried — and `overnight-agents.yml` line 215's `git add` doesn't list them, so it doesn't try.
2. **Operational (morning-edition.md):** This one IS unignored and IS in the git add line, but the bot's commits since `849d49bb` (Apr 10) haven't actually included a diff for it — only the JSON files. Today's run (`8d17667c`, Wed May 13) reported "Morning Edition published. 12 headlines, 0 errors" in the step log, but `git show 8d17667c --stat` shows only `cw-current.json`, `kitchen-data.json`, `pulse.json` changed. The freshly-generated `morning-edition.md` isn't reaching the commit.

The workflow itself reports success on every recent run. **GitHub Actions' green checkmarks have been masking two silent failures since mid-April.**

---

## Evidence

### File timestamps and last commits

```
reports/morning-edition.md   Apr 10 09:51   last actual diff in commit 849d49bb (Apr 10)
reports/housekeeping.md      Apr 12 01:01   never appeared in any bot commit
reports/pipeline-scan.md     Feb 26 21:51   never appeared in any bot commit
```

The Apr 12 housekeeping.md and Feb 26 pipeline-scan.md are local artifacts — they were generated locally at some point, never committed by the bot.

### Today's run

```
gh run view 25797084598 → all jobs "success"
git show 8d17667c --stat → 3 files changed:
  cw-current.json
  kitchen-data.json
  pulse.json
```

morning-edition.md step log says `[2026-05-13] Morning Edition published. 12 headlines, 0 errors.` — but the file diff isn't in the commit.

### `.gitignore`

```
docs/plans/reports/
# Overnight agent reports (generated, not committed — kitchen-data.json is the compiled output)
reports/*
!reports/pipeline.json
!reports/social-drafts/
!reports/morning-edition.md
```

`reports/housekeeping.md` and `reports/pipeline-scan.md` are caught by `reports/*` with no exception. Permanent block.

### `overnight-agents.yml` line 215

```yaml
git add kitchen-data.json cw-current.json pulse.json spend-data.json reports/morning-edition.md
```

Includes morning-edition.md. Does **not** include housekeeping.md or pipeline-scan.md.

---

## Root cause #1 — Structural (housekeeping + pipeline-scan)

Two distinct shortfalls have to be true for these files to ever land in a bot commit:

1. The `.gitignore` has to allow them.
2. The workflow's `git add` line has to include them.

Currently **neither** is true. Even if Derek added them to the `git add` line tomorrow, `.gitignore` would still block them.

### Recommended fix (5 minutes)

Edit `.gitignore`:

```
reports/*
!reports/pipeline.json
!reports/social-drafts/
!reports/morning-edition.md
!reports/housekeeping.md          # ADD
!reports/pipeline-scan.md         # ADD
```

Edit `.github/workflows/overnight-agents.yml` line 215:

```yaml
# BEFORE
git add kitchen-data.json cw-current.json pulse.json spend-data.json reports/morning-edition.md

# AFTER
git add kitchen-data.json cw-current.json pulse.json spend-data.json reports/morning-edition.md reports/housekeeping.md reports/pipeline-scan.md
```

Friday's run (May 15) would commit both files, and they'd update on every Mon/Wed/Fri thereafter.

---

## Root cause #2 — Operational (morning-edition.md)

This one is subtler and I haven't fully isolated it.

**What's confirmed:**
- The morning-edition.mjs script writes to `reports/morning-edition.md` (line 38 of the script).
- The job step finishes with "Morning Edition published. 12 headlines, 0 errors." → the script ran to completion.
- The artifact upload uses `path: reports/morning-edition.md` and `if-no-files-found: warn`.
- The compile job downloads with `path: reports/` and `continue-on-error: true`.
- `git add reports/morning-edition.md` runs in the compile job.
- The resulting commit doesn't include a diff for morning-edition.md.

**What this points at:** the upload/download artifact step is likely depositing the file at the wrong path inside the compile job's workspace, so `git add reports/morning-edition.md` stages either an unchanged file (the checked-out Apr 10 version) or no file (silent skip). The two `continue-on-error: true` flags in the compile job's download steps mean a path mismatch would never raise.

**Two specific suspicions worth checking on Thursday:**

1. **`upload-artifact@v4` may preserve the path from the workspace root.** Uploading `path: reports/morning-edition.md` could create an artifact whose internal structure is `reports/morning-edition.md`. Downloading that artifact with `path: reports/` could result in `reports/reports/morning-edition.md`. The git add then stages the *checked-out* `reports/morning-edition.md` (unchanged from Apr 10), which has no diff.
2. **Or:** the artifact may upload fine and contain `morning-edition.md` at its root, but the download step writes it to `reports/morning-edition.md` and overwrites the checked-out file — yet the freshly-written content is somehow byte-identical to the Apr 10 version, which would be very surprising for a daily news brief.

Suspicion #1 is by far the more likely. A 5-minute check on Thursday morning would confirm: run the workflow manually with `gh workflow run overnight-agents.yml`, then check the compile job's runner filesystem via a debug step (`run: ls -la reports/`).

### Recommended fix path (15 minutes to investigate, 5 minutes to fix)

Easiest reliable fix that doesn't depend on artifact-path archaeology: **commit the file directly from the producing job instead of round-tripping through an artifact.** Add a commit step to the morning-edition job (same pattern the compile job uses) and remove morning-edition from the compile job's git add. The artifact upload can stay for diagnostic visibility.

Alternative: change the upload to specify the file's basename and the include-paths separately so the artifact lands at a known location on download. Reference: GitHub's docs for upload-artifact v4 path behavior.

---

## What this doesn't explain

- Why `pipeline.json` (which IS unignored and presumably also generated) hasn't updated since Apr 9. Could be the same artifact path issue.
- Whether the script's content is actually changing day to day. The "12 headlines, 0 errors" output is consistent but the headlines themselves should vary. If the API keys (Gemini, Perplexity, Mistral, Cohere) are still working — and the per-job "success" suggests they are — then the content is changing in the runner's filesystem; it's just not reaching the commit.

---

## Suggested order of operations for Derek

1. **Friday (post-deck-ship):** Apply Fix #1 (gitignore + workflow git add). One-line change to each file. Test by running `gh workflow run overnight-agents.yml` manually and checking the resulting commit.
2. **Weekend or next Mon:** Investigate Fix #2. Easiest path is to add a debug `run: ls -la reports/` step to the compile job, run it manually, and read the runner filesystem. Then either move the commit step or fix the artifact path.
3. **W21:** Once both are fixed, verify the next three runs (Mon/Wed/Fri) all produce file diffs. Then the markdown reports start flowing again and `/standup`-style read-throughs of last night's output become possible.

---

## What this is not

- Not a security issue. The pipeline is running correctly; the bot has appropriate scope.
- Not a cost issue. The API calls are happening; the script is producing content.
- Not a kitchen-data.json issue. The compiled JSON pipeline works — `/kitchen` shows fresh data daily.
- Not a Friday-blocker. The Adams deck ships independent of this pipeline.

---

## Files referenced

- `.github/workflows/overnight-agents.yml` (line 215 is the git add)
- `.gitignore` (lines for `reports/*` and unignores)
- `scripts/overnight/morning-edition.mjs` (line 38 writes the file)
- `reports/morning-edition.md` (the file that's frozen at Apr 10)

---

— Generated by Claude during overnight work after Derek's 7:16 PM EOD green light on May 13, 2026.
