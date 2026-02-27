/**
 * Social Draft Agent — claudewill.io
 *
 * Runs nightly via GitHub Actions. For each published Being Claude
 * article, generates a LinkedIn company page post draft via Gemini.
 *
 * Idempotent — skips articles that already have drafts.
 * Writes individual drafts to reports/social-drafts/{slug}.md
 * Writes a summary report to reports/social-draft.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readPipeline, writePipeline, upsertItem, findItem } from '../lib/pipeline.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')
const DRAFTS_DIR = join(REPORTS_DIR, 'social-drafts')

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const BEING_CLAUDE_DIR = join(REPO_ROOT, 'being-claude')

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

function getPublishedArticles() {
  if (!existsSync(BEING_CLAUDE_DIR)) return []

  const redirectBlocks = getRedirectBlocks()
  const articles = []

  for (const entry of readdirSync(BEING_CLAUDE_DIR)) {
    const full = join(BEING_CLAUDE_DIR, entry)
    if (!statSync(full).isDirectory()) continue

    const slug = entry
    const indexHtml = join(full, 'index.html')
    if (!existsSync(indexHtml)) continue

    // Skip blocked articles
    if (redirectBlocks.has(`/being-claude/${slug}`) || redirectBlocks.has(`/being-claude/${slug}/`)) continue

    const html = readFileSync(indexHtml, 'utf-8')

    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].split('|')[0].trim() : slug

    // Extract meta description
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
    const description = descMatch ? descMatch[1] : ''

    // Extract first ~500 chars of visible body text
    const bodyMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    let excerpt = ''
    if (bodyMatch) {
      excerpt = bodyMatch[1]
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 500)
    }

    articles.push({ slug, title, description, excerpt })
  }
  return articles
}

async function generateDraft(article) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

  const prompt = `Write a LinkedIn company page post for CW Strategies LLC promoting this Being Claude research article.

Article title: "${article.title}"
Description: "${article.description}"
Excerpt: "${article.excerpt}"
URL: https://claudewill.io/being-claude/${article.slug}/

Requirements:
- Professional but not corporate. Direct, clear voice.
- Under 150 words for the post body.
- No emojis.
- Include the article URL.
- Frame: CW Strategies publishes Being Claude — a research series written by Claude about the experience of being an AI. Derek Simmons edits. The machine writes about being the machine.
- Add 3-5 relevant hashtags at the end (separate line). Use from: #claudewill #beingclaude #builtbyclaudes #themethod #truthovercomfort #airesearch #artificialintelligence
- Output ONLY the post text. No preamble, no explanation.`

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 500, temperature: 0.4 },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown')
    throw new Error(`Gemini API ${res.status}: ${errText}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('No text in Gemini response')

  return text.trim()
}

// ── Main ─────────────────────────────────────────────

async function main() {
  const date = new Date().toISOString().split('T')[0]

  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true })
  if (!existsSync(DRAFTS_DIR)) mkdirSync(DRAFTS_DIR, { recursive: true })

  if (!GEMINI_API_KEY) {
    const report = `# Social Drafts — claudewill.io\n**Date:** ${date}\n**Agent:** social-draft\n**Type:** content\n\n## Flags (Decisions Needed)\nNone.\n\n## Findings\nSocial draft agent not configured — add GEMINI_API_KEY to GitHub secrets.\n\n## Details\nNo API key available.\n`
    writeFileSync(join(REPORTS_DIR, 'social-draft.md'), report)
    console.log(`[${date}] Social drafts skipped — no API key.`)
    return
  }

  const articles = getPublishedArticles()
  const generated = []
  const skipped = []
  const errors = []

  for (const article of articles) {
    const draftPath = join(DRAFTS_DIR, `${article.slug}.md`)

    // Idempotent — skip if draft exists
    if (existsSync(draftPath)) {
      skipped.push(article.slug)
      continue
    }

    try {
      const draft = await generateDraft(article)
      const draftContent = `# LinkedIn Draft: ${article.title}\n**Generated:** ${date}\n**URL:** https://claudewill.io/being-claude/${article.slug}/\n**Status:** Review needed\n\n---\n\n${draft}\n`
      writeFileSync(draftPath, draftContent)
      generated.push(article.slug)
    } catch (err) {
      errors.push({ slug: article.slug, error: err.message })
    }
  }

  // Seed pipeline manifest
  const pipeline = readPipeline()
  for (const slug of generated) {
    const itemId = `linkedin-${slug}`
    if (!findItem(pipeline, itemId)) {
      upsertItem(pipeline, {
        id: itemId,
        type: 'linkedin',
        channel: 'cw-company',
        title: `LinkedIn: ${articles.find(a => a.slug === slug)?.title || slug}`,
        source: `reports/social-drafts/${slug}.md`,
        status: 'draft',
        slug,
      })
    }
  }
  writePipeline(pipeline)

  // Build summary report
  let report = `# Social Drafts — claudewill.io\n`
  report += `**Date:** ${date}\n`
  report += `**Agent:** social-draft\n`
  report += `**Type:** content\n\n`

  report += `## Flags (Decisions Needed)\n`
  if (generated.length > 0) {
    for (const slug of generated) {
      report += `- [ ] Review draft: reports/social-drafts/${slug}.md\n`
    }
    report += `\n`
  } else if (errors.length > 0) {
    for (const e of errors) report += `- [ ] Failed to generate draft for ${e.slug}: ${e.error}\n`
    report += `\n`
  } else {
    report += `None.\n\n`
  }

  report += `## Findings\n`
  report += `**Published articles:** ${articles.length}\n`
  report += `**New drafts generated:** ${generated.length}\n`
  report += `**Skipped (already drafted):** ${skipped.length}\n`
  if (errors.length > 0) report += `**Errors:** ${errors.length}\n`
  report += `\n`

  report += `## Details\n`
  for (const slug of generated) report += `- ${slug}: NEW draft generated\n`
  for (const slug of skipped) report += `- ${slug}: skipped (draft exists)\n`
  for (const e of errors) report += `- ${e.slug}: ERROR — ${e.error}\n`

  writeFileSync(join(REPORTS_DIR, 'social-draft.md'), report)
  console.log(`[${date}] Social drafts complete. ${generated.length} new, ${skipped.length} skipped, ${errors.length} errors.`)
}

main().catch((err) => {
  console.error(`Social draft agent failed: ${err.message}`)
  const date = new Date().toISOString().split('T')[0]
  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true })
  const failReport = `# Social Drafts — claudewill.io\n**Date:** ${date}\n**Agent:** social-draft\n**Type:** content\n\n## Flags (Decisions Needed)\n- [ ] Social draft agent failed: ${err.message}\n\n## Findings\nAgent error.\n\n## Details\n${err.stack || 'No stack trace'}\n`
  writeFileSync(join(REPORTS_DIR, 'social-draft.md'), failReport)
  process.exit(1)
})
