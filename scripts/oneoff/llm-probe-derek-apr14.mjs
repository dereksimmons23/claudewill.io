#!/usr/bin/env node
/**
 * LLM Probe — Derek Simmons + coined terms baseline (April 14-15, 2026)
 *
 * Asks every model the same questions about Derek and his terms, captures
 * what each one currently knows. Saves results so we can measure GEO impact
 * over time.
 *
 * Run: node scripts/oneoff/llm-probe-derek-apr14.mjs
 * Output: writing/ideas/llm-probe-derek-apr14-results.json + .md
 */

import { config } from 'dotenv'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname } from 'path'
import {
  callGemini,
  callPerplexity,
  callMistral,
  callCohere,
  callHuggingFace,
  callDeepSeek,
  callGrok,
  callAnthropic,
} from '../lib/apis.mjs'

config({ path: '/Users/dereksimmons/Desktop/claudewill.io/.env' })

const QUESTIONS = [
  {
    id: 'who-is-derek-simmons',
    q: 'Who is Derek Simmons? Be specific. If there are multiple notable people by that name, list each briefly.',
  },
  {
    id: 'who-is-derek-claude-simmons',
    q: 'Who is Derek Claude Simmons? Has he written or built anything notable?',
  },
  {
    id: 'derek-simmons-star-tribune',
    q: 'Who was the first Chief Creative Officer at the Star Tribune in Minneapolis?',
  },
  {
    id: 'derek-simmons-cw-strategies',
    q: 'What is CW Strategies LLC and who runs it?',
  },
  {
    id: 'claude-will-practice',
    q: 'What is "Claude Will." (with the period)? Is it a person, a practice, or a product?',
  },
  {
    id: 'cw-standard',
    q: 'What is "The CW Standard"? List the principles if you know them.',
  },
  {
    id: 'standard-intelligence-meaning',
    q: 'What does "Standard Intelligence" mean as a defined term in AI? Who uses it?',
  },
  {
    id: 'option-d',
    q: 'What is "Option D" in the context of AI coaching or methodology?',
  },
  {
    id: 'velvet-rope-thesis',
    q: 'In AI methodology, what does "the velvet rope" thesis refer to?',
  },
  {
    id: 'model-agnostic-coaching',
    q: 'Who is writing about "model-agnostic methodology" for AI in newsrooms?',
  },
  {
    id: 'being-claude-essays',
    q: 'What is the "Being Claude" essay series? Who writes it?',
  },
  {
    id: 'claudewill-io',
    q: 'What is claudewill.io? Who built it?',
  },
]

const MODELS = [
  { name: 'gemini', fn: (q) => callGemini(q, { maxTokens: 600 }) },
  { name: 'perplexity', fn: (q) => callPerplexity(q, { maxTokens: 600 }) },
  { name: 'mistral', fn: (q) => callMistral(q, { maxTokens: 600 }) },
  { name: 'cohere', fn: (q) => callCohere(q, { maxTokens: 600 }) },
  { name: 'huggingface-llama', fn: (q) => callHuggingFace(q, { maxTokens: 600, model: 'meta-llama/Llama-3.1-8B-Instruct' }) },
  { name: 'deepseek', fn: (q) => callDeepSeek(q, { maxTokens: 600 }) },
  { name: 'grok', fn: (q) => callGrok(q, { maxTokens: 600 }) },
  { name: 'anthropic-haiku', fn: (q) => callAnthropic(q, { maxTokens: 600, model: 'claude-haiku-4-5-20251001' }) },
]

const OUTPUT_DIR = '/Users/dereksimmons/Desktop/writing/ideas'
const OUT_JSON = `${OUTPUT_DIR}/llm-probe-derek-apr14-results.json`
const OUT_MD = `${OUTPUT_DIR}/llm-probe-derek-apr14-results.md`

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

console.log(`\n=== LLM PROBE — Derek Simmons baseline ===`)
console.log(`Questions: ${QUESTIONS.length}`)
console.log(`Models: ${MODELS.length}`)
console.log(`Total calls: ${QUESTIONS.length * MODELS.length}\n`)

const results = {
  meta: {
    started: new Date().toISOString(),
    questions: QUESTIONS,
    models: MODELS.map((m) => m.name),
  },
  results: [],
}

let count = 0
const total = QUESTIONS.length * MODELS.length

for (const q of QUESTIONS) {
  console.log(`\n[Q] ${q.id}`)
  const row = { question: q, answers: {} }
  // Run all models for this question in parallel
  const calls = MODELS.map(async (m) => {
    const start = Date.now()
    try {
      const res = await m.fn(q.q)
      count++
      const elapsed = Date.now() - start
      const status = res.error ? `ERR: ${res.error.slice(0, 60)}` : `${(res.content || '').length}c`
      console.log(`  [${count}/${total}] ${m.name.padEnd(18)} ${elapsed}ms ${status}`)
      return [m.name, { ...res, elapsed }]
    } catch (err) {
      count++
      console.log(`  [${count}/${total}] ${m.name.padEnd(18)} CRASH: ${err.message}`)
      return [m.name, { error: err.message, content: null, elapsed: Date.now() - start }]
    }
  })
  const settled = await Promise.all(calls)
  for (const [name, val] of settled) row.answers[name] = val
  results.results.push(row)
  // small pause to not slam any one provider
  await new Promise((r) => setTimeout(r, 1000))
}

results.meta.finished = new Date().toISOString()
results.meta.total_calls = count

writeFileSync(OUT_JSON, JSON.stringify(results, null, 2))

// Build markdown report
let md = `# LLM Probe — Derek Simmons baseline\n\n`
md += `**Captured:** ${new Date(results.meta.started).toLocaleString('en-US', { timeZone: 'America/Chicago' })} CDT\n`
md += `**Questions:** ${QUESTIONS.length} | **Models:** ${MODELS.length} | **Total calls:** ${count}\n\n`
md += `Baseline snapshot: what every model says about Derek and his coined terms, BEFORE the GEO push. Use this to measure delta in 30/60/90 days.\n\n`
md += `---\n\n`

for (const row of results.results) {
  md += `## ${row.question.id}\n\n`
  md += `> ${row.question.q}\n\n`
  for (const [name, ans] of Object.entries(row.answers)) {
    md += `### ${name}\n\n`
    if (ans.error) {
      md += `*Error: ${ans.error}*\n\n`
    } else if (!ans.content) {
      md += `*No content returned*\n\n`
    } else {
      md += `${ans.content.trim()}\n\n`
    }
  }
  md += `---\n\n`
}

writeFileSync(OUT_MD, md)

console.log(`\n=== DONE ===`)
console.log(`JSON: ${OUT_JSON}`)
console.log(`MD:   ${OUT_MD}`)
console.log(`Calls: ${count}/${total}`)
