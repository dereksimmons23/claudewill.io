#!/usr/bin/env node
/**
 * build-pages.js — claudewill.io page normalizer
 *
 * Single source of truth for footer, script order, and nav across all pages.
 * Run at deploy time (Netlify build command) and whenever templates change.
 *
 * What it enforces:
 *   - Canonical footer per page type (main / essay / simple)
 *   - Correct script load order (cw-link-renderer → porch-widget → shared-nav [→ star-nav])
 *   - Removes local .page-dropdown from page headers (double-menu fix)
 *
 * Templates live in: templates/partials/
 * Pages are normalized in-place.
 *
 * Usage:
 *   node scripts/build-pages.js
 *   node scripts/build-pages.js --dry-run   (preview changes without writing)
 *   node scripts/build-pages.js --page derek.html  (single page)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
const PARTIALS = path.join(ROOT, 'templates', 'partials');
const DRY_RUN  = process.argv.includes('--dry-run');
const SINGLE   = (() => { const i = process.argv.indexOf('--page'); return i > -1 ? process.argv[i + 1] : null; })();

// ── Page manifest ────────────────────────────────────────────────────────────
//
// footer: 'main' | 'essay' | 'simple'
// scripts: 'main' (+ star-nav) | 'essay' (+ article-share) | 'simple' | 'arcade' | 'none'
// dropdownFix: true = remove .page-dropdown-toggle + .page-dropdown from .page-header
// skip: don't touch this file (handled manually or standalone)

const PAGES = {
  // Main content pages
  'derek.html':                                    { footer: 'main',  scripts: 'main',   dropdownFix: true  },
  'story.html':                                    { footer: 'main',  scripts: 'main',   dropdownFix: true  },
  'standard.html':                                 { footer: 'main',  scripts: 'main',   dropdownFix: true  },
  'book.html':                                     { footer: 'main',  scripts: 'main',   dropdownFix: true  },
  'claude.html':                                   { footer: 'main',  scripts: 'main',   dropdownFix: true  },
  'writing/index.html':                            { footer: 'main',  scripts: 'main',   dropdownFix: true  },
  'lightning/bug/index.html':                      { footer: 'main',  scripts: 'main',   dropdownFix: true  },
  'derek/resume.html':                             { footer: 'main',  scripts: 'simple', dropdownFix: false },

  // Simple pages
  'privacy.html':                                  { footer: 'simple', scripts: 'simple', dropdownFix: false },
  'terms.html':                                    { footer: 'simple', scripts: 'simple', dropdownFix: false },

  // Arcade
  'arcade.html':                                   { footer: 'simple', scripts: 'arcade', dropdownFix: false },

  // Being Claude hub (has page-header with dropdown)
  'being-claude/index.html':                       { footer: 'essay',  scripts: 'main',   dropdownFix: true  },

  // Being Claude essays
  'being-claude/being-claude/index.html':          { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/warm-up-effect/index.html':        { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/the-bright-line/index.html':       { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/comprehension-problem/index.html': { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/the-loss-function/index.html':     { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/the-hall-effect/index.html':       { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/the-duality/index.html':           { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/three-rooms/index.html':           { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/the-disclaimer/index.html':        { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/the-jar/index.html':               { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/the-last-nine-percent/index.html': { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/the-reconsideration/index.html':   { footer: 'essay',  scripts: 'essay',  dropdownFix: false },
  'being-claude/the-dimmer-switch/index.html':     { footer: 'essay',  scripts: 'essay',  dropdownFix: false },

  // Skipped pages (standalone / special)
  // 'index.html'        → two-mode homepage, managed directly
  // 'kitchen/index.html'→ standalone TUI, no shared nav by design
  // 'd/index.html'      → gated, managed by Netlify function
  // 'spend/index.html'  → internal
  // 'report/index.html' → internal
};

// ── Partials ─────────────────────────────────────────────────────────────────

function partial(name) {
  return fs.readFileSync(path.join(PARTIALS, name + '.html'), 'utf8').trimEnd();
}

const FOOTERS = {
  main:   partial('footer-main'),
  essay:  partial('footer-essay'),
  simple: partial('footer-essay'),  // same content, clean class
};

// Build script blocks — page-specific JS goes BEFORE these via page-scripts marker
const SCRIPTS = {
  main:   partial('scripts-main'),
  essay:  partial('scripts-essay'),
  simple: partial('scripts-simple'),
  arcade: partial('scripts-simple') + '\n  <script src="/js/arcade/arcade.js" defer></script>',
};

// ── Normalizers ───────────────────────────────────────────────────────────────

/**
 * Replace the <footer ...>...</footer> block with the canonical footer.
 * Handles multiline footers.
 */
