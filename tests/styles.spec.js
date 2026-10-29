const { test, expect } = require('@playwright/test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const read = name => JSON.parse(readFileSync(path.join(__dirname, '..', name), 'utf8'));
const index = () => read('assets/daily/index.json');
const total = () => index().runs.reduce((n, r) => n + r.assets.length, 0);
const styleAssets = id => {
  const catalog = read('assets/styles.json');
  return index().runs.flatMap(r => r.assets.filter(a => (a.styleId ?? r.styleId ?? catalog.runStyles[r.id]) === id));
};
const chibi = () => styleAssets('chibi-fantasy');
const filter = (page, id) => page.locator(`#style-filters [data-style="${id}"]`);

test('所有素材明确登记风格，新增系列有独立身份、路径和用途', () => {
  const catalog = read('assets/styles.json');
  const categories = read('assets/categories.json').assetCategories;
  for (const run of index().runs) for (const asset of run.assets) {
    const style = asset.styleId ?? run.styleId ?? catalog.runStyles[run.id];
    expect(catalog.styles.map(s => s.id)).toContain(style);
    expect(categories[asset.id]).toBeTruthy();
    const prefix = catalog.styles.find(s => s.id === style).filenamePrefix;
    if (prefix) {
      expect(asset.styleId).toBe(style);
      expect(asset.id.startsWith(prefix)).toBe(true);
      expect(asset.path).toContain(`/library/${style}/${prefix}`);
      expect(asset.group).toBe('library');
    }
  }
  expect(chibi().length).toBeGreaterThanOrEqual(4);
});

test('全部素材按风格分区，分区和每张卡片标签一致', async ({ page }) => {
  await page.goto('/demo/history.html');
  await expect(page.getByTestId('archive-asset')).toHaveCount(total());
  for (const { id, label } of read('assets/styles.json').styles) {
    const count = styleAssets(id).length;
    if (!count) continue;
    const section = page.getByRole('region', { name: `${label}素材分区` });
    await expect(section.getByTestId('archive-asset')).toHaveCount(count);
    expect(await section.getByTestId('archive-asset').evaluateAll(cards => cards.every(card => card.dataset.style === card.closest('.style-collection').dataset.style))).toBe(true);
    await expect(section.locator('.asset-style').first()).toHaveText(label);
  }
});

test('风格链接与用途、日期和固定分组取交集，重置恢复全量', async ({ page }) => {
  await page.goto('/demo/history.html?style=chibi-fantasy');
  const cards = page.getByTestId('archive-asset');
  await expect(cards).toHaveCount(chibi().length);
  await page.locator('#category-filters [data-category="interface"]').click();
  await expect(cards).toHaveCount(chibi().filter(a => read('assets/categories.json').assetCategories[a.id] === 'interface').length);
  await page.getByLabel('选择日期', { exact: true }).selectOption('2026-10-24');
  await expect(cards).toHaveCount(0);
  await expect(page.locator('.history-empty')).toBeVisible();
  await page.getByRole('button', { name: '重置筛选', exact: true }).click();
  await expect(cards).toHaveCount(total());
  await filter(page, 'chibi-fantasy').click();
  await page.getByRole('button', { name: '固定对照', exact: true }).click();
  await expect(cards).toHaveCount(0);
  await filter(page, 'dark-metal').click();
  await expect(cards).toHaveCount(index().runs.flatMap(r => r.assets).filter(a => a.group === 'benchmark').length);
  await expect(page).toHaveURL(/style=dark-metal/);
  await expect(page.locator('#comparison-state')).toHaveAttribute('data-state', 'matched');
});

test('同一批次中的不同风格逐张分区，明确未知值不会继承整批风格', async ({ page }) => {
  const data = index();
  const original = data.runs[0];
  const a = original.assets[0];
  data.runs = [{ ...original, id: 'mixed-fixture', styleId: 'dark-metal', assets: [
    { ...a, id: 'dark-fixture', styleId: 'dark-metal' },
    { ...a, id: 'chibi-fixture', styleId: 'chibi-fantasy' },
    { ...a, id: 'unregistered-fixture', styleId: 'new-unknown' },
    { ...a, id: 'legacy-fixture' }
  ] }];
  await page.route('**/assets/daily/index.json', route => route.fulfill({ json: data }));
  await page.goto('/demo/history.html');
  await expect(page.locator('.archive-card[data-style="dark-metal"]')).toHaveCount(2);
  await expect(page.locator('.archive-card[data-style="chibi-fantasy"]')).toHaveCount(1);
  await expect(page.locator('.archive-card[data-style="unclassified-style"]')).toHaveCount(1);
  await filter(page, 'chibi-fantasy').click();
  await expect(page.getByTestId('archive-asset')).toHaveCount(1);
});

test('风格目录加载失败和无效链接都不会误归入旧风格', async ({ page }) => {
  await page.route('**/assets/styles.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/demo/history.html?style=chibi-fantasy');
  await expect(page.locator('#style-notice')).toContainText('风格目录暂不可用');
  await expect(page.getByTestId('archive-asset')).toHaveCount(0);
  await page.getByRole('button', { name: '重置筛选', exact: true }).click();
  await expect(page.locator('.archive-card[data-style="unclassified-style"]')).toHaveCount(total());
  await expect(page.locator('.archive-card[data-style="dark-metal"]')).toHaveCount(0);
  await expect(page.locator('#comparison-state')).toHaveAttribute('data-state', 'unknown-style');
  await page.unroute('**/assets/styles.json');
  await page.goto('/demo/history.html?style=nonexistent');
  await expect(page.locator('#style-notice')).toContainText('指定风格尚未登记');
  await expect(page.getByTestId('archive-asset')).toHaveCount(0);
});

test('同提示词哈希也不能把不同风格当成同一固定对照', async ({ page }) => {
  const data = index(); const original = data.runs[0];
  const assets = original.assets.filter(a => a.group === 'benchmark');
  data.runs = [{ ...original, assets, styleId: 'dark-metal' }, {
    ...original, id: 'cross-style-fixture', date: '2026-10-25', assets: assets.map(a => ({ ...a, styleId: 'chibi-fantasy' }))
  }];
  await page.route('**/assets/daily/index.json', route => route.fulfill({ json: data }));
  await page.goto('/demo/history.html');
  await expect(page.locator('#comparison-state')).toHaveAttribute('data-state', 'different-style');
});

test('主页风格入口可访问，390px风格筛选支持键盘且无横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo/');
  const section = page.getByRole('region', { name: '视觉风格系列' });
  await expect(section).toContainText('当前交互组件演示属于深色金属系列');
  await section.getByRole('link', { name: /Q版奇幻素材/ }).click();
  await expect(page.getByTestId('archive-asset')).toHaveCount(chibi().length);
  await filter(page, 'dark-metal').focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('archive-asset')).toHaveCount(styleAssets('dark-metal').length);
  await filter(page, 'chibi-fantasy').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const images = page.locator('.archive-card img');
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test('二次元入口在手机可用，按用途筛选不会混入其他风格且原图可下载', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo/');
  await page.getByRole('link', { name: /二次元奇幻素材/ }).click();
  const cards = page.getByTestId('archive-asset');
  const assets = styleAssets('anime-fantasy');
  await expect(cards).toHaveCount(assets.length);
  expect(await cards.evaluateAll(items => items.every(item => item.dataset.style === 'anime-fantasy'))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  for (const asset of assets) {
    const link = page.locator(`.asset-download[href$="/${asset.path}"]`);
    await expect(link).toHaveCount(1);
    const response = await request.get(`/${asset.path}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
  }
  const categories = read('assets/categories.json').assetCategories;
  for (const category of ['characters', 'equipment', 'interface']) {
    await page.locator(`#category-filters [data-category="${category}"]`).click();
    await expect(cards).toHaveCount(assets.filter(a => categories[a.id] === category).length);
    await expect(cards.first().locator('.asset-style')).toHaveText('二次元奇幻');
  }
});
