/**
 * Porch Light — The Arcade
 * Keep the light burning. Lightning bugs are coming.
 */

(function () {
  'use strict';

  var canvas, ctx, onGameOver, onScoreUpdate;
  var animFrame = null;
  var paused = false;
  var gameRunning = false;

  // State
  var light, bugs, pulses, energy, score, elapsed, spawnRate, lastTime;

  // Colors
  var GOLD = '#d4a84b';
  var GOLD_BRIGHT = '#e0b860';
  var BG = '#0a1829';
  var BORDER = '#1a3a5c';
  var TEXT = '#e8e8e8';
  var DIM = '#b0b0b0';
  var BUG_GLOW = '#c8e550';
  var BUG_BODY = '#8aab30';
  var BUG_AURA = 'rgba(200, 229, 80, 0.25)';
  var DANGER = '#cc6666';

  var W, H;
  var LIGHT_RADIUS = 30;
  var PULSE_COST = 15;
  var ENERGY_MAX = 100;
  var ENERGY_REGEN = 8;
  var LIGHT_HEALTH_MAX = 100;

  function initState() {
    W = canvas.width;
    H = canvas.height;

    light = {
      x: W / 2,
      y: 60,
      health: LIGHT_HEALTH_MAX,
      radius: LIGHT_RADIUS
    };

    bugs = [];
    pulses = [];
    energy = ENERGY_MAX;
    score = 0;
    elapsed = 0;
    spawnRate = 0.8;
    lastTime = 0;
    paused = false;
    gameRunning = true;
  }

  // ── Input ─────────────────────────────────────────

  function onPulse(e) {
    e.preventDefault();
    if (!gameRunning || paused) return;
    if (energy < PULSE_COST) return;

    energy -= PULSE_COST;
    pulses.push({
      x: light.x,
      y: light.y,
      radius: LIGHT_RADIUS,
      maxRadius: W * 0.35,
      speed: 300,
      alpha: 0.8
    });
  }

  function bindInput() {
    canvas.addEventListener('click', onPulse);
    canvas.addEventListener('touchstart', onPulse, { passive: false });
  }

  function unbindInput() {
    canvas.removeEventListener('click', onPulse);
    canvas.removeEventListener('touchstart', onPulse);
  }

  // ── Lightning Bugs ────────────────────────────────

  function spawnBug() {
    var edge = Math.floor(Math.random() * 3);
    var x, y;

    if (edge === 0) {
      x = -10;
      y = Math.random() * H * 0.7 + H * 0.15;
    } else if (edge === 1) {
      x = W + 10;
      y = Math.random() * H * 0.7 + H * 0.15;
    } else {
      x = Math.random() * W;
      y = H + 10;
    }

    var baseSpeed = 20 + elapsed * 0.5;
    var size = Math.random() < 0.15 ? 2 : 1;

    bugs.push({
      x: x,
      y: y,
      size: size,
      hp: size,
      speed: baseSpeed + Math.random() * 15,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 2 + Math.random() * 3,
      glowPhase: Math.random() * Math.PI * 2,
      glowSpeed: 1.5 + Math.random() * 2
    });
  }

  function updateBugs(dt) {
    for (var i = bugs.length - 1; i >= 0; i--) {
      var b = bugs[i];

      // Seek toward light with wobble
      var dx = light.x - b.x;
      var dy = light.y - b.y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        var nx = dx / dist;
        var ny = dy / dist;

        b.wobble += b.wobbleSpeed * dt;
        var wobbleX = -ny * Math.sin(b.wobble) * 30;
        var wobbleY = nx * Math.sin(b.wobble) * 30;

        b.x += (nx * b.speed + wobbleX) * dt;
        b.y += (ny * b.speed + wobbleY) * dt;
      }

      // Glow animation
      b.glowPhase += b.glowSpeed * dt;

      // Hit the light
      if (dist < LIGHT_RADIUS + 8 * b.size) {
        light.health -= 2 * b.size;
        bugs.splice(i, 1);
        if (light.health <= 0) {
          light.health = 0;
          endGame();
          return;
        }
      }
    }
  }

  // ── Pulses ────────────────────────────────────────

  function updatePulses(dt) {
    for (var i = pulses.length - 1; i >= 0; i--) {
      var p = pulses[i];
      p.radius += p.speed * dt;
      p.alpha -= dt * 1.5;

      // Push back bugs
      for (var j = bugs.length - 1; j >= 0; j--) {
        var b = bugs[j];
        var dx = b.x - p.x;
        var dy = b.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < p.radius + 10 && dist > p.radius - 30) {
          var nx = dx / (dist || 1);
          var ny = dy / (dist || 1);
          var knockback = 150;
          b.x += nx * knockback * dt * 4;
          b.y += ny * knockback * dt * 4;
          b.hp--;

          if (b.hp <= 0) {
            bugs.splice(j, 1);
            score += b.size * 5;
          }
        }
      }

      if (p.alpha <= 0 || p.radius > p.maxRadius) {
        pulses.splice(i, 1);
      }
    }
  }

  // ── Update ────────────────────────────────────────

  function update(dt) {
    elapsed += dt;
    score = Math.floor(elapsed);

    energy = Math.min(ENERGY_MAX, energy + ENERGY_REGEN * dt);

    spawnRate = 0.8 + elapsed * 0.08;
    var maxBugs = Math.min(30, 5 + Math.floor(elapsed * 0.3));
    if (bugs.length < maxBugs && Math.random() < spawnRate * dt) {
      spawnBug();
    }

    updateBugs(dt);
    updatePulses(dt);

    if (onScoreUpdate) onScoreUpdate(score);
  }

  // ── Rendering ─────────────────────────────────────

  function draw() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Light glow
    var healthPct = light.health / LIGHT_HEALTH_MAX;
    var glowRadius = 60 + healthPct * 80;
    var grad = ctx.createRadialGradient(light.x, light.y, 5, light.x, light.y, glowRadius);
    grad.addColorStop(0, 'rgba(212, 168, 75, ' + (0.6 * healthPct) + ')');
    grad.addColorStop(0.5, 'rgba(212, 168, 75, ' + (0.2 * healthPct) + ')');
    grad.addColorStop(1, 'rgba(212, 168, 75, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, light.y + glowRadius);

    // Light bulb
    ctx.fillStyle = healthPct > 0.3 ? GOLD : DANGER;
    ctx.beginPath();
    ctx.arc(light.x, light.y, LIGHT_RADIUS * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = healthPct > 0.3 ? GOLD_BRIGHT : '#e88';
    ctx.beginPath();
    ctx.arc(light.x, light.y, LIGHT_RADIUS * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Pulses
    for (var i = 0; i < pulses.length; i++) {
      var p = pulses[i];
      ctx.strokeStyle = 'rgba(212, 168, 75, ' + p.alpha + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Lightning bugs
    for (var j = 0; j < bugs.length; j++) {
      drawBug(bugs[j]);
    }

    drawEnergyBar();
    drawHealthBar();

    // Score
    ctx.fillStyle = GOLD;
    ctx.font = '600 16px "Noto Sans", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(score, 16, 30);
  }

  function drawBug(b) {
    var glowIntensity = 0.4 + Math.sin(b.glowPhase) * 0.4;
    var bodySize = 2.5 * b.size;
    var auraSize = 10 * b.size;

    // Glow aura
    var auraGrad = ctx.createRadialGradient(b.x, b.y, bodySize, b.x, b.y, auraSize);
    auraGrad.addColorStop(0, 'rgba(200, 229, 80, ' + (glowIntensity * 0.5) + ')');
    auraGrad.addColorStop(1, 'rgba(200, 229, 80, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, auraSize, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = BUG_BODY;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, bodySize * 0.6, bodySize, 0, 0, Math.PI * 2);
    ctx.fill();

    // Light-up abdomen
    ctx.fillStyle = 'rgba(200, 229, 80, ' + glowIntensity + ')';
    ctx.beginPath();
    ctx.arc(b.x, b.y + bodySize * 0.4, bodySize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEnergyBar() {
    var barW = 120;
    var barH = 6;
    var x = W - barW - 16;
    var y = 20;

    ctx.fillStyle = BORDER;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 3);
    ctx.fill();

    var pct = energy / ENERGY_MAX;
    ctx.fillStyle = pct > 0.3 ? GOLD : DANGER;
    ctx.beginPath();
    ctx.roundRect(x, y, barW * pct, barH, 3);
    ctx.fill();

    ctx.fillStyle = DIM;
    ctx.font = '500 10px "Noto Sans", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('ENERGY', x - 6, y + 6);
  }

  function drawHealthBar() {
    var barW = 120;
    var barH = 6;
    var x = W - barW - 16;
    var y = 34;

    ctx.fillStyle = BORDER;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, 3);
    ctx.fill();

    var pct = light.health / LIGHT_HEALTH_MAX;
    ctx.fillStyle = pct > 0.3 ? GOLD_BRIGHT : DANGER;
    ctx.beginPath();
    ctx.roundRect(x, y, barW * pct, barH, 3);
    ctx.fill();

    ctx.fillStyle = DIM;
    ctx.font = '500 10px "Noto Sans", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('LIGHT', x - 6, y + 6);
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
  window.ArcadeGames['porch-light'] = {
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
