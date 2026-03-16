#!/usr/bin/env node

/**
 * Photo Pipeline — claudewill.io
 *
 * Exports photos from the "claudewill" Apple Photos album
 * to images/articles/ for use in Being Claude articles.
 *
 * Workflow:
 *   1. Derek adds photos to "claudewill" album on iPhone
 *   2. iCloud syncs to Mac
 *   3. `npm run photos` exports new images here
 *   4. In markdown frontmatter: hero: my-photo.jpg
 *
 * Usage: node scripts/fetch-photos.js
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEST = path.join(ROOT, 'images', 'articles');
const ALBUM = 'claudewill';

function main() {
  // Ensure destination exists
  fs.mkdirSync(DEST, { recursive: true });

  // Check if album exists
  try {
    const albumCheck = execFileSync(
      'osxphotos',
      ['query', '--album', ALBUM, '--json'],
      { encoding: 'utf8', timeout: 30000 }
    ).trim();

    if (!albumCheck || albumCheck === '[]') {
      console.log('\nNo photos found in "' + ALBUM + '" album.');
      console.log('\nTo get started:');
      console.log('  1. Open Photos on your iPhone or Mac');
      console.log('  2. Create an album called "' + ALBUM + '"');
      console.log('  3. Add photos you want in articles');
      console.log('  4. Run this again: npm run photos\n');
      return;
    }
  } catch (e) {
    console.log('\nAlbum "' + ALBUM + '" not found in Apple Photos.');
    console.log('Create it first, then run again.\n');
    return;
  }

  // Get list of already-exported files to avoid duplicates
  var existing = new Set(
    fs.readdirSync(DEST).filter(function (f) {
      return /\.(jpg|jpeg|png|heic)$/i.test(f);
    })
  );

  // Export from album — convert HEIC to JPEG, reasonable quality
  console.log('Exporting from "' + ALBUM + '" album...');

  try {
    var output = execFileSync(
      'osxphotos',
      [
        'export', DEST,
        '--album', ALBUM,
        '--convert-to-jpeg',
        '--jpeg-quality', '0.85',
        '--jpeg-ext', 'jpg',
        '--update',
        '--no-progress',
        '--verbose'
      ],
      { encoding: 'utf8', timeout: 120000 }
    );

    // Count what was exported
    var newFiles = fs.readdirSync(DEST)
      .filter(function (f) { return /\.(jpg|jpeg|png)$/i.test(f); })
      .filter(function (f) { return !existing.has(f); });

    if (newFiles.length > 0) {
      console.log('\nExported ' + newFiles.length + ' new photo(s):');
      newFiles.forEach(function (f) {
        var stats = fs.statSync(path.join(DEST, f));
        var kb = Math.round(stats.size / 1024);
        console.log('  ' + f + ' (' + kb + ' KB)');
      });
    } else {
      console.log('\nNo new photos to export (all up to date).');
    }

    // List all available article images
    var allFiles = fs.readdirSync(DEST)
      .filter(function (f) { return /\.(jpg|jpeg|png)$/i.test(f); })
      .sort();

    if (allFiles.length > 0) {
      console.log('\n' + allFiles.length + ' total image(s) in images/articles/:');
      allFiles.forEach(function (f) { console.log('  ' + f); });
      console.log('\nUse in article frontmatter:');
      console.log('  hero: ' + allFiles[0] + '\n');
    }
  } catch (e) {
    if (e.stderr) {
      console.error('Export error:', e.stderr.toString().trim());
    } else {
      console.error('Export failed:', e.message);
    }
    process.exit(1);
  }
}

main();
