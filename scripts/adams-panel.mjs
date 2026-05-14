#!/usr/bin/env node
/**
 * adams-panel.mjs — Run the Adams deck past a 9-model panel for editorial feedback.
 *
 * Keys must already be in the shell environment. Run it like:
 *   source ~/Desktop/the-standard/scripts/keys.sh   # decrypts ~/.keys.age (passphrase prompt)
 *   node scripts/adams-panel.mjs                     # from the claudewill.io/ directory
 *
 * Every model gets the same deck and the same two-line review ask, so the
 * feedback is comparable. Failures are reported, not fatal — the other models
 * still run. Output prints here and saves to docs/drafts/adams-panel-feedback.md.
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import {
  callAnthropic, callCohere, callGemini, callMistral,
  callDeepSeek, callGrok, callHuggingFace,
} from './lib/apis.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── The deck (final v1 — all 7 slides) ────────────────────────────
const DECK = `
SLIDE 1 — A Working Method for Adams
How AI grows a local paper instead of cutting it
- 5 minutes, 7 slides
- Ask questions, bottom left
- Full site at claudewill.io
- Runs in public, every day
(v1 · Derek Simmons · For Traci + Pamela · May 2026)

SLIDE 2 — The Audience Is Moving
PRINT. ANALOG. LIVE. LOCAL.
- The Atlantic: 1M+ subscribers, resumed monthly print issues, +50 journalists added in 2025.
- Independent bookstores up 70% since 2020 — 1,916 to 3,218 stores (ABA data).
- Substack added 1M+ paid subscriptions in four months — 4M to 5M+ (Nov 2024 to March 2025).
- Worker-owned Defector: 42K+ paid subscribers, $4.6M revenue (FY2024).
Not a universal trend. Print overall is still declining. But the segments readers pay for directly — physical, local, independent — are growing, and Adams already serves them.
"...we continue to fund that future with a focus on print." — Mark Adams, July 2025 rebrand

SLIDE 3 — AI Grows the Paper
Mark Adams's framing, carried forward:
Use AI for the digital work the chain has to do anyway. Use the savings — and the new digital reach — to grow what print, local, and live already deliver.
The chains banking AI as cost reduction lose audience.
The chains reinvesting in physical product, live events, and local reporters keep it.
Adams isn't leading on AI. Adams uses AI to do the digital work — and grows the print, local, and live products readers already pay for.

SLIDE 4 — Four Patterns That Pay the Bill
- Stories nobody has time to write. HS sports, obits, civic, calendar. ~$15–$25K/yr API across 30 papers.
- Morning brief, per market. What the competition ran, local stories worth pursuing, what's already in the works. Drafted by 5 AM daily.
- Ask-the-paper widget. Reader-facing AI that remembers returning visitors. Answers their questions, keeps them on the page.
- AI fluency, chain-wide. Workshops and sessions built for the Adams portfolio. Working fluency across every team — newsroom, ad sales, production, circulation.
All four run on the same machinery — visible at claudewill.io/kitchen.

SLIDE 5 — Why This Fits Adams
From Adams's July 2025 rebrand:
"I don't think we were too soon. I don't think we're too late. I think we're just kind of perfect." — Mark Adams
Same posture, applied to AI now. Three commitments that would make an Adams standard worth publishing:
- AI covers the work currently going uncovered — the stories that should run and don't.
- Staffing stays flat or grows in deploying markets. Published. Measured.
- Byline and disclosure standards are Adams's call — aligned with PAPJ, where I sit on the board.
Without these, it's cost-cutting — and the audience leaves. With them, it's a strategy that holds.

SLIDE 6 — Who I Am
- 30 years in newsrooms. Star Tribune, LA Times, Wichita Eagle. AP correspondent. Four Pulitzer teams.
- 14 months building claudewill.io. A working newsroom-AI practice — running daily, in public, no team and no funding round.
- Board member, Public Alliance of Professional Journalists. Helping build credentialing and editorial-policy infrastructure for the next-generation newsroom.
Brief disclosure: I've worked with Cascadia Media Company, a growing Pacific Northwest news organization whose Washington markets overlap with Adams's. No active retainer at present. Methodology travels; client specifics don't.

SLIDE 7 — The Work
Fourteen months, every day, built by one person.
The site is an experimental tech and media company.
I'd bring that thinking and discipline to Adams.
claudewill.io/derek
`.trim()

// ─── The ask — identical for every model ───────────────────────────
const ASK = `You are reviewing a 7-slide pitch deck.

CONTEXT: It's an audition. A journalist with 30 years in newsrooms is proposing that Adams MultiMedia — a family-owned chain of ~120 small-market newspapers that rebranded in July 2025 to emphasize print plus digital — create an executive AI role for him. The deck goes first to two internal reviewers (both journalists) before it reaches the CEO, Mark Adams.

Give exactly TWO lines of your sharpest feedback:
1. The single weakest slide or line, and why.
2. The one change that would most improve the deck.

Be specific. Name the slide. No preamble, no summary, no praise. Two lines only.

THE DECK:
${DECK}`

const SYS = 'You are a sharp, experienced editorial and pitch reviewer. Direct and specific. No hedging, no flattery.'
const OPTS = { systemPrompt: SYS, maxTokens: 300, temperature: 0.4 }
// Opus 4.7 deprecated `temperature` — Anthropic calls omit it.
const ANTHRO_OPTS = { systemPrompt: SYS, maxTokens: 300 }

// ─── The panel — 9 models, 7 providers ─────────────────────────────
const PANEL = [
  { name: 'Opus 4.7',      run: () => callAnthropic(ASK, { ...ANTHRO_OPTS, model: 'claude-opus-4-7' }) },
  { name: 'Sonnet 4.6',    run: () => callAnthropic(ASK, { ...ANTHRO_OPTS, model: 'claude-sonnet-4-6' }) },
  { name: 'Haiku 4.5',     run: () => callAnthropic(ASK, { ...ANTHRO_OPTS, model: 'claude-haiku-4-5-20251001' }) },
  { name: 'Gemini 2.5',    run: () => callGemini(ASK, { maxTokens: 300, temperature: 0.4, searchGrounding: false }) },
  { name: 'Mistral Large', run: () => callMistral(ASK, { ...OPTS, model: 'mistral-large-latest' }) },
  { name: 'Cohere Cmd A',  run: () => callCohere(ASK, OPTS) },
  { name: 'Grok 3',        run: () => callGrok(ASK, OPTS) },
  { name: 'DeepSeek',      run: () => callDeepSeek(ASK, OPTS) },
  { name: 'Llama 3.3 70B', run: () => callHuggingFace(ASK, { ...OPTS, model: 'meta-llama/Llama-3.3-70B-Instruct' }) },
]

const stamp = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
console.log(`\n  ADAMS DECK — 9-MODEL PANEL REVIEW`)
console.log(`  ${stamp}\n`)

const results = await Promise.all(PANEL.map(async (m) => {
  const start = Date.now()
  try {
    const r = await m.run()
    return { name: m.name, ...r, elapsed: Date.now() - start }
  } catch (err) {
    return { name: m.name, error: err.message, content: null, elapsed: Date.now() - start }
  }
}))

let ok = 0, failed = 0
const md = [`# Adams Deck — 9-Model Panel Review`, ``, `_${stamp}_`, ``]

for (const r of results) {
  console.log('━'.repeat(72))
  if (r.error || !r.content) {
    failed++
    console.log(`  ${r.name}  —  ⚠  ${r.error || 'no content returned'}`)
    md.push(`## ${r.name} — FAILED`, ``, `\`${r.error || 'no content returned'}\``, ``)
  } else {
    ok++
    console.log(`  ${r.name}  (${(r.elapsed / 1000).toFixed(1)}s)\n`)
    console.log(r.content.trim().split('\n').map(l => '  ' + l).join('\n'))
    md.push(`## ${r.name}`, ``, r.content.trim(), ``)
  }
  console.log()
}

console.log('━'.repeat(72))
console.log(`  ${ok} responded · ${failed} failed\n`)

const outPath = resolve(__dirname, '..', 'docs', 'drafts', 'adams-panel-feedback.md')
try {
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, md.join('\n'))
  console.log(`  Saved: ${outPath}\n`)
} catch (err) {
  console.log(`  (could not save file: ${err.message})\n`)
}
