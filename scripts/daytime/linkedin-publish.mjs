/**
 * LinkedIn Publisher — daytime agent
 *
 * Runs via GitHub Actions (9 AM CST, Mon-Fri).
 * Finds approved LinkedIn items in pipeline.json.
 *
 * Phase 1: No LinkedIn API — writes ready-to-post files to reports/linkedin-queue/
 * Phase 2: When LinkedIn API credentials exist, posts directly and logs to CW Brief worker.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readPipeline, writePipeline, getItemsByStatus } from '../lib/pipeline.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const QUEUE_DIR = join(REPO_ROOT, 'reports', 'linkedin-queue')

const CW_BRIEF_URL = process.env.CW_BRIEF_URL
const CW_BRIEF_AUTH = process.env.CW_BRIEF_AUTH

async function logToBrief(title) {
  if (!CW_BRIEF_URL || !CW_BRIEF_AUTH) return
  try {
    await fetch(`${CW_BRIEF_URL}/content/linkedin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Worker-Key': CW_BRIEF_AUTH,
      },
      body: JSON.stringify({ title, date: new Date().toISOString() }),
      signal: AbortSignal.timeout(10000),
    })
  } catch { /* non-critical */ }
}

async function main() {
  const date = new Date().toISOString().split('T')[0]

  if (!existsSync(QUEUE_DIR)) mkdirSync(QUEUE_DIR, { recursive: true })

  const pipeline = readPipeline()
  const approved = getItemsByStatus(pipeline, 'approved').filter(i => i.type === 'linkedin')

  if (approved.length === 0) {
    console.log(`[${date}] LinkedIn publisher: no approved items.`)
    return
  }

  // Process one item per run (daily cadence)
  const item = approved[0]
  const sourcePath = join(REPO_ROOT, item.source)

  if (!existsSync(sourcePath)) {
    console.log(`[${date}] LinkedIn publisher: source not found — ${item.source}`)
    return
  }

  const content = readFileSync(sourcePath, 'utf-8')

  // Extract post body (after ---)
  const parts = content.split('---')
  const postBody = parts.length > 1 ? parts.slice(1).join('---').trim() : content.trim()

  // Phase 1: Write to queue for manual posting
  const queueFile = join(QUEUE_DIR, `${item.slug || item.id}.md`)
  const queueContent = `# Ready to Post: ${item.title}\n**Date:** ${date}\n**Channel:** CW Strategies LLC company page\n**Status:** Approved — post manually or wait for API automation\n\n---\n\n${postBody}\n`
  writeFileSync(queueFile, queueContent)

  // Update pipeline status
  const idx = pipeline.items.findIndex(i => i.id === item.id)
  if (idx >= 0) {
    pipeline.items[idx].status = 'published'
    pipeline.items[idx].publishedAt = new Date().toISOString()
    pipeline.items[idx].updated = new Date().toISOString()
    pipeline.items[idx].publishedUrl = queueFile
  }
  writePipeline(pipeline)

  // Log to CW Brief worker
  await logToBrief(item.title)

  console.log(`[${date}] LinkedIn publisher: queued "${item.title}" for posting.`)
}

main().catch((err) => {
  console.error(`LinkedIn publisher failed: ${err.message}`)
  process.exit(1)
})
