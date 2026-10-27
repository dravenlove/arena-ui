(function (global) {
  'use strict';

  function finite(value, label) {
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(label + ' 必须是有限数字。');
    return value;
  }
  function pair(value, label, positive) {
    if (!Array.isArray(value) || value.length !== 2 || !value.every(function (n) { return typeof n === 'number' && Number.isFinite(n) && (!positive || n > 0); })) throw new Error(label + ' 格式无效。');
    return value;
  }
  function smoothstep(start, end, value) {
    var t = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return t * t * (3 - 2 * t);
  }
  function distanceToSegment(x, y, ax, ay, bx, by) {
    var vx = bx - ax, vy = by - ay, length = vx * vx + vy * vy;
    var amount = length ? Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / length)) : 0;
    return Math.hypot(x - ax - amount * vx, y - ay - amount * vy);
  }
  function validate(config, image) {
    if (!config || config.schemaVersion !== 1 || config.mode !== 'procedural') throw new Error('连续动作配置格式不受支持。');
    pair(config.sourceSize, '原图尺寸', true); pair(config.canvasSize, '画布尺寸', true);
    if (!config.sourceSize.concat(config.canvasSize).every(function (n) { return Number.isInteger(n) && n <= 8192; })) throw new Error('图像尺寸超出支持范围。');
    if (image.naturalWidth !== config.sourceSize[0] || image.naturalHeight !== config.sourceSize[1]) throw new Error('人物原图尺寸与连续动作配置不一致。');
    if (config.canvasSize[0] / config.canvasSize[1] !== config.sourceSize[0] / config.sourceSize[1]) throw new Error('连续动作画布需保持原图比例。');
    if (!config.mesh || !['columns', 'rows'].every(function (key) { return Number.isInteger(config.mesh[key]) && config.mesh[key] >= 2 && config.mesh[key] <= 180; })) throw new Error('动作网格密度无效。');
    var motion = config.motion;
    if (!motion) throw new Error('缺少连续动作参数。');
    ['centerX', 'headEndY', 'neckEndY', 'anchorStartY', 'anchorEndY', 'chestLiftPixels', 'headLiftPixels', 'chestExpandPixels'].forEach(function (key) { finite(motion[key], key); });
    if (!(0 <= motion.headEndY && motion.headEndY < motion.neckEndY && motion.neckEndY <= motion.anchorStartY && motion.anchorStartY < motion.anchorEndY && motion.anchorEndY <= 1)) throw new Error('身体区域范围无效。');
    if (motion.centerX < 0 || motion.centerX > 1 || [motion.chestLiftPixels, motion.headLiftPixels, motion.chestExpandPixels].some(function (n) { return n < 0 || n > 32; })) throw new Error('呼吸幅度超出支持范围。');
    pair(motion.chestCenter, '胸部位置', false); pair(motion.chestSpread, '胸部范围', true);
    if (config.rigidRegions !== undefined && (!Array.isArray(config.rigidRegions) || config.rigidRegions.length > 16)) throw new Error('固定区域配置无效。');
    (config.rigidRegions || []).forEach(function (region) {
      if (!region || region.type !== 'capsule') throw new Error('固定区域类型不受支持。');
      pair(region.start, '固定区域起点', false); pair(region.end, '固定区域终点', false);
      if (finite(region.radiusPixels, '固定区域半径') < 0 || finite(region.featherPixels, '固定区域过渡') <= 0) throw new Error('固定区域范围无效。');
    });
  }

  // 建立固定纹理坐标的网格，只位移顶点；每个画面始终读取同一张原图。
  function create(canvas, image, config) {
    if (!canvas || typeof canvas.getContext !== 'function') throw new Error('缺少连续动作画布。');
    if (!image || !image.complete || !image.naturalWidth) throw new Error('人物原图尚未加载完成。');
    validate(config, image);
    var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error('当前浏览器无法创建 WebGL 连续动作画布。');
    var disposed = false, contextLost = false;
    var shaders = [], buffers = [], texture = null, program = null;
    var width = config.sourceSize[0], height = config.sourceSize[1], columns = config.mesh.columns, rows = config.mesh.rows;
    var vertices = new Float32Array((columns + 1) * (rows + 1) * 6);
    var indices = new Uint16Array(columns * rows * 6);
    var cursor = 0, indexCursor = 0, motion = config.motion;
    function clean() {
      buffers.forEach(function (buffer) { gl.deleteBuffer(buffer); });
      shaders.forEach(function (shader) { gl.deleteShader(shader); });
      if (texture) gl.deleteTexture(texture);
      if (program) gl.deleteProgram(program);
    }
    function lost(event) {
      event.preventDefault(); contextLost = true;
      // UI可监听此事件暂停并提供重试；不在上下文丢失后继续绘制。
      canvas.dispatchEvent(new CustomEvent('arena-idle-context-lost'));
    }
    canvas.addEventListener('webglcontextlost', lost);
    try {
      for (var row = 0; row <= rows; row++) {
        for (var column = 0; column <= columns; column++) {
          var u = column / columns, v = row / rows;
          var lowerAnchor = 1 - smoothstep(motion.anchorStartY, motion.anchorEndY, v);
          var neck = smoothstep(motion.headEndY, motion.neckEndY, v);
          var chestX = (u - motion.chestCenter[0]) / motion.chestSpread[0], chestY = (v - motion.chestCenter[1]) / motion.chestSpread[1];
          var chest = Math.exp(-0.5 * (chestX * chestX + chestY * chestY));
          var free = 1;
          (config.rigidRegions || []).forEach(function (region) {
            var distance = distanceToSegment(u * width, v * height, region.start[0] * width, region.start[1] * height, region.end[0] * width, region.end[1] * height);
            free *= smoothstep(region.radiusPixels, region.radiusPixels + region.featherPixels, distance);
          });
          // 头部仅整体轻移，胸肩轻微扩张；下肢和剑区域的位移严格为零。
          var xMotion = ((u - motion.centerX) / motion.chestSpread[0]) * motion.chestExpandPixels * chest * neck * lowerAnchor * free / width;
          var yMotion = -(motion.headLiftPixels * (1 - neck) + motion.chestLiftPixels * chest * neck) * lowerAnchor * free / height;
          vertices[cursor++] = u; vertices[cursor++] = v;
          vertices[cursor++] = u; vertices[cursor++] = v;
          vertices[cursor++] = xMotion; vertices[cursor++] = yMotion;
          if (row < rows && column < columns) {
            var a = row * (columns + 1) + column, b = a + 1, c = a + columns + 1, d = c + 1;
            indices[indexCursor++] = a; indices[indexCursor++] = c; indices[indexCursor++] = b;
            indices[indexCursor++] = b; indices[indexCursor++] = c; indices[indexCursor++] = d;
          }
        }
      }
      function shader(type, source) {
        var result = gl.createShader(type); if (!result) throw new Error('无法分配动作着色器。'); shaders.push(result);
        gl.shaderSource(result, source); gl.compileShader(result);
        if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('动作着色器编译失败：' + gl.getShaderInfoLog(result));
        return result;
      }
      var vertexShader = shader(gl.VERTEX_SHADER, 'attribute vec2 a_position; attribute vec2 a_uv; attribute vec2 a_motion; uniform float u_breath; varying vec2 v_uv; void main(){ vec2 p=a_position+a_motion*u_breath; gl_Position=vec4(p.x*2.0-1.0,1.0-p.y*2.0,0.0,1.0); v_uv=a_uv; }');
      var fragmentShader = shader(gl.FRAGMENT_SHADER, 'precision mediump float; uniform sampler2D u_image; varying vec2 v_uv; void main(){ gl_FragColor=texture2D(u_image,v_uv); }');
      program = gl.createProgram(); if (!program) throw new Error('无法分配动作绘制程序。');
      gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader); gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('动作绘制程序链接失败：' + gl.getProgramInfoLog(program));
      gl.useProgram(program);
      var vertexBuffer = gl.createBuffer(), indexBuffer = gl.createBuffer();
      if (!vertexBuffer || !indexBuffer) throw new Error('无法分配动作网格。');
      buffers.push(vertexBuffer, indexBuffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
      ['a_position', 'a_uv', 'a_motion'].forEach(function (name, offset) {
        var location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 24, offset * 8);
      });
      texture = gl.createTexture(); if (!texture) throw new Error('无法分配人物纹理。');
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
      // 纹理与透明画布均使用预乘alpha，防止透明边缘的隐藏RGB产生黑边或彩边。
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
      var breathLocation = gl.getUniformLocation(program, 'u_breath');
      canvas.width = config.canvasSize[0]; canvas.height = config.canvasSize[1];
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
      function draw(phase) {
        if (disposed) throw new Error('连续动作画布已释放。');
        if (contextLost || gl.isContextLost()) throw new Error('连续动作画布已中断，请重新加载。');
        finite(phase, '动作相位');
        // 归一化后显式保证整周期回到相同数值，接缝处速度也连续。
        var cycle = ((phase % 1) + 1) % 1;
        var breath = cycle === 0 ? 0 : 0.5 - 0.5 * Math.cos(cycle * Math.PI * 2);
        gl.uniform1f(breathLocation, breath); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        canvas.dataset.phase = String(cycle);
      }
      draw(0);
      return {
        draw: draw,
        dispose: function () {
          if (disposed) return;
          disposed = true; canvas.removeEventListener('webglcontextlost', lost); clean();
        }
      };
    } catch (error) {
      canvas.removeEventListener('webglcontextlost', lost); clean(); throw error;
    }
  }
  global.ArenaIdleMotion = Object.freeze({ create: create });
})(window);
