/**
 * Code Review Agent — claudewill.io
 *
 * Runs nightly via GitHub Actions. Gets recent git diffs
 * and sends them to Mistral for review.
 *
 * Writes a markdown report to reports/code-review.md
 * No dependencies — uses native fetch (Node 22).
 *
 * Note: execSync is used with hardcoded git commands only —
 * no user input is interpolated into shell commands.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY

function writeReport(content) {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }
  writeFileSync(join(REPORTS_DIR, 'code-review.md'), content)
}

function getRecentDiffs() {
  try {
    const diff = execSync('git log --since="24 hours ago" -p --no-color', {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 5, // 5MB
    })
    return diff.trim()
  } catch {
    return ''
  }
}

function getRecentCommitSummary() {
  try {
    const log = execSync('git log --since="24 hours ago" --oneline --no-color', {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    })
    return log.trim()
  } catch {
    return ''
  }
}

async function main() {
  const date = new Date().toISOString().split('T')[0]

  // Check for recent commits first
  const commitSummary = getRecentCommitSummary()

  if (!commitSummary) {
    const report = `# Code Review\n**Date:** ${date}\n**Agent:** code-review\n**Type:** review\n\n## Flags (Decisions Needed)\nNone.\n\n## Findings\nNo commits in last 24 hours. Nothing to review.\n\n## Details\nNone.\n`
    writeReport(report)
    console.log(`[${date}] Code review skipped — no recent commits.`)
    return
  }

  if (!MISTRAL_API_KEY) {
    const report = `# Code Review\n**Date:** ${date}\n**Agent:** code-review\n**Type:** review\n\n## Flags (Decisions Needed)\nNone.\n\n## Findings\nMistral agent not configured — add MISTRAL_API_KEY to GitHub secrets.\n\n## Details\nRecent commits (not reviewed):\n${commitSummary}\n`
    writeReport(report)
    console.log(`[${date}] Code review skipped — no API key.`)
    return
  }

  const diffs = getRecentDiffs()

  // Truncate diffs if too large for the API (keep under ~60K chars)
  const maxDiffLength = 60000
  const truncatedDiffs = diffs.length > maxDiffLength
    ? diffs.slice(0, maxDiffLength) + '\n\n[... truncated — diff exceeded 60K chars]'
    : diffs

  const prompt = `Review the following git diffs from the last 24 hours on a web project (claudewill.io — static HTML/CSS/JS site with Netlify serverless functions).

Focus on:
1. **Security issues** — exposed secrets, XSS vectors, insecure API calls, missing auth checks
2. **Performance problems** — unnecessary DOM queries, unoptimized loops, large synchronous operations, missing caching
3. **Accessibility issues** — missing alt text, broken ARIA, keyboard traps, contrast problems
4. **Broken patterns** — inconsistencies with the rest of the codebase, dead code, race conditions

Be direct. Skip praise. If everything looks clean, say so in one line. If there are issues, list them with file names and line references.

Recent commits:
${commitSummary}

Diffs:
${truncatedDiffs}`

  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a senior code reviewer. Be concise and direct. Focus on real issues, not style preferences. If you find nothing concerning, say so plainly.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Mistral API returned ${res.status}: ${errorText}`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || 'No content returned.'

    // Determine if there are flags (look for security/critical keywords)
    const hasSecurityIssues = /security|vulnerability|exposed|secret|xss|injection|auth/i.test(content)
      && !/no security|no.+vulnerabilit|looks clean|nothing.+concern/i.test(content)

    let report = `# Code Review\n`
    report += `**Date:** ${date}\n`
    report += `**Agent:** code-review\n`
    report += `**Type:** review\n\n`

    report += `## Flags (Decisions Needed)\n`
    if (hasSecurityIssues) {
      report += `- [ ] Security-related findings detected — review below\n\n`
    } else {
      report += `None.\n\n`
    }

    report += `## Findings\n`
    report += `${content}\n\n`

    report += `## Details\n`
    report += `Commits reviewed: ${commitSummary.split('\n').length}\n`
    report += `Model: mistral-small-latest | Tokens: ${data.usage?.total_tokens || 'unknown'}\n`

    writeReport(report)
    console.log(`[${date}] Code review complete.`)
  } catch (err) {
    const report = `# Code Review\n**Date:** ${date}\n**Agent:** code-review\n**Type:** review\n\n## Flags (Decisions Needed)\n- [ ] Code review failed: ${err.message}\n\n## Findings\nAgent error — could not complete code review.\n\n## Details\nRecent commits (not reviewed):\n${commitSummary}\n`
    writeReport(report)
    console.error(`Code review failed: ${err.message}`)
    process.exit(1)
  }
}

main()
