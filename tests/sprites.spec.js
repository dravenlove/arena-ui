const { test, expect } = require('@playwright/test');

const animationPath = '/assets/sprites/sunward-idle/animation.json';
const motionPath = '/assets/sprites/sunward-idle/idle-motion.json';

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
  const motionResponse = await request.get(motionPath);
  expect(motionResponse.ok()).toBe(true);
  const motion = await motionResponse.json();
  expect(motion.image).toBe(animation.referenceImage);
  expect(motion.sourceSize).toEqual([sizes[1].width, sizes[1].height]);
  expect(motion.canvasSize[0] / motion.canvasSize[1]).toBeCloseTo(sizes[1].width / sizes[1].height, 8);
  expect(motion.cycleSeconds).toBe(3.2);
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

async function ready(page, mode = 'continuous') {
  await page.goto('/demo/sprites.html');
  await expect(page.locator('#player')).toHaveAttribute('data-ready', 'true');
  if (mode !== 'continuous') await page.getByRole('combobox', { name: '动作方式', exact: true }).selectOption(mode);
  await expect(page.locator('#player')).toHaveAttribute('data-mode', mode);
}

test('实际动画随时间换帧、暂停保持画面，速度控制改变帧推进', async ({ page }) => {
  await page.clock.install();
  await ready(page, 'frames');
  await expect(page.getByRole('button', { name: '暂停动画' })).toBeEnabled();
  await page.clock.runFor(300);
  expect(Number(await page.locator('#sprite-canvas').getAttribute('data-frame'))).toBeGreaterThan(0);
  await page.getByRole('button', { name: '暂停动画' }).click();
  const paused = await page.locator('#sprite-canvas').evaluate(canvas => canvas.toDataURL());
  await page.clock.runFor(1500);
  expect(await page.locator('#sprite-canvas').evaluate(canvas => canvas.toDataURL())).toBe(paused);
  await page.getByRole('button', { name: '查看第 1 帧', exact: true }).click();
  await page.getByLabel('播放速度').selectOption('4');
  await page.getByRole('button', { name: '播放动画' }).click();
  await page.clock.runFor(300);
  await expect(page.locator('#sprite-canvas')).toHaveAttribute('data-frame', '1');
  await page.clock.runFor(500);
  await expect(page.locator('#sprite-canvas')).toHaveAttribute('data-frame', '3');
  await expect(page.locator('#loop-summary')).toContainText('2.00 秒循环');
});

test('减少动画偏好默认暂停，逐帧/滑块可操作且真实像素发生变化', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page, 'frames');
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'false');
  await expect(page.locator('#motion-note')).toBeVisible();
  const pixels = new Set();
  for (let frame = 1; frame <= 8; frame++) {
    await page.getByRole('button', { name: `查看第 ${frame} 帧`, exact: true }).click();
    await expect(page.locator('#sprite-canvas')).toHaveAttribute('data-frame', String(frame - 1));
    pixels.add(await page.locator('#sprite-canvas').evaluate(canvas => canvas.toDataURL()));
  }
  expect(pixels.size).toBe(8);
  await page.getByRole('button', { name: '下一帧', exact: true }).click();
  await expect(page.locator('#sprite-canvas')).toHaveAttribute('data-frame', '0');
  await page.getByRole('button', { name: '上一帧', exact: true }).click();
  await expect(page.locator('#sprite-canvas')).toHaveAttribute('data-frame', '7');
  await page.getByLabel('当前帧', { exact: true }).fill('3');
  await expect(page.locator('#sprite-canvas')).toHaveAttribute('data-frame', '3');
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'false');
  const aligned = await page.locator('#sprite-canvas').evaluate(canvas => canvas.toDataURL());
  await page.getByLabel('固定脚底').uncheck();
  await expect(page.locator('#sprite-canvas')).toHaveAttribute('data-aligned', 'false');
  expect(await page.locator('#sprite-canvas').evaluate(canvas => canvas.toDataURL())).not.toBe(aligned);
});

test('手机预览无横向溢出，深浅棋盘底、图集总览及下载入口可用', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page, 'frames');
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

async function phase(page) {
  return Number(await page.locator('#idle-canvas').getAttribute('data-phase'));
}

