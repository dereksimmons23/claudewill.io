/**
 * Housekeeping Agent — claudewill.io
 *
 * Replaces site-audit. Runs nightly via GitHub Actions. Checks:
 *
 * PAGE HEALTH
 *   - All public pages responding (HTTP 200)
 *   - Response times reasonable (<3s)
 *   - SSL certificate valid
 *   - Subdomains up
 *
 * REPO HYGIENE
 *   - No sensitive files tracked in git (strategies/, .env, clients/)
 *   - CW prompt .md files don't reference dead URLs
 *   - Redirect targets in netlify.toml resolve to real files
 *   - site-registry.json pages match actual HTML files
 *   - map.html mentions all live pages
 *   - .gitignore has required patterns
 *
 * Writes to reports/housekeeping.md
 * No dependencies — uses native Node 22.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

const SITE = 'https://claudewill.io'

// ── Page Health ─────────────────────────────────────

const PAGES = [
  '/',
  '/derek',
  '/story',
  '/workshop',
  '/privacy',
  '/terms',
  '/kitchen',
  '/arcade',
  '/map',
  '/being-claude',
]

const EXTERNAL_CHECKS = [
  { url: 'https://coach.claudewill.io', name: 'Coach D' },
  { url: 'https://bob.claudewill.io', name: 'BOB' },
]

const SLOW_MS = 3000

async function checkPage(url, retries = 1) {
  const start = Date.now()
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    return {
      url,
      status: res.status,
      ok: res.ok,
      elapsed: Date.now() - start,
    }
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 15000))
      return checkPage(url, retries - 1)
    }
    return {
      url,
      status: 0,
      ok: false,
      elapsed: Date.now() - start,
      error: err.code || err.message || 'Unknown error',
    }
  }
}

async function checkSSL(hostname) {
  try {
    await fetch(`https://${hostname}`, { signal: AbortSignal.timeout(5000) })
    return { valid: true }
  } catch (err) {
    if (err.code === 'CERT_HAS_EXPIRED' || err.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
      return { valid: false, error: err.code }
    }
    return { valid: true, note: 'Could not verify (network error)' }
  }
}

// ── Sensitive File Detection ────────────────────────

const SENSITIVE_PATTERNS = [
  { pattern: /^strategies\//, reason: 'Client-confidential documents' },
  { pattern: /^clients\//, reason: 'Client work directory' },
  { pattern: /(^|\/)\.env($|\.[^e])/, reason: 'Environment variables' },  // allows .env.example
  { pattern: /^ea\.html$/, reason: 'Deprecated client page' },
]

function checkSensitiveFiles() {
  const issues = []
  try {
    const tracked = execFileSync('git', ['ls-files'], { cwd: REPO_ROOT, encoding: 'utf-8' })
      .split('\n').filter(Boolean)

    for (const file of tracked) {
      for (const { pattern, reason } of SENSITIVE_PATTERNS) {
        if (pattern.test(file)) {
          issues.push(`${file} (${reason})`)
        }
      }
    }
  } catch {
    issues.push('Could not run git ls-files')
  }
  return issues
}

// ── CW Prompt Dead URL Check ────────────────────────

const DEAD_URLS = [
  '/derek/assessment',
  '/library',
  '/strategies',
  '/stable',
  '/studio',
  '/proof',
  '/mirae',
]

function findMdFiles(dir) {
  const files = []
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...findMdFiles(full))
    else if (entry.name.endsWith('.md')) files.push(full)
  }
  return files
}

function checkPromptURLs() {
  const issues = []
  const promptDir = join(REPO_ROOT, 'netlify', 'functions', 'cw-prompt')
  const mdFiles = findMdFiles(promptDir)

  for (const file of mdFiles) {
    const content = readFileSync(file, 'utf-8')
    const relPath = file.replace(REPO_ROOT + '/', '')

    for (const dead of DEAD_URLS) {
      const escaped = dead.replace(/\//g, '\\/')
      const regex = new RegExp(`(?:claudewill\\.io)?${escaped}(?![\\w/-])`, 'g')
      if (regex.test(content)) {
        issues.push(`${relPath} references ${dead}`)
      }
    }
  }
  return issues
}

// ── Redirect Target Validation ──────────────────────

function parseRedirects(tomlContent) {
  const redirects = []
  const blocks = tomlContent.split('[[redirects]]').slice(1)
  for (const block of blocks) {
    const from = block.match(/from\s*=\s*"([^"]+)"/)?.[1]
    const to = block.match(/to\s*=\s*"([^"]+)"/)?.[1]
    if (from && to) redirects.push({ from, to })
  }
  return redirects
}

function fileExistsForPath(urlPath) {
  const clean = urlPath.replace(/^\//, '').replace(/[?#].*$/, '')
  if (clean === '') return true
  return existsSync(join(REPO_ROOT, clean + '.html'))
    || existsSync(join(REPO_ROOT, clean, 'index.html'))
    || existsSync(join(REPO_ROOT, clean))
}

function checkRedirectTargets() {
  const issues = []
  const tomlPath = join(REPO_ROOT, 'netlify.toml')
  if (!existsSync(tomlPath)) return issues

  const content = readFileSync(tomlPath, 'utf-8')
  const redirects = parseRedirects(content)
  const fromPaths = new Set(redirects.map(r => r.from.replace('.html', '')))

  for (const { from, to } of redirects) {
    if (to.startsWith('http') || to === '/' || to.includes(':splat')) continue

    const cleanTo = to.replace(/[?#].*$/, '')
    const hasFile = fileExistsForPath(cleanTo)
    const hasRedirect = fromPaths.has(cleanTo) || fromPaths.has(cleanTo.replace('.html', ''))

    if (!hasFile && !hasRedirect) {
      issues.push(`${from} \u2192 ${to} (target not found)`)
    }
  }
  return issues
}

// ── Site Registry Sync ──────────────────────────────

function checkSiteRegistry() {
  const issues = []
  const regPath = join(REPO_ROOT, 'site-registry.json')
  if (!existsSync(regPath)) return ['site-registry.json not found']

  try {
    const registry = JSON.parse(readFileSync(regPath, 'utf-8'))
    const pages = registry.pages || []

    for (const page of pages) {
      if (!page.path) continue
      if (!fileExistsForPath(page.path)) {
        issues.push(`${page.path} (${page.title || 'untitled'}) \u2014 no file`)
      }
    }
    return issues
  } catch {
    return ['site-registry.json parse error']
  }
}

// ── Map Coverage ────────────────────────────────────

function checkMapCoverage() {
  const issues = []
  const mapPath = join(REPO_ROOT, 'map.html')
  if (!existsSync(mapPath)) return ['map.html not found']

  const mapContent = readFileSync(mapPath, 'utf-8')

  const SHOULD_BE_IN_MAP = [
    '/derek', '/story', '/workshop', '/kitchen',
    '/arcade', '/being-claude',
  ]

  for (const path of SHOULD_BE_IN_MAP) {
    if (!mapContent.includes(path)) {
      issues.push(`${path} not in map.html`)
    }
  }
  return issues
}

// ── Gitignore Pattern Check ─────────────────────────

const REQUIRED_GITIGNORE = [
  { pattern: 'strategies/', label: 'Client docs' },
  { pattern: '.env', label: 'Environment variables' },
  { pattern: 'HANDOFF.md', label: 'Session state' },
  { pattern: 'CLAUDE.md', label: 'Project instructions' },
  { pattern: '.claude/', label: 'Claude config' },
]

function checkGitignorePatterns() {
  const issues = []
  const giPath = join(REPO_ROOT, '.gitignore')
  if (!existsSync(giPath)) return ['No .gitignore found']

  const content = readFileSync(giPath, 'utf-8')

  for (const { pattern, label } of REQUIRED_GITIGNORE) {
    if (!content.includes(pattern)) {
      issues.push(`Missing: ${pattern} (${label})`)
    }
  }
  return issues
}

// ── Main ────────────────────────────────────────────

async function main() {
  const date = new Date().toISOString().split('T')[0]
  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true })

  const flags = []
  const findings = []
  const details = []

  // ── Page Health ──

  const [pageResults, externalResults, ssl] = await Promise.all([
    Promise.all(PAGES.map(p => checkPage(`${SITE}${p}`))),
    Promise.all(EXTERNAL_CHECKS.map(e => checkPage(e.url).then(r => ({ ...r, name: e.name })))),
    checkSSL('claudewill.io'),
  ])

  const downPages = pageResults.filter(r => !r.ok)
  const slowPages = pageResults.filter(r => r.ok && r.elapsed > SLOW_MS)
  const downExternal = externalResults.filter(r => !r.ok)
  const upPages = pageResults.filter(r => r.ok)
  const avgTime = upPages.length > 0
    ? Math.round(upPages.reduce((sum, r) => sum + r.elapsed, 0) / upPages.length)
    : 0

  for (const p of downPages) flags.push(`${p.url} is DOWN (${p.error || `status ${p.status}`})`)
  for (const p of downExternal) flags.push(`${p.name || p.url} is DOWN (${p.error || `status ${p.status}`})`)
  if (!ssl.valid) flags.push(`SSL certificate issue: ${ssl.error}`)
  for (const p of slowPages) findings.push(`Slow: ${p.url} \u2014 ${p.elapsed}ms`)

  const allUp = downPages.length === 0 && downExternal.length === 0
  findings.unshift(allUp
    ? `All ${pageResults.length} pages + ${externalResults.length} subdomains responding. Avg ${avgTime}ms.`
    : `${upPages.length}/${pageResults.length} pages up. ${downPages.length} down.`
  )

  for (const r of [...pageResults, ...externalResults]) {
    const label = r.name ? `${r.name} (${r.url})` : r.url
    details.push(r.ok ? `${label} \u2014 ${r.status} ${r.elapsed}ms` : `${label} \u2014 DOWN: ${r.error || `status ${r.status}`}`)
  }

  // ── Repo Hygiene ──

  const sensitiveFiles = checkSensitiveFiles()
  const promptURLs = checkPromptURLs()
  const redirectTargets = checkRedirectTargets()
  const registrySync = checkSiteRegistry()
  const mapCoverage = checkMapCoverage()
  const gitignoreCheck = checkGitignorePatterns()

  for (const f of sensitiveFiles) flags.push(`Sensitive file tracked: ${f}`)
  for (const f of promptURLs) flags.push(`Prompt dead link: ${f}`)
  for (const f of redirectTargets) flags.push(`Redirect gap: ${f}`)
  for (const f of registrySync) flags.push(`Registry: ${f}`)
  for (const f of gitignoreCheck) flags.push(`Gitignore: ${f}`)
  for (const f of mapCoverage) findings.push(`Map: ${f}`)

  const hygieneIssues = sensitiveFiles.length + promptURLs.length + redirectTargets.length
    + registrySync.length + gitignoreCheck.length

  findings.push(`Repo hygiene: ${hygieneIssues === 0 ? 'clean' : hygieneIssues + ' issues'}.`)
  findings.push(`Map: ${mapCoverage.length === 0 ? 'complete' : mapCoverage.length + ' pages missing'}.`)

  // ── Build Report ──

  let report = `# Housekeeping \u2014 claudewill.io\n`
  report += `**Date:** ${date}\n`
  report += `**Agent:** housekeeping\n`
  report += `**Type:** audit\n\n`

  report += `## Flags (Decisions Needed)\n`
  if (flags.length === 0) {
    report += `None.\n\n`
  } else {
    for (const f of flags) report += `- [ ] ${f}\n`
    report += `\n`
  }

  report += `## Findings\n`
  for (const f of findings) report += `- ${f}\n`
  report += `\n`

  report += `## Details\n`
  for (const d of details) report += `- ${d}\n`
  report += `\nSSL: ${ssl.valid ? 'Valid' : `ISSUE \u2014 ${ssl.error}`}\n`

  writeFileSync(join(REPORTS_DIR, 'housekeeping.md'), report)
  console.log(`[${date}] Housekeeping complete. ${flags.length} flags, ${findings.length} findings.`)
}

main().catch(err => {
  console.error(`Housekeeping failed: ${err.message}`)
  const date = new Date().toISOString().split('T')[0]
  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(join(REPORTS_DIR, 'housekeeping.md'),
    `# Housekeeping \u2014 claudewill.io\n**Date:** ${date}\n**Agent:** housekeeping\n**Type:** audit\n\n## Flags (Decisions Needed)\n- [ ] Housekeeping script failed: ${err.message}\n\n## Findings\nAgent error \u2014 could not complete audit.\n\n## Details\nNone.\n`)
  process.exit(1)
})
