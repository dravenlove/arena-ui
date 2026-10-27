(function () {
  'use strict';
  var CONFIG_PATH = 'assets/sprites/sunward-idle/animation.json';
  var MOTION_PATH = 'assets/sprites/sunward-idle/idle-motion.json';
  var ui = {
    player: document.getElementById('player'), status: document.getElementById('load-status'), retry: document.getElementById('retry'),
    title: document.getElementById('page-title'), description: document.getElementById('description'), stage: document.getElementById('stage'),
    canvas: document.getElementById('sprite-canvas'), sheet: document.getElementById('sprite-sheet'), playState: document.getElementById('play-state'),
    previous: document.getElementById('previous'), next: document.getElementById('next'), play: document.getElementById('toggle-play'),
    slider: document.getElementById('frame-slider'), output: document.getElementById('frame-output'), count: document.getElementById('frame-count'),
    frames: document.getElementById('frame-buttons'), speed: document.getElementById('play-speed'), loop: document.getElementById('loop-summary'), align: document.getElementById('align-feet'),
    png: document.getElementById('download-png'), json: document.getElementById('download-json'), reference: document.getElementById('reference-link'),
    review: document.getElementById('review-section'), reviewList: document.getElementById('review-list'), motionNote: document.getElementById('motion-note'),
    idleCanvas: document.getElementById('idle-canvas'), mode: document.getElementById('animation-mode'), modeNote: document.getElementById('mode-note'),
    continuousControls: document.getElementById('continuous-controls'), frameControls: document.getElementById('frame-controls'),
    phase: document.getElementById('phase-slider'), phaseOutput: document.getElementById('phase-output'), breathSpeed: document.getElementById('breath-speed')
  };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var state = { ready: false, playing: false, frame: 0, fps: 8, aligned: true, image: null, config: null, view: 'animation', lastTime: null, elapsed: 0, raf: null, request: 0,
    mode: 'continuous', phase: 0, breathSpeed: 1, motion: null, renderer: null, motionError: null };
  var context = ui.canvas.getContext('2d');

  // 配置中的资源只允许指向本仓库 assets/ 内，拒绝远程地址与路径穿越。
  function assetURL(path) {
    if (typeof path !== 'string' || !path.startsWith('assets/') || /[\\\u0000-\u001f\u007f?#:%]/.test(path)) throw new Error('素材路径无效。');
    if (path.split('/').some(function (part) { return !part || part === '.' || part === '..'; })) throw new Error('素材路径无效。');
    var base = new URL('../assets/', window.location.href), url = new URL('../' + path, window.location.href);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) throw new Error('素材路径无效。');
    return url.href;
  }
  function positiveInteger(n) { return Number.isInteger(n) && n > 0 && n <= 8192; }
  function validate(config) {
    if (!config || config.schemaVersion !== 1 || !Array.isArray(config.frames) || !config.frames.length || config.frames.length > 512) throw new Error('动作配置格式不受支持。');
    if (!Array.isArray(config.frameSize) || config.frameSize.length !== 2 || !config.frameSize.every(positiveInteger)) throw new Error('动作画布尺寸无效。');
    if (!Number.isFinite(config.fps) || config.fps < 1 || config.fps > 60) throw new Error('播放速度无效。');
    if (config.drawOffset !== undefined && (!Array.isArray(config.drawOffset) || config.drawOffset.length !== 2 || !config.drawOffset.every(function (n) { return Number.isInteger(n) && Math.abs(n) <= 8192; }))) throw new Error('显示位置无效。');
    config.frames.forEach(function (frame) {
      if (!frame || !Number.isInteger(frame.x) || !Number.isInteger(frame.y) || frame.x < 0 || frame.y < 0 || !positiveInteger(frame.w) || !positiveInteger(frame.h)) throw new Error('动作帧范围无效。');
      if (['dx', 'dy'].some(function (key) { return frame[key] !== undefined && (!Number.isInteger(frame[key]) || Math.abs(frame[key]) > 8192); })) throw new Error('动作帧对齐位置无效。');
    });
    assetURL(config.image);
    if (config.referenceImage) assetURL(config.referenceImage);
    return config;
  }
  function resetClock() { state.lastTime = null; state.elapsed = 0; }
  function validateMotion(config) {
    if (!config || config.schemaVersion !== 1 || !Array.isArray(config.canvasSize) || config.canvasSize.length !== 2 || !config.canvasSize.every(positiveInteger)) throw new Error('连续待机画布配置无效。');
    if (!Array.isArray(config.sourceSize) || config.sourceSize.length !== 2 || !config.sourceSize.every(positiveInteger)) throw new Error('连续待机原图尺寸配置无效。');
    if (!Number.isFinite(config.cycleSeconds) || config.cycleSeconds < 1 || config.cycleSeconds > 30) throw new Error('呼吸周期配置无效。');
    assetURL(config.image);
    return config;
  }
  function cancelFrame() { if (state.raf !== null) window.cancelAnimationFrame(state.raf); state.raf = null; }
  function schedule() {
    if (state.ready && state.playing && !document.hidden && state.view === 'animation' && state.raf === null) state.raf = window.requestAnimationFrame(tick);
  }
  function updatePlaybackUI() {
    ui.play.textContent = state.playing ? '暂停' : '播放';
    ui.play.setAttribute('aria-label', state.playing ? '暂停动画' : '播放动画');
    ui.playState.textContent = !state.ready ? '等待素材' : state.view === 'sheet' ? '原始 8 帧图集' : state.playing ? '循环播放中' : '已暂停';
    ui.playState.classList.toggle('is-playing', state.ready && state.playing && state.view === 'animation');
    ui.player.dataset.playing = String(state.playing);
  }
  function play(playing) {
    state.playing = Boolean(state.ready && playing); resetClock(); cancelFrame(); updatePlaybackUI(); schedule();
  }
  function draw() {
    if (!state.ready) return;
    if (state.mode === 'continuous') {
      state.renderer.draw(state.phase);
      ui.idleCanvas.dataset.phase = state.phase.toFixed(6);
      ui.phase.value = String(Math.round(state.phase * 1000));
      ui.phaseOutput.value = Math.round(state.phase * 100) + '%';
      ui.count.textContent = '单图连续待机';
      return;
    }
    var frame = state.config.frames[state.frame];
    context.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    // 原图等比例逐帧裁取；对齐只改变显示坐标，不缩放或修改每帧人物。
    var offset = state.config.drawOffset || [0, 0];
    var dx = offset[0] + (state.aligned ? frame.dx || 0 : 0), dy = offset[1] + (state.aligned ? frame.dy || 0 : 0);
    context.drawImage(state.image, frame.x, frame.y, frame.w, frame.h, dx, dy, frame.w, frame.h);
    ui.canvas.dataset.frame = String(state.frame);
    ui.canvas.dataset.aligned = String(state.aligned);
    ui.canvas.setAttribute('aria-label', (state.config.label || '角色待机动作') + '，第 ' + (state.frame + 1) + ' 帧，共 ' + state.config.frames.length + ' 帧');
    ui.slider.value = String(state.frame); ui.slider.setAttribute('aria-valuetext', '第 ' + (state.frame + 1) + ' 帧');
    ui.output.value = String(state.frame + 1); ui.count.textContent = String(state.frame + 1).padStart(2, '0') + ' / ' + String(state.config.frames.length).padStart(2, '0');
    ui.frames.querySelectorAll('button').forEach(function (button, index) { button.setAttribute('aria-pressed', String(index === state.frame)); });
  }
  function tick(time) {
    state.raf = null;
    if (!state.playing || document.hidden || state.view !== 'animation') { resetClock(); return; }
    if (state.lastTime !== null) {
      if (state.mode === 'continuous') {
        state.phase = (state.phase + (time - state.lastTime) * state.breathSpeed / (state.motion.cycleSeconds * 1000)) % 1;
        draw(); state.lastTime = time; schedule(); return;
      }
      state.elapsed += time - state.lastTime;
      var duration = 1000 / state.fps, steps = Math.floor(state.elapsed / duration);
      if (steps > 0) {
        state.elapsed -= steps * duration;
        if (state.config.loop === false && state.frame + steps >= state.config.frames.length - 1) {
          state.frame = state.config.frames.length - 1; draw(); play(false); return;
        }
        state.frame = (state.frame + steps) % state.config.frames.length; draw();
      }
    }
    state.lastTime = time; schedule();
  }
  function setView(view) {
    state.view = view;
    document.querySelectorAll('[data-view]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.view === view)); });
    ui.canvas.hidden = view !== 'animation' || state.mode !== 'frames';
    ui.idleCanvas.hidden = view !== 'animation' || state.mode !== 'continuous'; ui.sheet.hidden = view !== 'sheet';
    if (view === 'sheet') play(false);
    updatePlaybackUI();
  }
  function chooseFrame(frame) {
    if (!state.ready) return;
    play(false); setView('animation');
    state.frame = (frame + state.config.frames.length) % state.config.frames.length; draw();
  }
  function updateSpeedSummary() {
    if (!state.ready) return;
    ui.loop.textContent = state.mode === 'continuous'
      ? (state.motion.cycleSeconds / state.breathSpeed).toFixed(2) + ' 秒／次 · 连续呼吸'
      : state.fps + ' 帧／秒 · ' + (state.config.frames.length / state.fps).toFixed(2) + ' 秒' + (state.config.loop === false ? '' : '循环');
  }
  function setEnabled(enabled) {
    [ui.play, ui.previous, ui.next, ui.slider, ui.speed, ui.mode, ui.phase, ui.breathSpeed].forEach(function (control) { control.disabled = !enabled; });
    ui.align.disabled = !enabled || !state.config || !state.config.frames.some(function (frame) { return frame.dx || frame.dy; });
    document.querySelectorAll('button[data-view], button[data-background]').forEach(function (button) { button.disabled = !enabled; });
  }
  function makeFrames() {
    ui.frames.replaceChildren();
    state.config.frames.forEach(function (frame, index) {
      var button = document.createElement('button'); button.type = 'button'; button.textContent = String(index + 1).padStart(2, '0');
      button.setAttribute('aria-label', '查看第 ' + (index + 1) + ' 帧'); button.setAttribute('aria-pressed', String(index === 0));
      button.addEventListener('click', function () { chooseFrame(index); }); ui.frames.append(button);
    });
  }
  function setLink(link, path, download) {
    if (!path) { link.hidden = true; return; }
    link.href = assetURL(path); link.hidden = false;
    if (download) link.download = path.split('/').pop();
  }
  function updateModeUI() {
    var continuous = state.mode === 'continuous';
    var config = continuous ? state.motion : state.config;
    ui.player.dataset.mode = state.mode; ui.mode.value = state.mode;
    ui.frameControls.hidden = continuous; ui.continuousControls.hidden = !continuous;
    ui.previous.hidden = continuous; ui.next.hidden = continuous;
    ui.modeNote.textContent = continuous ? '一张立绘，连续呼吸。脸和装备沿用同一张图。' : '原始八帧逐张播放，可检查重绘造成的跳变。';
    ui.title.textContent = continuous ? '逐日剑士 · 连贯待机' : '逐日剑士 · 原始八帧';
    ui.description.textContent = continuous ? '同一张立绘做轻微呼吸，保持脚底稳定。切换到原始 8 帧可以比较差别。' : state.config.description;
    ui.png.textContent = continuous ? '下载原始立绘 PNG ↓' : '下载图集 PNG ↓';
    setLink(ui.png, config.image, true); setLink(ui.json, continuous ? MOTION_PATH : CONFIG_PATH, true);
    setLink(ui.reference, state.config.referenceImage, false);
    ui.reviewList.replaceChildren();
    (Array.isArray(config.review) ? config.review : []).filter(function (item) { return typeof item === 'string' && item; }).forEach(function (item) {
      var li = document.createElement('li'); li.textContent = item; ui.reviewList.append(li);
    });
    ui.review.hidden = !ui.reviewList.children.length;
    ui.status.dataset.state = 'ready';
    ui.status.textContent = state.motionError || (continuous ? '连贯待机已就绪 · 程序驱动，同一张原图。' : '原始 8 帧已就绪 · 可播放，也可逐帧查看。');
    setView('animation'); draw(); updateSpeedSummary();
  }
  function fetchConfig(path) {
    return fetch(assetURL(path), { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('动作配置尚未就绪，请稍后重新加载。'); return response.json();
    });
  }
  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var image = new Image(); image.onload = function () { resolve(image); }; image.onerror = function () { reject(new Error('图片读取失败，请检查图集文件。')); }; image.src = url;
    });
  }
  function load() {
    var request = ++state.request;
    play(false); state.ready = false; ui.player.dataset.ready = 'false'; setEnabled(false); ui.retry.hidden = true;
    ui.status.dataset.state = 'loading'; ui.status.textContent = '正在读取动作素材…';
    ui.review.hidden = true; ui.frames.replaceChildren(); [ui.png, ui.json, ui.reference].forEach(function (link) { link.hidden = true; });
    if (!context) { ui.status.dataset.state = 'error'; ui.status.textContent = '当前浏览器不支持画布，请使用支持 Canvas 的浏览器查看。'; return; }
    Promise.all([fetchConfig(CONFIG_PATH).then(validate), fetchConfig(MOTION_PATH).then(validateMotion)]).then(function (configs) {
      return Promise.all([loadImage(assetURL(configs[0].image)), loadImage(assetURL(configs[1].image))]).then(function (images) {
        return { config: configs[0], image: images[0], motion: configs[1], reference: images[1] };
      });
    }).then(function (data) {
      if (request !== state.request) return;
      data.config.frames.forEach(function (frame) {
        if (frame.x + frame.w > data.image.naturalWidth || frame.y + frame.h > data.image.naturalHeight) throw new Error('图集尺寸与动作帧范围不一致。');
      });
      if (data.reference.naturalWidth !== data.motion.sourceSize[0] || data.reference.naturalHeight !== data.motion.sourceSize[1]) throw new Error('连续待机原图尺寸与配置不一致。');
      if (state.renderer) state.renderer.dispose();
      state.renderer = null; state.motionError = null; state.motion = data.motion;
      try {
        state.renderer = window.ArenaIdleMotion.create(ui.idleCanvas, data.reference, data.motion);
      } catch (error) {
        state.mode = 'frames'; state.motionError = '连续待机暂不可用：' + error.message + ' 当前可查看原始 8 帧。';
      }
      ui.mode.querySelector('[value="continuous"]').disabled = !state.renderer;
      state.config = data.config; state.image = data.image; state.frame = 0; state.fps = data.config.fps; state.phase = 0; state.breathSpeed = 1; ui.breathSpeed.value = '1'; state.ready = true;
      state.aligned = data.config.alignmentDefault !== false; ui.align.checked = state.aligned;
      ui.player.dataset.ready = 'true'; ui.canvas.width = data.config.frameSize[0]; ui.canvas.height = data.config.frameSize[1];
      ui.sheet.src = data.image.src; ui.sheet.width = data.image.naturalWidth; ui.sheet.height = data.image.naturalHeight;
      ui.slider.max = String(data.config.frames.length - 1); ui.slider.value = '0';
      if (!Array.from(ui.speed.options).some(function (option) { return Number(option.value) === state.fps; })) {
        var option = document.createElement('option'); option.value = String(state.fps); option.textContent = '原速 · ' + state.fps + ' 帧／秒'; ui.speed.append(option);
      }
      ui.speed.value = String(state.fps);
      makeFrames(); setEnabled(true); updateModeUI();
      ui.motionNote.hidden = !reducedMotion.matches; play(!reducedMotion.matches);
    }).catch(function (error) {
      if (request !== state.request) return;
      play(false); state.ready = false; ui.player.dataset.ready = 'false'; setEnabled(false); updatePlaybackUI();
      ui.status.dataset.state = 'error'; ui.status.textContent = error instanceof SyntaxError ? '动作配置无法解析，请检查文件后重新加载。' : error.message;
      ui.retry.hidden = false;
    });
  }

  ui.play.addEventListener('click', function () { if (state.view !== 'animation') setView('animation'); if (state.mode === 'frames' && !state.playing && state.config.loop === false && state.frame === state.config.frames.length - 1) state.frame = 0; play(!state.playing); draw(); });
  ui.mode.addEventListener('change', function () {
    if (!state.ready || (ui.mode.value === 'continuous' && !state.renderer)) return;
    var wasPlaying = state.playing;
    play(false); state.mode = ui.mode.value; updateModeUI(); play(wasPlaying);
  });
  ui.phase.addEventListener('input', function () { if (!state.ready) return; play(false); setView('animation'); state.phase = Number(ui.phase.value) / 1000; draw(); });
  ui.breathSpeed.addEventListener('change', function () { state.breathSpeed = Number(ui.breathSpeed.value); resetClock(); updateSpeedSummary(); });
  ui.previous.addEventListener('click', function () { chooseFrame(state.frame - 1); });
  ui.next.addEventListener('click', function () { chooseFrame(state.frame + 1); });
  ui.slider.addEventListener('input', function () { chooseFrame(Number(ui.slider.value)); });
  ui.speed.addEventListener('change', function () { state.fps = Number(ui.speed.value); resetClock(); updateSpeedSummary(); });
  ui.align.addEventListener('change', function () { state.aligned = ui.align.checked; draw(); });
  document.querySelectorAll('button[data-view]').forEach(function (button) { button.addEventListener('click', function () { setView(button.dataset.view); }); });
  document.querySelectorAll('button[data-background]').forEach(function (button) {
    button.addEventListener('click', function () {
      ui.stage.dataset.background = button.dataset.background;
      document.querySelectorAll('button[data-background]').forEach(function (item) { item.setAttribute('aria-pressed', String(item === button)); });
    });
  });
  document.addEventListener('visibilitychange', function () { resetClock(); cancelFrame(); schedule(); });
  ui.idleCanvas.addEventListener('webglcontextlost', function (event) {
    event.preventDefault();
    if (!state.ready) return;
    play(false);
    if (state.renderer) state.renderer.dispose();
    state.renderer = null; state.mode = 'frames';
    state.motionError = '连续待机的绘图连接暂时中断，当前可查看原始 8 帧。';
    ui.mode.querySelector('[value="continuous"]').disabled = true;
    updateModeUI();
  });
  ui.idleCanvas.addEventListener('webglcontextrestored', function () { ui.retry.hidden = false; });
  reducedMotion.addEventListener('change', function (event) { ui.motionNote.hidden = !event.matches; if (event.matches) play(false); });
  ui.retry.addEventListener('click', load);
  load();
})();
