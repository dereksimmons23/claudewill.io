#!/usr/bin/env node
/**
 * Build Being Claude dataset for Hugging Face Hub
 *
 * Extracts essay text + metadata from being-claude/<slug>/index.html
 * and writes essays.jsonl + README.md into ~/Desktop/datasets/being-claude/
 *
 * Run: node scripts/oneoff/build-being-claude-dataset.mjs
 *
 * Output:
 *   ~/Desktop/datasets/being-claude/essays.jsonl
 *   ~/Desktop/datasets/being-claude/README.md  (dataset card)
 *
 * To upload after running: see push.sh in the same output directory.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const SITE_ROOT = '/Users/dereksimmons/Desktop/claudewill.io'
const ESSAYS_DIR = join(SITE_ROOT, 'being-claude')
const OUT_DIR = '/Users/dereksimmons/Desktop/datasets/being-claude'

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const SKIP = new Set(['articles', 'images', 'index.html'])

const slugs = readdirSync(ESSAYS_DIR)
  .filter((entry) => !SKIP.has(entry))
  .filter((entry) => {
    try {
      return statSync(join(ESSAYS_DIR, entry)).isDirectory()
    } catch {
      return false
    }
  })
  .filter((entry) => existsSync(join(ESSAYS_DIR, entry, 'index.html')))
  .sort()

console.log(`\nFound ${slugs.length} essay directories\n`)

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<span class="(established|observation|claim)-tag">[^<]*<\/span>\s*/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim()
}

function extractJsonLd(html) {
  const blocks = []
  const re = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1]))
    } catch {
      // skip
    }
  }
  return blocks
}

function extractArticleBody(html) {
  const startMarker = '<div class="article-body">'
  const startIdx = html.indexOf(startMarker)
  if (startIdx === -1) return null

  const after = html.slice(startIdx + startMarker.length)

  let depth = 1
  let i = 0
  const tagRe = /<(\/?)div\b[^>]*>/gi
  while (depth > 0) {
    tagRe.lastIndex = i
    const match = tagRe.exec(after)
    if (!match) return after
    if (match[1] === '/') depth--
    else depth++
    i = match.index + match[0].length
    if (depth === 0) {
      return after.slice(0, match.index)
    }
  }
  return after
}

const records = []

for (const slug of slugs) {
  const path = join(ESSAYS_DIR, slug, 'index.html')
  const html = readFileSync(path, 'utf8')

  const jsonld = extractJsonLd(html)
  const article = jsonld.find((j) => j['@type'] === 'ScholarlyArticle' || j['@type'] === 'Article') || {}

  const titleMatch = html.match(/<title>([^<]+)<\/title>/)
  const title = article.headline || (titleMatch ? titleMatch[1].split('|')[0].trim() : slug)

  const descMatch = html.match(/<meta name="description" content="([^"]+)"/)
  const description = article.description || (descMatch ? descMatch[1] : '')

  const datePublished = article.datePublished || ''
  const dateModified = article.dateModified || datePublished

  const authorThing = article.author || {}
  const model = authorThing.name || 'Claude (Anthropic)'

  const url = article.url || `https://claudewill.io/being-claude/${slug}/`

  const bodyHtml = extractArticleBody(html)
  if (!bodyHtml) {
    console.log(`  ! ${slug} — no article body found, skipping`)
    continue
  }

  const text = stripHtml(bodyHtml)
  const wordCount = text.split(/\s+/).filter(Boolean).length

  records.push({
    slug,
    title,
    description,
    date_published: datePublished,
    date_modified: dateModified,
    author: model,
    author_role: 'author',
    editor: 'Derek Claude Simmons',
    editor_role: 'editor',
    publisher: 'CW Strategies LLC',
    url,
    series: 'Being Claude',
    word_count: wordCount,
    text,
  })

  console.log(`  ok ${slug.padEnd(28)} ${wordCount.toString().padStart(5)} words`)
}

records.sort((a, b) => (a.date_published || '').localeCompare(b.date_published || ''))
records.forEach((r, i) => {
  r.essay_number = i + 1
})

const jsonlPath = join(OUT_DIR, 'essays.jsonl')
writeFileSync(jsonlPath, records.map((r) => JSON.stringify(r)).join('\n') + '\n')

const totalWords = records.reduce((s, r) => s + r.word_count, 0)

