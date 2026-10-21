# ItemSlot

背包/装备栏里的一个 56px 道具格，边框颜色表示稀有度：common `ink-muted`、rare `cyan`、epic `violet`、legendary `gold`。

- 不传 `icon` 即空格子（虚线边框）。`count > 1` 时右下角显示数量，超过 999 显示 `999+`。
- 选中态：`surface-700` 底 + 外圈 `cyan` 双环，和稀有度边框可以同时存在。
- 稀有度同时应在道具名或 tooltip 里用文字写明，不只靠颜色。
- 使用方提供：道具图标（`icon`，推荐 36×36 图片）、`label`（无障碍名称）、`onClick`。
