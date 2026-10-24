# Dialog

需要明确回应的模态窗口，例如出战确认、奖励详情。使用原生 `<dialog>` 和 `showModal()`，需要支持此 API 的现代浏览器。

```js
const [open, setOpen] = React.useState(false);
React.createElement(ArenaUI.Dialog, {
  open, onClose: () => setOpen(false), title: '准备出战',
  actions: React.createElement(ArenaUI.Button, {
    onClick: () => setOpen(false)
  }, '确认出战')
}, '将消耗 20 点体力。');
```

| 属性 | 说明 |
| --- | --- |
| `open: boolean` | 是否显示，由宿主管理 |
| `onClose: () => void` | 关闭请求；宿主必须更新 open |
| `title: ReactNode` | 必填标题，同时作为无障碍名称 |
| `children?: ReactNode` | 正文 |
| `actions?: ReactNode` | 底部操作 |
| `className?: string` | 自定义样式 |

打开后，页面其他内容由原生模态机制置为不可交互。焦点进入带 `autoFocus` 的内容，默认进入关闭按钮；Tab / Shift+Tab 在窗口内循环。Esc、点击背景、右上角关闭按钮均调用 `onClose`。关闭或卸载后恢复打开前的焦点。危险操作仍需清楚说明后果，关闭请求不应执行操作。