async function breathSpeed(page, rate) {
  const select = page.locator('#breath-speed');
  const value = await select.locator('option').evaluateAll((options, rate) => {
    const option = options.find(option => Number(option.value) === rate);
    return option && option.value;
  }, rate);
  expect(value).toBeDefined();
  await select.selectOption(value);
}

// 从真实画布取样，脚部区域固定为基线位置，避免跟随移动后的轮廓而漏检漂移。
async function idlePixels(page, footRegion) {
  return page.locator('#idle-canvas').evaluate(async (canvas, fixedRegion) => {
    // 连续渲染器使用 WebGL；复制真实绘制结果到临时2D画布读取像素。
    const snapshot = document.createElement('canvas');
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    const context = snapshot.getContext('2d', { willReadFrequently: true });
    context.drawImage(canvas, 0, 0);
    const full = context.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0, visible = 0, bottom = -1;
    for (let index = 3; index < full.data.length; index += 4) {
      if (full.data[index] === 0) transparent++;
      if (full.data[index] > 64) {
        visible++;
        bottom = Math.floor((index - 3) / 4 / canvas.width);
      }
    }
    const band = Math.max(4, Math.round(canvas.height * 0.055));
    const top = Math.max(0, bottom - band);
    const region = fixedRegion || { x: 0, y: top, width: canvas.width, height: Math.min(canvas.height - top, band + 5) };
    const feet = context.getImageData(region.x, region.y, region.width, region.height);
    let footVisible = 0;
    for (let index = 3; index < feet.data.length; index += 4) if (feet.data[index] > 64) footVisible++;
    async function digest(data) {
      const buffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
    }
    const [fullHash, footHash] = await Promise.all([digest(full.data), digest(feet.data)]);
    return { fullHash, footHash, footRegion: region, transparent, visible, footVisible };
  }, footRegion);
}

test('默认连贯待机实际推进相位，暂停静止，倍率和3.2秒循环生效', async ({ page }) => {
  await page.clock.install();
  await ready(page);
  const idle = page.locator('#idle-canvas');
  await expect(idle).toBeVisible();
  await expect(page.locator('#sprite-canvas')).toBeHidden();
  await expect(page.locator('#play-speed')).toBeHidden();
  await expect(page.getByLabel('当前帧', { exact: true })).toBeHidden();
  const initial = await idle.evaluate(canvas => canvas.toDataURL());
  await page.clock.runFor(480);
  expect(await phase(page)).toBeGreaterThan(0.1);
  expect(await idle.evaluate(canvas => canvas.toDataURL())).not.toBe(initial);
  await page.getByRole('button', { name: '暂停动画', exact: true }).click();
  const stoppedPhase = await phase(page);
  const stoppedPixels = await idle.evaluate(canvas => canvas.toDataURL());
  await page.clock.runFor(1300);
  expect(await phase(page)).toBe(stoppedPhase);
  expect(await idle.evaluate(canvas => canvas.toDataURL())).toBe(stoppedPixels);

  for (const rate of [0.5, 1, 1.5]) {
    await page.getByLabel('呼吸进度', { exact: true }).fill('0');
    await breathSpeed(page, rate);
    await page.getByRole('button', { name: '播放动画', exact: true }).click();
    await page.clock.runFor(820);
    expect(Math.abs(await phase(page) - 0.25 * rate)).toBeLessThan(0.04);
    await page.getByRole('button', { name: '暂停动画', exact: true }).click();
  }
  await page.getByLabel('呼吸进度', { exact: true }).fill('0');
  await breathSpeed(page, 1);
  await page.getByRole('button', { name: '播放动画', exact: true }).click();
  await page.clock.runFor(3450);
  expect(await phase(page)).toBeGreaterThan(0.03);
  expect(await phase(page)).toBeLessThan(0.13);
});

