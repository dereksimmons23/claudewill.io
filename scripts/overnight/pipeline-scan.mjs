/**
 * Pipeline Scanner — overnight agent
 *
 * Validates pipeline.json: removes stale items, flags stuck drafts,
 * archives old published items, reports pipeline health.
 *
 * No API keys needed.
 * Writes a markdown report to reports/pipeline-scan.md
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readPipeline, writePipeline } from '../lib/pipeline.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

function main() {
  const date = new Date().toISOString().split('T')[0]
  const now = new Date()

  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true })

  const pipeline = readPipeline()

  if (!pipeline.items.length) {
    const report = `# Pipeline Scan — claudewill.io\n**Date:** ${date}\n**Agent:** pipeline-scan\n**Type:** validation\n\n## Flags (Decisions Needed)\nNone.\n\n## Findings\nPipeline empty. No items to scan.\n\n## Details\n- Items: 0\n`
    writeFileSync(join(REPORTS_DIR, 'pipeline-scan.md'), report)
    console.log(`[${date}] Pipeline scan: empty pipeline.`)
    return
  }

  const flags = []
  const actions = []

  // Check for stuck drafts (draft for 7+ days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  for (const item of pipeline.items) {
    if (item.status === 'draft' && item.created) {
      const created = new Date(item.created)
      if (created < sevenDaysAgo) {
        const days = Math.floor((now - created) / (24 * 60 * 60 * 1000))
        flags.push(`${item.title}: draft for ${days} days — review or reject`)
      }
    }
  }

  // Check for approved items waiting too long (3+ days)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  for (const item of pipeline.items) {
    if (item.status === 'approved' && item.updated) {
      const updated = new Date(item.updated)
      if (updated < threeDaysAgo) {
        flags.push(`${item.title}: approved but not published for 3+ days`)
      }
    }
  }

  // Archive old published items (30+ days)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  let archived = 0
  for (const item of pipeline.items) {
    if (item.status === 'published' && item.publishedAt) {
      const published = new Date(item.publishedAt)
      if (published < thirtyDaysAgo) {
        item.status = 'archived'
        item.updated = now.toISOString()
        archived++
        actions.push(`Archived: ${item.title} (published ${Math.floor((now - published) / (24 * 60 * 60 * 1000))}d ago)`)
      }
    }
  }

  // Remove archived items from the manifest
  const before = pipeline.items.length
  pipeline.items = pipeline.items.filter(i => i.status !== 'archived')
  const removed = before - pipeline.items.length
  if (removed > 0) actions.push(`Removed ${removed} archived items`)

  if (archived > 0 || removed > 0) writePipeline(pipeline)

  // Count by status
  const counts = {}
  for (const item of pipeline.items) {
    counts[item.status] = (counts[item.status] || 0) + 1
  }

  // Build report
  let report = `# Pipeline Scan — claudewill.io\n`
  report += `**Date:** ${date}\n`
  report += `**Agent:** pipeline-scan\n`
  report += `**Type:** validation\n\n`

  report += `## Flags (Decisions Needed)\n`
  if (flags.length === 0) {
    report += `None.\n\n`
  } else {
    for (const f of flags) report += `- [ ] ${f}\n`
    report += `\n`
  }

  report += `## Findings\n`
  report += `**Pipeline:** ${pipeline.items.length} items`
  const parts = Object.entries(counts).map(([k, v]) => `${v} ${k}`)
  if (parts.length) report += ` (${parts.join(', ')})`
  report += `\n`
  if (actions.length) {
    report += `\n**Actions taken:**\n`
    for (const a of actions) report += `- ${a}\n`
  }
  report += `\n`

  report += `## Details\n`
  for (const item of pipeline.items) {
    report += `- ${item.id}: ${item.status} (${item.type})\n`
  }

  writeFileSync(join(REPORTS_DIR, 'pipeline-scan.md'), report)
  console.log(`[${date}] Pipeline scan: ${pipeline.items.length} items, ${flags.length} flags, ${archived} archived.`)
}

main()
