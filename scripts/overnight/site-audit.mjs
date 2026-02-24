/**
 * Site Audit Agent — claudewill.io
 *
 * Runs nightly via GitHub Actions. Checks:
 * - All public pages are responding
 * - Response times are reasonable
 * - SSL certificate is valid
 * - Subdomains are up
 *
 * Writes a markdown report to reports/site-audit.md
 * No dependencies — uses native fetch (Node 22).
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

const SITE = 'https://claudewill.io'

// Pages to check — the actual public pages on claudewill.io
const PAGES = [
  '/',
  '/derek',
  '/story',
  '/work-with-me',
  '/workshop',
  '/library',
  '/map',
  '/privacy',
  '/terms',
  '/kitchen',
  '/arcade',
]

// External subdomains
const EXTERNAL_CHECKS = [
  { url: 'https://coach.claudewill.io', name: 'Coach D' },
  { url: 'https://bob.claudewill.io', name: 'BOB' },
]

// Thresholds
const SLOW_MS = 3000

async function checkPage(url) {
  const start = Date.now()
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    const elapsed = Date.now() - start
    return {
      url,
      status: res.status,
      ok: res.ok,
      elapsed,
      redirected: res.redirected,
      finalUrl: res.url,
    }
  } catch (err) {
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

function formatReport(results, externalResults, ssl, date) {
  const flags = []
  const findings = []
  const details = []

  // Down pages
  const downPages = results.filter((r) => !r.ok)
  if (downPages.length > 0) {
    for (const p of downPages) {
      flags.push(`${p.url} is DOWN (${p.error || `status ${p.status}`})`)
    }
  }

  // Slow pages
  const slowPages = results.filter((r) => r.ok && r.elapsed > SLOW_MS)
  if (slowPages.length > 0) {
    for (const p of slowPages) {
      findings.push(`Slow: ${p.url} — ${p.elapsed}ms`)
    }
  }

  // External sites
  const downExternal = externalResults.filter((r) => !r.ok)
  if (downExternal.length > 0) {
    for (const p of downExternal) {
      flags.push(`${p.name || p.url} is DOWN (${p.error || `status ${p.status}`})`)
    }
  }

  // SSL
  if (!ssl.valid) {
    flags.push(`SSL certificate issue: ${ssl.error}`)
  }

  // Summary stats
  const upPages = results.filter((r) => r.ok)
  const avgTime = upPages.length > 0
    ? Math.round(upPages.reduce((sum, r) => sum + r.elapsed, 0) / upPages.length)
    : 0
  const allUp = downPages.length === 0 && downExternal.length === 0

  if (allUp) {
    findings.unshift(
      `All ${results.length} pages responding. Average response: ${avgTime}ms.`
    )
  } else {
    findings.unshift(
      `${results.length - downPages.length}/${results.length} pages up. ${downPages.length} down.`
    )
  }

  // Per-page detail
  for (const r of [...results, ...externalResults]) {
    const label = r.name ? `${r.name} (${r.url})` : r.url
    if (r.ok) {
      details.push(`${label} — ${r.status} ${r.elapsed}ms`)
    } else {
      details.push(`${label} — DOWN: ${r.error || `status ${r.status}`}`)
    }
  }

  // Build report
  let report = `# Site Audit — claudewill.io\n`
  report += `**Date:** ${date}\n`
  report += `**Agent:** site-audit\n`
  report += `**Type:** audit\n\n`

  report += `## Flags (Decisions Needed)\n`
  if (flags.length === 0) {
    report += `None.\n\n`
  } else {
    for (const f of flags) {
      report += `- [ ] ${f}\n`
    }
    report += `\n`
  }

  report += `## Findings\n`
  for (const f of findings) {
    report += `- ${f}\n`
  }
  report += `\n`

  report += `## Details\n`
  for (const d of details) {
    report += `- ${d}\n`
  }
  report += `\n`

  report += `SSL: ${ssl.valid ? 'Valid' : `ISSUE — ${ssl.error}`}\n`

  return { report, flags, findings, details, avgTime, allUp, upCount: upPages.length, totalCount: results.length }
}

async function main() {
  const date = new Date().toISOString().split('T')[0]

  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }

  // Run all checks in parallel
  const [pageResults, externalResults, ssl] = await Promise.all([
    Promise.all(PAGES.map((p) => checkPage(`${SITE}${p}`))),
    Promise.all(
      EXTERNAL_CHECKS.map((e) =>
        checkPage(e.url).then((r) => ({ ...r, name: e.name }))
      )
    ),
    checkSSL('claudewill.io'),
  ])

  const { report } = formatReport(pageResults, externalResults, ssl, date)

  writeFileSync(join(REPORTS_DIR, 'site-audit.md'), report)
  console.log(`[${date}] Site audit complete.`)
}

main().catch((err) => {
  console.error(`Site audit failed: ${err.message}`)
  // Write a failure report so compile still has something
  const date = new Date().toISOString().split('T')[0]
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }
  const failReport = `# Site Audit — claudewill.io\n**Date:** ${date}\n**Agent:** site-audit\n**Type:** audit\n\n## Flags (Decisions Needed)\n- [ ] Site audit script failed: ${err.message}\n\n## Findings\nAgent error — could not complete audit.\n\n## Details\nNone.\n`
  writeFileSync(join(REPORTS_DIR, 'site-audit.md'), failReport)
  process.exit(1)
})