test('呼吸进度改变真实像素且首尾闭合，脚部固定并保留透明背景', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  const progress = page.getByLabel('呼吸进度', { exact: true });
  await progress.fill('0');
  const base = await idlePixels(page);
  expect(base.transparent).toBeGreaterThan(0);
  expect(base.visible).toBeGreaterThan(0);
  expect(base.footVisible).toBeGreaterThan(0);
  const appearances = new Set([base.fullHash]);
  for (const value of ['250', '500', '750']) {
    await progress.fill(value);
    expect(await phase(page)).toBeCloseTo(Number(value) / 1000, 5);
    const current = await idlePixels(page, base.footRegion);
    appearances.add(current.fullHash);
    expect(current.footHash, `相位${value}的脚部不应漂移`).toBe(base.footHash);
  }
  expect(appearances.size).toBeGreaterThan(1);
  await progress.fill('1000');
  const loopEnd = await idlePixels(page, base.footRegion);
  expect(loopEnd.fullHash).toBe(base.fullHash);
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'false');
});

test('切换动作方式保留播放意图，只有当前方式推进，图集总览暂停', async ({ page }) => {
  await page.clock.install();
  await ready(page);
  const mode = page.getByRole('combobox', { name: '动作方式', exact: true });
  const frame = page.locator('#sprite-canvas');
  const idle = page.locator('#idle-canvas');
  await page.clock.runFor(350);
  await mode.selectOption('frames');
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'true');
  await expect(frame).toBeVisible();
  await expect(idle).toBeHidden();
  await expect(page.locator('#breath-speed')).toBeHidden();
  const frozenPhase = await phase(page);
  const frozenIdle = await idle.evaluate(canvas => canvas.toDataURL());
  const oldFrame = await frame.getAttribute('data-frame');
  await page.clock.runFor(400);
  expect(await frame.getAttribute('data-frame')).not.toBe(oldFrame);
  expect(await phase(page)).toBe(frozenPhase);
  expect(await idle.evaluate(canvas => canvas.toDataURL())).toBe(frozenIdle);

  await page.getByRole('button', { name: '暂停动画', exact: true }).click();
  await mode.selectOption('continuous');
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'false');
  const inactiveFrame = await frame.getAttribute('data-frame');
  await page.getByRole('button', { name: '播放动画', exact: true }).click();
  await page.clock.runFor(400);
  expect(await frame.getAttribute('data-frame')).toBe(inactiveFrame);
  await page.getByRole('button', { name: '整张图集', exact: true }).click();
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'false');
  await expect(page.locator('#sprite-sheet')).toBeVisible();
  await expect(idle).toBeHidden();
  await expect(frame).toBeHidden();
  const sheetPhase = await phase(page);
  await page.clock.runFor(700);
  expect(await phase(page)).toBe(sheetPhase);
});

test('连贯待机遵循减少动态偏好，手机390px及背景切换正常', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'false');
  await expect(page.locator('#motion-note')).toBeVisible();
  await expect(page.locator('#idle-canvas')).toBeVisible();
  const pixels = await page.locator('#idle-canvas').evaluate(canvas => canvas.toDataURL());
  for (const [name, value] of [['浅色', 'light'], ['棋盘', 'checker'], ['深色', 'dark']]) {
    await page.getByRole('button', { name, exact: true }).click();
    await expect(page.locator('#stage')).toHaveAttribute('data-background', value);
    expect(await page.locator('#idle-canvas').evaluate(canvas => canvas.toDataURL())).toBe(pixels);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: '播放动画', exact: true }).click();
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('#player')).toHaveAttribute('data-playing', 'false');
  expect(errors).toEqual([]);
});

test('WebGL不可用时明确回退旧图集，逐帧预览仍可用', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...arguments_) {
      if (type === 'webgl' || type === 'webgl2') return null;
      return original.call(this, type, ...arguments_);
    };
  });
  await page.goto('/demo/sprites.html');
  await expect(page.locator('#player')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#player')).toHaveAttribute('data-mode', 'frames');
  await expect(page.locator('#load-status')).toContainText('连续待机暂不可用');
  await expect(page.locator('#sprite-canvas')).toBeVisible();
  await expect(page.locator('#idle-canvas')).toBeHidden();
  await expect(page.locator('#animation-mode option[value="continuous"]')).toHaveJSProperty('disabled', true);
  await page.getByRole('button', { name: '查看第 2 帧', exact: true }).click();
  await expect(page.locator('#sprite-canvas')).toHaveAttribute('data-frame', '1');
});
