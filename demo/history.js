(function () {
  'use strict';
  var state = { runs: [], dates: [], categories: [], assetCategories: {}, styles: [], runStyles: {}, style: 'all', category: 'all', group: 'all', date: 'all', left: '', right: '', benchmark: '' };
  var ui = {
    date: document.getElementById('archive-date'), summary: document.getElementById('archive-summary'),
    status: document.getElementById('history-status'), results: document.getElementById('archive-results'),
    retry: document.getElementById('reload-history'), left: document.getElementById('comparison-left'),
    right: document.getElementById('comparison-right'), benchmark: document.getElementById('comparison-benchmark'),
    comparisonState: document.getElementById('comparison-state'), comparisonResults: document.getElementById('comparison-results'),
    categories: document.getElementById('category-filters'), categoryNotice: document.getElementById('category-notice'),
    reset: document.getElementById('reset-filters'), styles: document.getElementById('style-filters'), styleNotice: document.getElementById('style-notice')
  };

  // 所有归档文本均通过 textContent 展示，提示词不会作为 HTML 执行。
  function node(tag, className, text) {
    var result = document.createElement(tag);
    if (className) result.className = className;
    if (text !== undefined) result.textContent = String(text);
    return result;
  }
  function text(value, fallback) { return typeof value === 'string' && value ? value : (fallback || '未记录'); }
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    var date = new Date(value + 'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  // 只允许 assets/ 下的仓库相对文件；拒绝远程 URL、编码绕过、查询参数与路径穿越。
  function assetURL(path) {
    if (typeof path !== 'string' || !path.startsWith('assets/') || /[\\\u0000-\u001f\u007f?#:%]/.test(path)) return null;
    var parts = path.split('/');
    if (parts.some(function (part) { return !part || part === '.' || part === '..'; })) return null;
    var base = new URL('../assets/', window.location.href), url = new URL('../' + path, window.location.href);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return null;
    return url.href;
  }
  function runTime(run) {
    if (typeof run.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(run.time)) return run.time + ' · 上海时间';
    if (typeof run.time === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(run.time)) {
      var parsed = new Date(run.time);
      if (Number.isFinite(parsed.getTime())) return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(parsed) + ' · 上海时间';
    }
    return run.kind === 'initial-session' ? '本次手动生成 · 时间未记录' : '时间未记录';
  }
  function groupName(group) { return group === 'benchmark' ? '固定对照' : '素材扩展'; }
  // 风格按素材显式记录、整批记录、历史映射依次解析，未知值绝不猜成旧风格。
  function styleFor(run, asset) {
    var id = Object.prototype.hasOwnProperty.call(asset, 'styleId') ? asset.styleId : Object.prototype.hasOwnProperty.call(run, 'styleId') ? run.styleId : Object.prototype.hasOwnProperty.call(state.runStyles, run.id) ? state.runStyles[run.id] : null;
    return state.styles.some(function (style) { return style.id === id; }) ? id : 'unclassified-style';
  }
  function styleName(id) {
    var style = state.styles.find(function (item) { return item.id === id; });
    return id === 'all' ? '全部风格' : style ? style.label : '风格待确认';
  }
  function updateStyleURL() {
    var url = new URL(window.location.href);
    if (state.style === 'all') url.searchParams.delete('style'); else url.searchParams.set('style', state.style);
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  function prepareStyles(catalog) {
    state.styles = []; state.runStyles = {};
    var valid = catalog && catalog.schemaVersion === 1 && Array.isArray(catalog.styles) && catalog.runStyles && typeof catalog.runStyles === 'object' && !Array.isArray(catalog.runStyles);
    if (valid) {
      catalog.styles.forEach(function (style) {
        if (style && typeof style.id === 'string' && /^[a-z][a-z0-9-]*$/.test(style.id) && !['all', 'unclassified-style'].includes(style.id) && typeof style.label === 'string' && style.label && !state.styles.some(function (item) { return item.id === style.id; })) state.styles.push(style);
      });
      state.runStyles = catalog.runStyles;
    }
    state.style = new URL(window.location.href).searchParams.get('style') || 'all';
    var knownSelection = state.style === 'all' || state.style === 'unclassified-style' || state.styles.some(function (style) { return style.id === state.style; });
    ui.styleNotice.hidden = state.styles.length > 0 && knownSelection;
    ui.styleNotice.textContent = !state.styles.length ? '风格目录暂不可用，素材单列为“风格待确认”，不会自动归入旧风格。' : '指定风格尚未登记，请选择已登记的风格或重置筛选。';
    var filters = [{ id: 'all', label: '全部风格', description: '按风格分区浏览，保留各自标签' }].concat(state.styles);
    if (state.runs.some(function (run) { return !run.assets.length ? styleFor(run, {}) === 'unclassified-style' : run.assets.some(function (asset) { return styleFor(run, asset) === 'unclassified-style'; }); })) filters.push({ id: 'unclassified-style', label: '风格待确认', description: '缺少或无法核实风格记录的素材' });
    ui.styles.replaceChildren();
    filters.forEach(function (style) {
      var button = node('button', 'style-filter'); button.type = 'button'; button.dataset.style = style.id;
      button.append(node('strong', '', style.label), node('span', 'style-count', '0'), node('small', '', typeof style.description === 'string' ? style.description : ''));
      button.addEventListener('click', function () { state.style = style.id; updateStyleURL(); ui.styleNotice.hidden = state.styles.length > 0; renderArchive(); });
      ui.styles.append(button);
    });
  }
  function renderStyleCounts() {
    var counts = { all: 0 };
    state.runs.forEach(function (run) { run.assets.forEach(function (asset) {
      if (!baseScope(run, asset) || (state.category !== 'all' && categoryFor(asset) !== state.category)) return;
      var id = styleFor(run, asset); counts[id] = (counts[id] || 0) + 1; counts.all++;
    }); });
    ui.styles.querySelectorAll('[data-style]').forEach(function (button) {
      var id = button.dataset.style, count = counts[id] || 0;
      button.querySelector('.style-count').textContent = count + ' 张';
      button.setAttribute('aria-label', styleName(id) + '，' + count + ' 张');
      button.setAttribute('aria-pressed', String(id === state.style));
    });
  }
  // 用途分类独立于实验分组；未登记的新素材始终能在“待分类”中找到。
  function categoryFor(asset) {
    var id = typeof asset.id === 'string' && Object.prototype.hasOwnProperty.call(state.assetCategories, asset.id) ? state.assetCategories[asset.id] : null;
    return state.categories.some(function (category) { return category.id === id; }) ? id : 'uncategorized';
  }
  function categoryName(id) {
    var category = state.categories.find(function (item) { return item.id === id; });
    return id === 'all' ? '全部素材' : category ? category.label : '待分类';
  }
  function baseScope(run, asset) {
    return (state.date === 'all' || run.date === state.date) && (state.group === 'all' || asset.group === state.group);
  }
  function inScope(run, asset) { return baseScope(run, asset) && (state.style === 'all' || styleFor(run, asset) === state.style); }
  function prepareCategories(catalog) {
    state.categories = []; state.assetCategories = {}; state.category = 'all';
    var valid = catalog && catalog.schemaVersion === 1 && Array.isArray(catalog.categories) && catalog.assetCategories && typeof catalog.assetCategories === 'object' && !Array.isArray(catalog.assetCategories);
    if (valid) {
      catalog.categories.forEach(function (category) {
        if (category && typeof category.id === 'string' && /^[a-z][a-z0-9-]*$/.test(category.id) && !['all', 'uncategorized'].includes(category.id) && typeof category.label === 'string' && category.label && !state.categories.some(function (item) { return item.id === category.id; })) state.categories.push(category);
      });
      state.assetCategories = catalog.assetCategories;
    }
    ui.categoryNotice.hidden = state.categories.length > 0;
    ui.categoryNotice.textContent = state.categories.length ? '' : '用途分类暂不可用，素材仍可按日期浏览，暂列为“待分类”。';
    var filters = [{ id: 'all', label: '全部素材' }].concat(state.categories);
    if (state.runs.some(function (run) { return run.assets.some(function (asset) { return categoryFor(asset) === 'uncategorized'; }); })) filters.push({ id: 'uncategorized', label: '待分类' });
    ui.categories.replaceChildren();
    filters.forEach(function (category) {
      var button = node('button', 'category-filter'); button.type = 'button'; button.dataset.category = category.id;
      button.setAttribute('aria-pressed', String(category.id === state.category));
      if (typeof category.description === 'string') button.title = category.description;
      button.append(node('span', '', category.label), node('span', 'category-count', '0'));
      button.addEventListener('click', function () { state.category = category.id; renderArchive(); });
      ui.categories.append(button);
    });
  }
  function renderCategoryCounts() {
    var counts = { all: 0 };
    state.runs.forEach(function (run) { run.assets.forEach(function (asset) {
      if (!inScope(run, asset)) return;
      var id = categoryFor(asset); counts[id] = (counts[id] || 0) + 1; counts.all++;
    }); });
    ui.categories.querySelectorAll('[data-category]').forEach(function (button) {
      var id = button.dataset.category, count = counts[id] || 0;
      button.querySelector('.category-count').textContent = count;
      button.setAttribute('aria-label', categoryName(id) + '，' + count + ' 张');
      button.setAttribute('aria-pressed', String(id === state.category));
    });
    ui.reset.disabled = !state.dates.length || (state.date === 'all' && state.group === 'all' && state.category === 'all' && state.style === 'all');
  }
  function statusName(status) { return status === 'complete' ? '已完成' : status === 'partial' ? '部分完成' : status === 'failed' ? '生成失败' : '状态未记录'; }
  function sizeText(asset) {
    return Array.isArray(asset.size) && asset.size.length === 2 && asset.size.every(function (n) { return Number.isFinite(n) && n > 0; }) ? asset.size.join(' × ') + ' px' : '尺寸未记录';
  }
  function bytesText(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return '大小未记录';
    return bytes >= 1048576 ? (bytes / 1048576).toFixed(2) + ' MB' : Math.round(bytes / 1024) + ' KB';
  }
  function setOptions(select, options, value, placeholder) {
    select.replaceChildren();
    if (placeholder !== undefined) {
      var empty = node('option', '', placeholder); empty.value = ''; select.append(empty);
    }
    options.forEach(function (item) {
      var option = node('option', '', item.label); option.value = item.value; select.append(option);
    });
    select.value = value;
    select.disabled = options.length === 0;
  }
  function dateOptions() { return state.dates.map(function (date) { return { value: date, label: date }; }); }
  function metadataLine(list, title, value, isCode) {
    var row = node('div', 'record-row'); row.append(node('dt', '', title), node('dd', isCode ? 'record-code' : '', value)); list.append(row);
  }
  function detailsFor(asset, run) {
    var details = node('details', 'asset-details'); details.append(node('summary', '', '查看提示词与记录'));
    var body = node('div', 'asset-details-body'), list = node('dl', 'record-list');
    metadataLine(list, '生成记录', text(run.id), true);
    metadataLine(list, '生成时间', run.date + ' · ' + runTime(run));
    metadataLine(list, '素材用途', categoryName(categoryFor(asset)));
    metadataLine(list, '视觉风格', styleName(styleFor(run, asset)));
    metadataLine(list, '固定题目', text(asset.benchmarkId, '非固定对照素材'), true);
    metadataLine(list, '提示词版本', text(asset.promptVersion), true);
    metadataLine(list, '提示词 SHA-256', text(asset.promptSha256), true);
    metadataLine(list, '文件 SHA-256', text(asset.sha256), true);
    metadataLine(list, '模型版本', !asset.model || asset.model === 'unreported' ? '运行时未返回，无法核实版本' : asset.model);
    metadataLine(list, '文件信息', sizeText(asset) + ' · ' + bytesText(asset.bytes));
    metadataLine(list, '背景', asset.transparentBackground === true ? '透明背景' : '非透明背景');
    body.append(list, node('h4', '', '实际提示词'), node('pre', 'asset-prompt', text(asset.prompt, '这条记录未保存提示词。')));
    details.append(body); return details;
  }
  function imageFor(asset, url) {
    var image = node('img', 'asset-image'); image.src = url; image.alt = text(asset.label, text(asset.id, '生成素材')); image.loading = 'lazy';
    if (Array.isArray(asset.size) && asset.size.length === 2 && asset.size.every(function (n) { return Number.isInteger(n) && n > 0; })) { image.width = asset.size[0]; image.height = asset.size[1]; }
    image.addEventListener('error', function () {
      var warning = node('span', 'asset-image-error', '原图暂时无法加载，请检查对应归档文件。');
      image.replaceWith(warning);
    });
    return image;
  }
  function downloadFor(asset, url) {
    var link = node('a', 'asset-download', '下载原图 ↓'); link.href = url; link.download = asset.path.split('/').pop(); return link;
  }
  function assetCard(asset, run, comparison) {
    var card = node('article', comparison ? 'comparison-card' : 'archive-card');
    card.dataset.testid = comparison ? 'comparison-asset' : 'archive-asset';
    card.dataset.group = asset.group; card.dataset.assetId = text(asset.id, 'unknown'); card.dataset.category = categoryFor(asset);
    card.dataset.style = styleFor(run, asset);
    var url = assetURL(asset.path), frame = node('div', 'asset-image-frame' + (asset.transparentBackground ? ' is-transparent' : ''));
    if (url) {
      var link = node('a', 'asset-original'); link.href = url; link.target = '_blank'; link.rel = 'noreferrer';
      link.setAttribute('aria-label', '查看原图：' + text(asset.label, asset.id)); link.append(imageFor(asset, url)); frame.append(link);
    } else frame.append(node('p', 'asset-image-error', '文件路径无效，已隐藏链接与预览。'));
    var content = node('div', 'asset-content'), top = node('div', 'asset-card-top');
    top.append(node('span', 'asset-group ' + (asset.group === 'benchmark' ? 'is-benchmark' : ''), groupName(asset.group)), node('span', 'asset-size', sizeText(asset)));
    content.append(top, node('p', 'asset-style', styleName(styleFor(run, asset))), node('p', 'asset-category', categoryName(categoryFor(asset))), node('h3', '', text(asset.label, asset.id)));
    if (comparison) content.append(node('p', 'asset-comparison-date', run.date + ' · ' + runTime(run)));
    var footer = node('div', 'asset-card-footer'); footer.append(node('span', '', bytesText(asset.bytes)));
    if (url) footer.append(downloadFor(asset, url));
    content.append(footer, detailsFor(asset, run)); card.append(frame, content); return card;
  }
  function renderArchive() {
    ui.results.replaceChildren(); renderCategoryCounts(); renderStyleCounts();
    if (!state.dates.length) {
      ui.status.textContent = '尚无生成记录。每日生成完成后，素材会按日期出现在这里。'; return;
    }
    var runs = state.runs.filter(function (run) { return state.date === 'all' || run.date === state.date; });
    var shown = 0, styles = state.styles.map(function (style) { return style.id; }).concat('unclassified-style');
    styles.forEach(function (styleId) {
      if (state.style !== 'all' && state.style !== styleId) return;
      var collection = node('section', 'style-collection'); collection.dataset.style = styleId;
      collection.setAttribute('aria-label', styleName(styleId) + '素材分区');
      collection.append(node('h3', 'style-collection-title', styleName(styleId)));
      var sections = 0;
      runs.forEach(function (run) {
        var assets = run.assets.filter(function (asset) { return inScope(run, asset) && styleFor(run, asset) === styleId && (state.category === 'all' || categoryFor(asset) === state.category); });
        if (!assets.length && (run.assets.length || state.group !== 'all' || state.category !== 'all' || styleFor(run, {}) !== styleId)) return;
        var section = node('section', 'archive-run'), heading = node('div', 'archive-run-heading');
        heading.append(node('h4', '', (state.date === 'all' ? run.date + ' · ' : '') + runTime(run)), node('span', 'run-status is-' + run.status, statusName(run.status)));
        section.append(heading);
        if (assets.length) {
          var grid = node('div', 'archive-grid'); assets.forEach(function (asset) { grid.append(assetCard(asset, run, false)); }); section.append(grid); shown += assets.length;
        } else section.append(node('p', 'archive-run-empty', run.status === 'failed' ? '本次生成失败，未产生可展示的素材。' : '本条记录暂未收录素材。'));
        collection.append(section); sections++;
      });
      if (sections) ui.results.append(collection);
    });
    ui.status.textContent = (state.date === 'all' ? '全部日期' : state.date) + ' · ' + shown + ' 张素材' + ' · ' + styleName(state.style) + (state.category === 'all' ? '' : ' · ' + categoryName(state.category)) + (state.group === 'all' ? '' : ' · ' + groupName(state.group));
    if (!shown && (state.group !== 'all' || state.category !== 'all' || state.style !== 'all')) ui.results.append(node('div', 'history-empty', '当前筛选暂无素材。可选择全部日期、其他分类，或重置筛选。'));
  }
  function findBenchmark(date) {
    if (!date || !state.benchmark) return null;
    for (var i = 0; i < state.runs.length; i++) {
      var run = state.runs[i];
      if (run.date !== date) continue;
      var asset = run.assets.find(function (item) { return item.group === 'benchmark' && item.benchmarkId === state.benchmark; });
      if (asset) return { run: run, asset: asset };
    }
    return null;
  }
  function comparePlaceholder(title, message) {
    var empty = node('div', 'comparison-placeholder'); empty.append(node('span', '', title), node('p', '', message)); return empty;
  }
  function comparisonStatus(status, message) { ui.comparisonState.dataset.state = status; ui.comparisonState.textContent = message; }
  function renderComparison() {
    ui.comparisonResults.replaceChildren();
    var left = findBenchmark(state.left), right = findBenchmark(state.right);
    var sameRecord = left && right && (left.run.id === right.run.id || state.left === state.right);
    ui.comparisonResults.append(left ? assetCard(left.asset, left.run, true) : comparePlaceholder('左侧记录', '这个日期尚无该固定题目的生成记录。'));
    if (sameRecord) ui.comparisonResults.append(comparePlaceholder('同一份记录', '请选择另一个生成日期，保留一次实验对应一个结果。'));
    else ui.comparisonResults.append(right ? assetCard(right.asset, right.run, true) : comparePlaceholder('等待下一次记录', state.right ? '这个日期尚无该固定题目的生成记录。' : '更多日期生成后，将在这里展开新的对照。'));
    if (sameRecord) comparisonStatus('same-record', '左右是同一份生成记录，不能作为两次实验。');
    else if (state.dates.length < 2) comparisonStatus('waiting', state.dates.length ? '目前只有一个生成日期，需更多日期记录才能观察长期变化。' : '尚无固定对照记录，等待首次归档后再来查看。');
    else if (!left || !right) comparisonStatus('missing', '所选日期缺少该固定题目的记录，请更换日期或题目。');
    else if (styleFor(left.run, left.asset) === 'unclassified-style' || styleFor(right.run, right.asset) === 'unclassified-style') comparisonStatus('unknown-style', '风格记录尚未确认，不能作为同风格固定对照。');
    else if (styleFor(left.run, left.asset) !== styleFor(right.run, right.asset)) comparisonStatus('different-style', '两份素材风格不同，不能作为同风格固定对照。');
    else if (!/^[a-f0-9]{64}$/i.test(left.asset.promptSha256 || '') || !/^[a-f0-9]{64}$/i.test(right.asset.promptSha256 || '')) comparisonStatus('missing', '提示词摘要未完整记录，暂时无法确认是否为相同题目条件。');
    else if (left.asset.promptSha256 === right.asset.promptSha256 && left.asset.benchmarkId === right.asset.benchmarkId) comparisonStatus('matched', '提示词一致 · 可并排观察输出差异；随机性仍会影响每次结果。');
    else comparisonStatus('different', '提示词不同，不能直接对照输出变化。');
  }
  function prepare(data, catalog, styles) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.runs)) throw new Error('归档索引格式不受支持。');
    state.runs = data.runs.filter(function (run) { return run && validDate(run.date) && typeof run.id === 'string' && Array.isArray(run.assets); }).map(function (run) {
      return Object.assign({}, run, { status: ['complete', 'partial', 'failed'].includes(run.status) ? run.status : 'unknown', assets: run.assets.filter(function (asset) { return asset && typeof asset === 'object' && (asset.group === 'benchmark' || asset.group === 'library'); }) });
    });
    // 同一日期优先显示有明确时刻的较新记录；未知时刻不补造时间。
    state.runs.sort(function (a, b) { return b.date.localeCompare(a.date) || String(b.time || '').localeCompare(String(a.time || '')); });
    state.dates = Array.from(new Set(state.runs.map(function (run) { return run.date; }))).sort().reverse();
    state.date = 'all'; state.group = 'all';
    state.left = state.dates.length > 1 ? state.dates[1] : state.dates[0] || ''; state.right = state.dates.length > 1 ? state.dates[0] : '';
    prepareCategories(catalog);
    prepareStyles(styles);
    document.querySelectorAll('.archive-filters [data-group]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.group === state.group)); });
    var benchmarks = [];
    state.runs.forEach(function (run) { run.assets.forEach(function (asset) {
      if (asset.group === 'benchmark' && typeof asset.benchmarkId === 'string' && asset.benchmarkId && !benchmarks.some(function (item) { return item.value === asset.benchmarkId; })) benchmarks.push({ value: asset.benchmarkId, label: text(asset.label, asset.benchmarkId) });
    }); });
    state.benchmark = benchmarks.length ? benchmarks[0].value : '';
    setOptions(ui.date, state.dates.length ? [{ value: 'all', label: '全部日期' }].concat(dateOptions()) : [], state.date, state.dates.length ? undefined : '暂无日期');
    setOptions(ui.left, dateOptions(), state.left, state.dates.length ? undefined : '暂无日期');
    setOptions(ui.right, dateOptions(), state.right, state.dates.length > 1 ? '请选择日期' : '等待更多日期');
    setOptions(ui.benchmark, benchmarks, state.benchmark, benchmarks.length ? undefined : '暂无固定题目');
    var count = state.runs.reduce(function (sum, run) { return sum + run.assets.length; }, 0);
    ui.summary.textContent = state.dates.length + ' 个日期 · ' + state.runs.length + ' 次记录 · ' + count + ' 张素材';
    renderArchive(); renderComparison();
  }
  function load() {
    ui.status.textContent = '正在加载每日档案…'; ui.retry.hidden = true;
    var archive = fetch('../assets/daily/index.json', { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('读取归档失败：HTTP ' + response.status);
      return response.json();
    });
    var catalog = fetch('../assets/categories.json', { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('用途分类暂不可用');
      return response.json();
    }).catch(function () { return null; });
    var styles = fetch('../assets/styles.json', { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('风格目录暂不可用');
      return response.json();
    }).catch(function () { return null; });
    return Promise.all([archive, catalog, styles]).then(function (results) { prepare(results[0], results[1], results[2]); }).catch(function () {
      ui.summary.textContent = '归档暂不可用'; ui.status.textContent = '暂时无法加载每日档案。请检查归档索引是否可访问，并通过本地预览或 GitHub Pages 打开此页面。';
      ui.results.replaceChildren(); ui.comparisonResults.replaceChildren(); ui.retry.hidden = false;
      ui.categories.replaceChildren(); ui.reset.disabled = true; ui.categoryNotice.hidden = true;
      ui.styles.replaceChildren(); ui.styleNotice.hidden = true;
      [ui.date, ui.left, ui.right, ui.benchmark].forEach(function (select) { select.disabled = true; });
      comparisonStatus('waiting', '归档加载失败，暂时无法比较。');
    });
  }
  ui.date.addEventListener('change', function () { state.date = ui.date.value; renderArchive(); });
  ui.reset.addEventListener('click', function () {
    state.category = 'all'; state.group = 'all'; state.date = 'all'; state.style = 'all'; ui.date.value = 'all'; updateStyleURL(); ui.styleNotice.hidden = state.styles.length > 0;
    document.querySelectorAll('.archive-filters [data-group]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.group === 'all')); });
    renderArchive();
  });
  document.querySelectorAll('.archive-filters [data-group]').forEach(function (button) {
    button.addEventListener('click', function () {
      state.group = button.dataset.group;
      document.querySelectorAll('.archive-filters [data-group]').forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
      renderArchive();
    });
  });
  ui.left.addEventListener('change', function () { state.left = ui.left.value; renderComparison(); });
  ui.right.addEventListener('change', function () { state.right = ui.right.value; renderComparison(); });
  ui.benchmark.addEventListener('change', function () { state.benchmark = ui.benchmark.value; renderComparison(); });
  ui.retry.addEventListener('click', load);
  load();
})();
