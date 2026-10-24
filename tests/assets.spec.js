const { test, expect } = require('@playwright/test');

const expansionAssets = ['skills-atlas.png', 'rewards-atlas.png', 'frost-arena.png', 'empty-inventory.png'];

test('扩展素材均为可解码的 PNG，尺寸适合界面使用', async ({ request, page }) => {
  await page.goto('/demo/vendor/README.md');
  for (const filename of expansionAssets) {
    const url = '/assets/generated/' + filename;
    const response = await request.get(url);
    expect(response.ok(), filename).toBe(true);
    expect(response.headers()['content-type'], filename).toBe('image/png');
    const bytes = await response.body();
    expect(bytes.subarray(0, 8).toString('hex'), filename).toBe('89504e470d0a1a0a');
    const size = await page.evaluate(async source => {
      const image = new Image();
      image.src = source;
      await image.decode();
      return { width: image.naturalWidth, height: image.naturalHeight };
    }, url);
    expect(size.width, filename).toBeGreaterThanOrEqual(512);
    expect(size.height, filename).toBeGreaterThanOrEqual(512);
    expect(size.width, filename).toBeLessThanOrEqual(4096);
    expect(size.height, filename).toBeLessThanOrEqual(4096);
    expect(size.width, filename).toBe(bytes.readUInt32BE(16));
    expect(size.height, filename).toBe(bytes.readUInt32BE(20));
  }
});

test('空背包 PNG 含真实透明像素和可见图案', async ({ page }) => {
  await page.goto('/demo/vendor/README.md');
  const alpha = await page.evaluate(async () => {
    const image = new Image();
    image.src = '/assets/generated/empty-inventory.png';
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0, visible = 0;
    for (let index = 3; index < rgba.length; index += 4) {
      if (rgba[index] === 0) transparent++;
      if (rgba[index] > 0) visible++;
    }
    return { transparent, visible };
  });
  expect(alpha.transparent).toBeGreaterThan(0);
  expect(alpha.visible).toBeGreaterThan(0);
});

test('技能与奖励图集各展示八个图标，并支持切换选中项', async ({ page }) => {
  await page.goto('/demo/');
  const expansion = page.locator('#expansion');
  const categories = expansion.getByRole('tablist', { name: '扩展素材分类' });
  const details = expansion.getByTestId('expansion-detail');
  await categories.getByRole('tab', { name: '技能图标', exact: true }).click();
  const skills = expansion.getByRole('button', { name: /^选择技能：/ });
  await expect(skills).toHaveCount(8);
  const flame = expansion.getByRole('button', { name: '选择技能：烈焰斩', exact: true });
  await skills.nth(1).click();
  await expect(flame).toHaveAttribute('aria-pressed', 'false');
  await flame.click();
  await expect(flame).toHaveAttribute('aria-pressed', 'true');
  await expect(details).toContainText('烈焰斩');

  await categories.getByRole('tab', { name: '奖励道具', exact: true }).click();
  const rewards = expansion.getByRole('button', { name: /^选择奖励：/ });
  await expect(rewards).toHaveCount(8);
  const gold = expansion.getByRole('button', { name: '选择奖励：金币', exact: true });
  await rewards.nth(1).click();
  await expect(gold).toHaveAttribute('aria-pressed', 'false');
  await gold.click();
  await expect(gold).toHaveAttribute('aria-pressed', 'true');
  await expect(details).toContainText('金币');
});
