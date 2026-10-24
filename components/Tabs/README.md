# Tabs

受控的横向分类导航。选中项以青色文字和底线区分，禁用项不能选中。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `items` | `{id, label, disabled?, panelId?}[]` | `id` 必须唯一；`label` 支持 React 节点 |
| `value` | `string` | 当前选中项的 id |
| `onChange` | `(id: string) => void` | 由宿主更新 value |
| `label` | `string` | 导航的无障碍名称，默认「分类」 |
| `className` | `string` | 自定义布局 |

```js
const [tab, setTab] = React.useState('weapons');
React.createElement(ArenaUI.Tabs, {
  label: '背包分类', value: tab, onChange: setTab,
  items: [{ id: 'weapons', label: '武器', panelId: 'weapon-list' },
          { id: 'armor', label: '防具', panelId: 'armor-list' }]
});
```

左右方向键循环切换，Home / End 跳到首尾，自动跳过禁用项。Tab 键只进入当前选中项；未选中有效项时进入首个可用项。组件只负责导航，宿主根据 value 渲染内容；提供 `panelId` 时，宿主需创建对应 id 的内容面板。不要把纯页面链接伪装成 Tabs。
