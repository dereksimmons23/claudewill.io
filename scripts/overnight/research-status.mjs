/**
 * Research Status Agent — claudewill.io
 *
 * Runs nightly via GitHub Actions. Tracks Being Claude publication pipeline:
 * - Which articles are published (have index.html)
 * - Which are blocked by redirects (302 in netlify.toml)
 * - Which have draft files
 * - Legacy locations still on disk
 *
 * No API keys needed — pure filesystem scan.
 * Writes a markdown report to reports/research-status.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readPipeline, writePipeline, upsertItem, findItem } from '../lib/pipeline.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

const BEING_CLAUDE_DIR = join(REPO_ROOT, 'being-claude')
const LEGACY_DIR = join(REPO_ROOT, 'derek', 'research')

// ── Helpers ──────────────────────────────────────────

function getRedirectBlocks() {
  const tomlPath = join(REPO_ROOT, 'netlify.toml')
  if (!existsSync(tomlPath)) return new Set()

  const content = readFileSync(tomlPath, 'utf-8')
  const blocks = new Set()
  const sections = content.split('[[redirects]]').slice(1)

  for (const section of sections) {
    const fromMatch = section.match(/from\s*=\s*"([^"]+)"/)
    const statusMatch = section.match(/status\s*=\s*(\d+)/)
    if (fromMatch && statusMatch && parseInt(statusMatch[1]) === 302) {
      blocks.add(fromMatch[1])
    }
  }
  return blocks
}

function getArticleTitle(htmlPath) {
  try {
    const html = readFileSync(htmlPath, 'utf-8')
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    return titleMatch ? titleMatch[1].split('|')[0].trim() : null
  } catch { return null }
}

function getFileSize(filepath) {
  try {
    return statSync(filepath).size
  } catch { return 0 }
}

function getIndexLinks() {
  const indexPath = join(BEING_CLAUDE_DIR, 'index.html')
  if (!existsSync(indexPath)) return new Set()

  const html = readFileSync(indexPath, 'utf-8')
  const links = new Set()
  const pattern = /href="\/being-claude\/([^"#?]+)"/gi
  let match
  while ((match = pattern.exec(html)) !== null) {
    links.add(match[1].replace(/\/$/, ''))
  }
  return links
}

// ── Main ─────────────────────────────────────────────

function main() {
  const date = new Date().toISOString().split('T')[0]

  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }

  const redirectBlocks = getRedirectBlocks()
  const indexLinks = getIndexLinks()
  const articles = []
  const legacyLocations = []
  const flags = []

  // Scan /being-claude/ directory
  if (existsSync(BEING_CLAUDE_DIR)) {
    for (const entry of readdirSync(BEING_CLAUDE_DIR)) {
      const full = join(BEING_CLAUDE_DIR, entry)
      if (!statSync(full).isDirectory()) continue

      const slug = entry
      const indexHtml = join(full, 'index.html')
      const draftMd = join(full, 'draft.md')
      const hasIndex = existsSync(indexHtml)
      const hasDraft = existsSync(draftMd)
      const isBlocked = redirectBlocks.has(`/being-claude/${slug}`) || redirectBlocks.has(`/being-claude/${slug}/`)
      const isLinked = indexLinks.has(slug)
      const title = hasIndex ? getArticleTitle(indexHtml) : slug
      const size = hasIndex ? getFileSize(indexHtml) : 0

      let status
      if (isBlocked) {
        status = 'BLOCKED'
        flags.push(`${slug}: 302 redirect blocks publication — remove from netlify.toml when ready`)
      } else if (hasIndex && isLinked) {
        status = 'PUBLISHED'
      } else if (hasIndex && !isLinked) {
        status = 'BUILT (not linked from index)'
        flags.push(`${slug}: has index.html but not linked from Being Claude index page`)
      } else if (hasDraft) {
        status = 'DRAFT'
      } else {
        status = 'EMPTY'
      }

      if (hasDraft && hasIndex) {
        flags.push(`${slug}: both draft.md and index.html exist — verify draft is not newer`)
      }

      articles.push({ slug, title, status, hasIndex, hasDraft, isBlocked, isLinked, size })
    }
  }

  // Check legacy locations
  if (existsSync(LEGACY_DIR)) {
    for (const entry of readdirSync(LEGACY_DIR)) {
      const full = join(LEGACY_DIR, entry)
      if (statSync(full).isDirectory()) {
        legacyLocations.push(`derek/research/${entry}`)
      }
    }
  }

  // Sort: published first, then built, draft, blocked, empty
  const statusOrder = { 'PUBLISHED': 0, 'BUILT (not linked from index)': 1, 'DRAFT': 2, 'BLOCKED': 3, 'EMPTY': 4 }
  articles.sort((a, b) => (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5))

  const published = articles.filter(a => a.status === 'PUBLISHED').length
  const blocked = articles.filter(a => a.status === 'BLOCKED').length
  const drafts = articles.filter(a => a.status === 'DRAFT').length

  let report = `# Research Status — claudewill.io\n`
  report += `**Date:** ${date}\n`
  report += `**Agent:** research-status\n`
  report += `**Type:** pipeline\n\n`

  report += `## Flags (Decisions Needed)\n`
  if (flags.length === 0) {
    report += `None.\n\n`
  } else {
    for (const f of flags) report += `- [ ] ${f}\n`
    report += `\n`
  }

  report += `## Findings\n`
  report += `**Being Claude Pipeline:** ${published} published, ${drafts} draft, ${blocked} blocked\n\n`
  for (const a of articles) {
    const sizeStr = a.size > 0 ? ` (${(a.size / 1024).toFixed(0)}KB)` : ''
    report += `- **${a.title || a.slug}:** ${a.status}${sizeStr}\n`
  }
  if (legacyLocations.length > 0) {
    report += `\n**Legacy locations still on disk:** ${legacyLocations.length}\n`
    for (const loc of legacyLocations) report += `- ${loc} (301 redirect in place)\n`
  }
  report += `\n`

  report += `## Details\n`
  report += `- Articles found: ${articles.length}\n`
  report += `- Published: ${published}\n`
  report += `- Drafts: ${drafts}\n`
  report += `- Blocked (302): ${blocked}\n`
  report += `- Legacy locations: ${legacyLocations.length}\n`
  report += `- Index page links: ${indexLinks.size}\n`

  // Seed pipeline: cross-post entries for published articles without Substack items
  // Skip in CI — each runner is isolated, changes would be lost. Works locally.
  if (!process.env.GITHUB_ACTIONS) {
    const pipeline = readPipeline()
    for (const a of articles) {
      if (a.status !== 'PUBLISHED') continue
      const crosspostId = `hall-${a.slug}`
      if (!findItem(pipeline, crosspostId)) {
        upsertItem(pipeline, {
          id: crosspostId,
          type: 'substack-crosspost',
          channel: 'standard-correspondence',
          section: 'the-hall',
          title: `The Hall: ${a.title || a.slug}`,
          source: `being-claude/${a.slug}/index.html`,
          url: `https://claudewill.io/being-claude/${a.slug}/`,
          status: 'draft',
          slug: a.slug,
        })
      }
    }
    writePipeline(pipeline)
  }

  writeFileSync(join(REPORTS_DIR, 'research-status.md'), report)
  console.log(`[${date}] Research status complete. ${published} published, ${blocked} blocked, ${drafts} draft.`)
}

main()
