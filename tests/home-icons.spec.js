const { test, expect } = require('@playwright/test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const catalog = () => JSON.parse(readFileSync(path.join(__dirname, '../assets/home-icons.json'), 'utf8'));

test('主页展示八个独立图标，支持选择和实际文件下载', async ({ page, request }) => {
  const data = catalog();
  expect(data.items).toHaveLength(8);
  await page.goto('/demo/#home-icons');
  const section = page.locator('#home-icons');
  const buttons = section.getByTestId('home-icon');
  await expect(buttons).toHaveCount(data.items.length);
  await section.getByRole('button', { name: '选择主界面图标：邮件', exact: true }).click();
  await expect(section.getByTestId('home-icon-detail')).toContainText('系统邮件');
  await expect(section.getByRole('button', { name: '选择主界面图标：邮件', exact: true })).toHaveAttribute('aria-pressed', 'true');
  for (const item of data.items) {
    const link = section.getByRole('link', { name: '下载' + item.label + '图标 PNG', exact: true });
    await expect(link).toHaveAttribute('href', '../' + item.path);
    await expect(link).toHaveAttribute('download', item.path.split('/').pop());
    const response = await request.head('/' + item.path);
    expect(response.ok(), item.id).toBe(true);
    expect(response.headers()['content-type']).toBe('image/png');
    expect(Number(response.headers()['content-length'])).toBe(item.bytes);
  }
  const downloadPromise = page.waitForEvent('download');
  await section.getByRole('link', { name: '下载邮件图标 PNG', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('home-mail.png');
  expect(await download.failure()).toBeNull();
});

test('预览尺寸与深浅底可调整，键盘选择保留焦点', async ({ page }) => {
  await page.goto('/demo/#home-icons');
  const section = page.locator('#home-icons');
  await expect(section.getByTestId('home-icon')).toHaveCount(8);
  const button = section.getByRole('button', { name: '选择主界面图标：背包', exact: true });
  await button.focus();
  await page.keyboard.press('Space');
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  for (const size of [48, 64, 96]) {
    await section.getByRole('radio', { name: size + ' px', exact: true }).check();
    await expect(button.locator('img')).toHaveCSS('width', size + 'px');
    await expect(button.locator('img')).toHaveCSS('height', size + 'px');
  }
  await section.getByRole('radio', { name: '浅色', exact: true }).check();
  await expect(section.getByTestId('home-icons-grid')).toHaveClass(/is-light/);
  await expect(button.locator('.home-icon-stage')).toHaveCSS('background-color', 'rgb(242, 244, 248)');
  await section.getByRole('radio', { name: '深色', exact: true }).check();
  await expect(button.locator('.home-icon-stage')).toHaveCSS('background-color', 'rgb(23, 28, 36)');
});

test('图标清单失败可重试，组件实验场仍正常使用', async ({ page }) => {
  let tries = 0;
  await page.route('**/assets/home-icons.json', route => {
    tries++;
    return tries === 1 ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.fulfill({ json: catalog() });
  });
  await page.goto('/demo/');
  await expect(page.locator('#home-icons')).toContainText('图标暂时无法加载');
  await expect(page.locator('#library .specimen')).toHaveCount(6);
  await page.getByRole('button', { name: '重新加载图标', exact: true }).click();
  await expect(page.getByTestId('home-icon')).toHaveCount(8);
});

test('非法路径与缺失尺寸不会生成可点击图标或破坏主页', async ({ page }) => {
  const data = catalog();
  const item = data.items[0];
  data.items.push({ ...item, id: 'remote', path: 'https://example.com/secret.png' });
  data.items.push({ ...item, id: 'traversal', path: 'assets/../demo/index.html' });
  data.items.push({ ...item, id: 'missing-size', size: null });
  data.items.push({ ...item, id: 'invalid-description', description: {} });
  await page.route('**/assets/home-icons.json', route => route.fulfill({ json: data }));
  await page.goto('/demo/');
  await expect(page.getByTestId('home-icon')).toHaveCount(8);
  await expect(page.locator('#library .specimen')).toHaveCount(6);
});

test('390px下八个图标可下载，96px显示时没有横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo/#home-icons');
  const section = page.locator('#home-icons');
  await expect(section.getByTestId('home-icon')).toHaveCount(8);
  await section.getByRole('radio', { name: '96 px', exact: true }).check();
  await expect(section.getByRole('link', { name: /^下载.*图标 PNG$/ })).toHaveCount(8);
  const sizes = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
});

test('单张图片加载失败时显示占位说明，其余图标仍可选择', async ({ page }) => {
  await page.route('**/home-heroes.png', route => route.fulfill({ status: 404, body: '' }));
  await page.goto('/demo/#home-icons');
  const hero = page.getByRole('button', { name: '选择主界面图标：英雄', exact: true });
  await hero.scrollIntoViewIfNeeded();
  await expect(hero.locator('img')).toBeHidden();
  await expect(hero.locator('.home-icon-stage')).toHaveAttribute('data-failed', 'true');
  await page.getByRole('button', { name: '选择主界面图标：设置', exact: true }).click();
  await expect(page.getByTestId('home-icon-detail')).toContainText('音效、画质与游戏设置');
});
