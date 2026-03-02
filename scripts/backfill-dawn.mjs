/**
 * Backfill Dawn Entries — One-Time Script
 *
 * Parses 9 weekly markdown files from ~/Desktop/apps/dawn/2026/weekly/
 * (2026-W01.md through 2026-W09.md) and upserts structured data into
 * the Supabase `dawn_entries` table.
 *
 * Usage:
 *   node scripts/backfill-dawn.mjs
 *   node scripts/backfill-dawn.mjs --dry-run   # parse only, no Supabase writes
 *
 * Idempotent — uses upsert on (entry_date, phase, year) unique index.
 * Safe to run multiple times.
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Configuration ───────────────────────────────────

const WEEKLY_DIR = join(process.env.HOME, 'Desktop/apps/dawn/2026/weekly')
const ENV_PATH = join(process.env.HOME, 'Desktop/the-standard/.env')
const DRY_RUN = process.argv.includes('--dry-run')

// Challenge start: Dec 31, 2025 is Day -1, Jan 1, 2026 is Day 1
const CHALLENGE_START = new Date('2025-12-31') // Day 0 anchor (Dec 31 = Day -1, Jan 1 = Day 1)

// ── Load Supabase credentials ───────────────────────

config({ path: ENV_PATH })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in', ENV_PATH)
  process.exit(1)
}

const supabase = DRY_RUN ? null : createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Month name → number mapping ─────────────────────

const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
}

// ── Date parsing helpers ────────────────────────────

/**
 * Parse a date from the day header text.
 * Handles formats like:
 *   "Monday, February 23"
 *   "January 1, 2026"
 *   "December 28, 2025"
 *   "January 10-11, 2026" (weekend combined — returns first date)
 *   "Saturday-Sunday, January 18-19" (weekend combined)
 */
function parseDateFromHeader(headerText, weekFile) {
  // Extract year from the week file's title or default based on week number
  const weekMatch = weekFile.match(/W(\d+)/)
  const weekNum = weekMatch ? parseInt(weekMatch[1]) : null

  // Try: "Month Day, Year" or "Month Day-Day, Year" (e.g., "January 10-11, 2026")
  let m = headerText.match(/(\w+)\s+(\d+)(?:-\d+)?,\s*(\d{4})/)
  if (m) {
    const month = MONTHS[m[1].toLowerCase()]
    if (month !== undefined) {
      return new Date(parseInt(m[3]), month, parseInt(m[2]))
    }
  }

  // Try: "DayName, Month Day" (e.g., "Monday, February 23")
  m = headerText.match(/\w+day,\s+(\w+)\s+(\d+)/)
  if (m) {
    const month = MONTHS[m[1].toLowerCase()]
    if (month !== undefined) {
      // Infer year: W01 entries in December are 2025, everything else is 2026
      const year = (weekNum === 1 && month === 11) ? 2025 : 2026
      return new Date(year, month, parseInt(m[2]))
    }
  }

  // Try: "Month Day" without day name (e.g., "December 28, 2025" already caught above)
  m = headerText.match(/(\w+)\s+(\d+)/)
  if (m) {
    const month = MONTHS[m[1].toLowerCase()]
    if (month !== undefined) {
      const year = (weekNum === 1 && month === 11) ? 2025 : 2026
      return new Date(year, month, parseInt(m[2]))
    }
  }

  return null
}

/**
 * Parse day number from header text.
 * Handles: "Day 54", "Day -3", "Day 1 of 151", "Days 10-11 of 151"
 * Returns first day number for ranges.
 */
function parseDayNumber(headerText) {
  // "Day N" or "Day -N" or "Day N of 151"
  let m = headerText.match(/Day\s+(-?\d+)/)
  if (m) return parseInt(m[1])

  // "Days N-M"
  m = headerText.match(/Days?\s+(-?\d+)-/)
  if (m) return parseInt(m[1])

  return null
}

