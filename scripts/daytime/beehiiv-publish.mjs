/**
 * Beehiiv Publisher — Standard Correspondence
 *
 * Takes a markdown file from writing/distro/standard-correspondence/
 * and publishes it to Beehiiv as a scheduled draft.
 *
 * Usage:
 *   node scripts/daytime/beehiiv-publish.mjs issue-01-apr29.md
 *   node scripts/daytime/beehiiv-publish.mjs issue-01-apr29.md --send-at "2026-04-29T14:00:00Z"
 *
 * Env vars required:
 *   BEEHIIV_API_KEY      — from Beehiiv Settings → Integrations → API
 *   BEEHIIV_PUB_ID       — publication ID (e.g. pub_xxxxxxxx)
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const CONTENT_DIR = join(process.env.HOME, 'Desktop', 'writing', 'distro', 'standard-correspondence')

const API_KEY = process.env.BEEHIIV_API_KEY
const PUB_ID = process.env.BEEHIIV_PUB_ID
const BASE_URL = 'https://api.beehiiv.com/v2'

// ── Parse CLI args ──
const args = process.argv.slice(2)
const filename = args.find(a => !a.startsWith('--'))
const sendAtArg = args.find(a => a.startsWith('--send-at='))?.split('=')[1]
  || args[args.indexOf('--send-at') + 1]

if (!filename) {
  console.error('Usage: node beehiiv-publish.mjs <issue-file.md> [--send-at "ISO8601"]')
  process.exit(1)
}

if (!API_KEY || !PUB_ID) {
  console.error('Missing BEEHIIV_API_KEY or BEEHIIV_PUB_ID env vars')
  process.exit(1)
}

// ── Parse markdown into newsletter sections ──
function parseIssue(md) {
  const lines = md.split('\n')

  // Subject line from frontmatter
  const subjectLine = lines.find(l => l.startsWith('**Subject:**'))
  const subject = subjectLine
    ? subjectLine.replace('**Subject:**', '').trim()
    : lines.find(l => l.startsWith('# '))?.replace('# ', '').trim() || 'Standard Correspondence'

  // Strip frontmatter block (lines 1-6)
  const contentStart = lines.findIndex((l, i) => i > 2 && l === '---') + 1
  const body = lines.slice(contentStart).join('\n').trim()

  return { subject, body }
}

// ── Convert markdown to Beehiiv-compatible HTML ──
function markdownToHtml(md) {
  return md
    // Headers
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic / em
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Em dash separator lines
    .replace(/^---$/gm, '<hr>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Em dash shorthand
    .replace(/^—$/gm, '<p>—</p>')
    // Bullet lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Paragraphs — blank line separated
    .split(/\n\n+/)
    .map(block => {
      block = block.trim()
      if (!block) return ''
      if (block.startsWith('<h') || block.startsWith('<hr') || block.startsWith('<ul')) return block
      return `<p>${block.replace(/\n/g, '<br>')}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

// ── Beehiiv API: create post ──
async function createPost({ subject, htmlBody, sendAt }) {
  const payload = {
    subject,
    content: {
      type: 'html',
      value: htmlBody,
    },
    status: sendAt ? 'scheduled' : 'draft',
    ...(sendAt && { scheduled_at: sendAt }),
    audience: 'free', // send to all free subscribers
    content_tags: ['standard-correspondence'],
  }

  const res = await fetch(`${BASE_URL}/publications/${PUB_ID}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('Beehiiv API error:', JSON.stringify(data, null, 2))
    process.exit(1)
  }

  return data
}

// ── Main ──
async function main() {
  const filePath = join(CONTENT_DIR, filename)

  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
  }

  const md = readFileSync(filePath, 'utf-8')
  const { subject, body } = parseIssue(md)
  const htmlBody = markdownToHtml(body)

  console.log(`Publishing: "${subject}"`)
  if (sendAtArg) console.log(`Scheduled for: ${sendAtArg}`)

  const result = await createPost({
    subject,
    htmlBody,
    sendAt: sendAtArg || null,
  })

  const postId = result.data?.id || result.id
  const webUrl = result.data?.web_url || result.web_url || ''

  console.log(`✓ Created post: ${postId}`)
  if (webUrl) console.log(`  Preview: ${webUrl}`)
  console.log(`  Status: ${sendAtArg ? 'scheduled' : 'draft'}`)
}

main().catch(err => {
  console.error('Publisher error:', err.message)
  process.exit(1)
})
