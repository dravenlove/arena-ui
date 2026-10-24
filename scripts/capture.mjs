import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { setTimeout as pause } from 'node:timers/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const config = require('../playwright.config.js');
const root = fileURLToPath(new URL('../', import.meta.url));
const url = 'http://127.0.0.1:4173/demo/';
const output = path.join(root, 'test-results');
let server;
let browser;

async function available() {
  try { return (await fetch(url, { signal: AbortSignal.timeout(500) })).ok; }
  catch { return false; }
}

try {
  if (!(await available())) {
    server = spawn(process.execPath, [path.join(root, 'scripts', 'serve.mjs')], {
      cwd: root, windowsHide: true, stdio: ['ignore', 'ignore', 'pipe']
    });
    server.stderr.on('data', chunk => process.stderr.write(chunk));
    for (let attempt = 0; attempt < 40 && !(await available()); attempt++) await pause(100);
    if (!(await available())) throw new Error('预览服务无法启动。');
  }
  await mkdir(output, { recursive: true });
  browser = await chromium.launch({ channel: config.use.channel, headless: true });
  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 1100 }],
    ['mobile', { width: 390, height: 844 }]
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
      await Promise.all(Array.from(document.images, image => image.decode().catch(() => {})));
      await document.fonts.ready;
    });
    await page.screenshot({ path: path.join(output, `${name}.png`), animations: 'disabled' });
    await page.screenshot({ path: path.join(output, `${name}-full.png`), fullPage: true, animations: 'disabled' });
    const expansion = page.locator('#expansion');
    if (await expansion.count()) {
      // 元素特写隐藏吸附导航，避免滚动到元素时顶部内容被覆盖。
      const sectionCapture = { animations: 'disabled', style: '.sidebar { visibility: hidden !important; }' };
      await expansion.screenshot({ ...sectionCapture, path: path.join(output, `${name}-expansion.png`) });
      await expansion.getByRole('tab', { name: '奖励道具', exact: true }).click();
      await expansion.screenshot({ ...sectionCapture, path: path.join(output, `${name}-expansion-rewards.png`) });
    }
    console.log(`${name}: ${path.join(output, `${name}.png`)}`);
    await page.close();
    const history = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await history.goto(new URL('history.html', url).href, { waitUntil: 'networkidle' });
    await history.getByTestId('archive-asset').first().waitFor();
    await history.evaluate(async () => {
      document.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
      await Promise.all(Array.from(document.images, image => image.decode().catch(() => {})));
      await document.fonts.ready;
    });
    await history.screenshot({ path: path.join(output, `${name}-history.png`), animations: 'disabled' });
    await history.screenshot({ path: path.join(output, `${name}-history-full.png`), fullPage: true, animations: 'disabled' });
    await history.close();
  }
} finally {
  if (browser) await browser.close();
  if (server) server.kill();
}
