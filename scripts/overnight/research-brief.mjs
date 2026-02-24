/**
 * Research Brief Agent — claudewill.io
 *
 * Runs nightly via GitHub Actions. Calls Perplexity API
 * for AI industry news relevant to CW Strategies.
 *
 * Writes a markdown report to reports/research-brief.md
 * No dependencies — uses native fetch (Node 22).
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY

function writeReport(content) {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }
  writeFileSync(join(REPORTS_DIR, 'research-brief.md'), content)
}

async function main() {
  const date = new Date().toISOString().split('T')[0]

  if (!PERPLEXITY_API_KEY) {
    const report = `# Research Brief\n**Date:** ${date}\n**Agent:** research-brief\n**Type:** research\n\n## Flags (Decisions Needed)\nNone.\n\n## Findings\nPerplexity agent not configured — add PERPLEXITY_API_KEY to GitHub secrets.\n\n## Details\nNo API key available. Skipping research brief.\n`
    writeReport(report)
    console.log(`[${date}] Research brief skipped — no API key.`)
    return
  }

  const prompt = `What are the most significant AI industry developments in the last 24 hours? Focus on:

1. AI consulting practices — new tools, methodologies, or business models for AI consultants
2. Media industry AI adoption — how news organizations, publishers, and media companies are using AI
3. AI-native business methodology — companies building AI-first workflows, not just adding AI to existing processes
4. Anthropic, Claude, or AI agent developments — anything relevant to Claude-based systems

Be specific with names, companies, and dates. Include source URLs where available. Skip anything that's just hype or speculation — focus on real developments, product launches, policy changes, or industry shifts.`

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant for a digital strategy and AI consulting practice. Provide concise, sourced briefings. No filler. Lead with what matters.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Perplexity API returned ${res.status}: ${errorText}`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || 'No content returned.'
    const citations = data.citations || []

    let report = `# Research Brief\n`
    report += `**Date:** ${date}\n`
    report += `**Agent:** research-brief\n`
    report += `**Type:** research\n\n`

    report += `## Flags (Decisions Needed)\n`
    report += `None.\n\n`

    report += `## Findings\n`
    report += `${content}\n\n`

    if (citations.length > 0) {
      report += `## Sources\n`
      for (const citation of citations) {
        report += `- ${citation}\n`
      }
      report += `\n`
    }

    report += `## Details\n`
    report += `Model: sonar | Tokens: ${data.usage?.total_tokens || 'unknown'}\n`

    writeReport(report)
    console.log(`[${date}] Research brief complete.`)
  } catch (err) {
    const report = `# Research Brief\n**Date:** ${date}\n**Agent:** research-brief\n**Type:** research\n\n## Flags (Decisions Needed)\n- [ ] Research brief failed: ${err.message}\n\n## Findings\nAgent error — could not complete research brief.\n\n## Details\nNone.\n`
    writeReport(report)
    console.error(`Research brief failed: ${err.message}`)
    process.exit(1)
  }
}

main()
