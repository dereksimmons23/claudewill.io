/**
 * The Route — The Arcade
 * Deliver the paper. Don't miss a porch.
 * Inspired by Paperboy (1985).
 */

(function () {
  'use strict';

  var canvas, ctx, onGameOver, onScoreUpdate;
  var animFrame = null;
  var paused = false;
  var gameRunning = false;

  // State
  var rider, houses, papers, obstacles, scrollY;
  var lives, subscribers, score, speed, distance, lastTime;
  var throwLeft, throwRight;

  // Colors
  var GOLD = '#d4a84b';
  var GOLD_BRIGHT = '#e0b860';
  var BG = '#0a1829';
  var ROAD = '#0e1f32';
  var ROAD_LINE = '#1a3a5c';
  var SIDEWALK = '#12243a';
  var HOUSE_COLOR = '#162d47';
  var HOUSE_ROOF = '#1a3a5c';
  var PORCH_LIT = 'rgba(212, 168, 75, 0.3)';
  var PORCH_GOLD = '#d4a84b';
  var PAPER_COLOR = '#e8e8e8';
  var DIM = '#b0b0b0';
  var BORDER = '#1a3a5c';
  var DANGER = '#cc6666';
  var DOG_COLOR = '#8B6914';
  var CAR_COLOR = '#2a4a6a';

  var W, H;
  var RIDER_SIZE;
  var ROAD_LEFT, ROAD_RIGHT, ROAD_W;
  var HOUSE_W, HOUSE_H, PORCH_W;
  var HOUSE_SPACING;
  var PAPER_SPEED;
  var nextHouseY;
  var housesSide; // alternate sides

  function initState() {
    W = canvas.width;
    H = canvas.height;

    RIDER_SIZE = W * 0.03;
    ROAD_W = W * 0.35;
    ROAD_LEFT = (W - ROAD_W) / 2;
    ROAD_RIGHT = ROAD_LEFT + ROAD_W;
    HOUSE_W = W * 0.2;
    HOUSE_H = W * 0.12;
    PORCH_W = W * 0.06;
    HOUSE_SPACING = H * 0.22;
    PAPER_SPEED = 350;

    rider = {
      x: W / 2,
      y: H * 0.78,
      targetX: W / 2
    };

    houses = [];
    papers = [];
    obstacles = [];
    scrollY = 0;
    lives = 3;
    subscribers = 10;
    score = 0;
    speed = 100;
    distance = 0;
    lastTime = 0;
    nextHouseY = -HOUSE_SPACING;
    housesSide = 0;
    throwLeft = false;
    throwRight = false;
    paused = false;
    gameRunning = true;

    // Pre-populate initial houses
    for (var i = 0; i < 6; i++) {
      spawnHouse(-i * HOUSE_SPACING);
    }
  }

  // ── Input ─────────────────────────────────────────

  var keysDown = {};

  function onKeyDown(e) {
    keysDown[e.key] = true;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
    if (e.key === 'z' || e.key === 'Z') { throwPaper('left'); e.preventDefault(); }
    if (e.key === 'x' || e.key === 'X' || e.key === 'm' || e.key === 'M') { throwPaper('right'); e.preventDefault(); }
  }

  function onKeyUp(e) {
    keysDown[e.key] = false;
  }

  function onTouchStart(e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      var rect = canvas.getBoundingClientRect();
      var tx = (t.clientX - rect.left) * (W / rect.width);

      if (tx < W * 0.4) {
        throwPaper('left');
      } else if (tx > W * 0.6) {
        throwPaper('right');
      }

      // Move rider toward tap
      rider.targetX = Math.max(ROAD_LEFT + 10, Math.min(ROAD_RIGHT - 10, tx));
    }
  }

  function bindInput() {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  }

  function unbindInput() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    canvas.removeEventListener('touchstart', onTouchStart);
    keysDown = {};
  }

  // ── Papers ────────────────────────────────────────

  function throwPaper(side) {
    var vx = side === 'left' ? -PAPER_SPEED : PAPER_SPEED;
    papers.push({
      x: rider.x,
      y: rider.y - RIDER_SIZE,
      vx: vx,
      vy: -PAPER_SPEED * 0.3,
      size: 4,
      landed: false
    });
  }

  // ── Houses ────────────────────────────────────────

  function spawnHouse(y) {
    var side = housesSide % 2 === 0 ? 'left' : 'right';
    // Sometimes both sides
    if (Math.random() < 0.3 && housesSide > 2) {
      spawnSingleHouse(y, 'left');
      spawnSingleHouse(y, 'right');
    } else {
      spawnSingleHouse(y, side);
    }
    housesSide++;
  }

  function spawnSingleHouse(y, side) {
    var x = side === 'left' ? ROAD_LEFT - HOUSE_W - W * 0.04 : ROAD_RIGHT + W * 0.04;
    var porchX = side === 'left' ? x + HOUSE_W - PORCH_W : x;

    houses.push({
      x: x,
      y: y,
      w: HOUSE_W,
      h: HOUSE_H,
      side: side,
      porchX: porchX,
      porchY: y + HOUSE_H * 0.3,
      porchW: PORCH_W,
      porchH: HOUSE_H * 0.4,
      delivered: false,
      missed: false
    });

    // Occasionally spawn obstacle near house
    if (Math.random() < 0.25 && distance > 200) {
      spawnObstacle(y, side);
    }
  }

  // ── Obstacles ─────────────────────────────────────

  function spawnObstacle(y, nearSide) {
    var type = Math.random() < 0.4 ? 'dog' : 'car';

    if (type === 'dog') {
      var dogX = nearSide === 'left' ? ROAD_LEFT + 10 : ROAD_RIGHT - 20;
      obstacles.push({
        type: 'dog',
        x: dogX,
        y: y - 20,
        w: 14,
        h: 10,
        vx: nearSide === 'left' ? 60 : -60,
        active: true
      });
    } else {
      var lane = ROAD_LEFT + ROAD_W * (Math.random() < 0.5 ? 0.25 : 0.75);
      obstacles.push({
        type: 'car',
        x: lane - 10,
        y: y - H * 0.3,
        w: 20,
        h: 36,
        vx: 0,
        vy: speed * 0.5,
        active: true
      });
    }
  }

  // ── Update ────────────────────────────────────────

  function update(dt) {
    distance += speed * dt;
    scrollY += speed * dt;
    speed = 100 + distance * 0.01;

    // Rider movement
    if (keysDown['ArrowLeft']) {
      rider.targetX = rider.x - 200 * dt;
    }
    if (keysDown['ArrowRight']) {
      rider.targetX = rider.x + 200 * dt;
    }
    rider.targetX = Math.max(ROAD_LEFT + 10, Math.min(ROAD_RIGHT - 10, rider.targetX));
    rider.x += (rider.targetX - rider.x) * 8 * dt;

    // Spawn houses
    while (nextHouseY + scrollY > -HOUSE_SPACING) {
      nextHouseY -= HOUSE_SPACING;
      spawnHouse(nextHouseY);
    }

    // Update houses
    for (var i = houses.length - 1; i >= 0; i--) {
      var h = houses[i];
      var screenY = h.y + scrollY;

      // House scrolled off bottom — missed if not delivered
      if (screenY > H + HOUSE_H) {
        if (!h.delivered && !h.missed) {
          h.missed = true;
          subscribers--;
          if (subscribers <= 0) {
            subscribers = 0;
            endGame();
            return;
          }
        }
        houses.splice(i, 1);
      }
    }

    // Update papers
    for (var p = papers.length - 1; p >= 0; p--) {
      var paper = papers[p];
      if (paper.landed) {
        papers.splice(p, 1);
        continue;
      }

      paper.x += paper.vx * dt;
      paper.y += paper.vy * dt;
      paper.vy += 200 * dt; // gravity

      // Check porch hits
      for (var h2 = 0; h2 < houses.length; h2++) {
        var house = houses[h2];
        if (house.delivered) continue;

        var porchScreenY = house.porchY + scrollY;
        if (
          paper.x > house.porchX &&
          paper.x < house.porchX + house.porchW &&
          paper.y > porchScreenY &&
          paper.y < porchScreenY + house.porchH
        ) {
          house.delivered = true;
          paper.landed = true;
          score += 100;
          if (onScoreUpdate) onScoreUpdate(score);
          break;
        }
      }

      // Off screen
      if (paper.x < -20 || paper.x > W + 20 || paper.y > H + 20) {
        papers.splice(p, 1);
      }
    }

    // Update obstacles
    for (var o = obstacles.length - 1; o >= 0; o--) {
      var obs = obstacles[o];
      var obsScreenY = obs.y + scrollY;

      obs.x += (obs.vx || 0) * dt;
      if (obs.vy) obs.y += obs.vy * dt;

      // Off screen
      if (obsScreenY > H + 50 || obs.x < -50 || obs.x > W + 50) {
        obstacles.splice(o, 1);
        continue;
      }

      // Collision with rider
      if (obs.active) {
        var rx = rider.x - RIDER_SIZE;
        var ry = rider.y - RIDER_SIZE;
        var rw = RIDER_SIZE * 2;
        var rh = RIDER_SIZE * 2;

        if (
          rx < obs.x + obs.w &&
          rx + rw > obs.x &&
          ry < obsScreenY + obs.h &&
          ry + rh > obsScreenY
        ) {
          obs.active = false;
          lives--;
          if (lives <= 0) {
            endGame();
            return;
          }
          // Knockback
          rider.targetX = rider.x + (obs.vx > 0 ? 40 : -40);
        }
      }
    }

    if (onScoreUpdate) onScoreUpdate(score);
  }

  // ── Rendering ─────────────────────────────────────

  function draw() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Sidewalks
    ctx.fillStyle = SIDEWALK;
    ctx.fillRect(ROAD_LEFT - W * 0.06, 0, W * 0.06, H);
    ctx.fillRect(ROAD_RIGHT, 0, W * 0.06, H);

    // Road
    ctx.fillStyle = ROAD;
    ctx.fillRect(ROAD_LEFT, 0, ROAD_W, H);

    // Road lines (dashed center)
    ctx.strokeStyle = ROAD_LINE;
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    var lineOffset = scrollY % 40;
    ctx.beginPath();
    ctx.moveTo(W / 2, -40 + lineOffset);
    ctx.lineTo(W / 2, H + 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Houses
    for (var i = 0; i < houses.length; i++) {
      drawHouse(houses[i]);
    }

    // Obstacles
    for (var o = 0; o < obstacles.length; o++) {
      drawObstacle(obstacles[o]);
    }

    // Papers in flight
    for (var p = 0; p < papers.length; p++) {
      var paper = papers[p];
      if (!paper.landed) {
        ctx.fillStyle = PAPER_COLOR;
        ctx.fillRect(paper.x - paper.size / 2, paper.y - paper.size / 2, paper.size, paper.size);
      }
    }

    // Rider
    drawRider();

    // UI
    drawUI();
  }

  function drawHouse(h) {
    var sy = h.y + scrollY;
    if (sy < -HOUSE_H * 2 || sy > H + HOUSE_H) return;

    // House body
    ctx.fillStyle = HOUSE_COLOR;
    ctx.fillRect(h.x, sy, h.w, h.h);

    // Roof
    ctx.fillStyle = HOUSE_ROOF;
    ctx.beginPath();
    ctx.moveTo(h.x - 4, sy);
    ctx.lineTo(h.x + h.w / 2, sy - h.h * 0.4);
    ctx.lineTo(h.x + h.w + 4, sy);
    ctx.closePath();
    ctx.fill();

    // Porch
    var porchSY = h.porchY + scrollY;
    if (h.delivered) {
      ctx.fillStyle = PORCH_LIT;
      ctx.fillRect(h.porchX, porchSY, h.porchW, h.porchH);
      // Delivered paper on porch
      ctx.fillStyle = PAPER_COLOR;
      ctx.fillRect(h.porchX + h.porchW * 0.3, porchSY + h.porchH * 0.4, 5, 4);
    } else {
      // Gold porch light (target)
      ctx.fillStyle = PORCH_GOLD;
      ctx.beginPath();
      ctx.arc(h.porchX + h.porchW / 2, porchSY + 4, 3, 0, Math.PI * 2);
      ctx.fill();
      // Porch glow
      var pg = ctx.createRadialGradient(
        h.porchX + h.porchW / 2, porchSY + 4, 2,
        h.porchX + h.porchW / 2, porchSY + 4, 20
      );
      pg.addColorStop(0, 'rgba(212, 168, 75, 0.2)');
      pg.addColorStop(1, 'rgba(212, 168, 75, 0)');
      ctx.fillStyle = pg;
      ctx.fillRect(h.porchX - 10, porchSY - 10, h.porchW + 20, h.porchH + 20);
    }

    // Window
    ctx.fillStyle = h.missed ? DANGER : 'rgba(212, 168, 75, 0.1)';
    var winX = h.side === 'left' ? h.x + h.w * 0.15 : h.x + h.w * 0.55;
    ctx.fillRect(winX, sy + h.h * 0.2, h.w * 0.25, h.h * 0.3);
  }

  function drawObstacle(obs) {
    var sy = obs.y + scrollY;
    if (sy < -50 || sy > H + 50) return;

    if (obs.type === 'dog') {
      // Dog body
      ctx.fillStyle = DOG_COLOR;
      ctx.fillRect(obs.x, sy, obs.w, obs.h);
      // Head
      ctx.fillRect(obs.vx > 0 ? obs.x + obs.w - 4 : obs.x - 4, sy - 3, 8, 8);
    } else {
      // Car
      ctx.fillStyle = CAR_COLOR;
      ctx.beginPath();
      ctx.roundRect(obs.x, sy, obs.w, obs.h, 4);
      ctx.fill();
      // Headlights
      ctx.fillStyle = GOLD_BRIGHT;
      ctx.fillRect(obs.x + 2, sy + obs.h - 4, 4, 3);
      ctx.fillRect(obs.x + obs.w - 6, sy + obs.h - 4, 4, 3);
    }
  }

  function drawRider() {
    // Bike wheel trail
    ctx.fillStyle = 'rgba(212, 168, 75, 0.1)';
    ctx.fillRect(rider.x - 1, rider.y + RIDER_SIZE, 2, 12);

    // Body
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(rider.x, rider.y, RIDER_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Bike frame (simple triangle)
    ctx.strokeStyle = DIM;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rider.x, rider.y - RIDER_SIZE);
    ctx.lineTo(rider.x - RIDER_SIZE, rider.y + RIDER_SIZE);
    ctx.lineTo(rider.x + RIDER_SIZE, rider.y + RIDER_SIZE);
    ctx.closePath();
    ctx.stroke();

    // Wheels
    ctx.fillStyle = DIM;
    ctx.beginPath();
    ctx.arc(rider.x - RIDER_SIZE, rider.y + RIDER_SIZE, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rider.x + RIDER_SIZE, rider.y + RIDER_SIZE, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawUI() {
    // Score
    ctx.fillStyle = GOLD;
    ctx.font = '600 16px "Noto Sans", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(score, 16, 30);

    // Lives
    for (var i = 0; i < 3; i++) {
      ctx.fillStyle = i < lives ? DANGER : BORDER;
      ctx.beginPath();
      ctx.arc(W - 16 - i * 22, 24, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subscribers
    ctx.fillStyle = DIM;
    ctx.font = '500 11px "Noto Sans", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(subscribers + ' subscribers', 16, 50);

    // Subscriber bar
    var barW = 80;
    var barH = 4;
    var barX = 16;
    var barY = 56;
    ctx.fillStyle = BORDER;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = subscribers > 3 ? GOLD : DANGER;
    ctx.fillRect(barX, barY, barW * (subscribers / 10), barH);
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
  window.ArcadeGames['the-route'] = {
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