/**
 * Calculate week_number from entry_date.
 * Week 1 starts Dec 28, 2025 (the first entry).
 * Using ISO-like weekly numbering relative to challenge start.
 */
function calcWeekNumber(entryDate) {
  const epoch = new Date('2025-12-28') // W01 start
  const diffMs = entryDate.getTime() - epoch.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7) + 1
}

/**
 * Format a Date as YYYY-MM-DD string.
 */
function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ── Field extraction helpers ────────────────────────

/**
 * Extract a bold-label field value from text.
 * Looks for **Label:** Value patterns.
 * Returns the value string or null.
 */
function extractBoldField(text, ...labels) {
  for (const label of labels) {
    // Escape special regex chars in label
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`\\*\\*${escaped}\\*\\*\\s*(.+)`, 'i')
    const m = text.match(re)
    if (m) return m[1].trim()
  }
  return null
}

/**
 * Parse up_time from text.
 * Looks for **Up:** or prose mentions like "Woke up at 5:30am"
 */
function parseUpTime(text) {
  // Bold field: **Up:** 5:30am or **Up:** ~8:00am
  const upField = extractBoldField(text, 'Up:')
  if (upField) {
    const m = upField.match(/~?(\d{1,2}(?::\d{2})?)\s*(?:am|pm)/i)
    if (m) return m[0].replace(/^~/, '')
    // If it's "Not specified" or similar, return null
    if (/not specified|tbd/i.test(upField)) return null
    return upField.substring(0, 50) // truncate long values
  }

  // Prose fallback: "Woke up at 7:30am" or "Up at 5:30"
  const proseMatch = text.match(/(?:woke up|up)\s+(?:at\s+)?~?(\d{1,2}(?::\d{2})?)\s*(?:am|pm)?/i)
  if (proseMatch) return proseMatch[0].replace(/^(?:woke\s+)?/i, '').trim()

  return null
}

/**
 * Parse sleep hours from text.
 * Handles: "~8 hours", "about 7 hours", "6.5 hours", "5-6 hours" (takes midpoint)
 */
function parseSleepHours(text) {
  // Bold field: **Sleep:** ~7 hours or **Sleep:** Bed ~9:30pm, up at 5:30am (~8 hours)
  const sleepField = extractBoldField(text, 'Sleep:')
  if (sleepField) {
    return extractHoursFromText(sleepField)
  }

  // Look in the Up field too: **Up:** 7:30am, 7 hours sleep
  const upField = extractBoldField(text, 'Up:')
  if (upField) {
    const h = extractHoursFromText(upField)
    if (h) return h
  }

  // Prose fallback: "got about 7 hours of sleep" or "6.5 hours of sleep"
  return extractHoursFromText(text)
}

/**
 * Extract hours number from a text snippet.
 */
function extractHoursFromText(text) {
  // Range: "5-6 hours" → 5.5
  let m = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*hours?/i)
  if (m) return (parseFloat(m[1]) + parseFloat(m[2])) / 2

  // Single: "~8 hours" or "about 7.5 hours" or "7 hours"
  m = text.match(/(?:~|about\s+|around\s+)?(\d+(?:\.\d+)?)\s*hours?\s*(?:of\s+)?(?:sleep)?/i)
  if (m) return parseFloat(m[1])

  return null
}

/**
 * Parse overnight raid info.
 * Returns { raid: boolean, description: string|null, calories: number|null }
 */
