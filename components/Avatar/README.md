# Avatar

玩家、英雄和小队头像。硬朗方框沿用默认圆角；图片保持裁切填满。

```js
React.createElement(ArenaUI.Avatar, {
  src: '../assets/portraits/warden.webp', name: '守望者', size: 'lg'
});
```

- `src?: string`：图片地址；缺失或加载失败时显示名称首字符。
- `name?: string`：无障碍名称和回退文字，默认「玩家」。
- `size?: 'sm' | 'md' | 'lg'`：30 / 44 / 64px，默认 md。
- `className?: string`：自定义布局。
- 头像本身不响应点击；交互头像需由宿主放在有清楚名称的按钮内。
