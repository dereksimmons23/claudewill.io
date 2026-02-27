/**
 * Analytics Agent — claudewill.io
 *
 * Runs nightly via GitHub Actions. Queries Supabase tables
 * and surfaces business analytics: conversations, visitors,
 * pipeline, Derek's time, content cadence.
 *
 * Writes a markdown report to reports/analytics.md
 * No dependencies — uses native fetch (Node 22).
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const REPORTS_DIR = join(REPO_ROOT, 'reports')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

// Haiku 4.5 pricing (per million tokens)
const HAIKU_INPUT_COST = 0.80
const HAIKU_OUTPUT_COST = 4.00

// Sovereignty target: 2-3 hrs/day, 3-4 days/week = 6-12 hrs/week. Flag at 21+.
const HOURS_FLAG_THRESHOLD = 21

// ── Helpers ──────────────────────────────────────────

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function today() {
  return new Date().toISOString().split('T')[0]
}

async function supabaseGet(table, params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status} ${res.statusText}`)
  return res.json()
}

async function supabaseCount(table, filter = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*${filter}`, {
    method: 'HEAD',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'count=exact',
    },
    signal: AbortSignal.timeout(10000),
  })
  const range = res.headers.get('content-range')
  return range ? parseInt(range.split('/')[1]) || 0 : 0
}

// ── Data Collection ──────────────────────────────────

async function getConversations() {
  const day1 = daysAgo(1)
  const day7 = daysAgo(7)
  const day30 = daysAgo(30)

  // Get conversations from last 30 days with minimal fields
  const rows = await supabaseGet(
    'conversations',
    `?select=created_at,condition,ip_hash,token_usage&created_at=gte.${day30}&order=created_at.desc&limit=5000`
  )

  const count24h = rows.filter(r => r.created_at >= day1).length
  const count7d = rows.filter(r => r.created_at >= day7).length
  const count30d = rows.length

  // By condition
  const byCondition = {}
  for (const r of rows) {
    const c = r.condition || 'unknown'
    byCondition[c] = (byCondition[c] || 0) + 1
  }

  // Unique visitors (by ip_hash, 7d)
  const recent = rows.filter(r => r.created_at >= day7)
  const uniqueIPs = new Set(recent.map(r => r.ip_hash).filter(Boolean)).size

  // Token usage + cost
  let totalInput = 0
  let totalOutput = 0
  for (const r of rows) {
    if (r.token_usage) {
      totalInput += r.token_usage.input || 0
      totalOutput += r.token_usage.output || 0
    }
  }
  const cost30d = (totalInput * HAIKU_INPUT_COST + totalOutput * HAIKU_OUTPUT_COST) / 1_000_000

  return { count24h, count7d, count30d, byCondition, uniqueIPs7d: uniqueIPs, totalInput, totalOutput, cost30d }
}

async function getVisitors() {
  const day7 = daysAgo(7)

  // Total visitors
  const total = await supabaseCount('visitors')

  // New visitors last 7 days
  const newVisitors = await supabaseGet(
    'visitors',
    `?select=visitor_token&first_visit=gte.${day7}`
  )
  const new7d = newVisitors.length

  // Returning visitors (visit_count > 1)
  const returning = await supabaseCount('visitors', '&visit_count=gt.1')

  // Named visitors
  const named = await supabaseCount('visitors', '&name=not.is.null')

  // Top tags from visitor_notes (last 30 days)
  const day30 = daysAgo(30)
  const notes = await supabaseGet(
    'visitor_notes',
    `?select=tags&created_at=gte.${day30}`
  )
  const tagCounts = {}
  for (const n of notes) {
    if (Array.isArray(n.tags)) {
      for (const t of n.tags) {
        tagCounts[t] = (tagCounts[t] || 0) + 1
      }
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => `${tag} (${count})`)

  return { total, new7d, returning, named, topTags }
}

async function getPipeline() {
  const day7 = daysAgo(7)
  const day30 = daysAgo(30)

  const total = await supabaseCount('intake_submissions')

  const recent30 = await supabaseGet(
    'intake_submissions',
    `?select=created_at,engagement_type,name&created_at=gte.${day30}&order=created_at.desc`
  )

  const count7d = recent30.filter(r => r.created_at >= day7).length
  const count30d = recent30.length
  const mostRecent = recent30.length > 0 ? recent30[0].created_at.split('T')[0] : null
  const mostRecentName = recent30.length > 0 ? recent30[0].name : null

  // Engagement types
  const types = {}
  for (const r of recent30) {
    const t = r.engagement_type || 'unspecified'
    types[t] = (types[t] || 0) + 1
  }

  return { total, count7d, count30d, mostRecent, mostRecentName, types }
}

async function getDerekTime() {
  const day7 = daysAgo(7)
  const day30 = daysAgo(30)

  const sessions = await supabaseGet(
    'session_memories',
    `?select=project,session_date,duration_minutes,emotional_weight,topics&session_date=gte.${day7}&order=session_date.desc`
  )

  const sessions30d = await supabaseGet(
    'session_memories',
    `?select=project,duration_minutes&session_date=gte.${day30}&order=session_date.desc&limit=500`
  )

  const count7d = sessions.length
  const hours7d = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60
  const hours30d = sessions30d.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60

  // Project distribution (7d)
  const byProject = {}
  for (const s of sessions) {
    const p = s.project || 'unknown'
    if (!byProject[p]) byProject[p] = { sessions: 0, minutes: 0 }
    byProject[p].sessions++
    byProject[p].minutes += s.duration_minutes || 0
  }
  const topProjects = Object.entries(byProject)
    .sort((a, b) => b[1].minutes - a[1].minutes)
    .slice(0, 8)
    .map(([name, data]) => ({ name, sessions: data.sessions, hours: (data.minutes / 60).toFixed(1) }))

  // Avg emotional weight
  const weights = sessions.filter(s => s.emotional_weight != null)
  const avgWeight = weights.length > 0
    ? (weights.reduce((sum, s) => sum + s.emotional_weight, 0) / weights.length).toFixed(1)
    : 'n/a'

  return { count7d, hours7d, hours30d, topProjects, avgWeight, count30d: sessions30d.length }
}

// ── Flag Generation ──────────────────────────────────

function generateFlags(conversations, visitors, pipeline, derekTime) {
  const flags = []

  // Declining conversations
  if (conversations.count30d > 0) {
    const avg7d = conversations.count7d / 7
    const avg30d = conversations.count30d / 30
    if (avg7d < avg30d * 0.5 && conversations.count30d > 10) {
      flags.push(`Conversation volume declining: ${avg7d.toFixed(1)}/day (7d) vs ${avg30d.toFixed(1)}/day (30d)`)
    }
  }

  // No porch conversations + no new visitors
  if (conversations.count7d === 0 && visitors.new7d === 0) {
    flags.push('No porch conversations and no new visitors in 7 days')
  }

  // No intake submissions in 30 days
  if (pipeline.count30d === 0 && pipeline.total > 0) {
    flags.push('No intake submissions in 30 days — funnel may be broken')
  }

  // Derek hours
  if (derekTime.hours7d > HOURS_FLAG_THRESHOLD) {
    flags.push(`${derekTime.hours7d.toFixed(1)} hours last 7d — exceeds sovereignty target (${HOURS_FLAG_THRESHOLD}h)`)
  }

  return flags
}

// ── Report ───────────────────────────────────────────

function formatReport(conversations, visitors, pipeline, derekTime, date) {
  const flags = generateFlags(conversations, visitors, pipeline, derekTime)

  let report = `# Analytics — claudewill.io\n`
  report += `**Date:** ${date}\n`
  report += `**Agent:** analytics\n`
  report += `**Type:** analytics\n\n`

  // Flags
  report += `## Flags (Decisions Needed)\n`
  if (flags.length === 0) {
    report += `None.\n\n`
  } else {
    for (const f of flags) report += `- [ ] ${f}\n`
    report += `\n`
  }

  // Findings
  report += `## Findings\n`
  report += `**Conversations:** ${conversations.count30d} total (24h: ${conversations.count24h} | 7d: ${conversations.count7d} | 30d: ${conversations.count30d})\n`

  const conditions = Object.entries(conversations.byCondition)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
  if (conditions) report += `**By condition:** ${conditions}\n`
  report += `**Unique visitors (7d):** ${conversations.uniqueIPs7d}\n`
  report += `**Est. API cost (30d):** $${conversations.cost30d.toFixed(2)} (${(conversations.totalInput / 1000).toFixed(0)}K in / ${(conversations.totalOutput / 1000).toFixed(0)}K out)\n\n`

  report += `**Visitors:** ${visitors.total} total, ${visitors.new7d} new (7d), ${visitors.returning} returning, ${visitors.named} named\n`
  if (visitors.topTags.length > 0) report += `**Top tags:** ${visitors.topTags.join(', ')}\n`
  report += `\n`

  report += `**Pipeline:** ${pipeline.count30d} intake submissions (30d), ${pipeline.count7d} this week, ${pipeline.total} all time\n`
  if (pipeline.mostRecent) {
    report += `**Most recent:** ${pipeline.mostRecent}${pipeline.mostRecentName ? ` — ${pipeline.mostRecentName}` : ''}\n`
  }
  const engTypes = Object.entries(pipeline.types).map(([k, v]) => `${k}: ${v}`).join(', ')
  if (engTypes) report += `**Engagement types:** ${engTypes}\n`
  report += `\n`

  report += `**Derek's time (7d):** ${derekTime.hours7d.toFixed(1)} hours across ${derekTime.count7d} sessions\n`
  report += `**Derek's time (30d):** ${derekTime.hours30d.toFixed(1)} hours across ${derekTime.count30d} sessions\n`
  if (derekTime.topProjects.length > 0) {
    report += `**Top projects:** ${derekTime.topProjects.map(p => `${p.name} (${p.hours}h, ${p.sessions}s)`).join(', ')}\n`
  }
  report += `**Avg emotional weight:** ${derekTime.avgWeight}/10\n\n`

  // Details
  report += `## Details\n`
  report += `- Conversations queried: ${conversations.count30d} (30d window)\n`
  report += `- Visitors total: ${visitors.total}\n`
  report += `- Named visitors: ${visitors.named}\n`
  report += `- Intake submissions all time: ${pipeline.total}\n`
  report += `- Session memories queried: ${derekTime.count7d} (7d), ${derekTime.count30d} (30d)\n`
  report += `- Token usage (30d): ${conversations.totalInput.toLocaleString()} input, ${conversations.totalOutput.toLocaleString()} output\n`
  report += `- Data sources: Supabase (conversations, visitors, visitor_notes, intake_submissions, session_memories)\n`

  return { report, flags }
}

// ── Main ─────────────────────────────────────────────

async function main() {
  const date = today()

  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    const report = `# Analytics — claudewill.io\n**Date:** ${date}\n**Agent:** analytics\n**Type:** analytics\n\n## Flags (Decisions Needed)\n- [ ] Analytics not configured — add SUPABASE_URL and SUPABASE_ANON_KEY to GitHub secrets\n\n## Findings\nAgent not configured.\n\n## Details\nNone.\n`
    writeFileSync(join(REPORTS_DIR, 'analytics.md'), report)
    console.log(`[${date}] Analytics: not configured (missing Supabase credentials)`)
    return
  }

  // Run all queries in parallel
  const [conversations, visitors, pipeline, derekTime] = await Promise.all([
    getConversations(),
    getVisitors(),
    getPipeline(),
    getDerekTime(),
  ])

  const { report, flags } = formatReport(conversations, visitors, pipeline, derekTime, date)
  writeFileSync(join(REPORTS_DIR, 'analytics.md'), report)

  console.log(`[${date}] Analytics complete. ${flags.length} flags.`)
  if (flags.length > 0) {
    for (const f of flags) console.log(`  ⚑ ${f}`)
  }
}

main().catch((err) => {
  console.error(`Analytics agent failed: ${err.message}`)
  const date = today()
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true })
  }
  const failReport = `# Analytics — claudewill.io\n**Date:** ${date}\n**Agent:** analytics\n**Type:** analytics\n\n## Flags (Decisions Needed)\n- [ ] Analytics agent failed: ${err.message}\n\n## Findings\nAgent error — could not complete analytics.\n\n## Details\n${err.stack || 'No stack trace'}\n`
  writeFileSync(join(REPORTS_DIR, 'analytics.md'), failReport)
  process.exit(1)
})
