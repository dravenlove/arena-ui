# Panel

承载背包、技能详情、结算等内容的容器：`surface-800` 底、`line` 描边、`radius-sm` 圆角。

- `title` 用 heading 样式；`extra` 放在标题右侧（例如一个 Badge）；`actions` 是底部右对齐的按钮区。
- 内边距 `space-4`；面板之间间隔 `space-6`。
- 宽度跟随宿主容器，无最大宽度限制，适合网格与侧栏。

```js
React.createElement(ArenaUI.Panel, {
  id: 'skill-detail', title: '技能详情',
  extra: React.createElement(ArenaUI.Badge, { tone: 'cyan' }, '已装备'),
  actions: React.createElement(ArenaUI.Button, null, '升级')
}, '对目标造成 120% 攻击力的伤害。');
```

支持 section 通用属性，例如 `id`、`aria-label`、`style` 和事件属性。`title` 为 React 标题节点，不会透传成 HTML title 提示；没有 title 时可仅传 extra。正文和操作区分别由 `children`、`actions` 提供。
