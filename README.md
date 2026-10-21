# Arena UI

深色优先的游戏界面设计系统 (dark-first game UI)：金色代表行动与奖励，青色代表选中与能量，红色只代表伤害与危险。

> 这是一套**起步版**：没有对应的代码仓库，所以 token 和组件都是手工设定的，暂无字体文件、Logo 和图标。等有了前端/客户端仓库，可以再从代码同步。

## 原则 (Principles)

- **场景在后，信息在前。** 底色压到很暗（`bg-900`、`surface-800`），让角色、特效和数字成为画面主角。
- **颜色有固定含义。** `gold` = 主行动/货币/传说，`cyan` = 选中/焦点/法力，`red` = HP/伤害/危险，`green` = 治疗/增益，`violet` 只用于史诗级稀有度。不要把状态色拿来装饰。
- **硬朗的形状。** 默认 `radius-sm` (2px)，只有浮层用 `radius-md`，进度条和徽章用 `radius-pill`。
- **数字要稳。** 所有会变化的数值用 `stat` 样式（等宽字体），跳数字时宽度不变。

## 颜色 (Color)

只有一套深色主题 (Dark)。层级从深到浅：`bg-900` → `surface-800` → `surface-700`。

| 场景 | 用法 |
| --- | --- |
| 主按钮 | 底 `gold`，文字 `bg-900`（10.4:1） |
| 次按钮 | 底 `surface-700`，边框 `ink-muted`，文字 `ink` |
| 选中 / 焦点 | 2px `cyan` 描边或焦点环 |
| 伤害 / 治疗飘字 | `red` / `green` + `stat` 样式，并带 `-` / `+` 号 |
| 分隔线 | `line`（装饰用，不能当唯一的控件边框） |

对比度备注：`red` 在 `surface-700` 上只有 4.37:1，小字号不要放在这一层；`red` 与 `green` 并用时必须同时用正负号或图标区分（照顾色觉差异）。

## 字体 (Typography)

- `sans`：Inter + 苹方 / 微软雅黑 / Noto Sans SC 回退，覆盖中英文。
- `mono`：JetBrains Mono，用于数值。
- 目前**没有打包字体文件**，依赖用户系统已安装的字体；正式上线前应补上授权字体文件。

样式：`display` 40 · `title` 24 · `heading` 18 · `body` 15 · `caption` 12 · `stat` 20（mono）。

## 间距与圆角 (Spacing & Radius)

4px 基准网格：`space-1` 4 · `space-2` 8 · `space-4` 16 · `space-6` 24。
面板内边距 `space-4`，HUD 距屏幕边缘 `space-6`。

## 组件 (Components)

React 组件，全局命名空间 `window.ArenaUI`，样式在 `components/bundle.css`，类名前缀 `au-`。

| 组件 | 用途 |
| --- | --- |
| `Button` | primary / secondary / danger 三种按钮，`size="sm"` 用于行内 |
| `StatBar` | HP / MP / XP 数值条，HP ≤ 25% 数字变红 |
| `ItemSlot` | 56px 道具格，边框色 = 稀有度（common / rare / epic / legendary） |
| `Badge` | 短状态标签 |
| `Panel` | 标题 + 内容 + 底部操作区的容器 |

稀有度色阶：common `ink-muted` → rare `cyan` → epic `violet` → legendary `gold`。

## 图标 (Iconography)

暂无图标与 Logo。名字用 `title` 样式的纯文字展示，不要临时画标志。

## 文案 (Voice)

短、直接、动词开头：「出战」「领取」「强化」。数值写清楚单位和回合：「冷却 3 回合」「+15% 暴击率」。

## 目录结构 (Repository layout)

```
tokens/tokens.json      所有 token 的源数据（颜色、字体、间距、圆角）
tokens/tokens.css       由 tokens.json 生成的 CSS 变量和文字样式类
components/bundle.js    组件脚本，挂到 window.ArenaUI（依赖 React 18）
components/bundle.css   组件样式（类名前缀 au-）
components/index.d.ts   组件类型定义（文档用）
components/<组件>/README.md  每个组件的使用规范
demo/index.html         所有颜色和组件的演示页
```

## 使用方法 (Usage)

```html
<link rel="stylesheet" href="tokens/tokens.css">
<link rel="stylesheet" href="components/bundle.css">
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="components/bundle.js"></script>
<script>
  // 渲染一个主按钮
  const { Button } = window.ArenaUI;
  ReactDOM.createRoot(document.getElementById('app')).render(React.createElement(Button, null, '出战'));
</script>
```

只想用颜色和字体时，引入 `tokens/tokens.css` 后直接写 `var(--gold)`、`class="stat"` 即可。

演示页：开启 GitHub Pages（Settings → Pages → 从 main 分支根目录部署）后访问 `/demo/`。
