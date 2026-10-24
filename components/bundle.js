/* @ds-bundle: {"format":4,"namespace":"ArenaUI","components":[{"name":"Button"},{"name":"StatBar"},{"name":"ItemSlot"},{"name":"Badge"},{"name":"Panel"},{"name":"Tabs"},{"name":"Toggle"},{"name":"Avatar"},{"name":"Dialog"}]} */
(function () {
  'use strict';
  // 所有组件只依赖 React 18；保留无需构建的 window.ArenaUI 接入方式。
  var React = window.React, h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k) && keys.indexOf(k) < 0) r[k] = o[k]; return r; }
  function finite(value, fallback) { return typeof value === 'number' && Number.isFinite(value) ? value : fallback; }

  function Button(props) {
    var variant = props.variant || 'primary', size = props.size || 'md';
    var rest = omit(props, ['variant', 'size', 'className', 'children', 'icon', 'loading']);
    return h('button', Object.assign({ type: 'button' }, rest, {
      disabled: !!(props.disabled || props.loading), 'aria-busy': props.loading || undefined,
      className: cx('au-btn', 'au-btn-' + variant, 'au-btn-' + size, props.loading && 'is-loading', props.className)
    }), props.loading ? h('span', { className: 'au-spinner', 'aria-hidden': true }) : props.icon && h('span', { className: 'au-btn-icon', 'aria-hidden': true }, props.icon),
    h('span', { className: 'au-btn-label' }, props.children));
  }

  // 非有限数值使用安全默认值，防止 NaN / Infinity 污染宽度和 aria 属性。
  function StatBar(props) {
    var kind = props.kind || 'hp', rawMax = finite(props.max, 100), max = rawMax > 0 ? rawMax : 100;
    var v = Math.max(0, Math.min(max, finite(props.value, 0))), pct = v / max * 100;
    return h('div', { className: cx('au-stat', 'au-stat-' + kind, kind === 'hp' && pct <= 25 && 'is-low', props.className) },
      (props.label || props.showValue !== false) && h('div', { className: 'au-stat-head' },
        h('span', { className: 'au-stat-label' }, props.label || ''),
        props.showValue !== false && h('span', { className: 'au-stat-num' }, v.toLocaleString() + ' / ' + max.toLocaleString())),
      h('div', { className: 'au-stat-track', role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': v, 'aria-label': props.label || kind.toUpperCase() },
        h('div', { className: 'au-stat-fill', style: { width: pct + '%' } })));
  }

  function ItemSlot(props) {
    var rarity = props.rarity || 'common', empty = !props.icon;
    var rest = omit(props, ['rarity', 'icon', 'count', 'selected', 'className', 'label']);
    return h('button', Object.assign({ type: 'button', 'aria-label': props.label || (empty ? '空道具格' : '道具'), 'aria-pressed': !!props.selected }, rest, {
      className: cx('au-slot', 'au-slot-' + rarity, props.selected && 'is-selected', empty && 'is-empty', props.className)
    }), !empty && h('span', { className: 'au-slot-icon', 'aria-hidden': true }, props.icon),
    props.count > 1 && h('span', { className: 'au-slot-count' }, props.count > 999 ? '999+' : String(props.count)));
  }

  function Badge(props) {
    return h('span', Object.assign({}, omit(props, ['tone', 'className', 'children']), {
      className: cx('au-badge', 'au-badge-' + (props.tone || 'neutral'), props.className)
    }), props.children);
  }

  function Panel(props) {
    return h('section', Object.assign({}, omit(props, ['title', 'extra', 'actions', 'children', 'className']), {
      className: cx('au-panel', props.className)
    }), (props.title || props.extra) && h('header', { className: 'au-panel-head' },
      props.title && h('h2', { className: 'au-panel-title' }, props.title), props.extra || null),
    h('div', { className: 'au-panel-body' }, props.children),
    props.actions && h('footer', { className: 'au-panel-foot' }, props.actions));
  }

  // 受控标签导航：方向键、Home / End 自动跳过禁用项。
  function Tabs(props) {
    var uid = React.useId(), refs = React.useRef([]), items = props.items || [];
    var enabled = items.map(function (item, index) { return item.disabled ? -1 : index; }).filter(function (i) { return i >= 0; });
    var selectedIndex = items.findIndex(function (item) { return item.id === props.value && !item.disabled; });
    var tabIndex = selectedIndex >= 0 ? selectedIndex : enabled[0];
    function navigate(event, index) {
      var target, position = enabled.indexOf(index);
      if (event.key === 'ArrowRight') target = enabled[(position + 1) % enabled.length];
      else if (event.key === 'ArrowLeft') target = enabled[(position - 1 + enabled.length) % enabled.length];
      else if (event.key === 'Home') target = enabled[0];
      else if (event.key === 'End') target = enabled[enabled.length - 1];
      else return;
      event.preventDefault();
      if (target !== undefined) { refs.current[target].focus(); if (props.onChange) props.onChange(items[target].id); }
    }
    return h('div', { className: cx('au-tabs', props.className), role: 'tablist', 'aria-label': props.label || '分类', 'aria-orientation': 'horizontal' },
      items.map(function (item, index) {
        return h('button', { key: item.id, type: 'button', role: 'tab', id: uid + '-tab-' + index,
          ref: function (node) { refs.current[index] = node; }, disabled: !!item.disabled,
          'aria-selected': item.id === props.value, 'aria-controls': item.panelId,
          tabIndex: index === tabIndex ? 0 : -1, className: cx('au-tab', item.id === props.value && 'is-active'),
          onClick: function () { if (props.onChange) props.onChange(item.id); },
          onKeyDown: function (event) { navigate(event, index); }
        }, item.label);
      }));
  }

  function Toggle(props) {
    var rest = omit(props, ['checked', 'onChange', 'label', 'className', 'children']);
    return h('button', Object.assign({ type: 'button' }, rest, {
      role: 'switch', 'aria-checked': !!props.checked,
      className: cx('au-toggle', props.checked && 'is-checked', props.className),
      onClick: function () { if (!props.disabled && props.onChange) props.onChange(!props.checked); }
    }), h('span', { className: 'au-toggle-track', 'aria-hidden': true }, h('span', { className: 'au-toggle-thumb' })),
    h('span', { className: 'au-toggle-label' }, props.label));
  }

  function Avatar(props) {
    var state = React.useState(false), failed = state[0], setFailed = state[1];
    React.useEffect(function () { setFailed(false); }, [props.src]);
    var name = props.name || '玩家';
    return h('span', { className: cx('au-avatar', 'au-avatar-' + (props.size || 'md'), props.className), role: 'img', 'aria-label': name },
      props.src && !failed ? h('img', { src: props.src, alt: '', loading: 'lazy', onError: function () { setFailed(true); } }) :
        h('span', { 'aria-hidden': true }, Array.from(name.trim())[0] || '?'));
  }

  // showModal 让页面其余区域不可交互；补足焦点循环和关闭后的焦点恢复。
  function Dialog(props) {
    var ref = React.useRef(null), closeRef = React.useRef(props.onClose), uid = React.useId();
    closeRef.current = props.onClose;
    React.useEffect(function () {
      if (!props.open || !ref.current) return;
      var dialog = ref.current, previous = document.activeElement;
      dialog.showModal();
      function focusable() {
        return Array.prototype.filter.call(dialog.querySelectorAll('button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'),
          function (node) { return node.tabIndex >= 0 && node.getClientRects().length > 0 && !node.closest('[hidden], [inert]'); });
      }
      var nodes = focusable();
      (dialog.querySelector('[autofocus]') || nodes[0] || dialog).focus();
      function keydown(event) {
        if (event.key !== 'Tab') return;
        var targets = focusable(), first = targets[0], last = targets[targets.length - 1];
        if (!first) { event.preventDefault(); dialog.focus(); }
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
      }
      dialog.addEventListener('keydown', keydown);
      return function () {
        dialog.removeEventListener('keydown', keydown);
        if (dialog.open) dialog.close();
        if (previous && previous.isConnected && typeof previous.focus === 'function') previous.focus();
      };
    }, [props.open]);
    if (!props.open) return null;
    function close() { if (closeRef.current) closeRef.current(); }
    return h('dialog', { ref: ref, className: cx('au-dialog', props.className), tabIndex: -1,
      'aria-modal': true, 'aria-labelledby': uid + '-title',
      onCancel: function (event) { event.preventDefault(); close(); },
      onClick: function (event) { if (event.target === event.currentTarget) close(); }
    }, h('div', { className: 'au-dialog-content' },
      h('header', { className: 'au-dialog-head' }, h('h2', { id: uid + '-title', className: 'au-dialog-title' }, props.title),
        h('button', { type: 'button', className: 'au-dialog-close', onClick: close, 'aria-label': '关闭对话框' }, '×')),
      h('div', { className: 'au-dialog-body' }, props.children),
      props.actions && h('footer', { className: 'au-dialog-foot' }, props.actions)));
  }

  window.ArenaUI = Object.assign(window.ArenaUI || {}, {
    Button: Button, StatBar: StatBar, ItemSlot: ItemSlot, Badge: Badge, Panel: Panel,
    Tabs: Tabs, Toggle: Toggle, Avatar: Avatar, Dialog: Dialog
  });
})();
