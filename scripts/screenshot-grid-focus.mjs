import { chromium } from 'playwright';
import { mkdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const screenshotDir = join(projectRoot, 'screenshots');
mkdirSync(screenshotDir, { recursive: true });

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer((req, res) => {
  let filePath = join(projectRoot, req.url === '/' ? 'index.html' : req.url);
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html');
  if (!existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  const ext = '.' + filePath.split('.').pop();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
});

const PORT = 8767;

async function run() {
  await new Promise(r => server.listen(PORT, r));
  const browser = await chromium.launch();

  for (const vp of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 375, height: 812 },
  ]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${PORT}/portfolio`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.evaluate(() => document.getElementById('work').scrollIntoView({ behavior: 'instant' }));
    await page.waitForTimeout(500);
    const filename = `grid-focus-${vp.name}.png`;
    await page.screenshot({ path: join(screenshotDir, filename) });
    console.log(`  ${filename}: ${(statSync(join(screenshotDir, filename)).size / 1024).toFixed(1)} KB`);
    await ctx.close();
  }

  await browser.close();
  server.close();
}

run().catch(err => { console.error(err); server.close(); process.exit(1); });
