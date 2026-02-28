/**
 * Extract Dawn Fragments — One-Time Script
 *
 * Parses qualitative content from Derek's 15-year health practice archives
 * into the Supabase `dawn_fragments` table.
 *
 * Four extraction sources:
 *   A. patterns.md — seasonal patterns, danger language, mantras, insights
 *   B. hope-chest-letters-to-sons.md — letters to Jackson and Teegan
 *   C. daily-master-better-me.md — core mantras and manifesto
 *   D. Raw journals — keyword scanning for danger phrases, overnight patterns, weight milestones, sobriety
 *
 * Usage:
 *   node scripts/extract-dawn-fragments.mjs --dry-run   # parse only, no Supabase writes
 *   node scripts/extract-dawn-fragments.mjs              # live — deletes existing, inserts fresh
 *
 * Idempotent — DELETEs all existing fragments first, then inserts fresh.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// ── Configuration ───────────────────────────────────

var ARCHIVE_DIR = join(process.env.HOME, 'Desktop/apps/dawn/archive')
var RAW_DIR = join(ARCHIVE_DIR, 'raw')
var ENV_PATH = join(process.env.HOME, 'Desktop/standard-intelligence/.env')
var DRY_RUN = process.argv.includes('--dry-run')

// ── Load Supabase credentials ───────────────────────

config({ path: ENV_PATH })

var SUPABASE_URL = process.env.SUPABASE_URL
var SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in ' + ENV_PATH)
  process.exit(1)
}

var supabase = DRY_RUN ? null : createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Helpers ─────────────────────────────────────────

function readFile(filepath) {
  return readFileSync(filepath, 'utf-8')
}

function trimContent(text, maxLen) {
  if (!text) return ''
  var trimmed = text.trim()
  if (maxLen && trimmed.length > maxLen) {
    return trimmed.substring(0, maxLen)
  }
  return trimmed
}

// ── Source A: patterns.md ───────────────────────────

function extractFromPatterns() {
  var fragments = []
  var content = readFile(join(ARCHIVE_DIR, 'patterns.md'))
  var sourceFile = 'patterns.md'

  // 1. Seasonal patterns — each ### under ## Seasonal Patterns
  var seasonalMatch = content.match(/## Seasonal Patterns\n([\s\S]*?)(?=\n---|\n## [^#])/)
  if (seasonalMatch) {
    var seasonalBlock = seasonalMatch[1]
    var seasonSections = seasonalBlock.split(/(?=### )/)
    for (var i = 0; i < seasonSections.length; i++) {
      var sec = seasonSections[i]
      var titleMatch = sec.match(/### (.+)/)
      if (!titleMatch) continue
      var title = titleMatch[1].trim()
      var bullets = sec.replace(/### .+\n/, '').trim()
      fragments.push({
        type: 'pattern',
        content: bullets,
        source_year: null,
        source_file: sourceFile,
        source_date: null,
        context: null,
        title: title,
        tags: ['seasonal']
      })
    }
  }

  // 2. Danger language — list items under ## Recurring Language
  var recurringMatch = content.match(/## Recurring Language[^\n]*\n([\s\S]*?)(?=\n### Sign-offs)/)
  if (recurringMatch) {
    var dangerBlock = recurringMatch[1]
    var dangerLines = dangerBlock.split('\n').filter(function(l) { return /^- /.test(l.trim()) })
    for (var j = 0; j < dangerLines.length; j++) {
      var phrase = dangerLines[j].replace(/^- /, '').replace(/"/g, '').trim()
      fragments.push({
        type: 'warning',
        content: phrase,
        source_year: null,
        source_file: sourceFile,
        source_date: null,
        context: null,
        title: null,
        tags: ['danger-language']
      })
    }
  }

  // 3. Sign-off mantras
  var signoffMatch = content.match(/### Sign-offs That Appear\n([\s\S]*?)(?=\n---|\n## )/)
  if (signoffMatch) {
    var signoffBlock = signoffMatch[1]
    var signoffLines = signoffBlock.split('\n').filter(function(l) { return /^- /.test(l.trim()) })
    for (var k = 0; k < signoffLines.length; k++) {
      var mantra = signoffLines[k].replace(/^- /, '').replace(/"/g, '').trim()
      // strip parenthetical notes like "(most frequent, all eras)"
      var parenIdx = mantra.indexOf('(')
      if (parenIdx > 0) {
        mantra = mantra.substring(0, parenIdx).trim()
      }
      fragments.push({
        type: 'mantra',
        content: mantra,
        source_year: null,
        source_file: sourceFile,
        source_date: null,
        context: null,
        title: null,
        tags: ['sign-off']
      })
    }
  }

  // 4. Blockquote insights — ## Key Insights From Archives
  var insightsMatch = content.match(/## Key Insights From Archives\n([\s\S]*?)(?=\n---|\n## )/)
  if (insightsMatch) {
    var insightsBlock = insightsMatch[1]
    // Split by ### subsections
    var insightSections = insightsBlock.split(/(?=### )/)
    for (var m = 0; m < insightSections.length; m++) {
      var isec = insightSections[m]
      var quoteMatch = isec.match(/> "([^"]+)"/)
      if (!quoteMatch) {
        // Try without quotes
        quoteMatch = isec.match(/> (.+)/)
      }
      if (!quoteMatch) continue
      // Combine multi-line blockquotes
      var quoteLines = isec.match(/> .+/g)
      var fullQuote = ''
      if (quoteLines) {
        var parts = []
        for (var q = 0; q < quoteLines.length; q++) {
          var ql = quoteLines[q].replace(/^>\s*/, '').replace(/^"/, '').replace(/"$/, '').trim()
          if (ql.indexOf('\u2014 ') !== 0) {
            parts.push(ql)
          }
        }
        fullQuote = parts.join(' ')
      }
      // Parse date from attribution
      var dateAttrib = isec.match(/>\s*\u2014\s*(.+)/)
      var sourceDate = dateAttrib ? dateAttrib[1].trim() : null

      fragments.push({
        type: 'insight',
        content: fullQuote,
        source_year: null,
        source_file: sourceFile,
        source_date: sourceDate,
        context: null,
        title: null,
        tags: ['insight']
      })
    }
  }

  // 5. Overnight eating breakthrough — "What Coach Actually Knows"
  var coachKnowsMatch = content.match(/### What Coach Actually Knows[^\n]*\n([\s\S]*?)(?=\n---|\n## )/)
  if (coachKnowsMatch) {
    var coachBlock = coachKnowsMatch[1].trim()
    // Remove the bold header line
    var coachContent = coachBlock.replace(/^\*\*[^*]+\*\*\s*\n*/, '').trim()
    fragments.push({
      type: 'breakthrough',
      content: "It's not circadian. It's guilt. Eating when no one is looking. Not being judged\u2014even by himself, who is half asleep. The judge is asleep too.",
      source_year: 2026,
      source_file: sourceFile,
      source_date: 'January 13, 2026',
      context: coachContent,
      title: 'The Overnight Eating Truth',
      tags: ['overnight-eating']
    })
  }

  // 6. What actually works — ## What Actually Works (Evidence-Based)
  var worksMatch = content.match(/## What Actually Works \(Evidence-Based\)\n([\s\S]*?)(?=\n---|\n## )/)
  if (!worksMatch) {
    worksMatch = content.match(/## What Actually Works[^\n]*\n([\s\S]*?)(?=\n---|\n## )/)
  }
  if (worksMatch) {
    var worksBlock = worksMatch[1]
    // Get the "Consistently Effective" section
    var effectiveMatch = worksBlock.match(/### Consistently Effective\n([\s\S]*?)(?=\n### |\n---|\n## |$)/)
    if (effectiveMatch) {
      var effectiveLines = effectiveMatch[1].split('\n').filter(function(l) { return /^\d+\./.test(l.trim()) })
      for (var w = 0; w < effectiveLines.length; w++) {
        var item = effectiveLines[w].replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim()
        fragments.push({
          type: 'insight',
          content: item,
          source_year: null,
          source_file: sourceFile,
          source_date: null,
          context: null,
          title: null,
          tags: ['what-works']
        })
      }
    }
  }

  // 7. What doesn't work — ## What Consistently Doesn't Work
  var antiMatch = content.match(/## What Consistently Doesn't Work\n([\s\S]*?)(?=\n---|\n## )/)
  if (antiMatch) {
    var antiLines = antiMatch[1].split('\n').filter(function(l) { return /^\d+\./.test(l.trim()) })
    for (var a = 0; a < antiLines.length; a++) {
      var antiItem = antiLines[a].replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim()
      fragments.push({
        type: 'warning',
        content: antiItem,
        source_year: null,
        source_file: sourceFile,
        source_date: null,
        context: null,
        title: null,
        tags: ['anti-pattern']
      })
    }
  }

  return fragments
}

// ── Source B: hope-chest-letters-to-sons.md ──────────

function extractFromHopeChest() {
  var fragments = []
  var content = readFile(join(ARCHIVE_DIR, 'hope-chest-letters-to-sons.md'))
  var sourceFile = 'hope-chest-letters-to-sons.md'

  // Split by ## sections
  var sections = content.split(/(?=^## )/m)

  for (var i = 0; i < sections.length; i++) {
    var section = sections[i]
    var headerMatch = section.match(/^## (.+)/m)
    if (!headerMatch) continue

    var sectionTitle = headerMatch[1].trim()

    // Skip the H1 header and Final Word
    if (sectionTitle === 'Final Word') continue
    if (/^Letters to/i.test(sectionTitle)) continue

    // Find dated entries within section
    var body = section.replace(/^## .+\n/, '').trim()

    // Split by bold date patterns
    var datePattern = /\*\*([^*]+)\*\*/g
    var dates = []
    var match

    // First pass: collect all date-like bold entries
    while ((match = datePattern.exec(body)) !== null) {
      var boldText = match[1].trim()
      // Check if this looks like a date
      if (/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/.test(boldText)) {
        dates.push({ date: boldText, index: match.index })
      }
    }

    if (dates.length > 0) {
      // Split body by date positions
      for (var d = 0; d < dates.length; d++) {
        var startIdx = dates[d].index
        var endIdx = (d + 1 < dates.length) ? dates[d + 1].index : body.length
        var entryText = body.substring(startIdx, endIdx).trim()
        // Remove the bold date prefix
        entryText = entryText.replace(/^\*\*[^*]+\*\*\s*/, '').trim()

        // Parse year from date
        var yearMatch = dates[d].date.match(/(\d{4})/)
        var sourceYear = yearMatch ? parseInt(yearMatch[1]) : 2024

        var entryContent = trimContent(entryText, 500)
        var entryContext = entryText.length > 500 ? entryText : null

        fragments.push({
          type: 'letter',
          content: entryContent,
          source_year: sourceYear,
          source_file: sourceFile,
          source_date: dates[d].date,
          context: entryContext,
          title: sectionTitle,
          tags: ['jackson', 'teegan', 'hope-chest']
        })
      }
    } else {
      // No dated entries — treat whole section as one fragment
      var sectionContent = trimContent(body, 500)
      var sectionContext = body.length > 500 ? body : null

      fragments.push({
        type: 'letter',
        content: sectionContent,
        source_year: 2024,
        source_file: sourceFile,
        source_date: null,
        context: sectionContext,
        title: sectionTitle,
        tags: ['jackson', 'teegan', 'hope-chest']
      })
    }
  }

  return fragments
}

// ── Source C: daily-master-better-me.md ──────────────

function extractFromDailyMaster() {
  var fragments = []
  var content = readFile(join(RAW_DIR, 'daily-master-better-me.md'))
  var sourceFile = 'daily-master-better-me.md'

  // 1. 12 mantras from ## Core Philosophical Mantras
  var mantrasMatch = content.match(/## Core Philosophical Mantras\n([\s\S]*?)(?=\n## )/)
  if (mantrasMatch) {
    var mantrasBlock = mantrasMatch[1]
    var mantrasLines = mantrasBlock.split('\n').filter(function(l) { return /^\d+\./.test(l.trim()) })
    for (var i = 0; i < mantrasLines.length; i++) {
      var mantraText = mantrasLines[i].replace(/^\d+\.\s*/, '').trim()
      fragments.push({
        type: 'mantra',
        content: mantraText,
        source_year: 2024,
        source_file: sourceFile,
        source_date: null,
        context: null,
        title: 'Mantra #' + (i + 1),
        tags: ['daily-mantras']
      })
    }
  }

  // 2. "Do the Thing" manifesto
  var manifestoMatch = content.match(/## The \u201CDo the Thing\u201D Manifesto\n([\s\S]*?)(?=\n## )/)
  if (!manifestoMatch) {
    manifestoMatch = content.match(/## The "Do the Thing" Manifesto\n([\s\S]*?)(?=\n## )/)
  }
  if (manifestoMatch) {
    var manifestoBlock = manifestoMatch[1].trim()
    // Get all the lines
    var manifestoLines = manifestoBlock.split('\n').filter(function(l) { return l.trim().length > 0 })
    var manifestoContent = manifestoLines.join('\n')

    fragments.push({
      type: 'breakthrough',
      content: manifestoContent,
      source_year: 2024,
      source_file: sourceFile,
      source_date: null,
      context: null,
      title: 'The "Do the Thing" Manifesto',
      tags: ['manifesto']
    })
  }

  return fragments
}

// ── Source D: Raw journal keyword scanning ───────────

var DANGER_PHRASES = [
  /feeling my fatness/i,
  /back to the grind/i,
  /one more great run/i,
  /just need to flip the switch/i,
  /this time is different/i
]

var OVERNIGHT_PATTERNS = [
  /got up for a snack/i,
  /up at \d+ for snack/i,
  /up several times for/i,
  /up a couple of times for snack/i,
  /overnight.*snack/i,
  /2am.*snack|snack.*2am/i
]

var WEIGHT_MILESTONES = [
  /(?:down to|got to|hit|reached|weighed in at)\s*(?:about\s+)?1[789]\d/i,
  /under 200/i,
  /lost 30 pounds/i,
  /lightest in/i,
  /down \d{2,} pounds/i
]

var SOBER_PATTERNS = [
  /going dry/i,
  /went dry/i,
  /\bsober\b/i,
  /dry for/i,
  /months? sober/i,
  /no alcohol/i
]

var RAW_FILES = [
  { file: 'Daily-Better-Me-2010-2020.md', defaultYear: 2020, yearRange: [2010, 2020] },
  { file: 'Daily-Better-Me-2017.md', defaultYear: 2017, yearRange: [2017, 2017] },
  { file: 'Daily-Better-Me-2021.md', defaultYear: 2021, yearRange: [2021, 2021] },
  { file: 'Daily-Better-Me-2022-2023.md', defaultYear: 2023, yearRange: [2022, 2023] },
  { file: 'Better-Me-2024-Evernote.md', defaultYear: 2024, yearRange: [2024, 2024] }
]

// Date header patterns for splitting entries
var DATE_HEADERS = [
  // **Mon. DD:** or **Mon. DD.** or **Mon DD:** or **Su 1/1:**
  /\*\*(\w+\.?\s+\d+[\-\d]*)[\.:]\*\*/,
  // **Mon. DD-DD.** or **Mon DD-DD.**
  /\*\*(\w+\.?\s+\d+-\d+)[\.:]\*\*/,
  // **Mon DD-DD, YYYY.** (2024 Evernote multi-day format)
  /\*\*(\w+\.?\s+\d+-\w*\.?\s*\d+)[\.:]\*\*/
]

function splitRawEntries(content) {
  // Split on bold date patterns at start of line
  var entries = []
  var lines = content.split('\n')
  var currentEntry = null
  var currentHeader = null

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var headerFound = false

    for (var p = 0; p < DATE_HEADERS.length; p++) {
      var headerMatch = line.match(DATE_HEADERS[p])
      if (headerMatch) {
        // Save previous entry
        if (currentHeader && currentEntry) {
          entries.push({ header: currentHeader, text: currentEntry.join('\n') })
        }
        currentHeader = headerMatch[1]
        currentEntry = [line]
        headerFound = true
        break
      }
    }

    if (!headerFound && currentEntry) {
      currentEntry.push(line)
    }
  }

  // Save last entry
  if (currentHeader && currentEntry) {
    entries.push({ header: currentHeader, text: currentEntry.join('\n') })
  }

  return entries
}

function parseDateFromRawHeader(header) {
  // Parse "Dec. 27" or "Jan 2" or "Sept. 30-Oct. 5" etc.
  var headerMatch = header.match(/(\w+)\.?\s+(\d+)/)
  if (headerMatch) {
    return headerMatch[1] + '. ' + headerMatch[2]
  }
  return header
}

function extractSentenceContaining(text, pattern) {
  // Find the sentence containing the pattern match
  var patternMatch = text.match(pattern)
  if (!patternMatch) return null

  var matchIdx = text.indexOf(patternMatch[0])
  // Find sentence boundaries
  var start = matchIdx
  while (start > 0 && text[start - 1] !== '.' && text[start - 1] !== '!' && text[start - 1] !== '\n') {
    start--
  }
  var end = matchIdx + patternMatch[0].length
  while (end < text.length && text[end] !== '.' && text[end] !== '!' && text[end] !== '\n') {
    end++
  }
  if (end < text.length && text[end] === '.') end++

  return text.substring(start, end).trim()
}

function extractFromRawJournals() {
  var fragments = []

  for (var f = 0; f < RAW_FILES.length; f++) {
    var fileInfo = RAW_FILES[f]
    var filepath = join(RAW_DIR, fileInfo.file)
    var content
    try {
      content = readFile(filepath)
    } catch (e) {
      console.log('  SKIP: Could not read ' + fileInfo.file + ': ' + e.message)
      continue
    }

    var entries = splitRawEntries(content)
    var dangerCount = 0
    var overnightCount = 0
    var weightCount = 0
    var soberCount = 0

    for (var e = 0; e < entries.length; e++) {
      var entry = entries[e]
      var entryText = entry.text
      var dateStr = parseDateFromRawHeader(entry.header)

      // Danger phrases (max 10 per file)
      if (dangerCount < 10) {
        for (var dp = 0; dp < DANGER_PHRASES.length; dp++) {
          if (dangerCount >= 10) break
          if (DANGER_PHRASES[dp].test(entryText)) {
            var dangerSentence = extractSentenceContaining(entryText, DANGER_PHRASES[dp])
            if (dangerSentence && dangerSentence.length > 20) {
              fragments.push({
                type: 'warning',
                content: trimContent(dangerSentence, 500),
                source_year: fileInfo.defaultYear,
                source_file: fileInfo.file,
                source_date: dateStr,
                context: null,
                title: null,
                tags: ['danger-language', 'raw-journal']
              })
              dangerCount++
            }
          }
        }
      }

      // Overnight patterns (max 5 per file)
      if (overnightCount < 5) {
        for (var op = 0; op < OVERNIGHT_PATTERNS.length; op++) {
          if (overnightCount >= 5) break
          if (OVERNIGHT_PATTERNS[op].test(entryText)) {
            var overnightSentence = extractSentenceContaining(entryText, OVERNIGHT_PATTERNS[op])
            if (overnightSentence) {
              fragments.push({
                type: 'pattern',
                content: trimContent(overnightSentence, 500),
                source_year: fileInfo.defaultYear,
                source_file: fileInfo.file,
                source_date: dateStr,
                context: null,
                title: null,
                tags: ['overnight-eating', 'raw-journal']
              })
              overnightCount++
            }
          }
        }
      }

      // Weight milestones (max 5 per file)
      if (weightCount < 5) {
        for (var wp = 0; wp < WEIGHT_MILESTONES.length; wp++) {
          if (weightCount >= 5) break
          if (WEIGHT_MILESTONES[wp].test(entryText)) {
            var weightSentence = extractSentenceContaining(entryText, WEIGHT_MILESTONES[wp])
            if (weightSentence) {
              fragments.push({
                type: 'breakthrough',
                content: trimContent(weightSentence, 500),
                source_year: fileInfo.defaultYear,
                source_file: fileInfo.file,
                source_date: dateStr,
                context: null,
                title: null,
                tags: ['weight-milestone', 'raw-journal']
              })
              weightCount++
            }
          }
        }
      }

      // Sober streaks (max 3 per file)
      if (soberCount < 3) {
        for (var sp = 0; sp < SOBER_PATTERNS.length; sp++) {
          if (soberCount >= 3) break
          if (SOBER_PATTERNS[sp].test(entryText)) {
            var soberSentence = extractSentenceContaining(entryText, SOBER_PATTERNS[sp])
            if (soberSentence) {
              fragments.push({
                type: 'breakthrough',
                content: trimContent(soberSentence, 500),
                source_year: fileInfo.defaultYear,
                source_file: fileInfo.file,
                source_date: dateStr,
                context: null,
                title: null,
                tags: ['sobriety', 'raw-journal']
              })
              soberCount++
            }
          }
        }
      }
    }

    console.log('  ' + fileInfo.file + ': ' + entries.length + ' entries, ' +
      dangerCount + ' danger, ' + overnightCount + ' overnight, ' +
      weightCount + ' weight, ' + soberCount + ' sober')
  }

  return fragments
}

// ── Year Summaries ──────────────────────────────────

function getYearSummaries() {
  var yearSummaries = [
    { source_year: 2010, content: 'Early logging. Streaks, mantras, the pattern establishes.', context: JSON.stringify({ weight_range: '195-225', key_events: ['Started daily journaling', 'Same patterns begin'] }) },
    { source_year: 2017, content: 'Daily tracking deepens. Same patterns, same obstacles.', context: JSON.stringify({ weight_range: '200-220', key_events: [] }) },
    { source_year: 2018, content: 'Star Tribune years. Work intensity vs health balance.', context: JSON.stringify({ weight_range: '200-225', key_events: [] }) },
    { source_year: 2020, content: 'Pandemic. Overnight snacks documented. "Feeling my fatness."', context: JSON.stringify({ weight_range: '210-230', key_events: ['Pandemic begins', 'Working from home'] }) },
    { source_year: 2021, content: 'Pandemic year two. Longer reflections begin.', context: JSON.stringify({ weight_range: '215-230', key_events: [] }) },
    { source_year: 2022, content: 'Got down to 205 mid-December. Then wheels came off.', context: JSON.stringify({ weight_range: '205-225', key_events: ['Got down to 205'] }) },
    { source_year: 2023, content: 'The year of the streak. 5 months sober. 225 to 195. Ran a 5K.', context: JSON.stringify({ weight_range: '195-225', key_events: ['Went dry September', '5-month challenge', 'Lost 30 lbs', 'Ran a 5K'] }) },
    { source_year: 2024, content: 'Hope chest letters to sons. The stoics. Position eliminated.', context: JSON.stringify({ weight_range: '195-220', key_events: ['Hope chest letters', 'Position eliminated October'] }) },
    { source_year: 2025, content: 'Sandra passed June 28. CW Strategies founded.', context: JSON.stringify({ weight_range: null, key_events: ['Sandra Sue Simmons passed June 28', 'CW Strategies founded'] }) },
    { source_year: 2026, content: '151-day challenge. Better Us with Sheri. The Dash.', context: JSON.stringify({ weight_range: '220-236', key_events: ['Challenge started Jan 1', 'Better Us partnership', 'The Dash'] }) }
  ]

  var fragments = []
  for (var i = 0; i < yearSummaries.length; i++) {
    var ys = yearSummaries[i]
    fragments.push({
      type: 'year_summary',
      content: ys.content,
      source_year: ys.source_year,
      source_file: null,
      source_date: null,
      context: ys.context,
      title: ys.source_year + ' Summary',
      tags: ['year-summary']
    })
  }

  return fragments
}

// ── Main ────────────────────────────────────────────

async function main() {
  console.log('Dawn Fragment Extraction')
  console.log('========================')
  if (DRY_RUN) console.log('DRY RUN — no Supabase writes\n')

  // Source A: patterns.md
  console.log('\n-- Source A: patterns.md --')
  var patternsFragments = extractFromPatterns()
  console.log('  Extracted: ' + patternsFragments.length + ' fragments')

  // Source B: hope-chest-letters-to-sons.md
  console.log('\n-- Source B: hope-chest-letters-to-sons.md --')
  var hopeChestFragments = extractFromHopeChest()
  console.log('  Extracted: ' + hopeChestFragments.length + ' fragments')

  // Source C: daily-master-better-me.md
  console.log('\n-- Source C: daily-master-better-me.md --')
  var dailyMasterFragments = extractFromDailyMaster()
  console.log('  Extracted: ' + dailyMasterFragments.length + ' fragments')

  // Source D: Raw journals
  console.log('\n-- Source D: Raw journals --')
  var rawFragments = extractFromRawJournals()
  console.log('  Total from raw: ' + rawFragments.length + ' fragments')

  // Year summaries
  console.log('\n-- Year Summaries --')
  var yearFragments = getYearSummaries()
  console.log('  Extracted: ' + yearFragments.length + ' fragments')

  // Combine all
  var allFragments = []
    .concat(patternsFragments)
    .concat(hopeChestFragments)
    .concat(dailyMasterFragments)
    .concat(rawFragments)
    .concat(yearFragments)

  // ── Summary ─────────────────────────────────────
  console.log('\n\n== SUMMARY ==')
  console.log('A (patterns.md):           ' + patternsFragments.length)
  console.log('B (hope-chest):            ' + hopeChestFragments.length)
  console.log('C (daily-master):          ' + dailyMasterFragments.length)
  console.log('D (raw journals):          ' + rawFragments.length)
  console.log('Year summaries:            ' + yearFragments.length)
  console.log('-----------------------------')
  console.log('TOTAL:                     ' + allFragments.length)

  // Type breakdown
  var typeCounts = {}
  for (var t = 0; t < allFragments.length; t++) {
    var ftype = allFragments[t].type
    typeCounts[ftype] = (typeCounts[ftype] || 0) + 1
  }
  console.log('\nBy type:')
  var typeKeys = Object.keys(typeCounts)
  for (var tk = 0; tk < typeKeys.length; tk++) {
    console.log('  ' + typeKeys[tk] + ': ' + typeCounts[typeKeys[tk]])
  }

  // ── Dry run output ────────────────────────────

  if (DRY_RUN) {
    console.log('\n\n== SAMPLE FRAGMENTS ==')

    var sources = [
      { name: 'A (patterns.md)', frags: patternsFragments },
      { name: 'B (hope-chest)', frags: hopeChestFragments },
      { name: 'C (daily-master)', frags: dailyMasterFragments },
      { name: 'D (raw journals)', frags: rawFragments },
      { name: 'Year summaries', frags: yearFragments }
    ]

    for (var s = 0; s < sources.length; s++) {
      console.log('\n-- ' + sources[s].name + ' (first 5) --')
      var sample = sources[s].frags.slice(0, 5)
      for (var ss = 0; ss < sample.length; ss++) {
        var frag = sample[ss]
        console.log(JSON.stringify({
          type: frag.type,
          title: frag.title,
          content: frag.content.substring(0, 120) + (frag.content.length > 120 ? '...' : ''),
          source_year: frag.source_year,
          source_file: frag.source_file,
          source_date: frag.source_date,
          tags: frag.tags
        }, null, 2))
      }
    }

    console.log('\nDry run complete. No data written.')
    return
  }

  // ── Live: Delete existing, then insert ────────

  console.log('\nDeleting existing fragments...')
  var deleteResult = await supabase
    .from('dawn_fragments')
    .delete()
    .not('type', 'is', null)

  if (deleteResult.error) {
    console.error('Delete error: ' + deleteResult.error.message)
    // Try alternative — delete by known types
    var types = ['pattern', 'warning', 'mantra', 'insight', 'breakthrough', 'letter', 'year_summary']
    for (var di = 0; di < types.length; di++) {
      await supabase.from('dawn_fragments').delete().eq('type', types[di])
    }
    console.log('  Deleted existing fragments (by type).')
  } else {
    console.log('  Deleted existing fragments.')
  }

  console.log('\nInserting ' + allFragments.length + ' fragments...')

  // Batch inserts
  var BATCH_SIZE = 25
  var inserted = 0
  var errors = 0

  for (var bi = 0; bi < allFragments.length; bi += BATCH_SIZE) {
    var batch = allFragments.slice(bi, bi + BATCH_SIZE)

    var result = await supabase
      .from('dawn_fragments')
      .insert(batch)

    if (result.error) {
      console.error('  Batch ' + (Math.floor(bi / BATCH_SIZE) + 1) + ' error: ' + result.error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      process.stdout.write('  Inserted ' + inserted + '/' + allFragments.length + '\r')
    }
  }

  console.log('\n\nDone. ' + inserted + ' fragments inserted, ' + errors + ' errors.')
}

main().catch(function(err) {
  console.error('Fatal error:', err)
  process.exit(1)
})
