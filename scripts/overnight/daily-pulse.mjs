/**
 * Daily Pulse — The snapshot.
 *
 * Queries every data source, writes one JSON file.
 * Kitchen reads it. Standup reads it. Morning email reads it.
 *
 * Sources: Supabase (CW conversations, D conversations, sessions, dawn, visitors),
 *          Netlify (deploys, bandwidth), GitHub (commits), Substack (if available).
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', '..', 'pulse.json')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const now = new Date()
const today = now.toISOString().split('T')[0]
const weekAgo = new Date(now - 7 * 86400000).toISOString().split('T')[0]
const monthAgo = new Date(now - 30 * 86400000).toISOString().split('T')[0]

async function query(table, q) {
  try {
    const { data, error } = await q
    if (error) return null
    return data
  } catch { return null }
}

async function main() {
  const pulse = {
    generated: now.toISOString(),
    date: today
  }

  // ── CW Porch ──
  const [cwTotal, cwWeek, cwToday] = await Promise.all([
    query('conversations', supabase.from('conversations').select('*', { count: 'exact', head: true })),
    query('conversations', supabase.from('conversations').select('*', { count: 'exact', head: true }).gte('timestamp', weekAgo)),
    query('conversations', supabase.from('conversations').select('*', { count: 'exact', head: true }).gte('timestamp', today)),
  ])

  // Get counts from the response headers
  const cwTotalRes = await supabase.from('conversations').select('*', { count: 'exact', head: true })
  const cwWeekRes = await supabase.from('conversations').select('*', { count: 'exact', head: true }).gte('timestamp', weekAgo)
  const cwTodayRes = await supabase.from('conversations').select('*', { count: 'exact', head: true }).gte('timestamp', today)

  pulse.porch = {
    total: cwTotalRes.count || 0,
    thisWeek: cwWeekRes.count || 0,
    today: cwTodayRes.count || 0
  }

  // ── D Coach ──
  const dTotalRes = await supabase.from('d_conversations').select('*', { count: 'exact', head: true })
  const dWeekRes = await supabase.from('d_conversations').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo)
  const dTodayRes = await supabase.from('d_conversations').select('*', { count: 'exact', head: true }).gte('created_at', today)
  const dModes = await supabase.from('d_conversations').select('mode').gte('created_at', weekAgo)

  const modeCounts = {}
  if (dModes.data) {
    for (const row of dModes.data) {
      modeCounts[row.mode] = (modeCounts[row.mode] || 0) + 1
    }
  }

  pulse.d = {
    total: dTotalRes.count || 0,
    thisWeek: dWeekRes.count || 0,
    today: dTodayRes.count || 0,
    modes: modeCounts
  }

  // ── Visitors ──
  const visitorsRes = await supabase.from('visitors').select('name, visit_count, last_visit')
  const visitors = visitorsRes.data || []

  pulse.visitors = {
    total: visitors.length,
    returning: visitors.filter(v => v.visit_count > 1).length,
    named: visitors.filter(v => v.name).length,
    maxVisits: Math.max(0, ...visitors.map(v => v.visit_count || 0))
  }

  // ── Sessions (Claude Code) ──
  const sessionsRes = await supabase
    .from('session_memories')
    .select('project, session_date, emotional_weight')
    .gte('session_date', weekAgo)
    .order('session_date', { ascending: false })

  const sessions = sessionsRes.data || []
  const sessionsByProject = {}
  for (const s of sessions) {
    sessionsByProject[s.project] = (sessionsByProject[s.project] || 0) + 1
  }

  pulse.sessions = {
    thisWeek: sessions.length,
    avgWeight: sessions.length > 0
      ? +(sessions.reduce((a, s) => a + (s.emotional_weight || 0), 0) / sessions.length).toFixed(1)
      : 0,
    byProject: sessionsByProject
  }

  // ── Dawn ──
  const dawnRes = await supabase
    .from('dawn_entries')
    .select('entry_date, day_number, phase, sleep_hours, raid, weight_lbs')
    .order('entry_date', { ascending: false })
    .limit(14)

  const dawn = dawnRes.data || []
  const dawnDays = dawn.filter(e => e.phase === 'dawn')
  const raids = dawnDays.filter(e => e.raid)
  const latestWeight = dawn.find(e => e.weight_lbs)
  const lastEntry = dawn[0]

  pulse.dawn = {
    lastEntry: lastEntry?.entry_date || 'none',
    dayNumber: lastEntry?.day_number || 0,
    raidRate: dawnDays.length > 0 ? `${raids.length}/${dawnDays.length}` : '0/0',
    latestWeight: latestWeight?.weight_lbs || null,
    daysSinceEntry: lastEntry ? Math.floor((now - new Date(lastEntry.entry_date)) / 86400000) : null
  }

  // ── Revenue ──
  pulse.revenue = {
    cascadia: { monthly: 10000, status: 'active', endsApprox: '2026-04-30' },
    coachD: { monthly: 400, status: 'active' },
    d: { monthly: 0, status: 'not launched', subscribers: 0 },
    note: 'Stripe not yet connected. D has zero paying users.'
  }

  // ── The Bottom Line ──
  pulse.bottomLine = []
  if (pulse.visitors.total < 10) pulse.bottomLine.push('6 visitors in 3.5 months. Distribution is the gap.')
  if (pulse.d.total < 5) pulse.bottomLine.push('D has zero real users. Paywall is built. Stripe is not.')
  if (pulse.dawn.daysSinceEntry > 3) pulse.bottomLine.push(`Dawn: ${pulse.dawn.daysSinceEntry} days since last entry.`)
  if (pulse.revenue.d.subscribers === 0) pulse.bottomLine.push('$0 from D. $0 from the practice. Cascadia is the only income.')

  writeFileSync(OUT, JSON.stringify(pulse, null, 2))
  console.log(`Pulse: ${OUT}`)
  console.log(JSON.stringify(pulse.bottomLine, null, 2))
}

main().catch(err => {
  console.error('Pulse error:', err.message)
  process.exit(1)
})
