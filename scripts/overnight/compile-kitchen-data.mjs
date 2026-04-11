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

function readJson(filename) {
  const path = join(REPO_ROOT, filename)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return null
  }
}

function parseHousekeeping(content) {
  if (!content) {
    return {
      name: 'Housekeeping',
      lastRun: new Date().toISOString(),
      status: 'not-configured',
      summary: 'No housekeeping report found.',
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
    name: 'Housekeeping',
    lastRun: new Date().toISOString(),
    status,
    summary: summary || 'Audit complete.',
    flags,
    details,
  }
}

// Legacy parsers removed — research-brief, gemini-brief, code-review
// were replaced by Morning Edition (March 2026).

function parsePulse(pulse) {
  if (!pulse) {
    return {
      name: 'Daily Pulse',
      lastRun: new Date().toISOString(),
      status: 'not-configured',
      summary: 'No pulse.json found.',
      flags: [],
      metrics: {},
    }
  }

  const flags = []
  const metrics = {}
  let status = 'ok'

  if (pulse.porch) {
    metrics.conversations = {
      total: pulse.porch.total || 0,
      week: pulse.porch.thisWeek || 0,
      today: pulse.porch.today || 0,
    }
  }

  if (pulse.d) {
    metrics.d = {
      total: pulse.d.total || 0,
      week: pulse.d.thisWeek || 0,
      today: pulse.d.today || 0,
    }
  }

  if (pulse.visitors) {
    metrics.visitors = {
      total: pulse.visitors.total || 0,
      returning: pulse.visitors.returning || 0,
      named: pulse.visitors.named || 0,
    }
  }

  if (pulse.sessions) {
    metrics.sessions = {
      thisWeek: pulse.sessions.thisWeek || 0,
      avgWeight: pulse.sessions.avgWeight || 0,
      byProject: pulse.sessions.byProject || {},
    }
  }

  if (pulse.dawn) {
    metrics.dawn = {
      dayNumber: pulse.dawn.dayNumber || 0,
      raidRate: pulse.dawn.raidRate || '0/0',
      daysSinceEntry: pulse.dawn.daysSinceEntry,
    }
  }

  // Surface operational flags only (business flags are internal)
  if (pulse.flags && pulse.flags.operational && pulse.flags.operational.length > 0) {
    for (const line of pulse.flags.operational) flags.push(line)
    status = 'flags'
  } else if (pulse.bottomLine && pulse.bottomLine.length > 0) {
    // Legacy format — filter out internal business metrics
    const internalPatterns = ['$0 from', 'Distribution is the gap', 'zero real users', 'only income']
    for (const line of pulse.bottomLine) {
      if (!internalPatterns.some(p => line.includes(p))) {
        flags.push(line)
      }
    }
    if (flags.length > 0) status = 'flags'
  }

  const parts = []
  if (metrics.conversations) parts.push(`${metrics.conversations.total} conversations`)
  if (metrics.visitors) parts.push(`${metrics.visitors.total} visitors`)
  if (metrics.d) parts.push(`${metrics.d.total} D sessions`)
  const summary = parts.length > 0 ? parts.join(', ') : 'Pulse collected.'

  return {
    name: 'Daily Pulse',
    lastRun: pulse.generated || new Date().toISOString(),
    status,
    summary,
    flags,
    metrics,
  }
}

// Legacy parsers removed — content-scan, research-status, social-draft
// were replaced by Morning Edition and pipeline-scan (March 2026).

function parsePipelineScan(content) {
  if (!content) {
    return {
      name: 'Pipeline Scan',
      lastRun: new Date().toISOString(),
      status: 'not-configured',
      summary: 'No pipeline scan report found.',
      flags: [],
    }
  }

  const flags = []
  let status = 'ok'
  let summary = ''

  const flagsSection = content.match(/## Flags \(Decisions Needed\)\n([\s\S]*?)(?=\n## )/)?.[1] || ''
  const flagLines = flagsSection.match(/- \[.\] .+/g) || []
  for (const line of flagLines) flags.push(line.replace(/- \[.\] /, ''))
  if (flags.length > 0) status = 'flags'

  const findingsSection = content.match(/## Findings\n([\s\S]*?)(?=\n## )/)?.[1] || ''
  const firstLine = findingsSection.trim().split('\n')[0]
  summary = firstLine || 'Pipeline scan complete.'

  return {
    name: 'Pipeline Scan',
    lastRun: new Date().toISOString(),
    status,
    summary,
    flags,
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

function parseMorningEdition(content) {
  if (!content) {
    return {
      name: 'Morning Edition',
      lastRun: new Date().toISOString(),
      status: 'not-configured',
      summary: 'No morning edition report found.',
      flags: [],
      sections: {},
    }
  }

  const flags = []
  let status = 'ok'

  const flagsSection = content.match(/## Flags \(Decisions Needed\)\n([\s\S]*?)(?=\n## |$)/)?.[1] || ''
  const flagLines = flagsSection.match(/- \[.\] .+/g) || []
  for (const line of flagLines) flags.push(line.replace(/- \[.\] /, ''))
  if (flags.length > 0) status = 'flags'

  const sections = {}
  const mastheadSection = content.match(/## Masthead\n([\s\S]*?)(?=\n## |$)/)?.[1] || ''
  const rowRegex = /\|\s*(\w[\w\s&]*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g
  let match
  while ((match = rowRegex.exec(mastheadSection)) !== null) {
    if (match[1] === 'Section') continue
    sections[match[1].trim()] = { source: match[2].trim(), status: match[3].trim() }
  }

  const frontMatch = content.match(/## Front Page\n\n> \*\*(.*?)\*\*/)
  const summary = frontMatch ? frontMatch[1] : 'Morning Edition published.'

  const findingsSection = content.match(/## Findings\n\n([\s\S]*?)(?=\n## |$)/)?.[1] || ''

  return {
    name: 'Morning Edition',
    lastRun: new Date().toISOString(),
    status,
    summary,
    flags,
    sections,
    findings: findingsSection.trim(),
  }
}

function main() {
  const date = new Date().toISOString().split('T')[0]

  // Read reports — 4 agents
  const morningEditionContent = readReport('morning-edition.md')
  const housekeepingContent = readReport('housekeeping.md')
  const pipelineScanContent = readReport('pipeline-scan.md')

  // Read pulse.json (produced by daily-pulse agent)
  const pulseData = readJson('pulse.json')

  // Parse all
  const morningEdition = parseMorningEdition(morningEditionContent)
  const housekeeping = parseHousekeeping(housekeepingContent)
  const pulse = parsePulse(pulseData)
  const pipelineScan = parsePipelineScan(pipelineScanContent)

  const projects = loadProjects()

  const kitchenData = {
    lastUpdated: new Date().toISOString(),
    agents: {
      morningEdition,
      housekeeping,
      pulse,
      pipelineScan,
    },
    projects,
    ecosystem: {
      stack: [
        { name: 'Claude Code (Opus 4.6)', role: 'The engine — builds, writes, thinks ($100/mo)' },
        { name: 'Claude Haiku 4.5', role: 'Porch conversations + session memory' },
        { name: 'Gemini 2.5 Flash', role: 'Morning Edition — business & media (search grounded)' },
        { name: 'Perplexity sonar', role: 'Morning Edition — AI deep dive (search grounded)' },
        { name: 'Mistral Small', role: 'Morning Edition — practice synthesis' },
        { name: 'Cohere rerank', role: 'Morning Edition — headline curation' },
        { name: 'Google News RSS', role: 'Morning Edition — headlines (free, unlimited)' },
        { name: 'HuggingFace', role: 'Fine-tune training + inference (CW, D adapters)' },
        { name: 'Netlify', role: 'Hosting + serverless functions' },
        { name: 'Supabase', role: 'Database + logging' },
        { name: 'Cloudflare', role: 'Workers + DNS + fine-tune serving' },
        { name: 'GitHub Actions', role: 'Overnight agent scheduler' },
        { name: 'ElevenLabs', role: 'Voice synthesis (BOB, Coach D)' },
      ],
      monthlyCost: '~$125',
      method: {
        session: 'standup → work → eod. Every project, every day.',
        memory: 'CLAUDE.md defines identity. HANDOFF.md tracks state between sessions.',
        crew: 'Four thinking lenses (earn, connect, sharpen, challenge) run in parallel on any question.',
        agents: 'The Morning Edition: 5 AI sources curate a newspaper while the laptop is closed.',
        tools: 'Skills automate workflows. One command does what used to take an hour.',
      },
    },
  }

  writeFileSync(join(REPO_ROOT, 'kitchen-data.json'), JSON.stringify(kitchenData, null, 2) + '\n')
  console.log(`[${date}] kitchen-data.json compiled.`)

  console.log(`  Morning Edition: ${morningEdition.status}`)
  console.log(`  Housekeeping: ${housekeeping.status}`)
  console.log(`  Pulse: ${pulse.status}`)
  console.log(`  Pipeline Scan: ${pipelineScan.status}`)
  console.log(`  Projects: ${projects.length}`)

  // Update cw-current.json — preserve existing summary/upcoming, refresh date and recent
  const currentPath = join(REPO_ROOT, 'cw-current.json')
  let cwCurrent = {}
  if (existsSync(currentPath)) {
    try {
      cwCurrent = JSON.parse(readFileSync(currentPath, 'utf-8'))
    } catch {
      cwCurrent = {}
    }
  }

  // Build fresh recent array from overnight agent findings
  const freshRecent = []
  if (morningEdition.summary && morningEdition.status !== 'not-configured') {
    freshRecent.push(`Morning Edition (${date}): ${morningEdition.summary}`)
  }
  if (pipelineScan.flags && pipelineScan.flags.length > 0) {
    freshRecent.push(...pipelineScan.flags.slice(0, 2))
  }
  if (pulse.metrics && pulse.metrics.conversations) {
    freshRecent.push(`Porch conversations: ${pulse.metrics.conversations.total} total, ${pulse.metrics.conversations.week} this week`)
  }

  // Use fresh recent if we got meaningful data, otherwise preserve existing
  const recentToWrite = freshRecent.length > 0 ? freshRecent : (cwCurrent.recent || [])

  cwCurrent = {
    updated: date,
    summary: cwCurrent.summary || '',
    recent: recentToWrite,
    upcoming: cwCurrent.upcoming || [],
  }

  writeFileSync(currentPath, JSON.stringify(cwCurrent, null, 2) + '\n')
  console.log(`[${date}] cw-current.json updated.`)
}

main()
