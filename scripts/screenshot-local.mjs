import { chromium } from 'playwright';
import { mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const screenshotDir = join(projectRoot, 'screenshots');
mkdirSync(screenshotDir, { recursive: true });

// Simple static file server
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer((req, res) => {
  let filePath = join(projectRoot, req.url === '/' ? 'index.html' : req.url);
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  if (!existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  const ext = '.' + filePath.split('.').pop();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
});

const PORT = 8765;

async function run() {
  await new Promise(r => server.listen(PORT, r));
  console.log(`Local server on http://localhost:${PORT}`);

  const browser = await chromium.launch();
  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 375, height: 812 },
  ];

  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const filename = `portfolio-${vp.name}.png`;
    const filepath = join(screenshotDir, filename);
    process.stdout.write(`  ${filename} ... `);
    try {
      await page.goto(`http://localhost:${PORT}/portfolio`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: filepath, fullPage: true });
      const kb = (statSync(filepath).size / 1024).toFixed(1);
      console.log(`${kb} KB`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
    await ctx.close();
  }

  // Dark mode
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  const page = await ctx.newPage();
  const filename = 'portfolio-desktop-dark.png';
  const filepath = join(screenshotDir, filename);
  process.stdout.write(`  ${filename} ... `);
  try {
    await page.goto(`http://localhost:${PORT}/portfolio`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: filepath, fullPage: true });
    const kb = (statSync(filepath).size / 1024).toFixed(1);
    console.log(`${kb} KB`);
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
  }
  await ctx.close();

  await browser.close();
  server.close();
  console.log('\nScreenshots saved to screenshots/');
}

run().catch(err => { console.error(err); server.close(); process.exit(1); });
