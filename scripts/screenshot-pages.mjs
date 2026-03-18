import { chromium } from 'playwright';
import { mkdirSync, statSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const screenshotDir = join(projectRoot, 'screenshots');

// Ensure screenshots directory exists
mkdirSync(screenshotDir, { recursive: true });

const BASE_URL = 'https://claudewill.io';

const pages = [
  { path: '/', name: 'homepage' },
  { path: '/derek', name: 'derek' },
  { path: '/portfolio', name: 'portfolio' },
  { path: '/story', name: 'story' },
  { path: '/kitchen', name: 'kitchen' },
  { path: '/being-claude', name: 'being-claude' },
  { path: '/standard', name: 'standard' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  let count = 0;

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();

    for (const entry of pages) {
      const url = `${BASE_URL}${entry.path}`;
      const filename = `${entry.name}-${viewport.name}.png`;
      const filepath = join(screenshotDir, filename);

      process.stdout.write(`  ${filename} ... `);
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        // Brief pause to let animations/transitions settle
        await page.waitForTimeout(1000);
        await page.screenshot({ path: filepath, fullPage: true });
        const size = statSync(filepath).size;
        const sizeKB = (size / 1024).toFixed(1);
        console.log(`${sizeKB} KB`);
        count++;
      } catch (err) {
        console.log(`FAILED (${err.message})`);
      }
    }

    await context.close();
  }

  await browser.close();

  // Summary
  console.log('\n--- Summary ---');
  console.log(`Screenshots captured: ${count}`);
  console.log(`Output directory: ${screenshotDir}`);

  const files = readdirSync(screenshotDir).filter(f => f.endsWith('.png')).sort();
  let totalBytes = 0;
  for (const file of files) {
    const size = statSync(join(screenshotDir, file)).size;
    totalBytes += size;
    console.log(`  ${file.padEnd(32)} ${(size / 1024).toFixed(1)} KB`);
  }
  console.log(`Total size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
