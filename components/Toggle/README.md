# Toggle

二元设置开关。青色代表开启，同时通过滑块位置和 `aria-checked` 传达状态。

```js
const [enabled, setEnabled] = React.useState(true);
React.createElement(ArenaUI.Toggle, {
  checked: enabled, onChange: setEnabled, label: '自动拾取'
});
```

- `checked: boolean` 为受控值；`onChange(next: boolean)` 接收下一个布尔值，宿主更新状态。
- `label: ReactNode` 为必填可见名称。
- `disabled` 禁用鼠标和键盘操作。
- 支持其余 button 属性，例如 `id`、`aria-describedby`、`className`、`style`；`role` 固定为 `switch`。
- 空格或 Enter 切换。用于立即生效的设置；提交表单请另用 Button。
