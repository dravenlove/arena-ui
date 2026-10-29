const { test, expect } = require('@playwright/test');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => JSON.parse(readFileSync(path.join(root, p), 'utf8'));
const catalog = read('assets/anime-ui.json');

test('图集原图与归档一致，28个坐标完整覆盖各格且不相互重叠', () => {
  const run = read(catalog.manifest);
  expect(catalog.itemCount).toBe(28);
  expect(catalog.sheets).toHaveLength(4);
  const ids = [];
  for (const sheet of catalog.sheets) {
    const asset = run.assets.find(a => a.id === sheet.assetId);
    expect(asset.styleId).toBe('anime-fantasy');
    expect(sheet.path).toBe(asset.path);
    expect(sheet.size).toEqual(asset.size);
    const png = readFileSync(path.join(root, sheet.path));
    expect(png.readUInt32BE(16)).toBe(sheet.size[0]);
    expect(png.readUInt32BE(20)).toBe(sheet.size[1]);
    expect(createHash('sha256').update(png).digest('hex')).toBe(sheet.sha256);
    expect(sheet.sha256).toBe(asset.sha256);
    expect(sheet.items.length).toBe(sheet.grid.columns * sheet.grid.rows);
    let area = 0;
    for (const item of sheet.items) {
      ids.push(item.id); const r = item.rect;
      expect(r.x).toBeGreaterThanOrEqual(0); expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(sheet.size[0]); expect(r.y + r.height).toBeLessThanOrEqual(sheet.size[1]); area += r.width * r.height;
      for (const other of sheet.items.filter(x => x.index < item.index)) {
        const o = other.rect;
        expect(r.x >= o.x + o.width || o.x >= r.x + r.width || r.y >= o.y + o.height || o.y >= r.y + r.height).toBe(true);
      }
    }
    expect(area).toBe(sheet.size[0] * sheet.size[1]);
  }
  expect(new Set(ids).size).toBe(28);
});

test('分类、深浅底、叠字、全图与原图下载可用，图片逐项解码', async ({ page, request }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/demo/anime-ui.html');
  await expect(page.locator('.ui-item')).toHaveCount(28);
  for (const sheet of catalog.sheets) {
    await page.locator(`#category-filters [data-category="${sheet.id}"]`).click();
    await expect(page.locator('.ui-item:visible')).toHaveCount(sheet.items.length);
    for (const image of await page.locator('.sheet:visible .sprite-image').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(el => el.complete && el.naturalWidth > 0)).toBe(true);
    }
    const section = page.locator('.sheet:visible');
    await section.getByText('展开完整图集', { exact: true }).click();
    await expect(section.locator('.raw-sheet img')).toBeVisible();
    const link = section.getByRole('link', { name: '下载完整图集 ↓' });
    await expect(link).toHaveAttribute('download', sheet.path.split('/').pop());
    const response = await request.get(await link.getAttribute('href'));
    expect(response.ok()).toBe(true);
    expect(createHash('sha256').update(await response.body()).digest('hex')).toBe(sheet.sha256);
  }
  await page.locator('#category-filters [data-category="all"]').click();
  await page.getByLabel('预览底色', { exact: true }).selectOption('dark');
  await expect(page.locator('#collection')).toHaveAttribute('data-backdrop', 'dark');
  await page.getByLabel('中文叠字示意', { exact: true }).uncheck();
  await expect(page.locator('.item-label:visible')).toHaveCount(0);
  await page.getByLabel('中文叠字示意', { exact: true }).check();
  await expect(page.locator('.item-label:visible')).toHaveCount(8);
  expect(errors).toEqual([]);
});

test('390px主页入口、手机分类与键盘操作无横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo/');
  await page.getByRole('link', { name: /二次元组件 UI · 按钮/ }).click();
  await expect(page.locator('.ui-item')).toHaveCount(28);
  const navigation = page.locator('#category-filters [data-category="navigation"]');
  await navigation.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('.ui-item:visible')).toHaveCount(8);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#category-filters [data-category="panels"]').click();
  await expect(page.locator('.ui-item:visible')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('清单加载失败可重试，非法坐标不会显示错误切片', async ({ page }) => {
  await page.route('**/assets/anime-ui.json', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/demo/anime-ui.html');
  await expect(page.getByRole('alert')).toContainText('无法读取');
  await expect(page.locator('.ui-item')).toHaveCount(0);
  await page.unroute('**/assets/anime-ui.json');
  await page.getByRole('button', { name: '重新加载' }).click();
  await expect(page.locator('.ui-item')).toHaveCount(28);
  const bad = structuredClone(catalog); bad.sheets[0].items[0].rect.width = 99999;
  await page.route('**/assets/anime-ui.json', route => route.fulfill({ json: bad }));
  await page.reload();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.ui-item')).toHaveCount(0);
});
