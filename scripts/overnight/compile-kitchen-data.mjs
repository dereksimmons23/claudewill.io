/**
 * Compile Kitchen Data — claudewill.io
 *
 * Runs after all overnight agents complete. Reads their reports,
 * combines with kitchen-projects.json, and generates kitchen-data.json
 * for the Kitchen dashboard.
 *
 * No dependencies — uses native Node.js (Node 22).
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

function readReport(filename) {
  const path = join(REPORTS_DIR, filename)
  if (!existsSync(path)) return null
  try {
    return readFileSync(path, 'utf-8')
  } catch {
    return null
  }
}

function parseSiteAudit(content) {
  if (!content) {
    return {
      name: 'Site Audit',
      lastRun: new Date().toISOString(),
      status: 'not-configured',
      summary: 'No site audit report found.',
      flags: [],
      details: [],
    }
  }

  const flags = []
  const details = []
  let status = 'ok'
  let summary = ''

  // Extract flags
  const flagsSection = content.match(/## Flags \(Decisions Needed\)\n([\s\S]*?)(?=\n## )/)?.[1] || ''
  const flagLines = flagsSection.match(/- \[.\] .+/g) || []
  for (const line of flagLines) {
    flags.push(line.replace(/- \[.\] /, ''))
  }

  // Extract findings for summary
  const findingsSection = content.match(/## Findings\n([\s\S]*?)(?=\n## )/)?.[1] || ''
  const findingLines = findingsSection.match(/- .+/g) || []
  if (findingLines.length > 0) {
    summary = findingLines[0].replace(/^- /, '')
  }

  // Extract details
  const detailsSection = content.match(/## Details\n([\s\S]*?)(?=\n(?:SSL:|$))/)?.[1] || ''
  const detailLines = detailsSection.match(/- .+/g) || []
  for (const line of detailLines) {
    details.push(line.replace(/^- /, ''))
  }

  if (flags.length > 0) status = 'flags'

  return {
    name: 'Site Audit',
    lastRun: new Date().toISOString(),
    status,
    summary: summary || 'Audit complete.',
    flags,
    details,
  }
}

function parseResearchBrief(content) {
  if (!content) {
    return {
      name: 'Research Brief',
      lastRun: new Date().toISOString(),
      status: 'not-configured',
      summary: 'No research brief report found.',
      sources: [],
    }
  }

  const sources = []
  let status = 'ok'
  let summary = ''

  // Check if not configured
  if (content.includes('not configured') || content.includes('no API key')) {
    status = 'not-configured'
    summary = 'Perplexity agent not configured — add PERPLEXITY_API_KEY to GitHub secrets.'
    return { name: 'Research Brief', lastRun: new Date().toISOString(), status, summary, sources }
  }

  // Check if agent errored
  if (content.includes('Agent error')) {
    status = 'error'
    summary = 'Research brief agent encountered an error.'
    return { name: 'Research Brief', lastRun: new Date().toISOString(), status, summary, sources }
  }

  // Extract findings as summary (first ~200 chars)
  const findingsSection = content.match(/## Findings\n([\s\S]*?)(?=\n## )/)?.[1] || ''
  const cleanFindings = findingsSection.trim()
  summary = cleanFindings.length > 200
    ? cleanFindings.slice(0, 200).replace(/\s+\S*$/, '') + '...'
    : cleanFindings

  // Extract sources
  const sourcesSection = content.match(/## Sources\n([\s\S]*?)(?=\n## )/)?.[1] || ''
  const sourceLines = sourcesSection.match(/- .+/g) || []
  for (const line of sourceLines) {
    sources.push(line.replace(/^- /, ''))
  }

  return {
    name: 'Research Brief',
    lastRun: new Date().toISOString(),
    status,
    summary: summary || 'Research brief complete.',
    sources,
  }
}

function parseGeminiBrief(content) {
  if (!content) {
    return {
      name: 'Industry Brief',
      lastRun: new Date().toISOString(),
      status: 'not-configured',
      summary: 'No industry brief report found.',
      sources: [],
    }
  }

  const sources = []
  let status = 'ok'
  let summary = ''

  // Check if not configured
  if (content.includes('not configured') || content.includes('no API key')) {
    status = 'not-configured'
    summary = 'Gemini agent not configured — add GEMINI_API_KEY to GitHub secrets.'
    return { name: 'Industry Brief', lastRun: new Date().toISOString(), status, summary, sources }
  }

  // Check if agent errored
  if (content.includes('Agent error')) {
    status = 'error'
    summary = 'Industry brief agent encountered an error.'
    return { name: 'Industry Brief', lastRun: new Date().toISOString(), status, summary, sources }
  }

  // Extract findings as summary (first ~200 chars)
  const findingsSection = content.match(/## Findings\n([\s\S]*?)(?=\n## )/)?.[1] || ''
  const cleanFindings = findingsSection.trim()
  summary = cleanFindings.length > 200
    ? cleanFindings.slice(0, 200).replace(/\s+\S*$/, '') + '...'
    : cleanFindings

  // Extract sources
  const sourcesSection = content.match(/## Sources\n([\s\S]*?)(?=\n## |$)/)?.[1] || ''
  const sourceLines = sourcesSection.match(/- .+/g) || []
  for (const line of sourceLines) {
    sources.push(line.replace(/^- /, ''))
  }

  return {
    name: 'Industry Brief',
    lastRun: new Date().toISOString(),
    status,
    summary: summary || 'Industry brief complete.',
    sources,
  }
}

function parseCodeReview(content) {
  if (!content) {
    return {
      name: 'Code Review',
      lastRun: new Date().toISOString(),
      status: 'not-configured',
      summary: 'No code review report found.',
    }
  }

  let status = 'ok'
  let summary = ''

  // Check if not configured
  if (content.includes('not configured') || content.includes('no API key')) {
    status = 'not-configured'
    summary = 'Mistral agent not configured — add MISTRAL_API_KEY to GitHub secrets.'
    return { name: 'Code Review', lastRun: new Date().toISOString(), status, summary }
  }

  // Check if no recent commits
  if (content.includes('No commits in last 24 hours')) {
    status = 'no-changes'
    summary = 'No commits in last 24 hours. Nothing to review.'
    return { name: 'Code Review', lastRun: new Date().toISOString(), status, summary }
  }

  // Check if agent errored
  if (content.includes('Agent error')) {
    status = 'error'
    summary = 'Code review agent encountered an error.'
    return { name: 'Code Review', lastRun: new Date().toISOString(), status, summary }
  }

  // Check for security flags
  const hasFlags = content.includes('Security-related findings detected')
  if (hasFlags) status = 'flags'

  // Extract findings as summary (first ~200 chars)
  const findingsSection = content.match(/## Findings\n([\s\S]*?)(?=\n## )/)?.[1] || ''
  const cleanFindings = findingsSection.trim()
  summary = cleanFindings.length > 200
    ? cleanFindings.slice(0, 200).replace(/\s+\S*$/, '') + '...'
    : cleanFindings

  return {
    name: 'Code Review',
    lastRun: new Date().toISOString(),
    status,
    summary: summary || 'Code review complete.',
  }
}

function loadProjects() {
  const path = join(REPO_ROOT, 'kitchen-projects.json')
  if (!existsSync(path)) {
    console.warn('kitchen-projects.json not found — using empty project list.')
    return []
  }
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch (err) {
    console.warn(`Failed to parse kitchen-projects.json: ${err.message}`)
    return []
  }
}

function main() {
  const date = new Date().toISOString().split('T')[0]

  // Read reports
  const siteAuditContent = readReport('site-audit.md')
  const researchBriefContent = readReport('research-brief.md')
  const geminiBriefContent = readReport('gemini-brief.md')
  const codeReviewContent = readReport('code-review.md')

  // Parse reports
  const siteAudit = parseSiteAudit(siteAuditContent)
  const research = parseResearchBrief(researchBriefContent)
  const gemini = parseGeminiBrief(geminiBriefContent)
  const codeReview = parseCodeReview(codeReviewContent)

  // Load projects
  const projects = loadProjects()

  // Build kitchen-data.json
  const kitchenData = {
    lastUpdated: new Date().toISOString(),
    agents: {
      siteAudit,
      research,
      gemini,
      codeReview,
    },
    projects,
    ecosystem: {
      stack: [
        { name: 'Claude Code (Opus 4.6)', role: 'Working partner — builds, writes, thinks' },
        { name: 'Claude Haiku 4.5', role: 'Porch conversations + session memory' },
        { name: 'Gemini 2.5 Flash', role: 'Industry brief (Google Search grounded)' },
        { name: 'Perplexity', role: 'Research brief (deep search)' },
        { name: 'Mistral', role: 'Code review' },
        { name: 'Netlify', role: 'Hosting + serverless functions' },
        { name: 'Supabase', role: 'Database + logging' },
        { name: 'Cloudflare', role: 'Workers + DNS' },
        { name: 'GitHub Actions', role: 'Overnight agent scheduler' },
        { name: 'ElevenLabs', role: 'Voice synthesis (BOB, Coach D)' },
      ],
      monthlyCost: '$25-50',
      method: {
        session: 'standup → work → eod. Every project, every day.',
        memory: 'CLAUDE.md defines identity. HANDOFF.md tracks state between sessions.',
        crew: 'Four thinking lenses (earn, connect, sharpen, challenge) run in parallel on any question.',
        agents: 'Overnight scripts audit the site, research the market, and review code while the laptop is closed.',
        tools: 'Skills automate workflows. One command does what used to take an hour.',
      },
    },
  }

  writeFileSync(join(REPO_ROOT, 'kitchen-data.json'), JSON.stringify(kitchenData, null, 2) + '\n')
  console.log(`[${date}] kitchen-data.json compiled.`)

  // Log summary
  console.log(`  Site Audit: ${siteAudit.status}`)
  console.log(`  Research: ${research.status}`)
  console.log(`  Industry: ${gemini.status}`)
  console.log(`  Code Review: ${codeReview.status}`)
  console.log(`  Projects: ${projects.length}`)
}

main()
