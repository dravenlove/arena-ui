const { test, expect } = require('@playwright/test');

async function fixture(page) {
  await page.goto('/demo/vendor/README.md');
  await page.setContent('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"></head><body><main id="fixture"></main></body></html>');
  await page.addStyleTag({ url: '/tokens/tokens.css' });
  await page.addStyleTag({ url: '/components/bundle.css' });
  await page.addScriptTag({ url: '/demo/vendor/react.production.min.js' });
  await page.addScriptTag({ url: '/demo/vendor/react-dom.production.min.js' });
  await page.addScriptTag({ url: '/components/bundle.js' });
}

test('数值条限制范围并处理非有限输入', async ({ page }) => {
  await fixture(page);
  await page.evaluate(() => {
    const h = React.createElement;
    ReactDOM.createRoot(document.getElementById('fixture')).render(h(React.Fragment, null,
      h(ArenaUI.StatBar, { label: '低于下限', value: -1, max: 100 }),
      h(ArenaUI.StatBar, { label: '高于上限', value: 999, max: 100 }),
      h(ArenaUI.StatBar, { label: '非法输入', value: NaN, max: Infinity })));
  });
  await expect(page.getByRole('meter', { name: '低于下限' })).toHaveAttribute('aria-valuenow', '0');
  await expect(page.getByRole('meter', { name: '高于上限' })).toHaveAttribute('aria-valuenow', '100');
  await expect(page.getByRole('meter', { name: '非法输入' })).toHaveAttribute('aria-valuenow', '0');
  await expect(page.getByRole('meter', { name: '非法输入' })).toHaveAttribute('aria-valuemax', '100');
  expect(await page.locator('.au-stat-fill').evaluateAll(elements => elements.every(element => !/NaN|Infinity/.test(element.style.width)))).toBe(true);
});

test('键盘切换标签会跳过禁用项并循环', async ({ page }) => {
  await fixture(page);
  await page.evaluate(() => {
    const h = React.createElement;
    function Example() {
      const [value, setValue] = React.useState('a');
      return h(ArenaUI.Tabs, { label: '测试分类', value, onChange: setValue,
        items: [{ id: 'a', label: '第一项' }, { id: 'b', label: '禁用项', disabled: true }, { id: 'c', label: '第三项' }] });
    }
    ReactDOM.createRoot(document.getElementById('fixture')).render(h(Example));
  });
  const first = page.getByRole('tab', { name: '第一项' });
  const third = page.getByRole('tab', { name: '第三项' });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(third).toBeFocused();
  await expect(third).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-selected', 'true');
});

test('开关接受键盘操作且禁用开关不可点击', async ({ page }) => {
  await fixture(page);
  await page.evaluate(() => {
    const h = React.createElement;
    function Example() {
      const [checked, setChecked] = React.useState(false);
      return h(React.Fragment, null,
        h(ArenaUI.Toggle, { checked, onChange: setChecked, label: '声音' }),
        h(ArenaUI.Toggle, { checked: false, disabled: true, label: '禁用开关' }));
    }
    ReactDOM.createRoot(document.getElementById('fixture')).render(h(Example));
  });
  const toggle = page.getByRole('switch', { name: '声音' });
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toBeChecked();
  await page.keyboard.press('Enter');
  await expect(toggle).not.toBeChecked();
  await expect(page.getByRole('switch', { name: '禁用开关' })).toBeDisabled();
});

test('对话框在 Tab 和 Shift+Tab 导航时保持焦点', async ({ page }) => {
  await fixture(page);
  await page.evaluate(() => {
    const h = React.createElement;
    function Example() {
      const [open, setOpen] = React.useState(false);
      return h(React.Fragment, null,
        h(ArenaUI.Button, { onClick: () => setOpen(true) }, '打开测试弹窗'),
        h(ArenaUI.Dialog, { open, onClose: () => setOpen(false), title: '测试弹窗',
          actions: h(ArenaUI.Button, { onClick: () => setOpen(false) }, '确定') }, '测试内容'));
    }
    ReactDOM.createRoot(document.getElementById('fixture')).render(h(Example));
  });
  await page.getByRole('button', { name: '打开测试弹窗' }).click();
  const close = page.getByRole('button', { name: '关闭对话框' });
  const confirm = page.getByRole('button', { name: '确定', exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(confirm).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
});
