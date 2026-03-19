/**
 * The Morning Edition — claudewill.io
 *
 * A curated AI newspaper. Multiple sources, multiple models,
 * one readable output. Replaces: gemini-brief, research-brief,
 * code-review, content-scan, research-status, social-draft.
 *
 * Sources:
 *   - Google News RSS (free, no key) → headlines
 *   - Perplexity sonar (search-grounded) → AI deep dive
 *   - Gemini Flash (search-grounded) → business & media
 *   - Mistral (free tier) → "the practice" synthesis
 *   - Cohere rerank (optional) → smart curation
 *
 * Output: reports/morning-edition.md
 * No dependencies — uses native fetch (Node 22).
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import {
  callGemini, callPerplexity, callMistral,
  cohereRerank, fetchGoogleNews, dedupeHeadlines,
} from '../lib/apis.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

const DATE = new Date().toISOString().split('T')[0]
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_NAME = DAY_NAMES[new Date().getDay()]

function writeReport(content) {
  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(join(REPORTS_DIR, 'morning-edition.md'), content)
}

// ─── Section Builders ──────────────────────────────────────────────

async function buildHeadlines() {
  console.log('  [headlines] Fetching Google News RSS...')
  const raw = await fetchGoogleNews([
    'artificial intelligence',
    'AI startup funding',
    'media industry news',
    'Anthropic Claude OpenAI',
    'technology business',
  ], { maxPerTopic: 6 })

  let headlines = dedupeHeadlines(raw)

  // Try Cohere rerank if available — sort by relevance to Derek's work
  if (process.env.COHERE_API_KEY && headlines.length > 10) {
    console.log('  [headlines] Reranking with Cohere...')
    const docs = headlines.map(h => `${h.title} — ${h.source}`)
    const reranked = await cohereRerank(
      'AI consulting, media industry, digital strategy, human-AI collaboration, creative practice, journalism, Anthropic Claude',
      docs,
      { topN: 12 }
    )
    if (reranked.results) {
      headlines = reranked.results.map(r => headlines[r.index])
    }
  } else {
    headlines = headlines.slice(0, 12)
  }

  console.log(`  [headlines] ${headlines.length} headlines curated.`)
  return headlines
}

async function buildAIDeepDive() {
  console.log('  [ai] Calling Perplexity...')
  const result = await callPerplexity(
    `What are the 3-5 most significant AI developments in the last 24 hours? Focus on:
- New model releases, benchmarks, or capabilities
- AI company funding, acquisitions, or strategic moves
- AI policy, regulation, or governance developments
- Tools or frameworks that change how people build with AI

For each development: one headline sentence, then 2-3 sentences of substance. Include specific names, numbers, dates. Skip rumors and speculation.`,
    {
      systemPrompt: 'You are a senior technology reporter. Write like a wire service: facts first, analysis second, no filler. Every sentence earns its space.',
    }
  )

  if (result.error) {
    console.log(`  [ai] ${result.error}`)
    return { content: null, citations: [], error: result.error }
  }

  console.log(`  [ai] Done. ${result.citations.length} citations.`)
  return { content: result.content, citations: result.citations, error: null }
}

async function buildBusinessMedia() {
  console.log('  [business] Calling Gemini with Search grounding...')
  const result = await callGemini(
    `What are today's most important developments in business and media? Focus on:
- Media companies: layoffs, acquisitions, strategy shifts, new products
- Technology business: major deals, IPOs, earnings, market moves
- Digital strategy: new platforms, business model innovations
- The intersection of AI and media/business

Report 4-6 items. For each: headline, 2-3 sentences of substance, and why it matters for a digital strategy consultant. Be specific with numbers and names.`,
    {
      searchGrounding: true,
      temperature: 0.2,
    }
  )

  if (result.error) {
    console.log(`  [business] ${result.error}`)
    return { content: null, sources: [], error: result.error }
  }

  console.log(`  [business] Done. ${result.sources.length} sources.`)
  return { content: result.content, sources: result.sources, error: null }
}

async function buildPracticeAnalysis(aiContent, businessContent, headlines) {
  console.log('  [practice] Calling Mistral for synthesis...')

  // Build context from what we've gathered
  const headlineText = headlines.slice(0, 8).map(h => `- ${h.title} (${h.source})`).join('\n')
  const context = [
    headlineText ? `Today's headlines:\n${headlineText}` : '',
    aiContent ? `AI developments:\n${aiContent.slice(0, 1500)}` : '',
    businessContent ? `Business & media:\n${businessContent.slice(0, 1500)}` : '',
  ].filter(Boolean).join('\n\n')

  if (!context) {
    return { content: 'No source material available for synthesis.', error: null }
  }

  const result = await callMistral(
    `You are the morning analyst for a solo digital strategy and AI consulting practice (CW Strategies). The consultant has 30 years in media (Star Tribune, LA Times), now builds AI-native workflows for clients.

Based on today's developments below, write 3-5 bullet points answering: "What does this mean for the practice today?"

Rules:
- Each bullet: one sentence, specific and actionable
- Connect developments to real work: client proposals, positioning, content ideas, competitive landscape
- Flag anything that changes the game, not just makes noise
- If nothing moves the needle today, say so in one line

${context}`,
    {
      systemPrompt: 'You are a strategic business analyst. Every sentence must be actionable. No filler, no hedging, no "it remains to be seen." Say what to do.',
      temperature: 0.4,
    }
  )

  if (result.error) {
    console.log(`  [practice] ${result.error}`)
    return { content: null, error: result.error }
  }

  console.log('  [practice] Done.')
  return { content: result.content, error: null }
}

// ─── Compile the Paper ─────────────────────────────────────────────

async function main() {
  console.log(`[${DATE}] The Morning Edition — building...`)

  // Call all sources in parallel
  const [headlines, ai, business] = await Promise.all([
    buildHeadlines(),
    buildAIDeepDive(),
    buildBusinessMedia(),
  ])

  // Practice analysis depends on the above
  const practice = await buildPracticeAnalysis(
    ai.content,
    business.content,
    headlines
  )

  // ─── Compose the paper ───────────────────────────────────────────

  let paper = ''
  const errors = []

  paper += `# The Morning Edition\n`
  paper += `### ${DAY_NAME}, ${DATE}\n`
  paper += `**Agent:** morning-edition\n`
  paper += `**Type:** newspaper\n\n`
  paper += `---\n\n`

  // Front Page — top headline
  if (headlines.length > 0) {
    const lead = headlines[0]
    paper += `## Front Page\n\n`
    paper += `> **${lead.title}**\n`
    paper += `> — ${lead.source}\n\n`
  }

  // Headlines
  if (headlines.length > 1) {
    paper += `## Headlines\n\n`
    for (const h of headlines.slice(1)) {
      paper += `- **${h.title}** — ${h.source}\n`
    }
    paper += `\n`
  }

  paper += `---\n\n`

  // AI & Technology
  paper += `## AI & Technology\n\n`
  if (ai.content) {
    paper += `${ai.content}\n\n`
    if (ai.citations.length > 0) {
      paper += `*Sources: ${ai.citations.slice(0, 5).join(', ')}*\n\n`
    }
  } else {
    paper += `*Section unavailable: ${ai.error}*\n\n`
    errors.push(ai.error)
  }

  paper += `---\n\n`

  // Business & Media
  paper += `## Business & Media\n\n`
  if (business.content) {
    paper += `${business.content}\n\n`
    if (business.sources.length > 0) {
      paper += `*Sources: ${business.sources.slice(0, 5).map(s => `[${s.title}](${s.url})`).join(', ')}*\n\n`
    }
  } else {
    paper += `*Section unavailable: ${business.error}*\n\n`
    errors.push(business.error)
  }

  paper += `---\n\n`

  // The Practice
  paper += `## The Practice\n\n`
  paper += `*What this means for CW Strategies today:*\n\n`
  if (practice.content) {
    paper += `${practice.content}\n\n`
  } else {
    paper += `*Section unavailable: ${practice.error}*\n\n`
    errors.push(practice.error)
  }

  paper += `---\n\n`

  // Masthead
  paper += `## Masthead\n\n`
  paper += `| Section | Source | Status |\n`
  paper += `|---------|--------|--------|\n`
  paper += `| Headlines | Google News RSS | ${headlines.length} items |\n`
  paper += `| AI & Tech | Perplexity sonar | ${ai.content ? 'ok' : ai.error} |\n`
  paper += `| Business | Gemini Flash (search) | ${business.content ? 'ok' : business.error} |\n`
  paper += `| The Practice | Mistral Small | ${practice.content ? 'ok' : practice.error} |\n`
  paper += `| Curation | Cohere rerank | ${process.env.COHERE_API_KEY ? 'active' : 'not configured'} |\n`

  // Flags for kitchen-data compatibility
  if (errors.length > 0) {
    paper += `\n## Flags (Decisions Needed)\n\n`
    for (const e of errors) {
      paper += `- [ ] ${e}\n`
    }
  } else {
    paper += `\n## Flags (Decisions Needed)\n\nNone.\n`
  }

  paper += `\n## Findings\n\n`
  paper += `${headlines.length} headlines curated across 5 topics. `
  paper += `${ai.citations?.length || 0} AI citations. `
  paper += `${business.sources?.length || 0} business sources.\n`

  writeReport(paper)
  console.log(`[${DATE}] Morning Edition published. ${headlines.length} headlines, ${errors.length} errors.`)
}

main().catch(err => {
  const fallback = `# The Morning Edition\n**Date:** ${DATE}\n**Agent:** morning-edition\n**Type:** newspaper\n\n## Flags (Decisions Needed)\n- [ ] Morning Edition failed: ${err.message}\n\n## Findings\nAgent error.\n`
  writeReport(fallback)
  console.error(`Morning Edition failed: ${err.message}`)
  process.exit(1)
})
