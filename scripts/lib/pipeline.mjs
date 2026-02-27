/**
 * Pipeline Manifest — shared helpers
 *
 * Reads/writes reports/pipeline.json. Used by overnight agents (seeding),
 * daytime agents (publishing), dev server (review hub), and Claude Code.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const PIPELINE_PATH = join(REPO_ROOT, 'reports', 'pipeline.json')

export function readPipeline() {
  if (!existsSync(PIPELINE_PATH)) return { lastUpdated: null, items: [] }
  try {
    return JSON.parse(readFileSync(PIPELINE_PATH, 'utf-8'))
  } catch {
    return { lastUpdated: null, items: [] }
  }
}

export function writePipeline(data) {
  const dir = dirname(PIPELINE_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  data.lastUpdated = new Date().toISOString()
  writeFileSync(PIPELINE_PATH, JSON.stringify(data, null, 2) + '\n')
}

export function findItem(pipeline, id) {
  return pipeline.items.find(item => item.id === id)
}

export function upsertItem(pipeline, item) {
  const idx = pipeline.items.findIndex(i => i.id === item.id)
  item.updated = new Date().toISOString()
  if (idx >= 0) {
    pipeline.items[idx] = { ...pipeline.items[idx], ...item }
  } else {
    item.created = item.created || new Date().toISOString()
    pipeline.items.push(item)
  }
}

export function getItemsByStatus(pipeline, status) {
  return pipeline.items.filter(item => item.status === status)
}

export function getItemsByType(pipeline, type) {
  return pipeline.items.filter(item => item.type === type)
}

export { REPO_ROOT, PIPELINE_PATH }
