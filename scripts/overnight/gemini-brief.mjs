/**
 * Gemini Industry Brief — claudewill.io
 *
 * Runs nightly via GitHub Actions. Calls Gemini API
 * with Google Search grounding for AI industry research.
 *
 * Writes a markdown report to reports/gemini-brief.md
 * No dependencies — uses native fetch (Node 22).
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

function writeReport(content) {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }
  writeFileSync(join(REPORTS_DIR, 'gemini-brief.md'), content)
}

async function main() {
  const date = new Date().toISOString().split('T')[0]

  if (!GEMINI_API_KEY) {
    const report = `# Industry Brief\n**Date:** ${date}\n**Agent:** gemini-brief\n**Type:** research\n\n## Flags (Decisions Needed)\nNone.\n\n## Findings\nGemini agent not configured — add GEMINI_API_KEY to GitHub secrets.\n\n## Details\nNo API key available. Skipping industry brief.\n`
    writeReport(report)
    console.log(`[${date}] Gemini brief skipped — no API key.`)
    return
  }

  const prompt = `You are a research assistant for CW Strategies, a digital strategy and AI consulting practice. Provide a concise morning brief on the most significant AI industry developments from the last 24 hours.

Focus on:
1. **AI consulting and services** — new tools, methodologies, or business models relevant to AI consultants and digital strategists
2. **Media industry + AI** — how news organizations, publishers, and media companies are adopting or being disrupted by AI
3. **AI agent developments** — multi-agent systems, AI coding tools, autonomous agents, orchestration frameworks
4. **Anthropic / Claude ecosystem** — Claude model updates, API changes, MCP developments, Claude Code updates
5. **Google / Gemini ecosystem** — Gemini updates, Google AI Studio, Vertex AI changes

Be specific: names, companies, dates, dollar amounts. Skip hype and speculation — focus on real product launches, policy changes, funding rounds, and industry shifts. Lead with what matters most to a solo AI consultant.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.3,
        },
      }),
      signal: AbortSignal.timeout(45000),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Gemini API returned ${res.status}: ${errorText}`)
    }

    const data = await res.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content returned.'

    // Extract grounding sources
    const sources = []
    const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    for (const chunk of chunks) {
      if (chunk.web) {
        sources.push(`[${chunk.web.title || 'Source'}](${chunk.web.uri})`)
      }
    }

    let report = `# Industry Brief\n`
    report += `**Date:** ${date}\n`
    report += `**Agent:** gemini-brief\n`
    report += `**Type:** research\n\n`

    report += `## Flags (Decisions Needed)\n`
    report += `None.\n\n`

    report += `## Findings\n`
    report += `${content}\n\n`

    if (sources.length > 0) {
      report += `## Sources\n`
      for (const source of sources) {
        report += `- ${source}\n`
      }
      report += `\n`
    }

    report += `## Details\n`
    report += `Model: gemini-2.5-flash (Google Search grounded)\n`
    report += `Sources: ${sources.length}\n`

    writeReport(report)
    console.log(`[${date}] Gemini industry brief complete. ${sources.length} sources.`)
  } catch (err) {
    const report = `# Industry Brief\n**Date:** ${date}\n**Agent:** gemini-brief\n**Type:** research\n\n## Flags (Decisions Needed)\n- [ ] Gemini brief failed: ${err.message}\n\n## Findings\nAgent error — could not complete industry brief.\n\n## Details\nNone.\n`
    writeReport(report)
    console.error(`Gemini brief failed: ${err.message}`)
    process.exit(1)
  }
}

main()