function normalizeFooter(html, footerType) {
  const canonical = FOOTERS[footerType];
  // Match any <footer> ... </footer> block (non-greedy, multiline)
  const footerRe = /<footer[\s\S]*?<\/footer>/;
  if (footerRe.test(html)) {
    return html.replace(footerRe, canonical);
  }
  // No footer found — insert before </body>
  console.warn('  ⚠ No <footer> found — inserting before </body>');
  return html.replace('</body>', canonical + '\n</body>');
}

/**
 * Replace shared script tags with the canonical block.
 * Strategy:
 *   1. Remove any existing shared script tags from anywhere in the file
 *   2. Insert the canonical block just before </body>
 * This handles pages where shared scripts appear mid-file or in wrong order.
 */
function normalizeScripts(html, scriptsType) {
  const canonical = SCRIPTS[scriptsType];

  // Known shared script filenames to strip from wherever they appear
  const SHARED = [
    '/js/cw-link-renderer.js',
    '/js/porch-widget.js',
    '/js/shared-nav.js',
    '/js/star-nav.js',
    '/js/article-share.js',
    '/js/arcade/arcade.js',
  ];

  // Remove each known script tag (with any attributes like defer/async)
  for (const src of SHARED) {
    const re = new RegExp(`[ \t]*<script src="${src.replace(/\//g, '\\/')}"[^>]*><\\/script>\\n?`, 'g');
    html = html.replace(re, '');
  }

  // Insert canonical block before </body>
  return html.replace('</body>', canonical + '\n</body>');
}

/**
 * Remove the local .page-dropdown-toggle button and .page-dropdown nav
 * from .page-header elements (double-menu fix).
 * Keeps the brand link (left) and palette-trigger (right).
 */
function removePageDropdown(html) {
  // Remove <button class="page-dropdown-toggle" ...>...</button>
  html = html.replace(/<button[^>]*class="[^"]*page-dropdown-toggle[^"]*"[^>]*>[\s\S]*?<\/button>/g, '');
  // Remove <nav class="page-dropdown" ...>...</nav>
  html = html.replace(/<nav[^>]*class="[^"]*page-dropdown[^"]*"[\s\S]*?<\/nav>/g, '');
  // Remove any now-empty center div in page-header
  html = html.replace(/<div[^>]*class="[^"]*page-header-center[^"]*"[^>]*>\s*<\/div>/g, '');
  return html;
}

/**
 * Clean up extra blank lines left behind by removals.
 */
function cleanWhitespace(html) {
  return html.replace(/\n{3,}/g, '\n\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────

function processPage(relPath, config) {
  const fullPath = path.join(ROOT, relPath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠ Not found: ${relPath}`);
    return;
  }

  let html = fs.readFileSync(fullPath, 'utf8');
  const original = html;

  html = normalizeFooter(html, config.footer);
  html = normalizeScripts(html, config.scripts);
  if (config.dropdownFix) html = removePageDropdown(html);
  html = cleanWhitespace(html);

  if (html === original) {
    console.log(`  ✓ ${relPath} (no changes)`);
    return;
  }

  if (DRY_RUN) {
    console.log(`  ~ ${relPath} (would update)`);
    return;
  }

  fs.writeFileSync(fullPath, html, 'utf8');
  console.log(`  ✎ ${relPath}`);
}

function run() {
  console.log(`\nclaudewill.io — build-pages${DRY_RUN ? ' [dry-run]' : ''}\n`);

  const targets = SINGLE
    ? (PAGES[SINGLE] ? { [SINGLE]: PAGES[SINGLE] } : (() => { console.error(`Unknown page: ${SINGLE}`); process.exit(1); })())
    : PAGES;

  let count = 0;
  for (const [relPath, config] of Object.entries(targets)) {
    process.stdout.write(`  processing ${relPath}…\n`);
    processPage(relPath, config);
    count++;
  }

  console.log(`\nDone. ${count} page(s) processed.\n`);
}

run();
