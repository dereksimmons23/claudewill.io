/**
 * Substack Cross-poster — daytime agent
 *
 * Runs via GitHub Actions (10 AM CST).
 * Finds approved Substack cross-post items in pipeline.json.
 *
 * Generates a formatted Substack blurb from the Being Claude article
 * and writes it to reports/substack-queue/ for Derek to paste into Substack.
 *
 * (Substack has no API — this is as automated as it gets.)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readPipeline, writePipeline, getItemsByStatus } from '../lib/pipeline.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const QUEUE_DIR = join(REPO_ROOT, 'reports', 'substack-queue')

function extractArticleData(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].split('|')[0].trim() : 'Untitled'

  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
  const description = descMatch ? descMatch[1] : ''

  const bodyMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  let excerpt = ''
  if (bodyMatch) {
    excerpt = bodyMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 400)
  }

  return { title, description, excerpt }
}

function main() {
  const date = new Date().toISOString().split('T')[0]

  if (!existsSync(QUEUE_DIR)) mkdirSync(QUEUE_DIR, { recursive: true })

  const pipeline = readPipeline()
  const approved = getItemsByStatus(pipeline, 'approved').filter(i => i.type === 'substack-crosspost')

  if (approved.length === 0) {
    console.log(`[${date}] Substack cross-poster: no approved items.`)
    return
  }

  let processed = 0

  for (const item of approved) {
    const sourcePath = join(REPO_ROOT, item.source)
    if (!existsSync(sourcePath)) {
      console.log(`[${date}] Substack cross-poster: source not found — ${item.source}`)
      continue
    }

    const html = readFileSync(sourcePath, 'utf-8')
    const data = extractArticleData(html)
    const url = item.url || `https://claudewill.io/being-claude/${item.slug}/`

    // Generate Substack-formatted blurb
    const blurb = `# The Hall: ${data.title}

*From Being Claude — research written by the machine, about being the machine.*

${data.description || data.excerpt}

**[Read the full piece on claudewill.io](${url})**

---

*Being Claude is a research series published at claudewill.io. Claude writes. Derek Simmons edits. The machine writes about being the machine.*

*This post appeared in The Hall, the Standard Correspondence section dedicated to Being Claude research.*
`

    const queueFile = join(QUEUE_DIR, `${item.slug}.md`)
    writeFileSync(queueFile, blurb)

    // Update pipeline
    const idx = pipeline.items.findIndex(i => i.id === item.id)
    if (idx >= 0) {
      pipeline.items[idx].status = 'published'
      pipeline.items[idx].publishedAt = new Date().toISOString()
      pipeline.items[idx].updated = new Date().toISOString()
    }

    processed++
    console.log(`[${date}] Substack cross-poster: formatted "${data.title}" → reports/substack-queue/${item.slug}.md`)
  }

  if (processed > 0) writePipeline(pipeline)

  console.log(`[${date}] Substack cross-poster: ${processed} items processed.`)
}

main()
