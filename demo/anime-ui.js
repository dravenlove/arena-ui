(function () {
  'use strict';
  var collection = document.getElementById('collection');
  var filters = document.getElementById('category-filters');
  var summary = document.getElementById('collection-summary');
  var error = document.getElementById('load-error');
  var retry = document.getElementById('retry');
  var labels = document.getElementById('labels');
  var overlays = { 'buttons-1': '开始冒险', 'buttons-2': '开始冒险', 'buttons-3': '查看详情', 'buttons-4': '暂未解锁', 'buttons-5': '角色', 'buttons-6': '装备', 'progression-7': '12,800', 'progression-8': '防御 90' };
  function node(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function localAsset(path) {
    if (typeof path !== 'string' || !/^assets\/[a-zA-Z0-9_./-]+$/.test(path) || path.split('/').some(function (p) { return !p || p === '.' || p === '..'; })) throw new Error('素材路径无效');
    return new URL('../' + path, window.location.href).href;
  }
  function selectCategory(id) {
    filters.querySelectorAll('button').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.category === id)); });
    collection.querySelectorAll('.sheet').forEach(function (sheet) { sheet.hidden = id !== 'all' && sheet.dataset.category !== id; });
  }
  function filter(id, label) {
    var button = node('button', '', label); button.type = 'button'; button.dataset.category = id; button.setAttribute('aria-pressed', String(id === 'all'));
    button.addEventListener('click', function () { selectCategory(id); }); filters.append(button);
  }
  function imageFailure(img) {
    img.addEventListener('error', function () { img.hidden = true; var message = node('span', 'image-error', '图片暂不可用，请下载原图重试。'); img.parentNode.append(message); }, { once: true });
  }
  function sheetView(sheet) {
    var section = node('section', 'sheet'); section.dataset.category = sheet.id; section.setAttribute('aria-labelledby', 'sheet-' + sheet.id);
    var header = node('div', 'sheet-header'), heading = node('div'), title = node('h2', '', sheet.label); title.id = 'sheet-' + sheet.id;
    heading.append(title, node('p', 'sheet-description', sheet.note), node('span', 'sheet-meta', sheet.items.length + ' 个设计项 · ' + sheet.size.join(' × ') + ' px · 透明 PNG'));
    var links = node('div', 'downloads'), download = node('a', '', '下载完整图集 ↓'), open = node('a', '', '查看原图 ↗');
    download.href = open.href = localAsset(sheet.path); download.download = sheet.path.split('/').pop(); open.target = '_blank'; open.rel = 'noreferrer'; links.append(download, open); header.append(heading, links);
    var grid = node('div', 'items');
    sheet.items.forEach(function (item) {
      var card = node('figure', 'ui-item'); card.dataset.item = item.id;
      var stage = node('div', 'item-stage'), windowEl = node('div', 'sprite-window');
      windowEl.style.setProperty('--ratio', item.rect.width + ' / ' + item.rect.height);
      // 仅在浏览器按已核对的坐标显示原图，不修改或重采样磁盘 PNG。
      var img = node('img', 'sprite-image'); img.src = localAsset(sheet.path); img.alt = item.label; img.loading = 'lazy'; img.decoding = 'async';
      img.style.width = sheet.size[0] / item.rect.width * 100 + '%'; img.style.height = sheet.size[1] / item.rect.height * 100 + '%'; img.style.left = -item.rect.x / item.rect.width * 100 + '%'; img.style.top = -item.rect.y / item.rect.height * 100 + '%'; imageFailure(img); windowEl.append(img);
      if (overlays[item.id]) { var label = node('span', 'item-label', overlays[item.id]); label.hidden = !labels.checked; windowEl.append(label); }
      stage.append(windowEl); var caption = node('figcaption', '', item.label); caption.append(node('small', '', '第 ' + (item.index + 1) + ' 格 · ' + item.rect.width + ' × ' + item.rect.height)); card.append(stage, caption); grid.append(card);
    });
    var details = node('details', 'raw-sheet'); details.append(node('summary', '', '展开完整图集')); var original = node('img'); original.src = localAsset(sheet.path); original.alt = sheet.label + '完整图集'; original.loading = 'lazy'; imageFailure(original); details.append(original); section.append(header, grid, details); return section;
  }
  function validate(data) {
    if (!data || data.schemaVersion !== 1 || data.styleId !== 'anime-fantasy' || !Array.isArray(data.sheets) || !data.sheets.length) throw new Error('素材清单格式无效');
    var ids = new Set(), count = 0;
    data.sheets.forEach(function (sheet) {
      if (!/^[a-z][a-z0-9-]*$/.test(sheet.id) || ids.has(sheet.id) || !Array.isArray(sheet.items) || !Array.isArray(sheet.size) || sheet.size.length !== 2 || !sheet.size.every(function (v) { return Number.isInteger(v) && v > 0; })) throw new Error('图集信息无效');
      ids.add(sheet.id); localAsset(sheet.path);
      sheet.items.forEach(function (item) {
        var r = item.rect;
        if (!r || ![r.x, r.y, r.width, r.height].every(Number.isInteger) || r.x < 0 || r.y < 0 || r.width <= 0 || r.height <= 0 || r.x + r.width > sheet.size[0] || r.y + r.height > sheet.size[1]) throw new Error('图集坐标超出边界');
        count++;
      });
    });
    if (count !== data.itemCount) throw new Error('设计项数量不匹配');
    localAsset(data.manifest);
  }
  async function load() {
    error.hidden = retry.hidden = true; summary.textContent = '正在读取素材…'; collection.replaceChildren(); filters.replaceChildren();
    try {
      var response = await fetch('../assets/anime-ui.json'); if (!response.ok) throw new Error('读取失败'); var data = await response.json(); validate(data);
      filter('all', '全部 ' + data.itemCount);
      data.sheets.forEach(function (sheet) { filter(sheet.id, sheet.label + ' ' + sheet.items.length); collection.append(sheetView(sheet)); });
      summary.textContent = data.date + ' · 二次元奇幻 · ' + data.sheets.length + ' 张图集 · ' + data.itemCount + ' 个设计项';
      var manifest = document.getElementById('manifest-link'); manifest.href = localAsset(data.manifest); manifest.hidden = false;
    } catch (e) { collection.replaceChildren(); filters.replaceChildren(); error.textContent = '素材暂时无法读取，请重新加载。'; error.hidden = retry.hidden = false; summary.textContent = '加载未完成'; }
  }
  document.getElementById('backdrop').addEventListener('change', function (event) { collection.dataset.backdrop = event.target.value; });
  labels.addEventListener('change', function () { collection.querySelectorAll('.item-label').forEach(function (el) { el.hidden = !labels.checked; }); });
  retry.addEventListener('click', load); load();
}());
