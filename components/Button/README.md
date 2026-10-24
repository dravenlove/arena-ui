# Button

触发一个行动的按钮：`primary` 用金色表示画面里最重要的那一个行动，`secondary` 用于其余选项，`danger` 用于分解、出售、放弃等不可逆操作。

- 一个界面里最多一个 `primary`（「出战」「领取」）。
- `danger` 只用描边 + 红字，不做实心红底，避免和伤害反馈混淆。
- 文案用动词开头，2–4 个字。`size="sm"` 用于列表行内操作。
- 焦点环为 2px `cyan`；禁用态降为 `surface-700` + `ink-muted`。
- 使用方提供：`onClick`、文案。

```js
React.createElement(ArenaUI.Button, {
  variant: 'primary', icon: '↗', loading: false,
  onClick: () => startBattle()
}, '出战');
```

`icon?: ReactNode` 显示在文案前，装饰图标不重复读出。`loading?: boolean` 显示加载标记、设置 `aria-busy` 并阻止重复点击，同时保留原文案。支持原生 button 属性，默认 `type="button"`；表单提交需显式指定 `type="submit"`。普通按钮高 44px，sm 为 32px，适合桌面密集操作区。
