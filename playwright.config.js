const { defineConfig, chromium } = require('@playwright/test');
const { existsSync } = require('node:fs');

// 优先使用 Playwright 管理的浏览器；未安装时可使用本机 Chrome/Edge。
const localChannel = process.platform === 'win32'
  ? (existsSync('C:/Program Files/Google/Chrome/Application/chrome.exe') ? 'chrome'
    : existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe') ? 'msedge' : undefined)
  : undefined;
const channel = process.env.PLAYWRIGHT_CHANNEL || (existsSync(chromium.executablePath()) ? undefined : localChannel);

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    channel,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:4173/demo/',
    reuseExistingServer: !process.env.CI,
    timeout: 20_000
  }
});
