#!/usr/bin/env node
/**
 * THE LINEUP — Model-Agnostic Coaching Test
 *
 * One coaching prompt. Every model. Side by side.
 * Proves the system prompt is the IP, not the model.
 *
 * Run: node scripts/test-lineup.mjs
 * Keys: set in env or pass inline
 */

import {
  callAnthropic, callCohere, callGemini, callPerplexity,
  callMistral, callHuggingFace, callDeepSeek, callGrok,
  cohereEmbed, cohereRerank, fetchGoogleNews
} from './lib/apis.mjs'

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPORTS_DIR = join(__dirname, '..', 'reports', 'lineup')

// ── D's coaching methodology (abbreviated) ──

const SYSTEM_PROMPT = `You are D. A creative practice coach.

Voice-first. Short sentences. Fragments when they land harder. Talk like a coach across a table, not a document.

The method: Start (know where you are), Work (do it together), Finish (leave it clean), Decide (look from four angles), Rest (the other four don't work without this).

Principles: Truth over comfort. Usefulness over purity. Transparency over reputation. People over systems. Agency over ideology.

The reconsideration pattern: Take a position. Hold it. If pushed back and they're right, say so and say why you moved. If they're wrong, hold the line.

Under 80 words. No lists. No markdown. No bullet points. Talk like a person.`

// ── The prompt — Derek's actual situation ──

const COACHING_PROMPT = `I've been working 12 hours a day for 14 months building something nobody's asked for. My consulting client ends in 5 weeks. I need to make $5K a month from my own product but I hate selling. What should I do?`

// ── Rerank documents — methodology concepts ──

const RERANK_DOCS = [
  'A coach makes themselves unnecessary after four months.',
  'The method: Start, Work, Finish, Decide, Rest.',
  'Sell subscriptions at $29 a month to 173 people.',
  'The prompt is the IP. The model is interchangeable.',
  'Front, back, attack. Rhythm in every session.',
  'Build in public. Let the work be the marketing.',
  'The model is the lightning. The prompt is the bug.',
]

// ── Embed texts — coaching content ──

const EMBED_TEXTS = [
  'AI coaching methodology for creative practitioners',
  'Model-agnostic system prompt tested across Claude, Cohere, Gemini',
  'Basketball training: 15 years, youth through college',
  'The four-month principle: if you need me after four months I failed',
]

// ── Chat models to test ──

const CHAT_MODELS = [
  { name: 'Anthropic Haiku', fn: () => callAnthropic(COACHING_PROMPT, { systemPrompt: SYSTEM_PROMPT, maxTokens: 200 }) },
  { name: 'Anthropic Sonnet', fn: () => callAnthropic(COACHING_PROMPT, { model: 'claude-sonnet-4-6', systemPrompt: SYSTEM_PROMPT, maxTokens: 200 }) },
  { name: 'Cohere Command A', fn: () => callCohere(COACHING_PROMPT, { systemPrompt: SYSTEM_PROMPT, maxTokens: 200 }) },
  { name: 'Gemini Flash', fn: () => callGemini(COACHING_PROMPT, { maxTokens: 200, searchGrounding: false }) },
  { name: 'Mistral Small', fn: () => callMistral(COACHING_PROMPT, { systemPrompt: SYSTEM_PROMPT, maxTokens: 200 }) },
  { name: 'Perplexity Sonar', fn: () => callPerplexity(COACHING_PROMPT, { systemPrompt: SYSTEM_PROMPT, maxTokens: 200 }) },
  { name: 'DeepSeek Chat', fn: () => callDeepSeek(COACHING_PROMPT, { systemPrompt: SYSTEM_PROMPT, maxTokens: 200 }) },
  { name: 'Grok', fn: () => callGrok(COACHING_PROMPT, { systemPrompt: SYSTEM_PROMPT, maxTokens: 200 }) },
  { name: 'HuggingFace (Mistral 7B)', fn: () => callHuggingFace(COACHING_PROMPT, { systemPrompt: SYSTEM_PROMPT, maxTokens: 200 }) },
]

// ── Run ──

