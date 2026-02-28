#!/usr/bin/env node

/**
 * Message Counter — counts Claude Code messages from local JSONL transcripts.
 * Writes to data/message-stats.json for the research page and kitchen page.
 *
 * Run: node scripts/message-counter.mjs
 *
 * Note: JSONL files are local only (~/.claude/projects/). This script must
 * run on Derek's machine. The output file gets committed and deployed.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const PROJECTS_DIR = join(homedir(), '.claude', 'projects');
const OUTPUT = join(import.meta.dirname, '..', 'data', 'message-stats.json');

// Friendly project names
const PROJECT_NAMES = {
  'claudewill-io': 'claudewill.io',
  'ROOT': 'Ecosystem',
  'writing': 'Writing',
  'HOME': 'Home',
  'apps-hancock': 'Hancock',
  'apps-dawn': 'Dawn',
  'writing-finding-claude': 'Finding Claude',
  'CDN-Project': 'CDN',
  'slowly-sideways': 'Slowly Sideways',
  'd-rock': 'D-Rock',
  'standard-intelligence': 'Standard Intelligence',
  'apps-coach': 'Coach D',
  'dawn': 'Dawn (old)',
  'apps-boolean': 'Boolean',
  'writing-practice': 'Writing Practice',
  'cdn': 'CDN (old)',
  'clients-cascadia': 'Cascadia',
  'coach': 'Coach (old)',
  'apps-d-rock': 'D-Rock (old)',
  'hancock': 'Hancock (old)',
  'apps-bob': 'BOB',
  'bob': 'BOB (old)',
};

function findJsonlFiles(dir) {
  const files = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findJsonlFiles(full));
      } else if (entry.name.endsWith('.jsonl')) {
        files.push(full);
      }
    }
  } catch { /* skip unreadable dirs */ }
  return files;
}

async function countMessages(filePath) {
  let user = 0, assistant = 0;
  const rl = createInterface({ input: createReadStream(filePath), crlfDelay: Infinity });
  for await (const line of rl) {
    if (line.includes('"role":"user"') || line.includes('"role": "user"')) user++;
    if (line.includes('"role":"assistant"') || line.includes('"role": "assistant"')) assistant++;
  }
  return { user, assistant };
}

function getProjectKey(filePath) {
  const rel = filePath.replace(PROJECTS_DIR + '/', '');
  const projDir = rel.split('/')[0];
  const cleaned = projDir
    .replace(/-Users-dereksimmons-Desktop-/, '')
    .replace(/-Users-dereksimmons-Desktop/, 'ROOT')
    .replace(/-Users-dereksimmons/, 'HOME');
  return cleaned;
}

function getFileDateRange(files) {
  let earliest = Infinity, latest = 0;
  for (const f of files) {
    try {
      const stat = statSync(f);
      const t = stat.mtimeMs;
      if (t < earliest) earliest = t;
      if (t > latest) latest = t;
    } catch { /* skip */ }
  }
  return {
    start: new Date(earliest).toISOString().split('T')[0],
    end: new Date(latest).toISOString().split('T')[0],
  };
}

async function main() {
  console.log('Scanning JSONL files...');
  const files = findJsonlFiles(PROJECTS_DIR);
  console.log(`Found ${files.length} conversation files.`);

  const byProject = {};
  let totalUser = 0, totalAssistant = 0;

  // Process in batches to avoid memory issues
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const counts = await countMessages(f);
    const proj = getProjectKey(f);

    if (!byProject[proj]) byProject[proj] = { user: 0, assistant: 0, conversations: 0 };
    byProject[proj].user += counts.user;
    byProject[proj].assistant += counts.assistant;
    byProject[proj].conversations++;

    totalUser += counts.user;
    totalAssistant += counts.assistant;

    if ((i + 1) % 100 === 0) {
      console.log(`  Processed ${i + 1}/${files.length}...`);
    }
  }

  const dateRange = getFileDateRange(files);
  const days = Math.max(1, Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)));

  // Sort projects by user message count
  const projects = Object.entries(byProject)
    .map(([key, val]) => ({
      key,
      name: PROJECT_NAMES[key] || key,
      user_messages: val.user,
      assistant_messages: val.assistant,
      total_messages: val.user + val.assistant,
      conversations: val.conversations,
    }))
    .sort((a, b) => b.user_messages - a.user_messages);

  const stats = {
    updated: new Date().toISOString(),
    claude_code: {
      start_date: dateRange.start,
      end_date: dateRange.end,
      days,
      conversations: files.length,
      user_messages: totalUser,
      assistant_messages: totalAssistant,
      total_messages: totalUser + totalAssistant,
      avg_user_per_day: Math.round(totalUser / days),
      avg_total_per_day: Math.round((totalUser + totalAssistant) / days),
    },
    by_project: projects.filter(p => p.user_messages > 0),
    note: 'Claude Code only (Jan 2026+). Claude.ai web history (Oct 2024 - Jan 2026) not included. Estimated 14-month total across all platforms: 100K-200K+.',
  };

  writeFileSync(OUTPUT, JSON.stringify(stats, null, 2));
  console.log(`\nDone. Written to ${OUTPUT}`);
  console.log(`\n=== Summary ===`);
  console.log(`Conversations: ${stats.claude_code.conversations.toLocaleString()}`);
  console.log(`Days: ${stats.claude_code.days}`);
  console.log(`User messages: ${stats.claude_code.user_messages.toLocaleString()}`);
  console.log(`Assistant messages: ${stats.claude_code.assistant_messages.toLocaleString()}`);
  console.log(`Total: ${stats.claude_code.total_messages.toLocaleString()}`);
  console.log(`Avg/day (user): ${stats.claude_code.avg_user_per_day.toLocaleString()}`);
  console.log(`Top project: ${projects[0]?.name} (${projects[0]?.user_messages.toLocaleString()} msgs)`);
}

main().catch(console.error);
