const { test, expect } = require('@playwright/test');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const path = require('node:path');

const seedDate = '2026-10-24';
const fixtureDate = '2026-10-25';
const benchmarkIds = ['equipment-atlas-v1', 'ui-kit-board-v1'];
const root = path.join(__dirname, '..');
const readJson = filename => JSON.parse(readFileSync(path.join(root, filename), 'utf8'));
const readIndex = () => readJson('assets/daily/index.json');
const sha256 = value => createHash('sha256').update(value).digest('hex');

// 第二天只存在于浏览器路由中，正式归档保持真实生成记录。
async function useSecondDay(page, changePrompt = false) {
  const index = readIndex();
  const seed = index.runs.find(run => run.date === seedDate);
  const fixed = seed.assets.filter(asset => asset.group === 'benchmark');
  const additions = seed.assets.filter(asset => asset.group !== 'benchmark').slice(0, 2);
  const future = JSON.parse(JSON.stringify({
    ...seed, id: 'fixture-20261025-daily', date: fixtureDate, time: '09:00:00', kind: 'scheduled',
    manifest: 'assets/daily/2026/10/25/test-fixture/manifest.json', assets: [...fixed, ...additions]
  }));
  if (changePrompt) {
    const asset = future.assets.find(item => item.benchmarkId === benchmarkIds[0]);
    asset.prompt += '\nTest fixture: intentionally changed instruction.';
    asset.promptSha256 = createHash('sha256').update(asset.prompt, 'utf8').digest('hex');
  }
  index.runs = [seed, future];
  await page.route('**/assets/daily/index.json', route => route.fulfill({ json: index }));
  await page.route('**/assets/daily/2026/10/25/test-fixture/manifest.json', route => route.fulfill({
    json: { schemaVersion: 1, timezone: 'Asia/Shanghai', ...future, evaluation: {}, notes: ['Browser test fixture only.'] }
  }));
}

async function selectDate(page, label, date) {
  const select = page.getByLabel(label, { exact: true });
  let value;
  await expect.poll(async () => {
    value = await select.locator('option').evaluateAll((options, target) => {
      const option = options.find(item => item.textContent.includes(target));
      return option && option.value;
    }, date);
    return value;
  }, { message: `${label}应包含${date}` }).toBeTruthy();
  await select.selectOption(value);
}

async function openComparison(page, benchmarkId = benchmarkIds[0]) {
  await selectDate(page, '左侧日期', seedDate);
  await selectDate(page, '右侧日期', fixtureDate);
  await page.getByLabel('固定题目', { exact: true }).selectOption(benchmarkId);
}

test('首日原图与哈希完整，固定题目保持原始提示词和冻结参数', () => {
  const index = readIndex();
  const config = readJson('assets/daily/config.json');
  const original = readJson('assets/prompts.json');
  const seed = index.runs.find(run => run.date === seedDate && run.kind === 'initial-session');
  expect(seed).toBeDefined();
  expect(seed.assets).toHaveLength(8);
  expect(seed.time).toBeNull();
  expect(index.runs.some(run => run.id === 'fixture-20261025-daily')).toBe(false);
  const manifest = readJson(seed.manifest);
  expect(manifest.id).toBe(seed.id);
  expect(manifest.kind).toBe('initial-session');
  expect(manifest.assets).toEqual(seed.assets);
  for (const asset of seed.assets) {
    const filename = path.resolve(root, asset.path);
    expect(path.relative(root, filename).startsWith('..'), asset.path).toBe(false);
    const bytes = readFileSync(filename);
    expect(bytes.subarray(0, 8).toString('hex'), asset.path).toBe('89504e470d0a1a0a');
    expect(bytes.length, asset.path).toBe(asset.bytes);
    expect(sha256(bytes), asset.path).toBe(asset.sha256);
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], asset.path).toEqual(asset.size);
    expect(sha256(Buffer.from(asset.prompt, 'utf8')), asset.id).toBe(asset.promptSha256);
  }
  for (const id of benchmarkIds) {
    const asset = seed.assets.find(item => item.benchmarkId === id);
    const template = config.benchmarks.find(item => item.id === id);
    const source = original.assets.find(item => item.out === path.basename(asset.path));
    expect(template, id).toBeDefined();
    expect(source, id).toBeDefined();
    expect(asset.prompt, id).toBe(source.prompt);
    expect(template.prompt, id).toBe(source.prompt);
    expect(template.promptSha256, id).toBe(asset.promptSha256);
    expect(template.referencePath, id).toBe(asset.path);
    expect(template.requestedSize, id).toEqual(asset.requestedSize);
    expect(template.transparentBackground, id).toBe(asset.transparentBackground);
    expect(template.promptVersion, id).toBe(asset.promptVersion);
  }
});

