# ItemSlot

背包/装备栏里的一个 56px 道具格，边框颜色表示稀有度：common `ink-muted`、rare `cyan`、epic `violet`、legendary `gold`。

- 不传 `icon` 即空格子（虚线边框）。`count > 1` 时右下角显示数量，超过 999 显示 `999+`。
- 选中态：`surface-700` 底 + 外圈 `cyan` 双环，和稀有度边框可以同时存在。
- 稀有度同时应在道具名或 tooltip 里用文字写明，不只靠颜色。
- 使用方提供：道具图标（`icon`，推荐 44×44 图片）、`label`（无障碍名称）、`onClick`。

```js
React.createElement(ArenaUI.ItemSlot, {
  rarity: 'legendary', label: '王者之刃，传说，已选中', selected: true,
  icon: React.createElement('img', { src: '../assets/items/blade.webp', alt: '' }),
  onClick: () => selectItem('blade')
});
```

支持原生 button 属性。`disabled` 使用原生禁用机制，阻止点击和键盘操作。空格子仍可由宿主处理点击（例如打开装备选择器）；需要禁止选择时显式设置 disabled。可见图标由 label 统一命名，内部图片使用空 alt，避免重复朗读。