function parseRaid(text) {
  const result = { raid: false, description: null, calories: null }

  // Check bold fields
  const raidField = extractBoldField(text, 'Overnight raid:', 'Overnight eating:')

  if (raidField) {
    // Not a raid
    if (/^(none|not specified|tbd|no|n\/a)\.?$/i.test(raidField.trim())) {
      return result
    }

    result.raid = true
    result.description = raidField
    result.calories = parseCalories(raidField)
    return result
  }

  // Prose fallback: look for overnight eating mentions
  const prosePatterns = [
    /(?:got up|woke up).*?(?:for|had|ate)\s+(?:a\s+)?(?:snack|trail mix|cheez-its|chocolate|pretzels|cookies|doritos|m&ms|protein bar)/i,
    /overnight.*?(?:raid|snack|eating|ate)/i,
    /(?:midnight|2am|3am|1:30am|2:30am|1am).*?(?:snack|raid|ate|eating|cheez-its|chocolate|pretzels)/i,
    /\d+\s*calories?\s*(?:of\s+)?snacks?/i
  ]

  for (const pattern of prosePatterns) {
    const m = text.match(pattern)
    if (m) {
      result.raid = true
      result.description = m[0].substring(0, 200)
      result.calories = parseCalories(text)
      return result
    }
  }

  // Check for explicit "did not get up overnight" or "No overnight raid"
  if (/(?:did not|didn't)\s+get up overnight/i.test(text) ||
      /no overnight raid/i.test(text) ||
      /(?:woke up|got up).*?(?:didn't|did not).*?(?:snack|eat)/i.test(text)) {
    result.raid = false
    return result
  }

  return result
}

/**
 * Parse calorie count from text.
 * Handles: "~600 cal", "300-400 cal" (midpoint), "600 calories", "~225 cal"
 */
function parseCalories(text) {
  // Range: "300-400 cal" or "600-700 cal"
  let m = text.match(/~?(\d+)\s*-\s*(\d+)\s*cal/i)
  if (m) return Math.round((parseInt(m[1]) + parseInt(m[2])) / 2)

  // Single: "~600 cal" or "300 cal" or "600 calories" or "225 cal"
  m = text.match(/~?(\d{2,4})\s*cal(?:ories?)?/i)
  if (m) return parseInt(m[1])

  // "N calories worth" or "N calories o'"
  m = text.match(/(\d{2,4})\s*calories?\b/i)
  if (m) return parseInt(m[1])

  return null
}

/**
 * Parse goal from dawn text.
 * Looks for **What would make today his:** or **Today:** or **What would make the day mine?**
 */
function parseGoal(text) {
  const field = extractBoldField(text,
    'What would make today his:',
    'What would make the weekend his:',
    'What would make today his?',
    'What would make this day mine?',
    'What can you create today:',
    'What can you create today?'
  )
  if (field) return field.substring(0, 500)

  // Prose fallback: "What would make the day mine?" or "What can you create today?"
  const m = text.match(/what (?:would make (?:the |today |this )?day (?:mine|his|ours)|can you create today)\??[:\s]*([^\n]+)/i)
  if (m) return m[1].trim().substring(0, 500)

  return null
}

/**
 * Parse dusk summary from text.
 */
function parseDuskSummary(text) {
  const field = extractBoldField(text, 'What happened:')
  if (field) return field.substring(0, 1000)

  // Prose fallback: first substantial paragraph of dusk section
  // (used in W01-W03 where format is less structured)
  const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('*'))
  if (lines.length > 0) return lines[0].trim().substring(0, 1000)

  return null
}

/**
 * Parse "What did you learn?" from dusk text.
 */
function parseDuskLearned(text) {
  const field = extractBoldField(text, 'What did you learn?')
  if (field) return field.substring(0, 500)

  // Prose fallback: "What I learned:" or "What did I learn?"
  const m = text.match(/what (?:I|did (?:you|I)) learn(?:ed)?\??[:\s]*([^\n]+)/i)
  if (m) return m[1].trim().substring(0, 500)

  return null
}

/**
 * Parse steps from text.
 * Handles: "Under 3K" → 3000, "~5500" → 5500, "8,000 steps", "3,000 (snow blowing)"
 */
function parseSteps(text) {
  const stepsField = extractBoldField(text, 'Steps:')
  if (stepsField) {
    return extractStepsFromText(stepsField)
  }

  // Also check for step mentions in the prose (W01-W03)
  return extractStepsFromText(text)
}

function extractStepsFromText(text) {
  // "Under NK" → N*1000
  let m = text.match(/under\s+(\d+)k/i)
  if (m) return parseInt(m[1]) * 1000

  // "~NK" or "about NK"
  m = text.match(/(?:~|about\s+|around\s+)(\d+)k\b/i)
  if (m) return parseInt(m[1]) * 1000

  // "N,NNN steps" or "~N,NNN steps"
  m = text.match(/~?(\d{1,2}),?(\d{3})\s*steps/i)
  if (m) return parseInt(m[1] + m[2])

  // "NK steps"
  m = text.match(/(\d+)k\s*steps/i)
  if (m) return parseInt(m[1]) * 1000

  // Bare "N,NNN" in a steps-focused field (from bold label context)
  m = text.match(/~?(\d{1,2}),?(\d{3})/)
  if (m) return parseInt(m[1] + m[2])

  // "~NNNN" without comma
  m = text.match(/~(\d{4,5})/)
  if (m) return parseInt(m[1])

  // Prose: "got in NNNN steps" or "close to NNNN steps"
  m = text.match(/(?:got in|close to|about|around|more than|nearly)\s+~?(\d{1,2}),?(\d{3})\s*steps/i)
  if (m) return parseInt(m[1] + m[2])

  return null
}

/**
 * Parse weights_done from text.
 * True if "Yes" or describes activity. False if "No" or not mentioned.
 */
function parseWeightsDone(text) {
  const field = extractBoldField(text, 'Weights:')
  if (field) {
    if (/^no\b/i.test(field.trim())) return false
    if (/^yes\b/i.test(field.trim())) return true
    if (/carry\s+(?:broken|done)/i.test(field)) return true
    if (/not named|tbd|not mentioned/i.test(field)) return false
    // If it describes an activity, it's true
    if (field.length > 5 && !/no/i.test(field)) return true
    return false
  }

  // Prose fallback
  if (/lifted?\s+(?:weights?|heavy things?|a few heavy)/i.test(text)) return true
  if (/(?:half|full)\s+workout/i.test(text)) return true

  return null // Unknown
}

/**
 * Parse weight_lbs from text (weigh-in data).
 * Looks for "NNN.N lb" or "NNN.N lbs"
 */
function parseWeightLbs(text) {
  // "Derek: 224.4 lb" or "228.4 lb" or "236.4 lbs"
  const m = text.match(/(?:Derek|Coach)[:\s]*(\d{3}(?:\.\d)?)\s*lb/i)
  if (m) return parseFloat(m[1])

  // Generic NNN.N lb in context
  const m2 = text.match(/(\d{3}\.\d)\s*lb/i)
  if (m2) return parseFloat(m2[1])

  return null
}

/**
 * Parse Sheri's weight from text.
 */
function parseSheriWeight(text) {
  const m = text.match(/Sheri[:\s]*(\d{3}(?:\.\d)?)\s*lb/i)
  if (m) return parseFloat(m[1])
  return null
}

/**
 * Parse dash_note from text. Looks for **The dash:** section.
 */
function parseDashNote(text) {
  // Match the content after **The dash:** until the next bold label or section
  const m = text.match(/\*\*The dash:\*\*\s*\n([\s\S]*?)(?=\n\*\*[A-Z]|\n##|\n---|\n\*\*What|$)/)
  if (m) return m[1].trim().substring(0, 1000)
  return null
}

// ── File splitting ──────────────────────────────────

/**
 * Split a weekly file into day blocks.
 * Each day starts with "## DayName, Month Day" or "## Month Day, Year"
 * Returns array of { header, body, date, dayNumber }
 */
function splitIntoDays(content, weekFile) {
  const dayBlocks = []

  // Split on ## headers that look like day entries
  // Match patterns:
  //   ## Monday, February 23 - Day 54
  //   ## January 1, 2026 - Day 1 of 151
  //   ## December 28, 2025 - Context (Day -3)
  //   ## January 10-11, 2026 - Days 10-11 of 151 (Saturday-Sunday)
  //   ## Saturday-Sunday, January 18-19 - Days 18-19 of 151
  const dayHeaderRe = /^## .+(?:Day\s+-?\d+|Context)/m

  const lines = content.split('\n')
  let currentHeader = null
  let currentBody = []
  let currentDate = null
  let currentDayNum = null

  for (const line of lines) {
    if (/^## /.test(line) && (dayHeaderRe.test(line) || /^## \w+day/.test(line) || /^## (?:January|February|March|April|May|June|July|August|September|October|November|December)/i.test(line))) {
      // Save previous block
      if (currentHeader) {
        dayBlocks.push({
          header: currentHeader,
          body: currentBody.join('\n'),
          date: currentDate,
          dayNumber: currentDayNum
        })
      }

      currentHeader = line
      currentBody = []
      currentDate = parseDateFromHeader(line, weekFile)
      currentDayNum = parseDayNumber(line)
    } else {
      currentBody.push(line)
    }
  }

  // Save last block
  if (currentHeader) {
    dayBlocks.push({
      header: currentHeader,
      body: currentBody.join('\n'),
      date: currentDate,
      dayNumber: currentDayNum
    })
  }

  return dayBlocks
}

/**
 * Split a day block into Dawn and Dusk sections.
 * Returns { dawn: string|null, dusk: string|null, weigh_in: string|null }
 */
function splitPhases(dayBody) {
  const result = { dawn: null, dusk: null, weigh_in: null }

  // Split on ### headers
  const sections = dayBody.split(/(?=^### )/m)

  for (const section of sections) {
    const headerMatch = section.match(/^### (.+)/)
    if (!headerMatch) {
      // Content before any ### header — could be a prose dawn or dusk in W01
      // Check if it has substantial content
      const trimmed = section.trim()
      if (trimmed.length > 50 && !result.dawn) {
        // Could be a combined entry or context block
        // Check for dusk-like content
        if (/what (?:I|did|he) (?:did|do|learn)/i.test(trimmed) ||
            /am I better/i.test(trimmed) ||
            /what happened/i.test(trimmed)) {
          result.dusk = trimmed
        } else if (/what would make/i.test(trimmed) ||
                   /woke up|up at|up and at/i.test(trimmed)) {
          result.dawn = trimmed
        }
      }
      continue
    }

    const headerLower = headerMatch[1].toLowerCase()

    if (headerLower.includes('dawn') || headerLower.includes('weekend dawn')) {
      result.dawn = section
    } else if (headerLower.includes('dusk') || headerLower.includes('weekend dusk') || headerLower.includes('late dusk')) {
      // Concatenate multiple dusk sections (e.g., "Late Dusk - Death in the Family")
      result.dusk = result.dusk ? result.dusk + '\n\n' + section : section
    } else if (headerLower.includes('weigh-in') || headerLower.includes('weigh_in')) {
      result.weigh_in = section
    } else if (headerLower.includes('claude response')) {
      // Skip Claude's responses — they're not Coach's entries
    }
  }

  return result
}

// ── Row construction ────────────────────────────────

/**
 * Build a dawn row from parsed data.
 */
function buildDawnRow(date, dayNumber, weekNumber, dawnText, weighInText) {
  const raidInfo = parseRaid(dawnText)

  const row = {
    entry_date: formatDate(date),
    day_number: dayNumber,
    week_number: weekNumber,
    phase: 'dawn',
    up_time: parseUpTime(dawnText),
    sleep_hours: parseSleepHours(dawnText),
    raid: raidInfo.raid,
    raid_description: raidInfo.description,
    raid_calories: raidInfo.calories,
    goal: parseGoal(dawnText),
    dusk_summary: null,
    dusk_learned: null,
    steps: null,
    weights_done: null,
    exercise_notes: null,
    weight_lbs: weighInText ? parseWeightLbs(weighInText) : null,
    sheri_weight_lbs: weighInText ? parseSheriWeight(weighInText) : null,
    dash_note: parseDashNote(dawnText),
    source: 'backfill',
    year: date.getFullYear() === 2025 ? 2026 : date.getFullYear(), // Pre-challenge days count as 2026
    raw_text: dawnText.substring(0, 5000)
  }

  return row
}

/**
 * Build a dusk row from parsed data.
 */
function buildDuskRow(date, dayNumber, weekNumber, duskText, weighInText) {
  const raidInfo = parseRaid(duskText)

  const row = {
    entry_date: formatDate(date),
    day_number: dayNumber,
    week_number: weekNumber,
    phase: 'dusk',
    up_time: null,
    sleep_hours: parseSleepHours(duskText),
    raid: raidInfo.raid,
    raid_description: raidInfo.description,
    raid_calories: raidInfo.calories,
    goal: null,
    dusk_summary: parseDuskSummary(duskText),
    dusk_learned: parseDuskLearned(duskText),
    steps: parseSteps(duskText),
    weights_done: parseWeightsDone(duskText),
    exercise_notes: null,
    weight_lbs: weighInText ? parseWeightLbs(weighInText) : null,
    sheri_weight_lbs: weighInText ? parseSheriWeight(weighInText) : null,
    dash_note: parseDashNote(duskText),
    source: 'backfill',
    year: date.getFullYear() === 2025 ? 2026 : date.getFullYear(),
    raw_text: duskText.substring(0, 5000)
  }

  return row
}

// ── Main ────────────────────────────────────────────

async function main() {
  console.log('Dawn Backfill Script')
  console.log('====================')
  if (DRY_RUN) console.log('DRY RUN — no Supabase writes\n')

  // Read all weekly files
  const files = readdirSync(WEEKLY_DIR)
    .filter(f => /^2026-W(?:0[1-9]|[12]\d)\.md$/.test(f))
    .sort()

  console.log(`Found ${files.length} weekly files: ${files.join(', ')}\n`)

  const allRows = []
  const failures = []

  for (const file of files) {
    const filepath = join(WEEKLY_DIR, file)
    const content = readFileSync(filepath, 'utf-8')

    console.log(`\n── ${file} ──`)

    const dayBlocks = splitIntoDays(content, file)
    console.log(`  ${dayBlocks.length} day blocks found`)

    for (const block of dayBlocks) {
      if (!block.date) {
        failures.push({ file, header: block.header, reason: 'Could not parse date' })
        console.log(`  SKIP: ${block.header.substring(0, 60)} — no date parsed`)
        continue
      }

      if (block.dayNumber === null) {
        // Try to calculate day number from date
        const daysSinceStart = Math.round(
          (block.date.getTime() - new Date('2025-12-31').getTime()) / (1000 * 60 * 60 * 24)
        )
        block.dayNumber = daysSinceStart
        console.log(`  INFO: Calculated day number ${block.dayNumber} for ${formatDate(block.date)}`)
      }

      const weekNumber = calcWeekNumber(block.date)
      const phases = splitPhases(block.body)

      // Check for special entries that have no Dawn/Dusk headers
      // (like Dec 28 "Context" or Dec 31 "pause")
      if (!phases.dawn && !phases.dusk) {
        // Check if the body itself is substantive enough to be a raw entry
        const trimmedBody = block.body.trim()
        if (trimmedBody.length > 100) {
          // Treat as a single dawn entry (context/journal)
          const row = buildDawnRow(block.date, block.dayNumber, weekNumber, trimmedBody, null)
          allRows.push(row)
          console.log(`  + ${formatDate(block.date)} Day ${block.dayNumber}: context (1 row)`)
        } else {
          console.log(`  SKIP: ${formatDate(block.date)} Day ${block.dayNumber}: no Dawn/Dusk content`)
        }
        continue
      }

      let rowCount = 0

      if (phases.dawn) {
        const row = buildDawnRow(block.date, block.dayNumber, weekNumber, phases.dawn, phases.weigh_in)
        allRows.push(row)
        rowCount++
      }

      if (phases.dusk) {
        const row = buildDuskRow(block.date, block.dayNumber, weekNumber, phases.dusk, phases.weigh_in)
        allRows.push(row)
        rowCount++
      }

      console.log(`  + ${formatDate(block.date)} Day ${block.dayNumber}: ${rowCount} rows (${phases.dawn ? 'dawn' : ''}${phases.dawn && phases.dusk ? '+' : ''}${phases.dusk ? 'dusk' : ''})`)
    }
  }

  // ── Deduplicate by (entry_date, phase, year) — later day_number wins ──

  const seen = {}
  const deduped = []
  for (const row of allRows) {
    const key = `${row.entry_date}|${row.phase}|${row.year}`
    if (seen[key] !== undefined) {
      const existing = deduped[seen[key]]
      if (row.day_number > existing.day_number) {
        console.log(`  DEDUP: ${key} — Day ${existing.day_number} replaced by Day ${row.day_number}`)
        deduped[seen[key]] = row
      } else {
        console.log(`  DEDUP: ${key} — Day ${row.day_number} dropped (Day ${existing.day_number} kept)`)
      }
    } else {
      seen[key] = deduped.length
      deduped.push(row)
    }
  }
  if (deduped.length < allRows.length) {
    console.log(`\n  ${allRows.length - deduped.length} duplicate(s) resolved`)
  }
  const finalRows = deduped

  // ── Summary ─────────────────────────────────────

  console.log('\n\n== SUMMARY ==')
  console.log(`Total rows to upsert: ${finalRows.length}`)
  console.log(`  Dawn rows: ${finalRows.filter(r => r.phase === 'dawn').length}`)
  console.log(`  Dusk rows: ${finalRows.filter(r => r.phase === 'dusk').length}`)
  console.log(`  Parse failures: ${failures.length}`)

  if (failures.length > 0) {
    console.log('\nFailures:')
    for (const f of failures) {
      console.log(`  ${f.file}: ${f.reason} — ${f.header}`)
    }
  }

  // Field coverage stats
  const fields = ['up_time', 'sleep_hours', 'raid', 'goal', 'dusk_summary', 'dusk_learned', 'steps', 'weights_done', 'dash_note']
  console.log('\nField coverage:')
  for (const field of fields) {
    const filled = finalRows.filter(r => r[field] !== null && r[field] !== undefined).length
    const pct = Math.round((filled / finalRows.length) * 100)
    console.log(`  ${field}: ${filled}/${finalRows.length} (${pct}%)`)
  }

  // ── Upsert to Supabase ──────────────────────────

  if (DRY_RUN) {
    console.log('\nDry run complete. No data written.')
    console.log('\nSample rows:')
    for (const row of finalRows.slice(0, 3)) {
      console.log(JSON.stringify(row, null, 2))
    }
    return
  }

  console.log('\nUpserting to Supabase...')

  // Upsert in batches of 25 to avoid payload limits
  const BATCH_SIZE = 25
  let inserted = 0
  let errors = 0

  for (let i = 0; i < finalRows.length; i += BATCH_SIZE) {
    const batch = finalRows.slice(i, i + BATCH_SIZE)

    const { data, error } = await supabase
      .from('dawn_entries')
      .upsert(batch, { onConflict: 'entry_date,phase,year' })

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      process.stdout.write(`  Upserted ${inserted}/${finalRows.length}\r`)
    }
  }

  console.log(`\n\nDone. ${inserted} rows upserted, ${errors} errors.`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
