/**
 * Content Scanner — claudewill.io
 *
 * Runs nightly via GitHub Actions. Scans all HTML files for:
 * - Copyright years that aren't current
 * - Hardcoded dates more than 90 days old in visible content
 * - Internal links pointing to redirected pages
 * - Meta descriptions referencing removed features
 *
 * No API keys needed — pure filesystem scan.
 * Writes a markdown report to reports/content-scan.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

const CURRENT_YEAR = new Date().getFullYear()
const NINETY_DAYS_AGO = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

// Directories to skip
const SKIP_DIRS = new Set(['node_modules', '.netlify', '.git', '.claude', 'dev', 'worker', 'reports', 'scripts'])

// Files where dates are historical content (not stale)
const HISTORICAL_FILES = new Set(['derek/portfolio/index.html', 'derek/resume.html'])

// Dead features — flag if found in meta descriptions
const DEAD_FEATURES = ['workshop.html', 'library.html', 'map.html', 'studio.html', 'stable.html']

// ── Helpers ──────────────────────────────────────────

function findHtmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      findHtmlFiles(full, files)
    } else if (entry.endsWith('.html')) {
      files.push(full)
    }
  }
  return files
}

function parseRedirects() {
  const tomlPath = join(REPO_ROOT, 'netlify.toml')
  if (!existsSync(tomlPath)) return new Map()

  const content = readFileSync(tomlPath, 'utf-8')
  const redirects = new Map()
  const blocks = content.split('[[redirects]]').slice(1)

  for (const block of blocks) {
    const fromMatch = block.match(/from\s*=\s*"([^"]+)"/)
    const toMatch = block.match(/to\s*=\s*"([^"]+)"/)
    const statusMatch = block.match(/status\s*=\s*(\d+)/)
    if (fromMatch && toMatch) {
      redirects.set(fromMatch[1], {
        to: toMatch[1],
        status: statusMatch ? parseInt(statusMatch[1]) : 301,
      })
    }
  }
  return redirects
}

// Extract visible text (strip script/style blocks, then tags)
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
}

// ── Checks ───────────────────────────────────────────

function checkCopyright(html, filepath) {
  const issues = []
  const patterns = [
    /(?:©|&copy;)\s*(20\d{2})/gi,
    /copyright\s+(20\d{2})/gi,
  ]
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(html)) !== null) {
      const year = parseInt(match[1])
      if (year < CURRENT_YEAR) {
        issues.push({ type: 'copyright', file: filepath, detail: `Copyright year ${year} (should be ${CURRENT_YEAR})` })
      }
    }
  }
  return issues
}

function checkStaleDates(html, filepath) {
  const issues = []
  const visible = visibleText(html)

  const monthNames = 'January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'
  const pattern = new RegExp(`(${monthNames})\\s+(20\\d{2})`, 'gi')
  let match
  while ((match = pattern.exec(visible)) !== null) {
    const monthStr = match[1]
    const year = parseInt(match[2])
    const monthMap = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }
    const month = monthMap[monthStr.toLowerCase().slice(0, 3)]
    if (month !== undefined) {
      const dateApprox = new Date(year, month, 15)
      if (dateApprox < NINETY_DAYS_AGO) {
        issues.push({ type: 'stale-date', file: filepath, detail: `"${match[0]}" is more than 90 days old` })
      }
    }
  }
  return issues
}

function checkDeadLinks(html, filepath, redirects) {
  const issues = []
  const pattern = /href="(\/[^"#?]*)"/gi
  let match
  const seen = new Set()
  while ((match = pattern.exec(html)) !== null) {
    const path = match[1]
    if (seen.has(path)) continue
    seen.add(path)

    if (redirects.has(path)) {
      const r = redirects.get(path)
      // 302 redirects are intentional draft blocks — only flag 301s
      if (r.status === 301) {
        issues.push({ type: 'dead-link', file: filepath, detail: `href="${path}" redirects to ${r.to} (301)` })
      }
    }
  }
  return issues
}

function checkMetaDescriptions(html, filepath) {
  const issues = []
  const metaMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
  if (metaMatch) {
    const desc = metaMatch[1].toLowerCase()
    for (const dead of DEAD_FEATURES) {
      const name = dead.replace('.html', '')
      if (desc.includes(name)) {
        issues.push({ type: 'meta', file: filepath, detail: `Meta description references "${name}" (removed page)` })
      }
    }
  }
  return issues
}

// ── Main ─────────────────────────────────────────────

function main() {
  const date = new Date().toISOString().split('T')[0]

  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }

  const htmlFiles = findHtmlFiles(REPO_ROOT)
  const redirects = parseRedirects()
  const allIssues = []

  for (const filepath of htmlFiles) {
    const html = readFileSync(filepath, 'utf-8')
    const rel = relative(REPO_ROOT, filepath)

    allIssues.push(...checkCopyright(html, rel))
    if (!HISTORICAL_FILES.has(rel)) {
      allIssues.push(...checkStaleDates(html, rel))
    }
    allIssues.push(...checkDeadLinks(html, rel, redirects))
    allIssues.push(...checkMetaDescriptions(html, rel))
  }

  const flagItems = allIssues.filter(i => i.type === 'dead-link' || i.type === 'copyright')
  const findingItems = allIssues.filter(i => i.type === 'stale-date' || i.type === 'meta')

  let report = `# Content Scan — claudewill.io\n`
  report += `**Date:** ${date}\n`
  report += `**Agent:** content-scan\n`
  report += `**Type:** scan\n\n`

  report += `## Flags (Decisions Needed)\n`
  if (flagItems.length === 0) {
    report += `None.\n\n`
  } else {
    for (const f of flagItems) report += `- [ ] ${f.file}: ${f.detail}\n`
    report += `\n`
  }

  report += `## Findings\n`
  if (findingItems.length === 0 && flagItems.length === 0) {
    report += `All ${htmlFiles.length} HTML files clean. No stale content found.\n\n`
  } else {
    report += `Scanned ${htmlFiles.length} HTML files. Found ${allIssues.length} issues.\n`
    for (const f of findingItems) report += `- ${f.file}: ${f.detail}\n`
    report += `\n`
  }

  report += `## Details\n`
  report += `- HTML files scanned: ${htmlFiles.length}\n`
  report += `- Redirects loaded: ${redirects.size}\n`
  report += `- Copyright issues: ${allIssues.filter(i => i.type === 'copyright').length}\n`
  report += `- Stale dates: ${allIssues.filter(i => i.type === 'stale-date').length}\n`
  report += `- Dead links: ${allIssues.filter(i => i.type === 'dead-link').length}\n`
  report += `- Meta issues: ${allIssues.filter(i => i.type === 'meta').length}\n`

  writeFileSync(join(REPORTS_DIR, 'content-scan.md'), report)
  console.log(`[${date}] Content scan complete. ${allIssues.length} issues across ${htmlFiles.length} files.`)
}

main()
