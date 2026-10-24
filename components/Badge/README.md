# Badge

短状态标签（如「新」「已装备」「冷却中」），描边 + 同色文字，`tone` 对应系统语义色。

- `gold` 奖励/稀有，`cyan` 当前/已选，`red` 危险/不足，`green` 增益/已完成，`neutral` 普通信息。
- 文案 1–4 个字，不放图标以外的装饰。

```js
React.createElement(ArenaUI.Badge, { tone: 'green' }, '已完成');
```

支持 `children`、`className` 和其余 span 属性，例如 `role="status"`。需要动态播报时由宿主按实际场景设置 aria-live，静态标签无需播报。
