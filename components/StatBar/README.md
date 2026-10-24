# StatBar

显示生命值、法力或经验的横向数值条，`kind` 决定颜色：`hp` 用 `red`，`mp` 用 `cyan`，`xp` 用 `gold`。

- 数字用等宽字体，`value / max` 形式；HP ≤ 25% 时数字也变红，提示危险（不只靠条的长度）。
- 轨道是 `radius-pill`，底色 `bg-900`，宽度跟随容器，可在窄容器内收缩。
- 带 `role="meter"` 与 aria 值，屏幕阅读器可读。
- 使用方提供：`value`、`max`，可选 `label`；不想显示数字时 `showValue={false}`。

```js
React.createElement(ArenaUI.StatBar, {
  kind: 'hp', value: 3420, max: 4800, label: '生命值 HP'
});
```

`value` 限制在 `0..max`；NaN / Infinity / 非数字 value 回退 0，非有限或不大于 0 的 max 回退 100。所有 aria 数值和进度宽度都使用修正后的有限值。`className` 用于自定义布局。