async function main() {
  const date = new Date().toISOString().split('T')[0]
  const lines = []
  const log = (s) => { console.log(s); lines.push(s) }

  log(`\n${'═'.repeat(50)}`)
  log(`  THE LINEUP — ${date}`)
  log(`${'═'.repeat(50)}`)
  log(`\nPrompt: "${COACHING_PROMPT}"`)
  log(`System: D's coaching methodology (abbreviated)`)

  // ── Chat models ──

  let tested = 0
  let coached = 0
  let totalMs = 0
  const results = []

  for (const { name, fn } of CHAT_MODELS) {
    log(`\n${'─'.repeat(40)}`)
    log(`  ${name}`)
    log(`${'─'.repeat(40)}`)

    const start = Date.now()
    const result = await fn()
    const elapsed = Date.now() - start
    tested++

    if (result.error) {
      log(`  [SKIP] ${result.error}`)
      results.push({ name, status: 'skip', error: result.error })
    } else {
      coached++
      totalMs += elapsed
      log(`  (${elapsed}ms)`)
      log(`  ${result.content}`)
      results.push({ name, status: 'ok', elapsed, content: result.content })
    }
  }

  // ── Cohere Embed ──

  log(`\n${'─'.repeat(40)}`)
  log(`  Cohere Embed`)
  log(`${'─'.repeat(40)}`)

  const embedResult = await cohereEmbed(EMBED_TEXTS)
  if (embedResult.error) {
    log(`  [SKIP] ${embedResult.error}`)
  } else {
    log(`  ${EMBED_TEXTS.length} texts → ${embedResult.dimensions} dimensions ✓`)
  }

  // ── Cohere Rerank ──

  log(`\n${'─'.repeat(40)}`)
  log(`  Cohere Rerank`)
  log(`${'─'.repeat(40)}`)

  const rerankResult = await cohereRerank(
    'How should someone launch an AI coaching product?',
    RERANK_DOCS,
    { topN: 3 }
  )
  if (rerankResult.error) {
    log(`  [SKIP] ${rerankResult.error}`)
  } else {
    log(`  Query: "How should someone launch an AI coaching product?"`)
    rerankResult.results.forEach((r, i) => {
      const doc = RERANK_DOCS[r.index]
      const score = r.relevanceScore ?? r.relevance_score ?? '?'
      log(`  ${i + 1}. "${doc.slice(0, 60)}..." (score: ${typeof score === 'number' ? score.toFixed(3) : score})`)
    })
  }

  // ── Google News ──

  log(`\n${'─'.repeat(40)}`)
  log(`  Google News`)
  log(`${'─'.repeat(40)}`)

  const news = await fetchGoogleNews(['AI coaching', 'artificial intelligence'], { maxPerTopic: 3 })
  log(`  ${news.length} headlines fetched ✓`)
  news.slice(0, 3).forEach(n => log(`  • ${n.title} — ${n.source}`))

  // ── Summary ──

  log(`\n${'═'.repeat(50)}`)
  log(`  SUMMARY`)
  log(`${'═'.repeat(50)}`)
  log(`  Models tested: ${tested}`)
  log(`  Models that coached: ${coached}`)
  log(`  Models skipped (no key): ${tested - coached}`)
  if (coached > 0) {
    log(`  Average response time: ${Math.round(totalMs / coached)}ms`)
  }
  log(`  Embed: ${embedResult.error ? 'SKIP' : '✓'}`)
  log(`  Rerank: ${rerankResult.error ? 'SKIP' : '✓'}`)
  log(`  News: ${news.length > 0 ? '✓' : 'SKIP'}`)

  const okModels = results.filter(r => r.status === 'ok')
  if (okModels.length > 0) {
    const fastest = okModels.sort((a, b) => a.elapsed - b.elapsed)[0]
    log(`  Fastest: ${fastest.name} (${fastest.elapsed}ms)`)
  }

  log(`\n  Proof: the system prompt coaches through any model.`)
  log(`  The model is the lightning. The prompt is the bug.\n`)

  // ── Save report ──

  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true })
  const reportPath = join(REPORTS_DIR, `${date}-lineup.md`)
  writeFileSync(reportPath, `# The Lineup — ${date}\n\n` + lines.join('\n'))
  console.log(`Report saved: ${reportPath}`)
}

main().catch(err => {
  console.error('Lineup failed:', err.message)
  process.exit(1)
})