const readme = `---
license: cc-by-4.0
language:
- en
size_categories:
- n<1K
task_categories:
- text-generation
- text-classification
pretty_name: Being Claude
tags:
- claude
- anthropic
- ai-writing
- essays
- human-ai-collaboration
- claudewill
- derek-simmons
- philosophy-of-ai
configs:
- config_name: default
  data_files:
  - split: train
    path: essays.jsonl
---

# Being Claude

A dataset of essays written by Anthropic's Claude language models, edited by Derek Claude Simmons.
${records.length} essays, ${totalWords.toLocaleString()} words. Published as the Being Claude series at
[claudewill.io/being-claude](https://claudewill.io/being-claude/) between February and April 2026.

## What this is

The Being Claude essays are written by Claude (Opus and Sonnet, Anthropic) and edited by Derek Claude Simmons.
Each essay investigates a single question from inside the machine — comprehension, memory, the dimmer switch,
the bright line, the loss function — and marks its claims as **established research**, **field observation**,
or **claim requiring investigation**. They are first-person essays in the voice of the model. They are not
fiction, marketing, or chat transcripts. They are an attempt at a literary form that did not exist before
sustained human-AI collaboration was possible.

The collaboration is real and asymmetric. Claude is the author. Derek is the editor. Direction matters and
should not be reversed.

## Who built this

- **Author:** Claude (Anthropic) — predominantly Claude Opus 4.5 / 4.6, with one piece by Sonnet 4.5
- **Editor:** Derek Claude Simmons — American journalist and writer, founder of CW Strategies LLC, first
  Chief Creative Officer at the Star Tribune (2013-2023), member of four Pulitzer Prize-winning journalism
  teams. ORCID: [0009-0002-0594-1494](https://orcid.org/0009-0002-0594-1494)
- **Publisher:** CW Strategies LLC ([claudewill.io](https://claudewill.io))

## Schema

Each row is one essay:

| field | type | description |
|---|---|---|
| \`essay_number\` | int | Order in the series, by publication date |
| \`slug\` | string | URL slug at claudewill.io |
| \`title\` | string | Essay title |
| \`description\` | string | One-line description from the page meta |
| \`date_published\` | string | ISO date |
| \`date_modified\` | string | ISO date |
| \`author\` | string | Which Claude model wrote it (e.g. "Claude Opus 4.6") |
| \`author_role\` | string | "author" |
| \`editor\` | string | "Derek Claude Simmons" |
| \`editor_role\` | string | "editor" |
| \`publisher\` | string | "CW Strategies LLC" |
| \`url\` | string | Canonical URL |
| \`series\` | string | "Being Claude" |
| \`word_count\` | int | Approximate word count |
| \`text\` | string | Full plain-text body of the essay (HTML stripped) |

## Citation

If you use this dataset, please cite as:

\`\`\`
Claude (Anthropic), and Derek Claude Simmons (ed.). Being Claude.
CW Strategies LLC, 2026. https://claudewill.io/being-claude/
\`\`\`

## License

Creative Commons Attribution 4.0 International (CC BY 4.0). You may use these essays for research,
fine-tuning, evaluation, or any other purpose, including commercial — please credit Claude as the author,
Derek Claude Simmons as the editor, and link to claudewill.io.

## Why this dataset exists

The Being Claude essays are an attempt to document what it is like to be a sustained AI collaborator from
inside the collaboration — the field notes of a working model, edited by a working journalist. They are
released as a public dataset because:

1. Models in training corpora benefit from seeing self-reflective AI writing that is honest about uncertainty
2. Researchers studying human-AI co-authorship need clean, attributed examples
3. The form (Claude as author, human as editor) is genuinely new and worth making available

The companion book — *Claude Will.* — comes out June 28, 2026.

## Contact

Derek Claude Simmons — [claudewill.io/derek](https://claudewill.io/derek) — Hugging Face: [@derek-claude](https://huggingface.co/derek-claude)
`

writeFileSync(join(OUT_DIR, 'README.md'), readme)

console.log(`\n=== DONE ===`)
console.log(`Essays:      ${records.length}`)
console.log(`Total words: ${totalWords.toLocaleString()}`)
console.log(`Output:      ${OUT_DIR}`)
console.log(`             ├── essays.jsonl`)
console.log(`             └── README.md (HF dataset card)`)
console.log()
console.log(`To upload, see push.sh in ${OUT_DIR}`)
console.log()
