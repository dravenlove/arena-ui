(function () {
  'use strict';
  var h = React.createElement;
  // 独立加载图标清单，不影响原有组件实验场的状态。
  window.ArenaHomeIcons = function HomeIcons() {
    var dataState = React.useState({ status: 'loading', items: [] }), data = dataState[0], setData = dataState[1];
    var selectedState = React.useState(''), selectedId = selectedState[0], setSelectedId = selectedState[1];
    var sizeState = React.useState(64), size = sizeState[0], setSize = sizeState[1];
    var backgroundState = React.useState('dark'), background = backgroundState[0], setBackground = backgroundState[1];
    var retryState = React.useState(0), retry = retryState[0], setRetry = retryState[1];
    React.useEffect(function () {
      var controller = new AbortController();
      setData({ status: 'loading', items: [] });
      fetch('../assets/home-icons.json', { cache: 'no-store', signal: controller.signal }).then(function (response) {
        if (!response.ok) throw new Error('图标清单暂不可用');
        return response.json();
      }).then(function (catalog) {
        if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.items)) throw new Error('图标清单格式错误');
        var seen = new Set();
        var items = catalog.items.filter(function (item) {
          if (!item || typeof item.id !== 'string' || seen.has(item.id) || typeof item.label !== 'string' || typeof item.path !== 'string') return false;
          if (typeof item.description !== 'string' || !Array.isArray(item.size) || item.size.length !== 2 || !item.size.every(function (value) { return Number.isInteger(value) && value > 0; })) return false;
          // 仅引用同源 assets/ 下的归档图片。
          if (!/^assets\/[a-zA-Z0-9/_-]+\.png$/.test(item.path)) return false;
          seen.add(item.id); return true;
        });
        if (controller.signal.aborted) return;
        setData({ status: 'ready', items: items });
        setSelectedId(items.length ? items[0].id : '');
      }).catch(function (error) {
        if (error.name !== 'AbortError') setData({ status: 'error', items: [] });
      });
      return function () { controller.abort(); };
    }, [retry]);
    var selected = data.items.find(function (item) { return item.id === selectedId; });
    return h('section', { id: 'home-icons', className: 'home-icons-section', 'aria-labelledby': 'home-icons-title' },
      h('div', { className: 'section-heading' }, h('div', null,
        h('h2', { id: 'home-icons-title' }, '主界面常用图标', h('span', null, 'LOBBY ICONS')),
        h('p', null, '英雄、背包、任务与社交入口，独立透明图标可直接下载。')),
        h('a', { className: 'doc-link', href: './history.html' }, '全部素材 →')),
      h('div', { className: 'home-icons-toolbar' },
        h('fieldset', null, h('legend', null, '图标大小'),
          [48, 64, 96].map(function (value) {
            return h('label', { key: value }, h('input', { type: 'radio', name: 'home-icon-size', value: value, checked: size === value, onChange: function () { setSize(value); } }), value + ' px');
          })),
        h('fieldset', null, h('legend', null, '预览底色'),
          [['dark', '深色'], ['light', '浅色']].map(function (pair) {
            return h('label', { key: pair[0] }, h('input', { type: 'radio', name: 'home-icon-background', value: pair[0], checked: background === pair[0], onChange: function () { setBackground(pair[0]); } }), pair[1]);
          }))),
      data.status === 'loading' && h('p', { role: 'status', className: 'home-icons-message' }, '正在加载主界面图标…'),
      data.status === 'error' && h('div', { role: 'status', className: 'home-icons-message' }, '图标暂时无法加载。', h('button', { type: 'button', className: 'text-button', onClick: function () { setRetry(retry + 1); } }, '重新加载图标')),
      data.status === 'ready' && !data.items.length && h('p', { role: 'status', className: 'home-icons-message' }, '图标还在整理中，可先查看全部素材。'),
      data.items.length > 0 && h('div', { className: 'home-icons-grid is-' + background, style: { '--home-icon-size': size + 'px' }, 'data-testid': 'home-icons-grid' },
        data.items.map(function (item) {
          return h('article', { className: 'home-icon-card', key: item.id },
            h('button', { type: 'button', className: 'home-icon-select', 'aria-label': '选择主界面图标：' + item.label, 'aria-pressed': item.id === selectedId, 'data-testid': 'home-icon', onClick: function () { setSelectedId(item.id); } },
              h('span', { className: 'home-icon-stage' }, h('img', { src: '../' + item.path, alt: '', width: item.size[0], height: item.size[1], loading: 'lazy', onError: function (event) { event.currentTarget.hidden = true; event.currentTarget.parentNode.dataset.failed = 'true'; } })),
              h('span', { className: 'home-icon-label' }, item.label)),
            h('a', { className: 'home-icon-download', href: '../' + item.path, download: item.path.split('/').pop(), 'aria-label': '下载' + item.label + '图标 PNG' }, '下载 PNG ↓'));
        })),
      selected && h('div', { className: 'home-icon-detail', 'data-testid': 'home-icon-detail', 'aria-live': 'polite', 'aria-atomic': true },
        h('div', null, h('strong', null, selected.label), h('span', null, selected.description)),
        h('p', null, selected.size.join(' × ') + ' · 透明 PNG'),
        h('a', { href: '../' + selected.path, target: '_blank', rel: 'noreferrer' }, '查看原图 ↗'))
    );
  };
})();
