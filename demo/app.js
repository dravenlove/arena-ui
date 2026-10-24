(function () {
  'use strict';
  var h = React.createElement, A = window.ArenaUI;
  var asset = '../assets/generated/';
  var paths = {
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    layers: 'm12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5',
    sword: 'm14 3 7 0 0 7-12 12-7-7zM5 12l7 7M3 21l3-3M14 3l7 7',
    sliders: 'M4 5h16M4 12h16M4 19h16M8 2v6M16 9v6M10 16v6',
    box: 'm12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10',
    message: 'M21 15a3 3 0 0 1-3 3H7l-4 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3z',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    external: 'M14 3h7v7M21 3 10 14M10 3H4v17h17v-6',
    code: 'm8 6-6 6 6 6M16 6l6 6-6 6m-3-14-2 16',
    search: 'M21 21l-6-6M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
    chevron: 'm9 5 7 7-7 7',
    book: 'M3 3h6a3 3 0 0 1 3 3v16a4 4 0 0 0-4-3H3zM21 3h-6a3 3 0 0 0-3 3v16a4 4 0 0 1 4-3h5z',
    check: 'm5 12 4 4L19 6',
    bolt: 'm13 2-9 12h7l-1 8 10-13h-8z',
    download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5'
  };
  function Icon(p) {
    return h('svg', { width: p.size || 18, height: p.size || 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: paths[p.name] || paths.grid }));
  }
  var items = [
    { name: '誓约之刃', type: 'weapon', rarity: 'legendary', hint: '+128 攻击力', index: 0 },
    { name: '守望者之盾', type: 'armor', rarity: 'rare', hint: '+86 防御力', index: 1 },
    { name: '虚空指环', type: 'armor', rarity: 'epic', hint: '+15% 暴击率', index: 2 },
    { name: '生命药水', type: 'consumable', rarity: 'common', hint: '恢复 350 HP', count: 12, index: 3 },
    { name: '破阵战斧', type: 'weapon', rarity: 'common', hint: '+96 攻击力', index: 4 },
    { name: '钢铁战盔', type: 'armor', rarity: 'common', hint: '+42 防御力', index: 5 },
    { name: '经验卷轴', type: 'consumable', rarity: 'legendary', hint: '获得 500 XP', count: 3, index: 6 },
    { name: '能量水晶', type: 'consumable', rarity: 'rare', hint: '恢复 120 MP', count: 8, index: 7 }
  ];
  function ItemArt(p) {
    return h('span', { className: 'item-art', 'aria-hidden': true, style: { backgroundPosition: ((p.index % 4) * 100 / 3) + '% ' + (p.index < 4 ? '0%' : '100%') } });
  }
  var expansionSets = {
    skill: {
      file: 'skills-atlas.png', name: '技能',
      items: [
        ['烈焰斩', '火焰凝成刀锋，适用于近战爆发与灼烧类技能。'],
        ['寒冰枪', '冰晶汇成锐利长枪，适用于冰霜伤害与减速技能。'],
        ['雷霆击', '闪电贯穿目标，适用于瞬发攻击与范围打击。'],
        ['生命绽放', '生命能量向外绽开，适用于治疗与持续恢复。'],
        ['钢铁壁垒', '坚固护盾挡下冲击，适用于防御姿态与护甲增益。'],
        ['奥术漩涡', '奥术能量交汇旋转，适用于聚怪与范围法术。'],
        ['暗影突袭', '锋芒自暗影中显现，适用于潜行与突进技能。'],
        ['日曜裁决', '日光凝聚为审判之力，适用于终结技与神圣伤害。']
      ]
    },
    reward: {
      file: 'rewards-atlas.png', name: '奖励',
      items: [
        ['金币', '通用交易货币，用于商店购买、装备升级与奖励结算。'],
        ['宝石袋', '收纳闪耀宝石的奖励袋，适用于礼包与稀有货币。'],
        ['经验书', '记录冒险经验的书册，适用于角色培养与等级奖励。'],
        ['体力药剂', '补充冒险所需的体力，适用于补给和每日任务。'],
        ['传说宝箱', '等待开启的珍贵宝箱，适用于关卡首通与赛季奖励。'],
        ['竞技勋章', '竞技场中的荣誉凭证，适用于排名与段位奖励。'],
        ['通行证', '开启后续征途的凭证，适用于赛季通行证与活动入场。'],
        ['强化矿石', '蕴含能量的原矿，适用于装备强化与材料背包。']
      ]
    }
  };
  // 扩展素材独立管理选择状态，不干扰组件实验场的分类和筛选。
  function ExpansionPack() {
    var typeState = React.useState('skill'), type = typeState[0], setType = typeState[1];
    var selectionState = React.useState(0), selectedIndex = selectionState[0], setSelectedIndex = selectionState[1];
    var set = expansionSets[type], selectedItem = set.items[selectedIndex];
    function changeType(next) { setType(next); setSelectedIndex(0); }
    return h('section', { id: 'expansion', className: 'expansion-section', 'aria-labelledby': 'expansion-title' },
      h('div', { className: 'section-heading' }, h('div', null,
        h('h2', { id: 'expansion-title' }, '战斗之外，更多可能', h('span', null, 'EXPANSION PACK')),
        h('p', null, '从技能释放到战利品入袋，让每段旅程都有自己的画面。')),
        h('span', { className: 'expansion-label' }, '新增素材')),
      h('div', { className: 'expansion-grid' },
        h('article', { className: 'expansion-atlas-card' },
          h('header', { className: 'expansion-card-head' }, h('div', null, h('h3', null, '下一次出手，下一份收获。'), h('p', null, '两组图集，十六种故事。')), h('span', null, '16 ICONS')),
          h(A.Tabs, { label: '扩展素材分类', value: type, onChange: changeType,
            items: [{ id: 'skill', label: '技能图标', panelId: 'expansion-atlas-panel' }, { id: 'reward', label: '奖励道具', panelId: 'expansion-atlas-panel' }] }),
          h('div', { id: 'expansion-atlas-panel', role: 'tabpanel', 'aria-label': type === 'skill' ? '技能图标' : '奖励道具', className: 'expansion-atlas-panel' },
            h('div', { className: 'expansion-icons' }, set.items.map(function (item, index) {
              return h('button', { key: type + '-' + index, type: 'button', className: 'expansion-icon-button' + (index === selectedIndex ? ' is-selected' : ''),
                'aria-label': '选择' + set.name + '：' + item[0], 'aria-pressed': index === selectedIndex, 'data-testid': 'expansion-icon',
                onClick: function () { setSelectedIndex(index); } },
                h('span', { className: 'expansion-art expansion-art-' + type, 'aria-hidden': true,
                  style: { backgroundPosition: ((index % 4) * 100 / 3) + '% ' + (index < 4 ? '0%' : '100%') } }),
                h('span', { className: 'expansion-icon-name' }, item[0]));
            })),
            h('div', { className: 'expansion-detail', 'data-testid': 'expansion-detail', 'aria-live': 'polite', 'aria-atomic': true },
              h('div', null, h('span', { className: 'expansion-detail-kicker' }, type === 'skill' ? 'SKILL SELECTED' : 'REWARD SELECTED'), h('strong', null, selectedItem[0])),
              h('p', null, selectedItem[1])))),
        h('div', { className: 'expansion-side' },
          h('a', { className: 'expansion-scene', href: asset + 'frost-arena.png', target: '_blank', rel: 'noreferrer', 'aria-label': '查看冰霜竞技场原图' },
            h('img', { src: asset + 'frost-arena.png', alt: '冰雪环绕的竞技场场景', loading: 'lazy' }),
            h('div', { className: 'expansion-scene-copy' }, h('span', null, 'SCENE 02 / FROST ARENA'), h('h3', null, '踏入冰霜，唤醒战意。'), h('p', null, '为下一场对决，切换一片天地。')), h(Icon, { name: 'external', size: 15 })),
          h('article', { className: 'expansion-empty' },
            h('img', { src: asset + 'empty-inventory.png', alt: '用于背包空状态的透明背景插画', loading: 'lazy' }),
            h('div', null, h('span', { className: 'expansion-detail-kicker' }, 'EMPTY STATE'), h('h3', null, '背包还空着。'), h('p', null, '新的战利品，在下一场冒险里。'), h('span', { className: 'expansion-empty-note' }, '透明背景 · 随处融入'))))),
      h('div', { className: 'expansion-downloads', 'aria-label': '下载扩展素材' },
        [['skills-atlas.png', '技能图集'], ['rewards-atlas.png', '奖励图集'], ['frost-arena.png', '冰霜竞技场'], ['empty-inventory.png', '空背包插画']].map(function (file) {
          return h('a', { key: file[0], href: asset + file[0], download: file[0] }, h(Icon, { name: 'download', size: 14 }), file[1], h('span', null, 'PNG'));
        })));
  }
  // Card 定义在组件外，避免父状态变化导致整个卡片卸载和焦点丢失。
  function Card(p) {
    return h('article', { className: 'specimen ' + (p.className || ''), id: p.id },
      h('header', { className: 'specimen-head' }, h('div', { className: 'card-label' }, h(Icon, { name: p.icon }), h('h3', null, p.title), h('span', { className: 'english' }, p.en)),
        h('button', { className: 'icon-button', 'aria-label': '复制 ' + p.en + ' 用法', onClick: function () { p.onCopy(p.code); } }, h(Icon, { name: 'code', size: 16 }))),
      h('div', { className: 'specimen-content' }, p.children), h('footer', { className: 'specimen-foot' }, p.note, h('span', null, p.tag || '交互预览')));
  }
  function App() {
    var _a = React.useState('all'), category = _a[0], setCategory = _a[1];
    var _b = React.useState(''), query = _b[0], setQuery = _b[1];
    var _c = React.useState('all'), itemFilter = _c[0], setItemFilter = _c[1];
    var _d = React.useState(0), selected = _d[0], setSelected = _d[1];
    var _e = React.useState(false), dialog = _e[0], setDialog = _e[1];
    var _f = React.useState(''), toast = _f[0], setToast = _f[1];
    var _g = React.useState(true), sound = _g[0], setSound = _g[1];
    var _i = React.useState(false), auto = _i[0], setAuto = _i[1];
    var _j = React.useState('overview'), panelTab = _j[0], setPanelTab = _j[1];
    var _k = React.useState(3420), hp = _k[0], setHp = _k[1];
    var timer = React.useRef();
    React.useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
    function notify(message) { clearTimeout(timer.current); setToast(message); timer.current = setTimeout(function () { setToast(''); }, 3200); }
    function copy(code) {
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(code).then(function () { notify('用法已复制到剪贴板'); }, function () { notify('复制失败，请查看仓库中的组件文档'); });
      else notify('请查看仓库中的组件文档复制用法');
    }
    function visible(group, keywords) { return (category === 'all' || category === group) && (!query.trim() || keywords.toLowerCase().includes(query.trim().toLowerCase())); }
    function card(props) {
      props.onCopy = copy;
      return h.apply(null, [Card, props].concat(Array.prototype.slice.call(arguments, 1)));
    }
    var cards = [];
    if (visible('base', '按钮 Button action 基础组件')) cards.push(card({ key: 'buttons', id: 'buttons', icon: 'bolt', title: '行动按钮', en: 'Button', code: "React.createElement(ArenaUI.Button, { onClick: onBattle }, '出战')", note: '清晰的行动层级', tag: '3 种语义 · 2 种尺寸' },
      h('div', { className: 'button-examples' },
        h(A.Button, { icon: h(Icon, { name: 'sword' }), onClick: function () { setDialog(true); } }, '立即出战'),
        h(A.Button, { variant: 'secondary', onClick: function () { notify('编队行动已触发'); } }, '调整编队'),
        h(A.Button, { variant: 'danger', onClick: function () { notify('危险操作示例：请在实际游戏中添加确认流程'); } }, '分解道具')),
      h('div', { className: 'example-divider' }),
      h('div', { className: 'button-examples small-examples' }, h(A.Button, { size: 'sm', onClick: function () { notify('奖励已领取：+350 金币'); } }, '领取奖励'), h(A.Button, { variant: 'secondary', size: 'sm', icon: h(Icon, { name: 'box' }), onClick: function () { document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' }); } }, '背包'), h(A.Button, { size: 'sm', disabled: true }, '体力不足'))));
    if (visible('battle', '角色 Avatar Panel player 战斗组件')) cards.push(card({ key: 'player', id: 'player', icon: 'layers', title: '角色面板', en: 'Avatar / Panel', code: "React.createElement(ArenaUI.Avatar, { src: 'portrait.png', name: '暗影游侠', size: 'lg' })", note: '身份、等级与即时状态', tag: '可组合' },
      h(A.Panel, { className: 'player-demo-panel' },
        h('div', { className: 'player-identity' }, h(A.Avatar, { src: asset + 'sentinel-portrait.png', name: '暗影游侠', size: 'lg' }), h('div', null, h('div', { className: 'player-name' }, '暗影游侠', h('span', { className: 'level' }, 'LV. 27')), h('p', { className: 'player-sub' }, '暮光守望者 · 精英'), h(A.Badge, { tone: 'green' }, '● 在线'))),
        h('div', { className: 'player-stats' }, [['攻击力', '1,280'], ['防御力', '860'], ['暴击率', '24.5%']].map(function (pair) { return h('div', { key: pair[0] }, h('span', null, pair[0]), h('strong', null, pair[1])); })))));
    if (visible('battle', '数值条 StatBar HP MP XP 战斗组件')) cards.push(card({ key: 'bars', id: 'bars', icon: 'sliders', title: '战斗数值', en: 'StatBar', code: "React.createElement(ArenaUI.StatBar, { kind: 'hp', label: 'HP · 生命', value: 3420, max: 4800 })", note: '点击模拟数值变化', tag: 'HP / MP / XP' },
      h('div', { className: 'bars-stack' }, h(A.StatBar, { kind: 'hp', label: 'HP · 生命', value: hp, max: 4800 }), h(A.StatBar, { kind: 'mp', label: 'MP · 能量', value: 120, max: 200 }), h(A.StatBar, { kind: 'xp', label: 'XP · 经验', value: 6400, max: 10000 })),
      h('div', { className: 'stat-controls' }, h('button', { onClick: function () { setHp(Math.max(0, hp - 650)); }, className: 'text-button damage' }, '−650 受到伤害'), h('button', { onClick: function () { setHp(Math.min(4800, hp + 350)); }, className: 'text-button healing' }, '+350 恢复生命'))));
    if (visible('battle', '道具格 ItemSlot 背包 稀有度 战斗组件')) cards.push(card({ key: 'inventory', id: 'inventory', icon: 'box', title: '道具与装备', en: 'ItemSlot', className: 'inventory-card', code: "React.createElement(ArenaUI.ItemSlot, { rarity: 'legendary', icon: image, selected: true, label: '誓约之刃' })", note: '边框区分品质，青色标记选中', tag: '4 种稀有度' },
      h(A.Tabs, { label: '道具分类', value: itemFilter, onChange: setItemFilter, items: [{ id: 'all', label: '全部' }, { id: 'weapon', label: '武器' }, { id: 'armor', label: '防具' }, { id: 'consumable', label: '消耗品' }] }),
      h('div', { className: 'inventory-grid' }, items.filter(function (item) { return itemFilter === 'all' || item.type === itemFilter; }).map(function (item) {
        return h('div', { className: 'inventory-item', key: item.index }, h(A.ItemSlot, { 'data-testid': 'item-slot', rarity: item.rarity, selected: selected === item.index, icon: h(ItemArt, { index: item.index }), count: item.count, label: item.name, onClick: function () { setSelected(item.index); } }), h('span', null, item.name));
      })), h('div', { className: 'selected-item' }, h('span', { className: 'rarity-dot rarity-' + items[selected].rarity }), h('strong', null, items[selected].name), h('span', null, items[selected].hint), h(A.Badge, { tone: 'cyan' }, '已选中'))));
    if (visible('base', '导航 开关 Tabs Toggle 基础组件')) cards.push(card({ key: 'controls', id: 'controls', icon: 'sliders', title: '导航与设置', en: 'Tabs / Toggle', code: "React.createElement(ArenaUI.Toggle, { checked: true, onChange: setSound, label: '战斗音效' })", note: '支持键盘操作与焦点状态', tag: '受控组件' },
      h(A.Tabs, { label: '角色信息', value: panelTab, onChange: setPanelTab, items: [{ id: 'overview', label: '概览' }, { id: 'skills', label: '技能' }, { id: 'talents', label: '天赋', disabled: true }] }),
      h('div', { className: 'tab-description', role: 'tabpanel', 'aria-label': panelTab === 'overview' ? '概览' : '技能' }, panelTab === 'overview' ? '让每个选择，都有清晰的回应。' : '烈焰斩 · 对目标造成 120% 攻击力的伤害。'),
      h('div', { className: 'toggle-row' }, h(A.Toggle, { checked: sound, onChange: setSound, label: '战斗音效' }), h('span', { className: 'muted' }, sound ? '已开启' : '已关闭')),
      h('div', { className: 'toggle-row' }, h(A.Toggle, { checked: auto, onChange: setAuto, label: '自动战斗' }), h('span', { className: 'muted' }, auto ? '已开启' : '已关闭'))));
    if (visible('feedback', '标签 弹窗 Badge Dialog 反馈组件')) cards.push(card({ key: 'feedback', id: 'feedback', className: 'feedback-card', icon: 'message', title: '状态与反馈', en: 'Badge / Dialog', code: "React.createElement(ArenaUI.Dialog, { open, onClose, title: '准备好进入竞技场？' }, content)", note: '让关键状态一目了然', tag: '语义化反馈' },
      h('div', { className: 'badge-examples' }, h(A.Badge, { tone: 'gold' }, '传说品质'), h(A.Badge, { tone: 'cyan' }, '已装备'), h(A.Badge, { tone: 'red' }, '冷却 3 回合'), h(A.Badge, { tone: 'green' }, '+15% 暴击'), h(A.Badge, null, '未解锁')),
      h('div', { className: 'dialog-mini' }, h('span', { className: 'dialog-mini-title' }, '每个重要时刻，都值得确认。'), h('span', { className: 'muted' }, '战前准备、奖励领取与危险操作。'), h(A.Button, { variant: 'secondary', size: 'sm', onClick: function () { setDialog(true); } }, '预览弹窗', h(Icon, { name: 'external', size: 13 })))));
    return h(React.Fragment, null,
      h('aside', { className: 'sidebar', 'aria-label': '主导航' },
        h('a', { className: 'brand', href: '#main', 'aria-label': 'Arena UI 首页' }, h('span', null, 'ARENA', h('b', null, 'UI')), h('small', null, 'GAME DESIGN SYSTEM')),
        h('div', { className: 'sidebar-group-label' }, '工作空间'),
        h('nav', null, [['总览', 'grid', 'all', '#main'], ['基础组件', 'layers', 'base', '#library'], ['战斗组件', 'sword', 'battle', '#library'], ['反馈组件', 'message', 'feedback', '#library']].map(function (entry) {
          return h('a', { key: entry[0], href: entry[3], className: 'nav-link ' + (category === entry[2] ? 'active' : ''), 'aria-current': category === entry[2] ? 'page' : undefined, onClick: function () { setCategory(entry[2]); setQuery(''); } }, h(Icon, { name: entry[1] }), entry[0], entry[2] === 'all' && h('span', { className: 'nav-count' }, '09'));
        })),
        h('div', { className: 'sidebar-group-label resources-label' }, '设计资源'),
        h('nav', null, h('a', { className: 'nav-link', href: '#foundations' }, h(Icon, { name: 'sliders' }), '设计规范'), h('a', { className: 'nav-link', href: '#assets' }, h(Icon, { name: 'box' }), '视觉素材', h('span', { className: 'tiny-new' }, 'NEW')), h('a', { className: 'nav-link', href: './history.html' }, h(Icon, { name: 'grid' }), '每日档案'), h('a', { className: 'nav-link', href: 'https://github.com/dravenlove/arena-ui#使用方法', target: '_blank', rel: 'noreferrer' }, h(Icon, { name: 'book' }), '使用文档', h(Icon, { name: 'external', size: 12 }))),
        h('div', { className: 'sidebar-bottom' }, h('div', { className: 'system-status' }, h('i'), '所有组件已就绪'), h('span', null, 'Arena UI', h('span', { className: 'version' }, 'v2.0.0')))),
      h('div', { className: 'workspace' },
        h('header', { className: 'topbar' }, h('div', { className: 'breadcrumb' }, '工作空间', h(Icon, { name: 'chevron', size: 12 }), h('strong', null, '组件总览')), h('div', { className: 'top-actions' }, h('a', { href: 'https://github.com/dravenlove/arena-ui', target: '_blank', rel: 'noreferrer' }, 'GitHub', h(Icon, { name: 'external', size: 13 })), h('span', { className: 'top-divider' }), h('span', { className: 'top-version' }, 'v2.0'))),
        h('main', { id: 'main', tabIndex: -1 },
          h('section', { className: 'intro' }, h('div', { className: 'eyebrow' }, h('span'), 'BUILT FOR THE NEXT BATTLE'), h('h1', null, '为游戏而生，', h('em', null, '为体验而战。')), h('p', null, '从第一枚按钮，到整个竞技场。', h('br'), '一套风格统一、开箱即用的深色游戏界面组件。'), h('div', { className: 'intro-actions' }, h('a', { className: 'au-btn au-btn-primary', href: '#library' }, '探索组件', h(Icon, { name: 'arrow', size: 16 })), h('a', { className: 'doc-link', href: 'https://github.com/dravenlove/arena-ui#使用方法', target: '_blank', rel: 'noreferrer' }, h(Icon, { name: 'book', size: 16 }), '快速开始')), h('div', { className: 'intro-meta' }, h('span', null, h(Icon, { name: 'check', size: 12 }), '9 个可组合组件'), h('span', null, h(Icon, { name: 'check', size: 12 }), '专为深色场景'), h('span', null, h(Icon, { name: 'check', size: 12 }), '键盘友好'))),
          h('section', { className: 'campaign', 'aria-label': '场景预览' }, h('div', { className: 'campaign-copy' }, h('span', { className: 'campaign-eyebrow' }, 'THE ARENA AWAITS'), h('h2', null, '下一场传奇，由你开启。'), h('p', null, '让界面退后，让你的世界站上前台。'), h('button', { className: 'campaign-link', onClick: function () { setDialog(true); } }, '进入竞技场', h(Icon, { name: 'arrow', size: 16 }))), h('span', { className: 'campaign-corner' }, 'SCENE 01 / OBSIDIAN GATE')),
          h('section', { id: 'library', className: 'library' }, h('div', { className: 'section-heading' }, h('div', null, h('h2', null, '组件实验场', h('span', null, 'COMPONENTS')), h('p', null, '试一试，找到你的下一块界面拼图。')), h('span', { className: 'live-label' }, h('i'), '实时交互')),
            h('div', { className: 'library-toolbar' }, h(A.Tabs, { label: '组件分类', value: category, onChange: setCategory, items: [{ id: 'all', label: '全部组件' }, { id: 'base', label: '基础组件' }, { id: 'battle', label: '战斗组件' }, { id: 'feedback', label: '反馈组件' }] }), h('label', { className: 'search' }, h(Icon, { name: 'search', size: 16 }), h('input', { type: 'search', placeholder: '搜索组件…', 'aria-label': '搜索组件', value: query, onChange: function (event) { setQuery(event.target.value); } }), h('span', null, '⌕'))),
            h('div', { className: 'component-grid' }, cards.length ? cards : h('div', { className: 'empty-results' }, '没有找到匹配的组件。', h('button', { className: 'text-button', onClick: function () { setQuery(''); setCategory('all'); } }, '重置筛选')))),
          h('section', { id: 'foundations', className: 'foundations' }, h('div', { className: 'section-heading' }, h('div', null, h('h2', null, '用同一种设计语言', h('span', null, 'FOUNDATIONS')), h('p', null, '颜色有意义，细节有秩序。'))), h('div', { className: 'foundation-grid' }, h('div', { className: 'palette' }, [['gold', '行动 / 奖励', '#F2B632'], ['cyan', '选中 / 能量', '#3EC7E0'], ['red', '生命 / 危险', '#EF5B60'], ['green', '治疗 / 增益', '#46C97A'], ['violet', '史诗品质', '#B48CF2']].map(function (color) { return h('button', { key: color[0], className: 'color-token', 'aria-label': '复制颜色 ' + color[0], onClick: function () { copy(color[2]); } }, h('i', { style: { background: 'var(--' + color[0] + ')' } }), h('strong', null, color[1]), h('small', null, color[2])); })), h('div', { className: 'type-specimen' }, h('span', { className: 'eyebrow' }, 'TYPE & SPACE'), h('div', null, 'Aa', h('span', null, '胜利')), h('p', null, '清晰文字 · 稳定数字 · 4px 间距网格'), h('code', null, '1,280  /  +24.5%')))),
          h('section', { id: 'assets', className: 'asset-section' }, h('div', { className: 'section-heading' }, h('div', null, h('h2', null, '从视觉灵感，到真实界面', h('span', null, 'VISUAL ASSETS')), h('p', null, 'ChatGPT 生成的成套素材，与组件一起交付。')), h('a', { className: 'doc-link', href: './history.html' }, '每日档案', h(Icon, { name: 'arrow', size: 16 }))), h('div', { className: 'asset-grid' }, h('a', { className: 'board-preview', href: asset + 'ui-kit-board.png', target: '_blank', rel: 'noreferrer' }, h('img', { src: asset + 'ui-kit-board.png', alt: 'Arena UI 深色金属风组件视觉参考板：按钮、角色、背包与弹窗', loading: 'lazy' }), h('div', null, h('span', null, '组件视觉参考'), h(Icon, { name: 'external', size: 16 }))), h('div', { className: 'asset-downloads' }, h('h3', null, '为你的世界准备就绪。'), h('p', null, '战役场景、装备图集、角色头像。保留原图与完整提示词，方便继续扩展。'), [['equipment-atlas.png', '8 件装备 · 道具图集'], ['campaign-wide.png', '黑曜石之门 · 场景'], ['sentinel-portrait.png', '暗影游侠 · 头像']].map(function (file) { return h('a', { key: file[0], href: asset + file[0], download: file[0] }, file[1], h(Icon, { name: 'download', size: 16 })); })))),
          h(ExpansionPack),
          h('footer', { className: 'page-footer' }, h('span', null, 'ARENA UI', h('small', null, '构建界面，创造世界。')), h('span', null, '深色优先 · React 18 · v2.0.0')))),
      h(A.Dialog, { open: dialog, onClose: function () { setDialog(false); }, title: '准备好进入竞技场？', actions: h(React.Fragment, null, h(A.Button, { variant: 'secondary', onClick: function () { setDialog(false); } }, '再准备一下'), h(A.Button, { icon: h(Icon, { name: 'sword' }), onClick: function () { setDialog(false); notify('队伍已就绪，出战成功'); } }, '确认出战')) }, h('img', { className: 'dialog-scene', src: asset + 'campaign-wide.png', alt: '通向竞技场的青色传送门' }), h('p', null, '黑曜石之门已经开启。带上你的装备，与暗影游侠一起开启新的征途。'), h('div', { className: 'battle-summary' }, h(A.Badge, { tone: 'gold' }, '推荐等级 25'), h('span', null, '消耗体力 ', h('strong', null, '10')))),
      h('div', { className: 'toast ' + (toast ? 'is-visible' : ''), role: 'status', 'aria-live': 'polite', 'data-testid': 'toast' }, toast && h(Icon, { name: 'check', size: 16 }), toast));
  }
  ReactDOM.createRoot(document.getElementById('app')).render(h(App));
})();
