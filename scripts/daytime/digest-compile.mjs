/**
 * Digest Compiler — daytime agent
 *
 * Runs Thursday 8 AM CST via GitHub Actions.
 * Scans pipeline.json for items published in the last 7 days.
 * Compiles a weekly digest draft for Standard Correspondence.
 *
 * Output: reports/digest/week-of-YYYY-MM-DD.md
 * Also adds a digest entry to pipeline.json for Derek to review.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readPipeline, writePipeline, upsertItem, findItem } from '../lib/pipeline.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const DIGEST_DIR = join(REPO_ROOT, 'reports', 'digest')

function main() {
  const now = new Date()
  const date = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  if (!existsSync(DIGEST_DIR)) mkdirSync(DIGEST_DIR, { recursive: true })

  const pipeline = readPipeline()

  // Find items published in the last 7 days
  const recent = pipeline.items.filter(function (item) {
    if (item.status !== 'published' || !item.publishedAt) return false
    return new Date(item.publishedAt) >= weekAgo
  })

  // Group by type
  const linkedin = recent.filter(i => i.type === 'linkedin')
  const hall = recent.filter(i => i.type === 'substack-crosspost')
  const other = recent.filter(i => i.type !== 'linkedin' && i.type !== 'substack-crosspost')

  // Check if digest already exists for this week
  const digestId = `digest-${date}`
  if (findItem(pipeline, digestId)) {
    console.log(`[${date}] Digest compiler: digest already exists for this week.`)
    return
  }

  if (recent.length === 0) {
    console.log(`[${date}] Digest compiler: no published items this week. Skipping.`)
    return
  }

  // Build digest markdown
  let digest = `# Standard Correspondence — Weekly Digest\n`
  digest += `**Week of ${date}**\n\n`
  digest += `---\n\n`

  // Lead with the most interesting item (Being Claude > LinkedIn > other)
  const lead = hall[0] || linkedin[0] || other[0]
  if (lead) {
    const leadTitle = lead.title.replace('LinkedIn: ', '').replace('The Hall: ', '')
    digest += `## ${leadTitle}\n\n`
    if (lead.url) {
      digest += `[Read the full piece](${lead.url})\n\n`
    }
    digest += `*Lead item for this week's email. Write a 2-3 sentence introduction above.*\n\n`
    digest += `---\n\n`
  }

  // Other sections
  if (hall.length > 0) {
    digest += `### From The Hall\n\n`
    digest += `*Being Claude research — the machine writes about being the machine.*\n\n`
    for (const item of hall) {
      const title = item.title.replace('The Hall: ', '')
      digest += `- **${title}**`
      if (item.url) digest += ` — [read](${item.url})`
      digest += `\n`
    }
    digest += `\n`
  }

  if (linkedin.length > 0) {
    digest += `### From LinkedIn\n\n`
    digest += `*CW Strategies company page highlights.*\n\n`
    for (const item of linkedin) {
      const title = item.title.replace('LinkedIn: ', '')
      digest += `- **${title}**\n`
    }
    digest += `\n`
  }

  if (other.length > 0) {
    digest += `### Other\n\n`
    for (const item of other) {
      digest += `- **${item.title}**\n`
    }
    digest += `\n`
  }

  digest += `---\n\n`
  digest += `*Standard Correspondence is the media arm of Derek Simmons. Published weekly.*\n`
  digest += `\n`
  digest += `**Status:** Draft — needs Derek's lead piece (The Dispatch) and review.\n`

  // Write digest file
  const digestFile = join(DIGEST_DIR, `week-of-${date}.md`)
  writeFileSync(digestFile, digest)

  // Add to pipeline
  upsertItem(pipeline, {
    id: digestId,
    type: 'digest',
    channel: 'standard-correspondence',
    title: `Weekly Digest: ${date}`,
    source: `reports/digest/week-of-${date}.md`,
    status: 'draft',
  })
  writePipeline(pipeline)

  console.log(`[${date}] Digest compiler: compiled ${recent.length} items into weekly digest.`)
}

main()
