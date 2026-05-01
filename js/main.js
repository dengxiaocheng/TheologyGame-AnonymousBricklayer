// Game entry point — Anonymous Bricklayer
// Minimal static entry; gameplay modules to be wired via legacy fix plan.

(function () {
  'use strict';

  var canvas = document.getElementById('canvas');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var btnStart = document.getElementById('btn-start');
  var sceneTitle = document.getElementById('scene-title');
  var sceneText = document.getElementById('scene-text');
  var statShift = document.getElementById('stat-shift');
  var statGrace = document.getElementById('stat-grace');
  var statBrick = document.getElementById('stat-brick');

  var state = {
    started: false,
    shift: 0,
    grace: 0,
    bricks: 0
  };

  function drawCanvas() {
    if (!ctx) return;
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, w, h);

    if (!state.started) {
      ctx.fillStyle = '#c9a84c';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('巴别塔的工场', w / 2, h / 2 - 10);
      ctx.fillStyle = '#888';
      ctx.font = '11px sans-serif';
      ctx.fillText('等待开始…', w / 2, h / 2 + 14);
    } else {
      var bw = 30, bh = 16, gap = 2;
      var cols = Math.floor(w / (bw + gap));
      var rows = Math.min(state.bricks, Math.floor(h / (bh + gap)));
      var count = 0;
      for (var r = 0; r < rows && count < state.bricks; r++) {
        var offset = (r % 2) * (bw / 2);
        for (var c = 0; c < cols && count < state.bricks; c++) {
          var x = c * (bw + gap) + offset;
          var y = h - (r + 1) * (bh + gap);
          if (x + bw > w) continue;
          ctx.fillStyle = r % 3 === 0 ? '#8b6914' : '#a07828';
          ctx.fillRect(x, y, bw, bh);
          count++;
        }
      }
      ctx.fillStyle = '#c9a84c';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('班次 ' + state.shift + ' · 恩典 ' + state.grace, w / 2, 16);
    }
  }

  function updateStatus() {
    if (statShift) statShift.textContent = '班次: ' + state.shift;
    if (statGrace) statGrace.textContent = '恩典: ' + state.grace;
    if (statBrick) statBrick.textContent = '砖块: ' + state.bricks;
  }

  function advanceShift() {
    state.shift++;
    state.bricks += 3;
    state.grace += 1;
    sceneTitle.textContent = '班次 ' + state.shift;
    sceneText.textContent = '你在沉默中继续砌砖。第 ' + state.bricks + ' 块砖已放入墙壁。恩典悄然增长。';
    updateStatus();
    drawCanvas();
  }

  function handleStart() {
    if (!state.started) {
      state.started = true;
      if (btnStart) btnStart.textContent = '继续砌砖';
      advanceShift();
    } else {
      advanceShift();
    }
  }

  if (btnStart) {
    btnStart.addEventListener('click', handleStart);
    btnStart.addEventListener('touchend', function (e) {
      e.preventDefault();
      handleStart();
    });
  }

  if (canvas) {
    canvas.addEventListener('touchend', function (e) {
      e.preventDefault();
      if (state.started) advanceShift();
    });
    canvas.addEventListener('click', function () {
      if (state.started) advanceShift();
    });
  }

  drawCanvas();
  updateStatus();
})();
