const { test, expect } = require('@playwright/test');

const animationPath = '/assets/sprites/sunward-idle/animation.json';

test('真实精灵图集和参考原图可加载，帧区域位于实际图像内', async ({ page, request }) => {
  const response = await request.get(animationPath);
  expect(response.ok()).toBe(true);
  const animation = await response.json();
  expect(animation.schemaVersion).toBe(1);
  expect(animation.frames.length).toBeGreaterThan(1);
  expect(animation.fps).toBeGreaterThan(0);
  expect(animation.loop).toBe(true);
  expect(animation.frameSize).toHaveLength(2);
  for (const source of [animation.image, animation.referenceImage]) {
    expect(source).toMatch(/^assets\/[A-Za-z0-9/_.-]+\.png$/);
    const image = await request.get('/' + source);
    expect(image.ok(), source).toBe(true);
    expect((await image.body()).subarray(0, 8).toString('hex'), source).toBe('89504e470d0a1a0a');
  }
  await page.goto('/demo/vendor/README.md');
  const sizes = await page.evaluate(async sources => Promise.all(sources.map(async source => {
    const image = new Image();
    image.src = '/' + source;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  })), [animation.image, animation.referenceImage]);
  const sheet = sizes[0];
  for (const frame of animation.frames) {
    for (const key of ['x', 'y', 'w', 'h']) expect(Number.isInteger(frame[key]), key).toBe(true);
    expect(frame.x).toBeGreaterThanOrEqual(0);
    expect(frame.y).toBeGreaterThanOrEqual(0);
    expect(frame.w).toBeGreaterThan(0);
    expect(frame.h).toBeGreaterThan(0);
    expect(frame.x + frame.w).toBeLessThanOrEqual(sheet.width);
    expect(frame.y + frame.h).toBeLessThanOrEqual(sheet.height);
    expect([frame.w, frame.h]).toEqual(animation.sourceFrameSize);
    expect(Number.isFinite(frame.dx ?? 0)).toBe(true);
    expect(Number.isFinite(frame.dy ?? 0)).toBe(true);
  }
});

async function ready(page) {
  await page.goto('/demo/sprites.html');
  await expect(page.locator('#player')).toHaveAttribute('data-ready', 'true');
}

test('实际动画随时间换帧、暂停保持画面，速度控制改变帧推进', async ({ page }) => {
  await page.clock.install();
  await ready(page);
  await expect(page.getByRole('button', { name: '暂停动画' })).toBeEnabled();
  await page.clock.runFor(300);
  expect(Number(await page.locator('canvas').getAttribute('data-frame'))).toBeGreaterThan(0);
  await page.getByRole('button', { name: '暂停动画' }).click();
  const paused = await page.locator('canvas').evaluate(canvas => canvas.toDataURL());
  await page.clock.runFor(1500);
  expect(await page.locator('canvas').evaluate(canvas => canvas.toDataURL())).toBe(paused);
  await page.getByRole('button', { name: '查看第 1 帧', exact: true }).click();
  await page.getByLabel('播放速度').selectOption('4');
  await page.getByRole('button', { name: '播放动画' }).click();
  await page.clock.runFor(300);
  await expect(page.locator('canvas')).toHaveAttribute('data-frame', '1');
  await page.clock.runFor(500);
  await expect(page.locator('canvas')).toHaveAttribute('data-frame', '3');
  await expect(page.locator('#loop-summary')).toContainText('2.00 秒循环');
});

test('减少动画偏好默认暂停，逐帧/滑块可操作且真实像素发生变化', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'false');
  await expect(page.locator('#motion-note')).toBeVisible();
  const pixels = new Set();
  for (let frame = 1; frame <= 8; frame++) {
    await page.getByRole('button', { name: `查看第 ${frame} 帧`, exact: true }).click();
    await expect(page.locator('canvas')).toHaveAttribute('data-frame', String(frame - 1));
    pixels.add(await page.locator('canvas').evaluate(canvas => canvas.toDataURL()));
  }
  expect(pixels.size).toBe(8);
  await page.getByRole('button', { name: '下一帧', exact: true }).click();
  await expect(page.locator('canvas')).toHaveAttribute('data-frame', '0');
  await page.getByRole('button', { name: '上一帧', exact: true }).click();
  await expect(page.locator('canvas')).toHaveAttribute('data-frame', '7');
  await page.getByLabel('当前帧', { exact: true }).fill('3');
  await expect(page.locator('canvas')).toHaveAttribute('data-frame', '3');
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'false');
  const aligned = await page.locator('canvas').evaluate(canvas => canvas.toDataURL());
  await page.getByLabel('固定脚底').uncheck();
  await expect(page.locator('canvas')).toHaveAttribute('data-aligned', 'false');
  expect(await page.locator('canvas').evaluate(canvas => canvas.toDataURL())).not.toBe(aligned);
});

test('手机预览无横向溢出，深浅棋盘底、图集总览及下载入口可用', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  for (const [name, value] of [['浅色', 'light'], ['棋盘', 'checker'], ['深色', 'dark']]) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('#stage')).toHaveAttribute('data-background', value);
  }
  await page.getByRole('button', { name: '整张图集', exact: true }).click();
  await expect(page.locator('#sprite-sheet')).toBeVisible();
  await expect(page.locator('#sprite-canvas')).toBeHidden();
  expect(await page.locator('#sprite-sheet').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  for (const id of ['download-png', 'download-json', 'reference-link']) {
    expect((await request.get(await page.locator('#' + id).getAttribute('href'))).ok()).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: '动画', exact: true }).click();
  await expect(page.locator('#sprite-canvas')).toBeVisible();
  expect(errors).toEqual([]);
});

test('配置加载失败有可恢复的反馈，重试后载入真实图集', async ({ page }) => {
  await page.route('**' + animationPath, route => route.fulfill({ status: 503, body: 'unavailable' }));
  await page.goto('/demo/sprites.html');
  await expect(page.locator('#load-status')).toHaveAttribute('data-state', 'error');
  await expect(page.getByRole('button', { name: '重新加载' })).toBeVisible();
  await expect(page.locator('#toggle-play')).toBeDisabled();
  await page.unroute('**' + animationPath);
  await page.getByRole('button', { name: '重新加载' }).click();
  await expect(page.locator('#player')).toHaveAttribute('data-ready', 'true');
});
