/**
 * Fence Mender — The Arcade
 * Catch falling fence posts. Build the fence.
 */

(function () {
  'use strict';

  var canvas, ctx, onGameOver, onScoreUpdate;
  var animFrame = null;
  var paused = false;
  var gameRunning = false;

  // Game state
  var paddle, posts, fence, lives, score, speed, catchCount, lastTime;

  // Colors
  var GOLD = '#d4a84b';
  var GOLD_BRIGHT = '#e0b860';
  var GOLD_DIM = 'rgba(212, 168, 75, 0.3)';
  var BG = '#0a1829';
  var BORDER = '#1a3a5c';
  var TEXT = '#e8e8e8';
  var DIM = '#b0b0b0';
  var DANGER = '#cc6666';
  var WOOD = '#8B6914';
  var WOOD_DARK = '#5C4A1A';

  // Dimensions (set on init)
  var W, H;
  var PADDLE_W, PADDLE_H, POST_W, POST_H;
  var FENCE_Y_START;

  // Input
  var inputX = null;
  var touchId = null;

  function initState() {
    W = canvas.width;
    H = canvas.height;
    PADDLE_W = Math.round(W * 0.22);
    PADDLE_H = 14;
    POST_W = Math.round(W * 0.04);
    POST_H = Math.round(H * 0.06);
    FENCE_Y_START = H - 80;

    paddle = {
      x: W / 2 - PADDLE_W / 2,
      y: H - 50,
      w: PADDLE_W,
      h: PADDLE_H
    };

    posts = [];
    fence = [];
    lives = 3;
    score = 0;
    speed = 1.5;
    catchCount = 0;
    lastTime = 0;
    inputX = null;
    paused = false;
    gameRunning = true;
  }

  // ── Input Handlers ────────────────────────────────

  function onMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    inputX = (e.clientX - rect.left) * (W / rect.width);
  }

  function onTouchStart(e) {
    if (touchId !== null) return;
    var t = e.changedTouches[0];
    touchId = t.identifier;
    var rect = canvas.getBoundingClientRect();
    inputX = (t.clientX - rect.left) * (W / rect.width);
    e.preventDefault();
  }

  function onTouchMove(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId) {
        var rect = canvas.getBoundingClientRect();
        inputX = (e.changedTouches[i].clientX - rect.left) * (W / rect.width);
        e.preventDefault();
        return;
      }
    }
  }

  function onTouchEnd(e) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId) {
        touchId = null;
        return;
      }
    }
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowLeft') {
      paddle.vx = -6;
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      paddle.vx = 6;
      e.preventDefault();
    }
  }

  function onKeyUp(e) {
    if (e.key === 'ArrowLeft' && paddle.vx < 0) {
      paddle.vx = 0;
    } else if (e.key === 'ArrowRight' && paddle.vx > 0) {
      paddle.vx = 0;
    }
  }

  function bindInput() {
    paddle.vx = 0;
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  function unbindInput() {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
  }

  // ── Game Logic ────────────────────────────────────

  function spawnPost() {
    var margin = POST_W * 2;
    posts.push({
      x: margin + Math.random() * (W - margin * 2),
      y: -POST_H,
      w: POST_W,
      h: POST_H,
      speed: speed + Math.random() * 0.5
    });
  }

  function update(dt) {
    // Paddle movement
    if (inputX !== null) {
      paddle.x = inputX - paddle.w / 2;
    }
    if (paddle.vx) {
      paddle.x += paddle.vx * dt * 60;
    }

    // Clamp paddle
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.w > W) paddle.x = W - paddle.w;

    // Spawn posts
    var spawnRate = Math.max(0.008, 0.025 - catchCount * 0.0003);
    if (Math.random() < spawnRate * dt * 60) {
      spawnPost();
    }

    // Update posts
    for (var i = posts.length - 1; i >= 0; i--) {
      var p = posts[i];
      p.y += p.speed * dt * 60;

      // Check catch (collision with paddle)
      if (
        p.y + p.h >= paddle.y &&
        p.y + p.h <= paddle.y + paddle.h + p.speed * 2 &&
        p.x + p.w > paddle.x &&
        p.x < paddle.x + paddle.w
      ) {
        posts.splice(i, 1);
        catchCount++;
        score += 10;

        // Bonus for fence section
        if (catchCount % 10 === 0) {
          score += 50;
          speed += 0.3;
        }

        // Add to fence visual
        addFencePost();

        if (onScoreUpdate) onScoreUpdate(score);
        continue;
      }

      // Missed — fell past paddle
      if (p.y > H) {
        posts.splice(i, 1);
        lives--;
        if (lives <= 0) {
          endGame();
          return;
        }
      }
    }
  }

  function addFencePost() {
    var spacing = W * 0.05;
    var fenceX = (fence.length % 16) * spacing + spacing;
    var row = Math.floor(fence.length / 16);
    var fenceY = FENCE_Y_START - row * (POST_H + 4);
    fence.push({ x: fenceX, y: fenceY });
  }

  // ── Rendering ─────────────────────────────────────

  function draw() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Fence (background)
    drawFence();

    // Ground line
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, FENCE_Y_START + POST_H + 8);
    ctx.lineTo(W, FENCE_Y_START + POST_H + 8);
    ctx.stroke();

    // Falling posts
    for (var i = 0; i < posts.length; i++) {
      var p = posts[i];
      ctx.fillStyle = GOLD;
      ctx.fillRect(p.x, p.y, p.w, p.h);
      // Wood grain line
      ctx.fillStyle = GOLD_BRIGHT;
      ctx.fillRect(p.x + p.w * 0.3, p.y + 2, 1, p.h - 4);
    }

    // Paddle (rail)
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 4);
    ctx.fill();
    // Rail highlight
    ctx.fillStyle = GOLD_BRIGHT;
    ctx.fillRect(paddle.x + 4, paddle.y + 3, paddle.w - 8, 2);

    // Lives
    drawLives();

    // Score
    ctx.fillStyle = GOLD;
    ctx.font = '600 16px "Noto Sans", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(score, 16, 30);
  }

  function drawFence() {
    for (var i = 0; i < fence.length; i++) {
      var f = fence[i];
      ctx.fillStyle = WOOD;
      ctx.fillRect(f.x, f.y, POST_W, POST_H);
      ctx.fillStyle = WOOD_DARK;
      ctx.fillRect(f.x + POST_W * 0.35, f.y + 2, 1, POST_H - 4);
    }

    // Horizontal rails across fence sections
    if (fence.length >= 2) {
      var rows = Math.floor(fence.length / 16) + 1;
      for (var r = 0; r < rows; r++) {
        var rowStart = r * 16;
        var rowEnd = Math.min(rowStart + 16, fence.length);
        if (rowEnd - rowStart < 2) continue;

        var railY = FENCE_Y_START - r * (POST_H + 4) + POST_H * 0.35;
        var firstX = fence[rowStart].x;
        var lastX = fence[rowEnd - 1].x + POST_W;

        ctx.fillStyle = WOOD_DARK;
        ctx.fillRect(firstX, railY, lastX - firstX, 3);
        ctx.fillRect(firstX, railY + POST_H * 0.3, lastX - firstX, 3);
      }
    }
  }

  function drawLives() {
    var size = 8;
    var x = W - 16;
    var y = 24;
    for (var i = 0; i < 3; i++) {
      ctx.fillStyle = i < lives ? DANGER : BORDER;
      ctx.beginPath();
      ctx.arc(x - i * (size * 2 + 6), y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Game Loop ─────────────────────────────────────

  function loop(timestamp) {
    if (!gameRunning) return;
    if (paused) {
      animFrame = requestAnimationFrame(loop);
      return;
    }

    var dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0.016;
    lastTime = timestamp;

    update(dt);
    draw();
    animFrame = requestAnimationFrame(loop);
  }

  function endGame() {
    gameRunning = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    unbindInput();
    if (onGameOver) onGameOver(score);
  }

  // ── Public API ────────────────────────────────────

  window.ArcadeGames = window.ArcadeGames || {};
  window.ArcadeGames['fence-mender'] = {
    init: function (c, gameOverCb, scoreCb) {
      canvas = c;
      ctx = canvas.getContext('2d');
      onGameOver = gameOverCb;
      onScoreUpdate = scoreCb;

      initState();
      bindInput();
      animFrame = requestAnimationFrame(loop);
    },

    destroy: function () {
      gameRunning = false;
      if (animFrame) cancelAnimationFrame(animFrame);
      unbindInput();
    },

    pause: function () {
      paused = true;
    },

    resume: function () {
      paused = false;
      lastTime = 0;
    }
  };
})();
