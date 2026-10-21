/* @ds-bundle: {"format":4,"namespace":"ArenaUI","components":[{"name":"Button"},{"name":"StatBar"},{"name":"ItemSlot"},{"name":"Badge"},{"name":"Panel"}]} */
(function () {
  // 所有组件只依赖 window.React，样式全部来自 bundle.css + tokens.css
  var React = window.React, h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }

  // 按钮：primary 金色主行动 / secondary 次要 / danger 危险操作
  function Button(props) {
    var variant = props.variant || 'primary', size = props.size || 'md';
    var rest = omit(props, ['variant', 'size', 'className', 'children']);
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('au-btn', 'au-btn-' + variant, 'au-btn-' + size, props.className)
    }), props.children);
  }

  // 数值条：hp 红 / mp 青 / xp 金；value 会被夹在 0..max
  function StatBar(props) {
    var kind = props.kind || 'hp', max = props.max > 0 ? props.max : 100;
    var v = Math.max(0, Math.min(max, props.value || 0)), pct = (v / max) * 100;
    var low = kind === 'hp' && pct <= 25;
    return h('div', { className: cx('au-stat', 'au-stat-' + kind, low && 'is-low', props.className) },
      (props.label || props.showValue !== false) && h('div', { className: 'au-stat-head' },
        props.label ? h('span', { className: 'au-stat-label' }, props.label) : h('span'),
        props.showValue !== false && h('span', { className: 'au-stat-num' }, v.toLocaleString() + ' / ' + max.toLocaleString())),
      h('div', { className: 'au-stat-track', role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': v, 'aria-label': props.label || kind },
        h('div', { className: 'au-stat-fill', style: { width: pct + '%' } })));
  }

  // 道具格：rarity 决定边框色；icon 由使用方提供（图片或任意节点）
  function ItemSlot(props) {
    var rarity = props.rarity || 'common', empty = !props.icon;
    var rest = omit(props, ['rarity', 'icon', 'count', 'selected', 'className', 'label']);
    return h('button', Object.assign({ type: 'button', 'aria-label': props.label, 'aria-pressed': !!props.selected }, rest, {
      className: cx('au-slot', 'au-slot-' + rarity, props.selected && 'is-selected', empty && 'is-empty', props.className)
    }),
      !empty && h('span', { className: 'au-slot-icon' }, props.icon),
      props.count > 1 && h('span', { className: 'au-slot-count' }, props.count > 999 ? '999+' : String(props.count)));
  }

  // 徽章：短标签，tone 对应语义色
  function Badge(props) {
    return h('span', { className: cx('au-badge', 'au-badge-' + (props.tone || 'neutral'), props.className) }, props.children);
  }

  // 面板：标题 + 内容 + 可选底部操作区
  function Panel(props) {
    return h('section', { className: cx('au-panel', props.className) },
      props.title && h('header', { className: 'au-panel-head' }, h('h2', { className: 'au-panel-title' }, props.title), props.extra || null),
      h('div', { className: 'au-panel-body' }, props.children),
      props.actions && h('footer', { className: 'au-panel-foot' }, props.actions));
  }

  window.ArenaUI = Object.assign(window.ArenaUI || {}, { Button: Button, StatBar: StatBar, ItemSlot: ItemSlot, Badge: Badge, Panel: Panel });
})();
