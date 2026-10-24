const { test, expect } = require('@playwright/test');

test('演示页离线运行且没有脚本或资源错误', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => errors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`));
  // 只允许本地请求，确保演示无需 CDN、远程字体或在线图片。
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return ['127.0.0.1', 'localhost'].includes(url.hostname) ? route.continue() : route.abort();
  });
  await page.goto('/demo/');
  await expect(page.getByRole('heading', { level: 1, name: '为游戏而生，为体验而战。' })).toBeVisible();
  await expect(page.getByRole('button').first()).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

for (const width of [390, 400, 430]) {
  test(`${width}px 窄屏布局不产生横向滚动`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/demo/');
    await expect(page.getByRole('heading', { level: 1, name: '为游戏而生，为体验而战。' })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  });
}

test('服务器拒绝隐藏文件和依赖目录', async ({ request }) => {
  expect((await request.get('/.git/config')).status()).toBe(403);
  expect((await request.get('/node_modules/react/package.json')).status()).toBe(403);
  expect((await request.get('/demo/%00')).status()).toBe(403);
});

test('背包分类筛选道具，并可恢复全部道具', async ({ page }) => {
  await page.goto('/demo/');
  const tabs = page.getByRole('tablist', { name: '道具分类' });
  const items = page.locator('.inventory-item:visible');
  await expect(items).toHaveCount(8);
  const weapons = tabs.getByRole('tab', { name: '武器', exact: true });
  await weapons.click();
  await expect(weapons).toHaveAttribute('aria-selected', 'true');
  await expect.poll(() => items.count()).toBeGreaterThan(0);
  expect(await items.count()).toBeLessThan(8);
  await tabs.getByRole('tab', { name: '全部', exact: true }).click();
  await expect(items).toHaveCount(8);
});

test('弹窗支持 Escape 和焦点恢复，确认出战有状态反馈', async ({ page }) => {
  await page.goto('/demo/');
  const opener = page.getByRole('button', { name: '预览弹窗', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: '准备好进入竞技场？' });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole('button', { name: '确认出战', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId('toast')).toContainText('队伍已就绪，出战成功');
});

test('组件搜索展示匹配项，并可从空态重置', async ({ page }) => {
  await page.goto('/demo/');
  const search = page.getByRole('searchbox', { name: '搜索组件' });
  await expect(page.locator('#library .specimen')).toHaveCount(6);
  await search.fill('Dialog');
  await expect(page.locator('#library .specimen')).toHaveCount(1);
  await expect(page.locator('#library .specimen').getByRole('heading', { name: '状态与反馈' })).toBeVisible();
  await search.fill('没有此组件-unknown');
  await expect(page.locator('#library .specimen')).toHaveCount(0);
  await expect(page.getByText('没有找到匹配的组件。')).toBeVisible();
  await page.getByRole('button', { name: '重置筛选' }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('#library .specimen')).toHaveCount(6);
});

test('组件分类只展示对应组件', async ({ page }) => {
  await page.goto('/demo/');
  const categories = page.getByRole('tablist', { name: '组件分类' });
  await categories.getByRole('tab', { name: '基础组件', exact: true }).click();
  await expect(page.locator('#library .specimen')).toHaveCount(2);
  await expect(page.locator('#buttons')).toBeVisible();
  await expect(page.locator('#controls')).toBeVisible();
  await categories.getByRole('tab', { name: '战斗组件', exact: true }).click();
  await expect(page.locator('#library .specimen')).toHaveCount(3);
  await expect(page.locator('#inventory')).toBeVisible();
  await categories.getByRole('tab', { name: '全部组件', exact: true }).click();
  await expect(page.locator('#library .specimen')).toHaveCount(6);
});