test('真实首日归档有八张素材，固定与扩展分组正确', async ({ page, request }) => {
  const response = await request.get('/assets/daily/index.json');
  expect(response.ok()).toBe(true);
  const index = await response.json();
  const seed = index.runs.find(run => run.date === seedDate);
  expect(seed.assets).toHaveLength(8);
  expect(seed.assets.filter(asset => asset.group === 'benchmark').map(asset => asset.benchmarkId).sort()).toEqual(benchmarkIds);

  await page.goto('/demo/history.html');
  await selectDate(page, '选择日期', seedDate);
  const assets = page.getByTestId('archive-asset');
  await expect(assets).toHaveCount(8);
  await page.getByRole('button', { name: '固定对照', exact: true }).click();
  await expect(assets).toHaveCount(2);
  await page.getByRole('button', { name: '素材扩展', exact: true }).click();
  await expect(assets).toHaveCount(6);
  await page.getByRole('button', { name: '全部', exact: true }).click();
  await expect(assets).toHaveCount(8);
});

test('只有一天记录时不伪装成两次独立对比', async ({ page }) => {
  await page.goto('/demo/history.html');
  await expect(page.getByTestId('archive-asset')).toHaveCount(8);
  const state = page.locator('#comparison-state');
  await expect(state).toContainText('目前只有一个生成日期');
  await expect(state).not.toHaveAttribute('data-state', 'matched');
});

test('日期过滤只显示所选日期，未来一天通过路由模拟', async ({ page }) => {
  await useSecondDay(page);
  await page.goto('/demo/history.html');
  await selectDate(page, '选择日期', fixtureDate);
  const assets = page.getByTestId('archive-asset');
  await expect(assets).toHaveCount(4);
  await page.getByRole('button', { name: '固定对照', exact: true }).click();
  await expect(assets).toHaveCount(2);
  await page.getByRole('button', { name: '素材扩展', exact: true }).click();
  await expect(assets).toHaveCount(2);
  await page.getByRole('button', { name: '全部', exact: true }).click();
  await selectDate(page, '选择日期', seedDate);
  await expect(assets).toHaveCount(8);
});

test('两个独立记录的同一固定题目仅在提示词哈希一致时可对照', async ({ page }) => {
  await useSecondDay(page);
  await page.goto('/demo/history.html');
  const state = page.locator('#comparison-state');
  for (const id of benchmarkIds) {
    await openComparison(page, id);
    await expect(state).toHaveAttribute('data-state', 'matched');
    await expect(state).toContainText('提示词一致');
  }
  await selectDate(page, '右侧日期', seedDate);
  await expect(state).toHaveAttribute('data-state', 'same-record');
  await expect(state).toContainText('不能作为两次实验');
});

test('提示词变化会提示不可直接对照，切换题目重新判断', async ({ page }) => {
  await useSecondDay(page, true);
  await page.goto('/demo/history.html');
  await openComparison(page);
  const state = page.locator('#comparison-state');
  await expect(state).toHaveAttribute('data-state', 'different');
  await expect(state).toContainText('提示词不同，不能直接对照输出变化');
  await page.getByLabel('固定题目', { exact: true }).selectOption(benchmarkIds[1]);
  await expect(state).toHaveAttribute('data-state', 'matched');
});

test('归档加载失败有明确错误反馈', async ({ page }) => {
  await page.route('**/assets/daily/index.json', route => route.fulfill({ status: 503, body: 'Archive unavailable' }));
  await page.goto('/demo/history.html');
  await expect(page.getByText(/无法加载|加载失败/).first()).toBeVisible();
  await expect(page.getByTestId('archive-asset')).toHaveCount(0);
});

test('没有记录时显示空态', async ({ page }) => {
  const index = readIndex();
  index.runs = [];
  await page.route('**/assets/daily/index.json', route => route.fulfill({ json: index }));
  await page.goto('/demo/history.html');
  await expect(page.getByText('尚无生成记录。每日生成完成后，素材会按日期出现在这里。', { exact: true })).toBeVisible();
  await expect(page.getByTestId('archive-asset')).toHaveCount(0);
});

test('每日档案390px布局可以操作且无横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo/');
  const entry = page.getByRole('main').getByRole('link', { name: '每日档案', exact: true });
  await entry.scrollIntoViewIfNeeded();
  await expect(entry).toBeVisible();
  await expect(entry).toBeInViewport();
  await entry.click();
  await expect(page).toHaveURL(/\/demo\/history\.html$/);
  await expect(page.getByTestId('archive-asset')).toHaveCount(8);
  await expect(page.getByLabel('选择日期', { exact: true })).toBeVisible();
  const sizes = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth
  }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
});
